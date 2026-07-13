"""Extract raw text from an uploaded PDF resume."""
from __future__ import annotations

import io

from PyPDF2 import PdfReader

from utils.text_processing import clean_text


class PDFParseError(Exception):
    pass


def extract_text_from_pdf(file_bytes: bytes) -> str:
    if not file_bytes:
        raise PDFParseError("Empty file received.")

    try:
        reader = PdfReader(io.BytesIO(file_bytes))
    except Exception as exc:  # noqa: BLE001
        raise PDFParseError(f"Could not read PDF: {exc}") from exc

    if reader.is_encrypted:
        try:
            reader.decrypt("")
        except Exception as exc:  # noqa: BLE001
            raise PDFParseError("PDF is password protected.") from exc

    pages_text = []
    for page in reader.pages:
        try:
            pages_text.append(page.extract_text() or "")
        except Exception:  # noqa: BLE001
            continue

    text = clean_text("\n".join(pages_text))
    if not text:
        raise PDFParseError(
            "No extractable text found in PDF. It may be a scanned image."
        )
    return text
