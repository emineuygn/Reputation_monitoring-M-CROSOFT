from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends

from api.schemas import GundemResponse
from auth.deps import get_current_user
from db.models import User
from scraper.gundem_scraper import GundemScraper

router = APIRouter()

_CACHE_TTL = timedelta(hours=1)
_cache: dict = {"data": None, "fetched_at": None}


@router.get("/gundem", response_model=GundemResponse)
async def get_gundem(current_user: User = Depends(get_current_user)):
    now = datetime.now(timezone.utc)
    stale = (
        _cache["data"] is None
        or _cache["fetched_at"] is None
        or now - _cache["fetched_at"] > _CACHE_TTL
    )

    if stale:
        haberler = await GundemScraper().fetch_gundem()
        if haberler or _cache["data"] is None:
            _cache["data"] = haberler
            _cache["fetched_at"] = now

    return GundemResponse(haberler=_cache["data"] or [], guncellenme=_cache["fetched_at"] or now)
