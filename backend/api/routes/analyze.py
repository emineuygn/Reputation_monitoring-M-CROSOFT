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
from db.database import get_db
from db.models import Report

router = APIRouter()


def get_scrapers(analiz_turu: str):
    if analiz_turu == "kisi":
        # Şikayetvar kişiler için uygun değil, LinkedIn kişi modunda çalışır
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
        KapScraper(),
        ForumScraper(),
        LinkedinScraper(kisi_modu=False),
    ]


@router.post("/analyze", response_model=AnalyzeResponse)
async def analyze(request: AnalyzeRequest, db: Session = Depends(get_db)):
    hedef_adi = request.hedef_adi.strip()
    if not hedef_adi:
        raise HTTPException(status_code=400, detail="Hedef adı boş olamaz.")

    scrapers = get_scrapers(request.analiz_turu)

    results = await asyncio.gather(
        *[s.scrape(hedef_adi) for s in scrapers],
        return_exceptions=True,
    )

    source_results = [r for r in results if r is not None and not isinstance(r, Exception)]

    analyzer = RiskAnalyzer()
    analysis = await analyzer.analyze(hedef_adi, source_results, request.analiz_turu)

    report = Report(
        hedef_adi=hedef_adi,
        analiz_turu=request.analiz_turu,
        risk_skoru=analysis.risk_skoru,
        risk_seviyesi=analysis.risk_seviyesi.value,
        ozet=analysis.genel_ozet,
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
    return analysis
