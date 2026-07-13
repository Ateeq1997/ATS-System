"""ATS scoring engine: keyword matching, skills gap analysis and an overall
match percentage computed via TF-IDF cosine similarity between the resume
and the (optional) job description.
"""
from __future__ import annotations

import re

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

from models.schemas import ATSScoreResult, RadarDatum, SkillCategoryDistribution
from utils.skills_db import SKILL_CATEGORIES, all_skills, category_for_skill
from utils.text_processing import clean_text, extract_phrases, tokenize

_FORMATTING_PENALTIES = [
    (re.compile(r"(table|text ?box)", re.I), "May contain tables/text boxes that confuse ATS parsers"),
]

_SECTION_HEADERS = [
    "experience", "education", "skills", "summary", "projects",
    "certifications", "contact",
]


def _formatting_score(resume_text: str) -> float:
    score = 100.0
    lowered = resume_text.lower()
    present_sections = sum(1 for h in _SECTION_HEADERS if h in lowered)
    score -= (len(_SECTION_HEADERS) - present_sections) * 6
    if len(resume_text) < 400:
        score -= 20
    email_found = re.search(r"[\w.+-]+@[\w-]+\.[\w.-]+", resume_text)
    phone_found = re.search(r"(\+?\d[\d\-\s()]{7,}\d)", resume_text)
    if not email_found:
        score -= 10
    if not phone_found:
        score -= 5
    return max(0.0, min(100.0, score))


def _tfidf_similarity(resume_text: str, job_text: str) -> float:
    if not job_text.strip():
        return 0.0
    vectorizer = TfidfVectorizer(stop_words="english")
    try:
        matrix = vectorizer.fit_transform([resume_text, job_text])
    except ValueError:
        return 0.0
    similarity = cosine_similarity(matrix[0:1], matrix[1:2])[0][0]
    return float(round(similarity * 100, 2))


def score_resume(resume_text: str, job_description: str = "") -> ATSScoreResult:
    resume_text = clean_text(resume_text)
    job_description = clean_text(job_description or "")

    candidate_skills = all_skills()
    matched_skills = sorted(extract_phrases(resume_text, candidate_skills))

    if job_description:
        job_skills = sorted(extract_phrases(job_description, candidate_skills))
        missing_skills = sorted(set(job_skills) - set(matched_skills))
        keyword_pool = job_skills or candidate_skills
    else:
        job_skills = []
        missing_skills = []
        keyword_pool = matched_skills

    resume_tokens = set(tokenize(resume_text))
    if job_description:
        job_tokens = [t for t in tokenize(job_description)]
        # keep top unique keywords by frequency for a readable keyword list
        seen: dict[str, int] = {}
        for t in job_tokens:
            seen[t] = seen.get(t, 0) + 1
        ranked = sorted(seen.items(), key=lambda kv: -kv[1])
        job_keywords = [k for k, _ in ranked[:40]]
    else:
        job_keywords = list(dict.fromkeys(keyword_pool))[:40]

    matched_keywords = sorted(k for k in job_keywords if k in resume_tokens or k in matched_skills)
    missing_keywords = sorted(set(job_keywords) - set(matched_keywords))

    if job_description:
        total_relevant = len(job_skills) or 1
        match_percentage = round(len(set(job_skills) & set(matched_skills)) / total_relevant * 100, 2)
        similarity_score = _tfidf_similarity(resume_text, job_description)
        match_percentage = round((match_percentage * 0.6) + (similarity_score * 0.4), 2)
    else:
        match_percentage = round(len(matched_skills) / max(len(candidate_skills), 1) * 100, 2)

    keyword_score = round(
        (len(matched_keywords) / max(len(job_keywords), 1)) * 100, 2
    ) if job_keywords else 0.0

    formatting = _formatting_score(resume_text)

    overall = round((match_percentage * 0.5) + (keyword_score * 0.3) + (formatting * 0.2), 2)

    return ATSScoreResult(
        overall_score=min(100.0, overall),
        match_percentage=min(100.0, match_percentage),
        keyword_score=min(100.0, keyword_score),
        formatting_score=formatting,
        matched_keywords=matched_keywords,
        missing_keywords=missing_keywords,
        matched_skills=matched_skills,
        missing_skills=missing_skills,
    )


def skill_distribution(resume_text: str) -> list[SkillCategoryDistribution]:
    resume_text = clean_text(resume_text)
    distribution = []
    for category, skills in SKILL_CATEGORIES.items():
        found = sorted(extract_phrases(resume_text, skills))
        if found:
            distribution.append(
                SkillCategoryDistribution(category=category, count=len(found), skills=found)
            )
    return distribution


# A category is considered "fully covered" once this many distinct skills in
# it are detected — chosen so radar shapes stay legible instead of shrinking
# toward zero against categories with a large taxonomy (e.g. 16 languages).
_RADAR_SATURATION_COUNT = 4


def _category_coverage(found_count: int) -> float:
    return round(min(found_count / _RADAR_SATURATION_COUNT, 1.0) * 100, 2)


def radar_chart_data(resume_text: str, job_description: str = "") -> list[RadarDatum]:
    resume_text = clean_text(resume_text)
    job_description = clean_text(job_description or "")
    radar = []
    for category, skills in SKILL_CATEGORIES.items():
        resume_found = extract_phrases(resume_text, skills)
        resume_score = _category_coverage(len(resume_found))
        if job_description:
            job_found = extract_phrases(job_description, skills)
            job_score = _category_coverage(len(job_found))
        else:
            job_score = 0.0
        radar.append(RadarDatum(category=category, resume_score=resume_score, job_score=job_score))
    return radar
