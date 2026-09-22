from typing import Optional
from urllib.parse import quote_plus
from .base_scraper import BaseScraper
from api.schemas import SourceResult, Haber


class NewsScraper(BaseScraper):
    source_name = "Haber Siteleri (Bing News)"

    async def scrape(self, hedef_adi: str) -> Optional[SourceResult]:
        query = quote_plus(f'"{hedef_adi}" haber')
        url = f"https://www.bing.com/news/search?q={query}&format=RSS"
        page = await self.async_fetch(url)
        if not page:
            return self.empty_result("Haber sitelerine erişilemedi.")

        items = page.css("item")[:10]
        if not items:
            return self.empty_result(f"'{hedef_adi}' için haber bulunamadı.")

        haberler = []
        for el in items:
            title = el.css("title::text").get("").strip()
            link = el.css("link::text").get("") or el.css("origLink::text").get("")
            if title:
                haberler.append(Haber(baslik=title, url=link or None))

        ozet = "; ".join(h.baslik for h in haberler[:5])
        return SourceResult(
            kaynak_adi=self.source_name,
            url=f"https://www.bing.com/news/search?q={query}",
            bulunan_icerik_ozeti=ozet,
            sonuc_sayisi=len(haberler),
            haberler=haberler,
        )
