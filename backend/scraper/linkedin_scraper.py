from typing import Optional
from urllib.parse import quote_plus
from .base_scraper import BaseScraper
from api.schemas import SourceResult, Haber


class LinkedinScraper(BaseScraper):
    source_name = "LinkedIn"

    def __init__(self, kisi_modu: bool = False):
        super().__init__()
        self.kisi_modu = kisi_modu

    async def scrape(self, hedef_adi: str) -> Optional[SourceResult]:
        if self.kisi_modu:
            return await self._scrape_person(hedef_adi)
        return await self._scrape_company(hedef_adi)

    async def _scrape_company(self, firma_adi: str) -> Optional[SourceResult]:
        slug = firma_adi.lower().replace(" ", "-").replace(".", "")
        url = f"https://www.linkedin.com/company/{slug}"
        page = await self.async_fetch_stealthy(url)
        if not page:
            return self.empty_result("LinkedIn şirket sayfasına erişilemedi.")

        title = page.css("title::text").get("") or ""
        tagline = page.css(".org-top-card-summary__tagline::text, p.break-words::text").get("").strip()
        employee = page.css(".org-about-company-module__company-staff-count-range::text").get("").strip()

        parts = [p for p in [tagline, employee] if p]
        ozet = " | ".join(parts) if parts else f"LinkedIn sayfası: {title.strip()}"

        haberler = [Haber(baslik=ozet, url=url)] if parts else []
        return SourceResult(
            kaynak_adi=self.source_name,
            url=url,
            bulunan_icerik_ozeti=ozet,
            sonuc_sayisi=1 if parts else 0,
            haberler=haberler,
        )

    async def _scrape_person(self, kisi_adi: str) -> Optional[SourceResult]:
        query = quote_plus(f'site:linkedin.com/in "{kisi_adi}"')
        page = await self.async_fetch(f"https://www.bing.com/search?q={query}&count=5")
        if not page:
            return self.empty_result("LinkedIn kişi araması başarısız.")

        haberler = []
        for el in page.css(".b_algo h2 a")[:5]:
            title = el.css("::text").get("").strip()
            href = el.attrib.get("href", "")
            if title and "linkedin.com/in" in href:
                haberler.append(Haber(baslik=title, url=href))

        if not haberler:
            return self.empty_result(f"'{kisi_adi}' için LinkedIn profili bulunamadı.")

        ozet = "; ".join(h.baslik for h in haberler[:3])
        return SourceResult(
            kaynak_adi=self.source_name,
            url=haberler[0].url,
            bulunan_icerik_ozeti=ozet,
            sonuc_sayisi=len(haberler),
            haberler=haberler,
        )
