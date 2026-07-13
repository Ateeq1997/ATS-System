"""Text normalization helpers.

spaCy's small English model is used when available for lemmatization, but a
regex-based fallback keeps the API functional even in environments where the
model wasn't downloaded (e.g. a constrained serverless cold start).
"""
from __future__ import annotations

import re

_TOKEN_RE = re.compile(r"[a-zA-Z][a-zA-Z0-9+.#/\-]*[a-zA-Z0-9+#]|[a-zA-Z]")
_STOPWORDS = {
    "a", "an", "the", "and", "or", "but", "if", "of", "at", "by", "for",
    "with", "about", "against", "between", "into", "through", "during",
    "to", "from", "in", "on", "is", "are", "was", "were", "be", "been",
    "being", "have", "has", "had", "do", "does", "did", "will", "would",
    "shall", "should", "may", "might", "must", "can", "could", "this",
    "that", "these", "those", "i", "you", "he", "she", "it", "we", "they",
    "as", "than", "then", "so", "such", "not", "no", "nor",
    # generic job-posting / resume filler that isn't a meaningful ATS keyword
    "need", "needs", "needed", "looking", "responsible", "role", "strong",
    "skilled", "skill", "skills", "experience", "experienced", "years",
    "year", "work", "working", "team", "ability", "able", "including",
    "etc", "job", "position", "candidate", "candidates", "required",
    "requirements", "requirement", "preferred", "plus", "using", "use",
    "well", "good", "great", "excellent", "knowledge", "understanding",
}

_nlp = None
_spacy_load_attempted = False


def _get_spacy_model():
    global _nlp, _spacy_load_attempted
    if _spacy_load_attempted:
        return _nlp
    _spacy_load_attempted = True
    try:
        import spacy

        try:
            _nlp = spacy.load("en_core_web_sm")
        except OSError:
            _nlp = spacy.blank("en")
    except Exception:
        _nlp = None
    return _nlp


def clean_text(text: str) -> str:
    text = text.replace("\x00", " ")
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def tokenize(text: str) -> list[str]:
    """Lowercase word tokens, stopwords removed."""
    nlp = _get_spacy_model()
    text = clean_text(text)
    if nlp is not None:
        try:
            doc = nlp(text.lower())
            return [
                tok.lemma_ if tok.lemma_ != "-PRON-" else tok.text
                for tok in doc
                if tok.is_alpha and not tok.is_stop and len(tok.text) > 1
            ]
        except Exception:
            pass
    tokens = _TOKEN_RE.findall(text.lower())
    return [t for t in tokens if t not in _STOPWORDS and len(t) > 1]


def extract_phrases(text: str, phrases: list[str]) -> set[str]:
    """Return which of the given multi-word/single-word phrases occur in text."""
    lowered = f" {clean_text(text).lower()} "
    found = set()
    for phrase in phrases:
        needle = phrase.lower()
        pattern = r"(?<![a-z0-9])" + re.escape(needle) + r"(?![a-z0-9])"
        if re.search(pattern, lowered):
            found.add(phrase)
    return found
