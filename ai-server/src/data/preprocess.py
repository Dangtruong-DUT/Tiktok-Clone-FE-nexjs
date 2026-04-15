from __future__ import annotations

import re
import unicodedata
from typing import Dict

_URL_RE = re.compile(r"https?://\S+|www\.\S+")
_MENTION_RE = re.compile(r"@[a-zA-Z0-9_\.]+")
_MULTI_SPACE_RE = re.compile(r"\s+")


def remove_diacritics(text: str) -> str:
    normalized = unicodedata.normalize("NFD", text)
    return re.sub(r"[\u0300-\u036f]", "", normalized)


def normalize_text(text: str, cfg: Dict) -> str:
    value = text or ""

    if cfg.get("lowercase", True):
        value = value.lower()

    if cfg.get("strip_urls", True):
        value = _URL_RE.sub(" ", value)

    if cfg.get("strip_mentions", True):
        value = _MENTION_RE.sub(" ", value)

    if cfg.get("normalize_vi_ascii", False):
        value = remove_diacritics(value)

    value = re.sub(r"[^\w\s]", " ", value, flags=re.UNICODE)

    if cfg.get("collapse_spaces", True):
        value = _MULTI_SPACE_RE.sub(" ", value).strip()

    return value
