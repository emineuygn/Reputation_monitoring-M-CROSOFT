import re
from typing import Optional
from urllib.parse import quote_plus
from .base_scraper import BaseScraper
from api.schemas import SourceResult, Haber


class SikayetvarScraper(BaseScraper):
    source_name = "Şikayetvar"

    async def scrape(self, hedef_adi: str) -> Optional[SourceResult]:
        slug = hedef_adi.lower().strip()
        slug = re.sub(r'[^a-z0-9ığüşöçı\- ]', '', slug).replace(' ', '-')
        slug = slug.replace('ı', 'i').replace('ğ', 'g').replace('ü', 'u') \
                   .replace('ş', 's').replace('ö', 'o').replace('ç', 'c')
        page_url = f"https://www.sikayetvar.com/{slug}"

        page = await self.async_fetch(page_url)
        if not page:
            return self.empty_result("Şikayetvar'a erişilemedi.")

        html = page.html_content or ""
        counts = re.findall(r'([\d.,]+)\s*[şs]ikayet', html, re.IGNORECASE)
        total = 0
        if counts:
            try:
                total = int(counts[0].replace(".", "").replace(",", ""))
            except ValueError:
                pass

        haberler = []
        for el in page.css("h3 a")[:10]:
            title = el.css("::text").get("").strip()
            href = el.attrib.get("href", "")
            if title:
                full_url = f"https://www.sikayetvar.com{href}" if href.startswith("/") else href or None
                haberler.append(Haber(baslik=title, url=full_url))

        if not haberler and total == 0:
            return self.empty_result(f"'{hedef_adi}' için Şikayetvar'da kayıt bulunamadı.")

        ozet = f"Toplam {total:,} şikayet. ".replace(",", ".") if total else ""
        ozet += "; ".join(h.baslik for h in haberler[:4])
        return SourceResult(
            kaynak_adi=self.source_name,
            url=page_url,
            bulunan_icerik_ozeti=ozet,
            sonuc_sayisi=total or len(haberler),
            haberler=haberler,
        )
