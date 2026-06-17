import asyncio
from typing import Optional
from urllib.parse import quote_plus
from .base_scraper import BaseScraper
from api.schemas import SourceResult, Haber


class ForumScraper(BaseScraper):
    source_name = "Forumlar (Ekşi Sözlük / DonanımHaber)"

    async def scrape(self, hedef_adi: str) -> Optional[SourceResult]:
        eksi, donanimhaber = await asyncio.gather(
            self._scrape_eksi(hedef_adi),
            self._scrape_donanimhaber(hedef_adi),
        )

        haberler = eksi + donanimhaber
        if not haberler:
            return self.empty_result(f"'{hedef_adi}' için forumlarda içerik bulunamadı.")

        ozet = "; ".join(h.baslik[:80] for h in haberler[:5])
        return SourceResult(
            kaynak_adi=self.source_name,
            url=f"https://eksisozluk.com/?q={quote_plus(hedef_adi)}",
            bulunan_icerik_ozeti=ozet,
            sonuc_sayisi=len(haberler),
            haberler=haberler,
        )

    async def _scrape_eksi(self, hedef_adi: str) -> list[Haber]:
        q = quote_plus(hedef_adi)
        page = await self.async_fetch(f"https://eksisozluk.com/?q={q}&_f=1")
        if not page:
            return []

        # Sayfa başlığından slug al (redirect sonrası URL'i bilemeyiz ama title'dan slug türetilebilir)
        page_title = page.css("title::text").get("").split(" - ")[0].strip()
        haberler = []
        for li in page.css("li[data-id]")[:8]:
            texts = [t.strip() for t in li.css("div.content::text").getall() if t.strip()]
            entry_id = li.attrib.get("data-id", "")
            if texts and texts[0] not in ("(bkz:", ")"):
                url = f"https://eksisozluk.com/entry/{entry_id}" if entry_id else None
                haberler.append(Haber(baslik=texts[0][:120], url=url))

        return haberler

    async def _scrape_donanimhaber(self, hedef_adi: str) -> list[Haber]:
        q = quote_plus(f"site:forum.donanimhaber.com {hedef_adi}")
        page = await self.async_fetch(f"https://lite.duckduckgo.com/lite/?q={q}")
        if not page:
            return []

        haberler = []
        titles = page.css("a.result-link::text").getall()[:5]
        links = [a.attrib.get("href", "") for a in page.css("a.result-link")[:5]]
        for title, link in zip(titles, links):
            if title.strip():
                haberler.append(Haber(baslik=title.strip(), url=link or None))
        return haberler
