"""FastAPI application entrypoint.

Deployed on Vercel as a single serverless function (see /vercel.json which
rewrites all /api/* traffic here). The `app` object is auto-detected by the
@vercel/python runtime.
"""
from __future__ import annotations

import concurrent.futures
import os
import sys
from datetime import datetime

sys.path.append(os.path.dirname(__file__))

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from models.schemas import (
    AnalyzeRequest,
    AnalyzeResponse,
    ChatRequest,
    ChatResponse,
    CompareRequest,
    CompareResponse,
    CoverLetterRequest,
    CoverLetterResponse,
    DashboardStats,
    ResumeHistoryEntry,
)
from services.ats_scorer import radar_chart_data, score_resume, skill_distribution
from services.gemini_service import analyze_resume, chat_reply, generate_cover_letter
from services.pdf_parser import PDFParseError, extract_text_from_pdf
from storage.json_storage import (
    append_record,
    delete_record,
    get_all_records,
    get_record,
)

app = FastAPI(title="AI Resume Analyzer API", version="1.0.0")

_origins = os.environ.get("CORS_ORIGINS", "*")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in _origins.split(",")] if _origins != "*" else ["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health() -> dict:
    return {"status": "ok", "time": datetime.utcnow().isoformat()}


@app.post("/api/upload")
async def upload_resume(file: UploadFile = File(...)) -> dict:
    if file.content_type not in ("application/pdf", "application/octet-stream") and not (
        file.filename or ""
    ).lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")

    file_bytes = await file.read()
    max_bytes = 8 * 1024 * 1024
    if len(file_bytes) > max_bytes:
        raise HTTPException(status_code=400, detail="File too large (max 8MB).")

    try:
        text = extract_text_from_pdf(file_bytes)
    except PDFParseError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc

    return {"filename": file.filename, "resume_text": text}


def _run_analysis(resume_text: str, job_description: str, filename: str) -> AnalyzeResponse:
    ats_result = score_resume(resume_text, job_description)
    distribution = skill_distribution(resume_text)
    radar = radar_chart_data(resume_text, job_description)
    ai_result = analyze_resume(resume_text, job_description, ats_result)

    response = AnalyzeResponse(
        filename=filename or "resume.pdf",
        ats_score=ats_result,
        skill_distribution=distribution,
        radar_data=radar,
        ai_analysis=ai_result,
        resume_text_preview=resume_text[:500],
        resume_text=resume_text,
        job_description=job_description,
    )

    append_record(
        {
            "id": response.id,
            "created_at": response.created_at,
            "filename": response.filename,
            "overall_score": ats_result.overall_score,
            "match_percentage": ats_result.match_percentage,
            "matched_skills_count": len(ats_result.matched_skills),
            "missing_skills_count": len(ats_result.missing_skills),
            "full_result": response.model_dump(mode="json"),
        }
    )

    return response


@app.post("/api/analyze", response_model=AnalyzeResponse)
async def analyze(payload: AnalyzeRequest) -> AnalyzeResponse:
    if not payload.resume_text or not payload.resume_text.strip():
        raise HTTPException(status_code=400, detail="resume_text is required.")

    return _run_analysis(
        payload.resume_text, payload.job_description or "", payload.filename or "resume.pdf"
    )


_MAX_COMPARE_RESUMES = 4


@app.post("/api/compare", response_model=CompareResponse)
async def compare(payload: CompareRequest) -> CompareResponse:
    if not payload.resumes:
        raise HTTPException(status_code=400, detail="At least one resume is required.")
    if len(payload.resumes) > _MAX_COMPARE_RESUMES:
        raise HTTPException(
            status_code=400, detail=f"Compare at most {_MAX_COMPARE_RESUMES} resumes at a time."
        )
    for r in payload.resumes:
        if not r.resume_text or not r.resume_text.strip():
            raise HTTPException(status_code=400, detail="Each resume must include resume_text.")

    job_description = payload.job_description or ""

    # Run analyses concurrently (each may include a network call to Gemini) so
    # total latency stays close to the slowest single resume rather than the sum.
    with concurrent.futures.ThreadPoolExecutor(max_workers=len(payload.resumes)) as executor:
        futures = [
            executor.submit(_run_analysis, r.resume_text, job_description, r.filename or "resume.pdf")
            for r in payload.resumes
        ]
        results = [f.result() for f in futures]

    ranking = [r.id for r in sorted(results, key=lambda x: x.ats_score.overall_score, reverse=True)]

    return CompareResponse(job_description=job_description, results=results, ranking=ranking)


@app.post("/api/cover-letter", response_model=CoverLetterResponse)
async def cover_letter(payload: CoverLetterRequest) -> CoverLetterResponse:
    if not payload.resume_text or not payload.resume_text.strip():
        raise HTTPException(status_code=400, detail="resume_text is required.")

    text, source = generate_cover_letter(
        payload.resume_text,
        payload.job_description or "",
        payload.company_name or "",
        payload.tone or "professional",
    )
    return CoverLetterResponse(cover_letter=text, source=source)


@app.post("/api/chat", response_model=ChatResponse)
async def chat(payload: ChatRequest) -> ChatResponse:
    if not payload.messages:
        raise HTTPException(status_code=400, detail="messages must include at least one message.")
    if not payload.resume_text or not payload.resume_text.strip():
        raise HTTPException(status_code=400, detail="resume_text is required.")

    reply, source = chat_reply(payload.resume_text, payload.job_description or "", payload.messages)
    return ChatResponse(reply=reply, source=source)


@app.get("/api/history", response_model=list[ResumeHistoryEntry])
def history() -> list[ResumeHistoryEntry]:
    records = get_all_records()
    entries = [
        ResumeHistoryEntry(
            id=r["id"],
            created_at=r["created_at"],
            filename=r["filename"],
            overall_score=r["overall_score"],
            match_percentage=r["match_percentage"],
            matched_skills_count=r["matched_skills_count"],
            missing_skills_count=r["missing_skills_count"],
        )
        for r in records
    ]
    return sorted(entries, key=lambda e: e.created_at, reverse=True)


@app.get("/api/history/{record_id}")
def history_detail(record_id: str) -> dict:
    record = get_record(record_id)
    if record is None:
        raise HTTPException(status_code=404, detail="Record not found.")
    return record.get("full_result", record)


@app.delete("/api/history/{record_id}")
def delete_history_item(record_id: str) -> dict:
    deleted = delete_record(record_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Record not found.")
    return {"deleted": True}


@app.get("/api/dashboard", response_model=DashboardStats)
def dashboard() -> DashboardStats:
    records = get_all_records()
    if not records:
        return DashboardStats(
            total_uploads=0,
            average_score=0,
            highest_score=0,
            lowest_score=0,
            recent_analyses=[],
            score_trend=[],
        )

    scores = [r["overall_score"] for r in records]
    sorted_records = sorted(records, key=lambda r: r["created_at"], reverse=True)

    recent = [
        ResumeHistoryEntry(
            id=r["id"],
            created_at=r["created_at"],
            filename=r["filename"],
            overall_score=r["overall_score"],
            match_percentage=r["match_percentage"],
            matched_skills_count=r["matched_skills_count"],
            missing_skills_count=r["missing_skills_count"],
        )
        for r in sorted_records[:5]
    ]

    trend_source = sorted(records, key=lambda r: r["created_at"])[-20:]
    score_trend = [
        {"date": r["created_at"], "score": r["overall_score"], "filename": r["filename"]}
        for r in trend_source
    ]

    return DashboardStats(
        total_uploads=len(records),
        average_score=round(sum(scores) / len(scores), 2),
        highest_score=max(scores),
        lowest_score=min(scores),
        recent_analyses=recent,
        score_trend=score_trend,
    )
