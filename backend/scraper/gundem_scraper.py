from typing import List
from urllib.parse import quote_plus
from .base_scraper import BaseScraper
from api.schemas import GundemHaber

RISK_QUERY = (
    '(dolandırıcılık OR yolsuzluk OR "rüşvet soruşturması" OR iflas OR '
    'konkordato OR "zimmete para geçirme" OR "vurgun" OR skandal) Türkiye'
)


class GundemScraper(BaseScraper):
    source_name = "Gündem"

    async def fetch_gundem(self, limit: int = 8) -> List[GundemHaber]:
        query = quote_plus(RISK_QUERY)
        url = f"https://news.google.com/rss/search?q={query}&hl=tr&gl=TR&ceid=TR:tr"
        page = await self.async_fetch(url)
        if not page:
            return []

        items = page.css("item")[:limit]
        haberler = []
        for el in items:
            title = el.css("title::text").get("").strip()
            link = el.css("link::text").get("").strip()
            source = el.css("source::text").get("").strip() or "Google Haberler"
            if title:
                haberler.append(GundemHaber(baslik=title, url=link or None, kaynak=source))
        return haberler
