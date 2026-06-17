from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import json

from api.schemas import AnalyzeResponse, RedFlag, SourceResult, RiskSeverity
from db.database import get_db
from db.models import Report

router = APIRouter()


def report_to_schema(report: Report) -> AnalyzeResponse:
    kirmizi_bayraklar = [
        RedFlag(**item) for item in json.loads(report.kirmizi_bayraklar or "[]")
    ]
    kaynaklar = [
        SourceResult(**item) for item in json.loads(report.kaynaklar or "[]")
    ]
    return AnalyzeResponse(
        id=report.id,
        hedef_adi=report.hedef_adi,
        analiz_turu=report.analiz_turu or "sirket",
        risk_skoru=report.risk_skoru,
        risk_seviyesi=RiskSeverity(report.risk_seviyesi),
        kirmizi_bayraklar=kirmizi_bayraklar,
        kaynaklar=kaynaklar,
        genel_ozet=report.ozet or "",
        tarih=report.created_at,
    )


@router.get("/reports", response_model=List[AnalyzeResponse])
def list_reports(db: Session = Depends(get_db)):
    reports = db.query(Report).order_by(Report.created_at.desc()).all()
    return [report_to_schema(r) for r in reports]


@router.get("/reports/{report_id}", response_model=AnalyzeResponse)
def get_report(report_id: int, db: Session = Depends(get_db)):
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Rapor bulunamadı.")
    return report_to_schema(report)
