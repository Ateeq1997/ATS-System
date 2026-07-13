"""Simple JSON file storage for resume analysis history.

Vercel serverless functions only guarantee a writable /tmp directory, so we
persist there in production and fall back to a local file during local
development. Storage is intentionally simple (read-modify-write whole file)
since expected volume is low (single-user demo app).
"""
from __future__ import annotations

import json
import os
import threading
from datetime import datetime
from typing import Any

_LOCK = threading.Lock()
_MAX_HISTORY_ITEMS = 200


def _storage_path() -> str:
    if os.environ.get("VERCEL"):
        return "/tmp/resume_history.json"
    return os.path.join(os.path.dirname(__file__), "resume_history.json")


def _read_all() -> list[dict[str, Any]]:
    path = _storage_path()
    if not os.path.exists(path):
        return []
    try:
        with open(path, "r", encoding="utf-8") as f:
            content = f.read().strip()
            return json.loads(content) if content else []
    except (json.JSONDecodeError, OSError):
        return []


def _write_all(records: list[dict[str, Any]]) -> None:
    path = _storage_path()
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(records, f, indent=2, default=str)


def _default_serialize(record: dict[str, Any]) -> dict[str, Any]:
    serialized = dict(record)
    for key, value in serialized.items():
        if isinstance(value, datetime):
            serialized[key] = value.isoformat()
    return serialized


def append_record(record: dict[str, Any]) -> None:
    with _LOCK:
        records = _read_all()
        records.append(_default_serialize(record))
        records = records[-_MAX_HISTORY_ITEMS:]
        _write_all(records)


def get_all_records() -> list[dict[str, Any]]:
    with _LOCK:
        return _read_all()


def get_record(record_id: str) -> dict[str, Any] | None:
    with _LOCK:
        for record in _read_all():
            if record.get("id") == record_id:
                return record
    return None


def delete_record(record_id: str) -> bool:
    with _LOCK:
        records = _read_all()
        filtered = [r for r in records if r.get("id") != record_id]
        if len(filtered) == len(records):
            return False
        _write_all(filtered)
        return True


def clear_all() -> None:
    with _LOCK:
        _write_all([])
