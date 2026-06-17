import asyncio
import logging
from typing import Optional
from config import settings
from api.schemas import SourceResult

logger = logging.getLogger(__name__)


class BaseScraper:
    source_name: str = "Bilinmeyen Kaynak"

    def __init__(self):
        self.timeout = settings.scraper_timeout
        self.rate_limit_delay = settings.scraper_rate_limit_delay

    async def scrape(self, firma_adi: str) -> Optional[SourceResult]:
        raise NotImplementedError

    def fetch(self, url: str, params: dict = None):
        """Scrapling Fetcher ile senkron GET — scraper'lar asyncio.to_thread ile çağırır."""
        from scrapling.fetchers import Fetcher
        try:
            full_url = url
            if params:
                from urllib.parse import urlencode
                full_url = f"{url}?{urlencode(params)}" if "?" not in url else f"{url}&{urlencode(params)}"
            page = Fetcher.get(full_url, stealthy_headers=True, timeout=self.timeout)
            return page
        except Exception as e:
            logger.warning(f"[{self.source_name}] Fetch hatası: {e}")
            return None

    async def async_fetch(self, url: str, params: dict = None):
        """fetch()'i thread'de çalıştırarak async uyumlu hale getirir."""
        return await asyncio.to_thread(self.fetch, url, params)

    def fetch_stealthy(self, url: str):
        """Anti-bot korumalı siteler için StealthyFetcher kullanır."""
        from scrapling.fetchers import StealthyFetcher
        try:
            page = StealthyFetcher.fetch(url, headless=True, timeout=self.timeout * 1000)
            return page
        except Exception as e:
            logger.warning(f"[{self.source_name}] StealthyFetch hatası: {e}")
            return None

    async def async_fetch_stealthy(self, url: str):
        return await asyncio.to_thread(self.fetch_stealthy, url)

    def empty_result(self, note: str = "Veri bulunamadı.") -> SourceResult:
        return SourceResult(
            kaynak_adi=self.source_name,
            bulunan_icerik_ozeti=note,
            sonuc_sayisi=0,
        )
