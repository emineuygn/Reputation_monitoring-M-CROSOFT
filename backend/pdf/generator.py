import os
import sys
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


def _ensure_weasyprint_native_libs():
    """macOS'ta Homebrew ile kurulan Pango/Cairo, dyld'in varsayılan arama
    yollarında değil — WeasyPrint'in dlopen çağrısından önce eklenmesi gerekiyor."""
    if sys.platform != "darwin":
        return
    for lib_dir in ("/opt/homebrew/lib", "/usr/local/lib"):
        if os.path.isdir(lib_dir):
            current = os.environ.get("DYLD_LIBRARY_PATH", "")
            if lib_dir not in current.split(":"):
                os.environ["DYLD_LIBRARY_PATH"] = f"{lib_dir}:{current}" if current else lib_dir


async def generate_pdf(analysis: AnalyzeResponse) -> str:
    env = Environment(loader=FileSystemLoader(str(TEMPLATE_DIR)))
    template = env.get_template("report_template.html")

    html_content = template.render(
        hedef_adi=analysis.hedef_adi,
        hedef_etiketi="Kişi" if analysis.analiz_turu == "kisi" else "Firma",
        vergi_no=analysis.vergi_no,
        nace_kodu=analysis.nace_kodu,
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
        _ensure_weasyprint_native_libs()
        from weasyprint import HTML
        HTML(string=html_content, base_url=str(TEMPLATE_DIR)).write_pdf(tmp.name)
    except ImportError:
        tmp_html = tmp.name.replace(".pdf", ".html")
        with open(tmp_html, "w", encoding="utf-8") as f:
            f.write(html_content)
        return tmp_html

    return tmp.name
