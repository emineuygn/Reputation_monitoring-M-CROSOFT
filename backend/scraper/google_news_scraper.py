from typing import Optional
from urllib.parse import quote_plus
from .base_scraper import BaseScraper
from api.schemas import SourceResult, Haber


class GoogleNewsScraper(BaseScraper):
    source_name = "Google Haberler"

    async def scrape(self, hedef_adi: str) -> Optional[SourceResult]:
        query = quote_plus(f'"{hedef_adi}"')
        url = f"https://news.google.com/rss/search?q={query}&hl=tr&gl=TR&ceid=TR:tr"
        page = await self.async_fetch(url)
        if not page:
            return self.empty_result("Google Haberler'e erişilemedi.")

        items = page.css("item")[:10]
        if not items:
            return self.empty_result(f"'{hedef_adi}' için Google haber bulunamadı.")

        haberler = []
        for el in items:
            title = el.css("title::text").get("").strip()
            link = self.extract_google_news_link(el)
            if title:
                haberler.append(Haber(baslik=title, url=link))

        ozet = "; ".join(h.baslik for h in haberler[:5])
        return SourceResult(
            kaynak_adi=self.source_name,
            url=f"https://news.google.com/search?q={query}&hl=tr",
            bulunan_icerik_ozeti=ozet,
            sonuc_sayisi=len(haberler),
            haberler=haberler,
        )
