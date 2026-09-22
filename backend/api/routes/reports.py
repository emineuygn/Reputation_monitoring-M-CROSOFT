from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session
from typing import List
import json

from api.schemas import AnalyzeResponse, RedFlag, SourceResult, RiskSeverity, StatsResponse
from auth.deps import get_current_user
from db.database import get_db
from db.models import Report, User

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
        vergi_no=report.vergi_no,
        nace_kodu=report.nace_kodu,
        risk_skoru=report.risk_skoru,
        risk_seviyesi=RiskSeverity(report.risk_seviyesi),
        kirmizi_bayraklar=kirmizi_bayraklar,
        kaynaklar=kaynaklar,
        genel_ozet=report.ozet or "",
        kisa_yorum=report.kisa_yorum or "",
        tarih=report.created_at,
    )


@router.get("/reports", response_model=List[AnalyzeResponse])
def list_reports(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    reports = (
        db.query(Report)
        .filter(Report.user_id == current_user.id)
        .order_by(Report.created_at.desc())
        .all()
    )
    return [report_to_schema(r) for r in reports]


@router.get("/reports/stats", response_model=StatsResponse)
def get_stats(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    base = db.query(Report).filter(Report.user_id == current_user.id)

    toplam = base.with_entities(func.count(Report.id)).scalar() or 0
    ortalama = base.with_entities(func.avg(Report.risk_skoru)).scalar() or 0
    yuksek = base.filter(Report.risk_seviyesi == "yüksek").with_entities(func.count(Report.id)).scalar() or 0

    ay_basi = datetime.utcnow().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    bu_ay = (
        db.query(func.count(Report.id))
        .filter(Report.user_id == current_user.id, Report.created_at >= ay_basi)
        .scalar()
        or 0
    )

    return StatsResponse(
        toplam_sorgu=toplam,
        ortalama_risk=round(float(ortalama), 1),
        yuksek_riskli_sayisi=yuksek,
        bu_ay_sorgu=bu_ay,
    )


@router.get("/reports/{report_id}", response_model=AnalyzeResponse)
def get_report(
    report_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    report = (
        db.query(Report)
        .filter(Report.id == report_id, Report.user_id == current_user.id)
        .first()
    )
    if not report:
        raise HTTPException(status_code=404, detail="Rapor bulunamadı.")
    return report_to_schema(report)
