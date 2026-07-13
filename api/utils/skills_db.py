"""Static skills taxonomy used for keyword / skill matching.

This intentionally avoids any network calls or heavyweight ML model
downloads so it works reliably inside a Vercel serverless function.
"""
from __future__ import annotations

SKILL_CATEGORIES: dict[str, list[str]] = {
    "Programming Languages": [
        "python", "javascript", "typescript", "java", "c++", "c#", "go", "rust",
        "php", "ruby", "kotlin", "swift", "sql", "r", "scala", "matlab",
    ],
    "Frontend": [
        "react", "vue", "angular", "next.js", "redux", "tailwind css", "html",
        "css", "sass", "webpack", "vite", "framer motion", "bootstrap",
    ],
    "Backend": [
        "node.js", "express", "fastapi", "django", "flask", "spring boot",
        "graphql", "rest api", "microservices", "nginx", "grpc",
    ],
    "Data & AI": [
        "machine learning", "deep learning", "nlp", "pytorch", "tensorflow",
        "scikit-learn", "pandas", "numpy", "data analysis", "spacy",
        "computer vision", "llm", "generative ai",
    ],
    "Cloud & DevOps": [
        "aws", "azure", "gcp", "docker", "kubernetes", "ci/cd", "terraform",
        "jenkins", "github actions", "vercel", "linux",
    ],
    "Databases": [
        "postgresql", "mysql", "mongodb", "redis", "sqlite", "dynamodb",
        "elasticsearch", "firebase",
    ],
    "Soft Skills": [
        "leadership", "communication", "teamwork", "problem solving",
        "project management", "agile", "scrum", "mentoring", "collaboration",
    ],
    "Tools": [
        "git", "jira", "figma", "postman", "vs code", "confluence",
    ],
}


def all_skills() -> list[str]:
    return [skill for skills in SKILL_CATEGORIES.values() for skill in skills]


def category_for_skill(skill: str) -> str:
    lowered = skill.lower()
    for category, skills in SKILL_CATEGORIES.items():
        if lowered in skills:
            return category
    return "Other"
