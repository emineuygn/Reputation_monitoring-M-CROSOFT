import os
import tempfile
from pathlib import Path
from jinja2 import Environment, FileSystemLoader
from api.schemas import AnalyzeResponse

TEMPLATE_DIR = Path(__file__).parent / "templates"

SEVERITY_SLUG = {
    "düşük": "dusuk",
    "orta": "orta",
    "yüksek": "yuksek",
}


async def generate_pdf(analysis: AnalyzeResponse) -> str:
    env = Environment(loader=FileSystemLoader(str(TEMPLATE_DIR)))
    template = env.get_template("report_template.html")

    html_content = template.render(
        firma_adi=analysis.firma_adi,
        tarih=analysis.tarih.strftime("%d.%m.%Y %H:%M"),
        rapor_id=analysis.id or "N/A",
        risk_skoru=analysis.risk_skoru,
        risk_seviyesi=analysis.risk_seviyesi.value,
        risk_seviyesi_slug=SEVERITY_SLUG.get(analysis.risk_seviyesi.value, "orta"),
        genel_ozet=analysis.genel_ozet,
        kirmizi_bayraklar=analysis.kirmizi_bayraklar,
        kaynaklar=analysis.kaynaklar,
    )

    tmp = tempfile.NamedTemporaryFile(suffix=".pdf", delete=False)
    tmp.close()

    try:
        from weasyprint import HTML
        HTML(string=html_content, base_url=str(TEMPLATE_DIR)).write_pdf(tmp.name)
    except ImportError:
        # WeasyPrint yoksa basit HTML dosyası oluştur (fallback)
        tmp_html = tmp.name.replace(".pdf", ".html")
        with open(tmp_html, "w", encoding="utf-8") as f:
            f.write(html_content)
        return tmp_html

    return tmp.name
