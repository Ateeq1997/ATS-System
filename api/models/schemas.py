"""Pydantic models shared across the API."""
from __future__ import annotations

from datetime import datetime
from typing import List, Optional
from uuid import uuid4

from pydantic import BaseModel, Field


class SkillMatch(BaseModel):
    skill: str
    matched: bool
    importance: float = 1.0


class ATSScoreResult(BaseModel):
    overall_score: float
    match_percentage: float
    keyword_score: float
    formatting_score: float
    matched_keywords: List[str] = Field(default_factory=list)
    missing_keywords: List[str] = Field(default_factory=list)
    matched_skills: List[str] = Field(default_factory=list)
    missing_skills: List[str] = Field(default_factory=list)


class SkillCategoryDistribution(BaseModel):
    category: str
    count: int
    skills: List[str] = Field(default_factory=list)


class RadarDatum(BaseModel):
    category: str
    resume_score: float
    job_score: float


class AIAnalysis(BaseModel):
    strengths: List[str] = Field(default_factory=list)
    weaknesses: List[str] = Field(default_factory=list)
    suggestions: List[str] = Field(default_factory=list)
    rewrite_suggestions: List[str] = Field(default_factory=list)
    summary: str = ""
    source: str = "gemini"  # "gemini" | "heuristic"


class AnalyzeRequest(BaseModel):
    resume_text: str
    job_description: Optional[str] = ""
    filename: Optional[str] = "resume.pdf"


class AnalyzeResponse(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid4()))
    created_at: datetime = Field(default_factory=datetime.utcnow)
    filename: str
    ats_score: ATSScoreResult
    skill_distribution: List[SkillCategoryDistribution]
    radar_data: List[RadarDatum]
    ai_analysis: AIAnalysis
    resume_text_preview: str
    resume_text: str = ""
    job_description: str = ""


class ResumeHistoryEntry(BaseModel):
    id: str
    created_at: datetime
    filename: str
    overall_score: float
    match_percentage: float
    matched_skills_count: int
    missing_skills_count: int


class DashboardStats(BaseModel):
    total_uploads: int
    average_score: float
    highest_score: float
    lowest_score: float
    recent_analyses: List[ResumeHistoryEntry]
    score_trend: List[dict]


class CompareResumeInput(BaseModel):
    resume_text: str
    filename: Optional[str] = "resume.pdf"


class CompareRequest(BaseModel):
    resumes: List[CompareResumeInput]
    job_description: Optional[str] = ""


class CompareResponse(BaseModel):
    job_description: str = ""
    results: List[AnalyzeResponse]
    ranking: List[str] = Field(default_factory=list)  # result ids, best first


class CoverLetterRequest(BaseModel):
    resume_text: str
    job_description: Optional[str] = ""
    company_name: Optional[str] = ""
    tone: Optional[str] = "professional"


class CoverLetterResponse(BaseModel):
    cover_letter: str
    source: str = "gemini"  # "gemini" | "heuristic"


class ChatMessage(BaseModel):
    role: str  # "user" | "assistant"
    content: str


class ChatRequest(BaseModel):
    resume_text: str
    job_description: Optional[str] = ""
    messages: List[ChatMessage]


class ChatResponse(BaseModel):
    reply: str
    source: str = "gemini"  # "gemini" | "heuristic"
