import json
from pathlib import Path
from typing import List, Optional

from fastapi import APIRouter, Query

from api.schemas import NaceKodu

router = APIRouter()

_DATA_PATH = Path(__file__).resolve().parent.parent.parent / "data" / "nace_kodlari.json"
_NACE_KODLARI: List[NaceKodu] = [
    NaceKodu(**item) for item in json.loads(_DATA_PATH.read_text(encoding="utf-8"))
]


def _tr_normalize(text: str) -> str:
    return text.replace("İ", "i").replace("I", "ı").lower()


@router.get("/nace", response_model=List[NaceKodu])
def search_nace(q: Optional[str] = Query(None, min_length=0), limit: int = 20):
    if not q or not q.strip():
        return _NACE_KODLARI[:limit]

    needle = _tr_normalize(q.strip())
    results = [
        n for n in _NACE_KODLARI
        if needle in _tr_normalize(n.kod) or needle in _tr_normalize(n.aciklama)
    ]
    return results[:limit]
