"""AI-powered resume analysis using Google's Gemini API.

Falls back to a deterministic heuristic analysis (derived from the ATS
score) when GEMINI_API_KEY is not configured or the API call fails, so the
feature degrades gracefully instead of breaking the app.
"""
from __future__ import annotations

import json
import os
import re

from models.schemas import AIAnalysis, ATSScoreResult, ChatMessage

_GEMINI_MODEL = os.environ.get("GEMINI_MODEL", "gemini-1.5-flash")


def _get_gemini_model():
    """Return a configured Gemini model instance, or None if no API key is set."""
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        return None
    try:
        import google.generativeai as genai

        genai.configure(api_key=api_key)
        return genai.GenerativeModel(_GEMINI_MODEL)
    except Exception:  # noqa: BLE001
        return None

_PROMPT_TEMPLATE = """You are an expert technical recruiter and resume coach.
Analyze the following resume{jd_clause}.

Resume:
---
{resume_text}
---
{jd_block}

Respond ONLY with valid JSON matching this exact schema, no markdown fences:
{{
  "strengths": ["..."],
  "weaknesses": ["..."],
  "suggestions": ["..."],
  "rewrite_suggestions": ["..."],
  "summary": "one paragraph overall assessment"
}}
Keep each list to at most 5 concise, specific, actionable bullet points.
"""


def _build_prompt(resume_text: str, job_description: str) -> str:
    jd_clause = " against the target job description" if job_description else ""
    jd_block = f"Job Description:\n---\n{job_description}\n---" if job_description else ""
    return _PROMPT_TEMPLATE.format(
        jd_clause=jd_clause,
        resume_text=resume_text[:6000],
        jd_block=jd_block[:3000],
    )


def _parse_json_response(raw: str) -> dict:
    cleaned = raw.strip()
    cleaned = re.sub(r"^```(json)?", "", cleaned).strip()
    cleaned = re.sub(r"```$", "", cleaned).strip()
    return json.loads(cleaned)


def _call_gemini(resume_text: str, job_description: str) -> AIAnalysis | None:
    model = _get_gemini_model()
    if model is None:
        return None

    try:
        prompt = _build_prompt(resume_text, job_description)
        response = model.generate_content(prompt)
        data = _parse_json_response(response.text)
        return AIAnalysis(
            strengths=data.get("strengths", []),
            weaknesses=data.get("weaknesses", []),
            suggestions=data.get("suggestions", []),
            rewrite_suggestions=data.get("rewrite_suggestions", []),
            summary=data.get("summary", ""),
            source="gemini",
        )
    except Exception:  # noqa: BLE001
        return None


def _heuristic_analysis(ats_result: ATSScoreResult, job_description: str) -> AIAnalysis:
    strengths = []
    weaknesses = []
    suggestions = []
    rewrite_suggestions = [
        "Lead bullet points with strong action verbs (e.g. 'Led', 'Built', 'Optimized').",
        "Quantify achievements with metrics (%, $, time saved, users impacted).",
    ]

    if ats_result.matched_skills:
        strengths.append(
            f"Demonstrates {len(ats_result.matched_skills)} relevant skills, including "
            f"{', '.join(ats_result.matched_skills[:5])}."
        )
    if ats_result.formatting_score >= 80:
        strengths.append("Resume formatting includes clear, ATS-friendly section headers.")
    if not strengths:
        strengths.append("Resume was successfully parsed and contains readable content.")

    if ats_result.missing_skills:
        weaknesses.append(
            f"Missing {len(ats_result.missing_skills)} skills the job description emphasizes: "
            f"{', '.join(ats_result.missing_skills[:5])}."
        )
        suggestions.append(
            "Add concrete examples of experience with: "
            f"{', '.join(ats_result.missing_skills[:5])}."
        )
    if ats_result.formatting_score < 80:
        weaknesses.append("Some standard resume sections or contact details may be missing.")
        suggestions.append("Ensure Contact, Summary, Experience, Education, and Skills sections are all present.")
    if not job_description:
        suggestions.append("Paste a target job description for a more tailored gap analysis.")
    if not weaknesses:
        weaknesses.append("No major issues detected, but keep tailoring content per application.")

    summary = (
        f"This resume scores {ats_result.overall_score:.0f}/100 overall with a "
        f"{ats_result.match_percentage:.0f}% match to the target role. "
        "Focus on closing the skill gaps below and quantifying impact in each bullet."
    )

    return AIAnalysis(
        strengths=strengths,
        weaknesses=weaknesses,
        suggestions=suggestions,
        rewrite_suggestions=rewrite_suggestions,
        summary=summary,
        source="heuristic",
    )


def analyze_resume(resume_text: str, job_description: str, ats_result: ATSScoreResult) -> AIAnalysis:
    result = _call_gemini(resume_text, job_description)
    if result is not None:
        return result
    return _heuristic_analysis(ats_result, job_description)


_COVER_LETTER_PROMPT = """You are an expert career coach writing a cover letter on behalf of a candidate.

Resume:
---
{resume_text}
---
{jd_block}

Write a {tone} cover letter{company_clause}. Keep it to 3-4 short paragraphs,
grounded only in experience actually present in the resume above (never invent
employers, titles, or skills). Address it "Dear Hiring Manager," unless a
company name is given. Return plain text only, no markdown, no subject line.
"""


def generate_cover_letter(
    resume_text: str,
    job_description: str = "",
    company_name: str = "",
    tone: str = "professional",
) -> tuple[str, str]:
    """Returns (cover_letter_text, source)."""
    model = _get_gemini_model()
    if model is not None:
        try:
            jd_block = f"Job Description:\n---\n{job_description[:3000]}\n---" if job_description else ""
            company_clause = f" for a role at {company_name}" if company_name else ""
            prompt = _COVER_LETTER_PROMPT.format(
                resume_text=resume_text[:6000],
                jd_block=jd_block,
                tone=tone or "professional",
                company_clause=company_clause,
            )
            response = model.generate_content(prompt)
            text = (response.text or "").strip()
            if text:
                return text, "gemini"
        except Exception:  # noqa: BLE001
            pass

    return _heuristic_cover_letter(resume_text, job_description, company_name), "heuristic"


def _heuristic_cover_letter(resume_text: str, job_description: str, company_name: str) -> str:
    from utils.skills_db import all_skills
    from utils.text_processing import extract_phrases

    skills = sorted(extract_phrases(resume_text, all_skills()))[:6]
    skills_clause = ", ".join(skills) if skills else "a diverse technical toolkit"
    company_clause = f"at {company_name}" if company_name else "at your organization"
    role_clause = "this role" if job_description else "opportunities on your team"

    return (
        "Dear Hiring Manager,\n\n"
        f"I'm writing to express my interest in {role_clause} {company_clause}. "
        f"My background includes hands-on experience with {skills_clause}, which I believe "
        "aligns well with what you're looking for.\n\n"
        "Throughout my career, I've focused on delivering measurable results, collaborating "
        "closely with cross-functional teams, and continuously building on my technical skill set. "
        "I'm confident I can bring that same focus and reliability to this position.\n\n"
        "I'd welcome the chance to discuss how my experience can contribute to your team. "
        "Thank you for your time and consideration.\n\nSincerely,\nA motivated candidate"
    )


_CHAT_SYSTEM_PROMPT = """You are a helpful, encouraging resume coach chatbot. Answer the
candidate's question about their resume{jd_clause}, using only information present
in the resume/job description below. Be specific and concise (2-5 sentences unless
more detail is clearly needed). If asked something the resume can't answer, say so honestly.

Resume:
---
{resume_text}
---
{jd_block}
"""


def chat_reply(
    resume_text: str,
    job_description: str,
    messages: list[ChatMessage],
) -> tuple[str, str]:
    """Returns (reply_text, source). Stateless: the full message history is passed in each call."""
    model = _get_gemini_model()
    if model is not None and messages:
        try:
            jd_clause = " against the target job description" if job_description else ""
            jd_block = f"Job Description:\n---\n{job_description[:3000]}\n---" if job_description else ""
            system = _CHAT_SYSTEM_PROMPT.format(
                jd_clause=jd_clause, resume_text=resume_text[:6000], jd_block=jd_block
            )
            history = [{"role": "user", "parts": [system]}, {"role": "model", "parts": ["Understood."]}]
            for m in messages[:-1]:
                role = "model" if m.role == "assistant" else "user"
                history.append({"role": role, "parts": [m.content]})
            chat = model.start_chat(history=history)
            response = chat.send_message(messages[-1].content)
            text = (response.text or "").strip()
            if text:
                return text, "gemini"
        except Exception:  # noqa: BLE001
            pass

    return _heuristic_chat_reply(messages), "heuristic"


def _heuristic_chat_reply(messages: list[ChatMessage]) -> str:
    question = messages[-1].content.lower() if messages else ""
    if any(w in question for w in ("weak", "gap", "missing", "improve")):
        return (
            "Without a live AI connection I can only give general guidance: check the "
            "\"Weaknesses\" and \"Suggestions\" tabs in the AI Analysis panel above — they "
            "already list the specific gaps found for this resume."
        )
    if any(w in question for w in ("strength", "good", "well")):
        return (
            "See the \"Strengths\" tab in the AI Analysis panel above for the specific "
            "strengths detected in this resume."
        )
    if any(w in question for w in ("rewrite", "bullet", "phrase", "word")):
        return (
            "See the \"Rewrite Tips\" tab above for concrete phrasing suggestions. In general: "
            "start bullets with a strong action verb and quantify the result."
        )
    return (
        "I can't reach the AI service right now (no GEMINI_API_KEY configured), so I can only "
        "point you at the ATS Score, Keywords, and AI Analysis sections above for details on "
        "this resume. Ask me about strengths, weaknesses, or rewrite tips and I'll point you "
        "to the right section."
    )
