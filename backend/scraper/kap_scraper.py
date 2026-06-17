from typing import Optional
from urllib.parse import quote_plus
from .base_scraper import BaseScraper
from api.schemas import SourceResult, Haber

CRITICAL_KEYWORDS = [
    "iflas", "konkordato", "tasfiye", "icra", "haciz",
    "yönetim değişikliği", "özel durum", "sermaye azaltımı",
    "faaliyet durdurma", "borç", "temerrüt",
]


class KapScraper(BaseScraper):
    source_name = "KAP (Kamuyu Aydınlatma Platformu)"

    async def scrape(self, hedef_adi: str) -> Optional[SourceResult]:
        query = quote_plus(f'KAP {hedef_adi} bildiri')
        url = f"https://news.google.com/rss/search?q={query}&hl=tr&gl=TR&ceid=TR:tr"
        page = await self.async_fetch(url)
        if not page:
            return self.empty_result("KAP bildiri araması başarısız.")

        items = page.css("item")[:15]
        if not items:
            return self.empty_result(f"'{hedef_adi}' için KAP bildirimi bulunamadı.")

        haberler = []
        for el in items:
            title = el.css("title::text").get("").strip()
            link = el.css("link::text").get("").strip()
            if title:
                haberler.append(Haber(baslik=title, url=link or None))

        # Kritik içerikleri öne al
        haberler.sort(
            key=lambda h: any(kw in h.baslik.lower() for kw in CRITICAL_KEYWORDS),
            reverse=True,
        )

        ozet = "; ".join(h.baslik for h in haberler[:5])
        return SourceResult(
            kaynak_adi=self.source_name,
            url=f"https://www.kap.org.tr/tr/ara?q={quote_plus(hedef_adi)}",
            bulunan_icerik_ozeti=ozet,
            sonuc_sayisi=len(haberler),
            haberler=haberler,
        )
