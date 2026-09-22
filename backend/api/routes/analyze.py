import asyncio
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import json

from api.schemas import AnalyzeRequest, AnalyzeResponse
from scraper.news_scraper import NewsScraper
from scraper.google_news_scraper import GoogleNewsScraper
from scraper.sikayetvar_scraper import SikayetvarScraper
from scraper.kap_scraper import KapScraper
from scraper.forum_scraper import ForumScraper
from scraper.linkedin_scraper import LinkedinScraper
from agent.risk_analyzer import RiskAnalyzer
from auth.deps import get_current_user
from db.database import get_db
from db.models import Report, User

router = APIRouter()


def get_scrapers(analiz_turu: str, vergi_no: str = None, nace_kodu: str = None):
    if analiz_turu == "kisi":
        return [
            NewsScraper(),
            GoogleNewsScraper(),
            KapScraper(),
            ForumScraper(),
            LinkedinScraper(kisi_modu=True),
        ]
    return [
        NewsScraper(),
        GoogleNewsScraper(),
        SikayetvarScraper(),
        KapScraper(vergi_no=vergi_no, nace_kodu=nace_kodu),
        ForumScraper(),
        LinkedinScraper(kisi_modu=False),
    ]


@router.post("/analyze", response_model=AnalyzeResponse)
async def analyze(
    request: AnalyzeRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    hedef_adi = request.hedef_adi.strip()
    if not hedef_adi:
        raise HTTPException(status_code=400, detail="Hedef adı boş olamaz.")

    vergi_no = request.vergi_no.strip() if request.vergi_no else None
    nace_kodu = request.nace_kodu.strip() if request.nace_kodu else None

    scrapers = get_scrapers(request.analiz_turu, vergi_no, nace_kodu)

    results = await asyncio.gather(
        *[s.scrape(hedef_adi) for s in scrapers],
        return_exceptions=True,
    )

    source_results = [r for r in results if r is not None and not isinstance(r, Exception)]

    analyzer = RiskAnalyzer()
    analysis = await analyzer.analyze(hedef_adi, source_results, request.analiz_turu)

    report = Report(
        user_id=current_user.id,
        hedef_adi=hedef_adi,
        analiz_turu=request.analiz_turu,
        vergi_no=vergi_no,
        nace_kodu=nace_kodu,
        risk_skoru=analysis.risk_skoru,
        risk_seviyesi=analysis.risk_seviyesi.value,
        ozet=analysis.genel_ozet,
        kisa_yorum=analysis.kisa_yorum,
        kirmizi_bayraklar=json.dumps(
            [f.model_dump() for f in analysis.kirmizi_bayraklar], ensure_ascii=False
        ),
        kaynaklar=json.dumps(
            [s.model_dump() for s in analysis.kaynaklar], ensure_ascii=False
        ),
    )
    db.add(report)
    db.commit()
    db.refresh(report)

    analysis.id = report.id
    analysis.vergi_no = vergi_no
    analysis.nace_kodu = nace_kodu
    return analysis
