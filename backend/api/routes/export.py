from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
import json

from api.schemas import AnalyzeResponse, RedFlag, SourceResult, RiskSeverity
from db.database import get_db
from db.models import Report
from pdf.generator import generate_pdf

router = APIRouter()


@router.post("/export/pdf")
async def export_pdf(report_id: int, db: Session = Depends(get_db)):
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Rapor bulunamadı.")

    kirmizi_bayraklar = [
        RedFlag(**item) for item in json.loads(report.kirmizi_bayraklar or "[]")
    ]
    kaynaklar = [
        SourceResult(**item) for item in json.loads(report.kaynaklar or "[]")
    ]
    analysis = AnalyzeResponse(
        id=report.id,
        firma_adi=report.firma_adi,
        risk_skoru=report.risk_skoru,
        risk_seviyesi=RiskSeverity(report.risk_seviyesi),
        kirmizi_bayraklar=kirmizi_bayraklar,
        kaynaklar=kaynaklar,
        genel_ozet=report.ozet or "",
        tarih=report.created_at,
    )

    pdf_path = await generate_pdf(analysis)
    return FileResponse(
        path=pdf_path,
        media_type="application/pdf",
        filename=f"itibar_raporu_{report.firma_adi}_{report.id}.pdf",
    )
