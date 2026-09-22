import re

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
import json

from api.schemas import AnalyzeResponse, RedFlag, SourceResult, RiskSeverity
from auth.deps import get_current_user
from db.database import get_db
from db.models import Report, User
from pdf.generator import generate_pdf

router = APIRouter()


@router.post("/export/pdf")
async def export_pdf(
    report_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    report = (
        db.query(Report)
        .filter(Report.id == report_id, Report.user_id == current_user.id)
        .first()
    )
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

    pdf_path = await generate_pdf(analysis)
    safe_ad = re.sub(r"[^\w\-]+", "_", report.hedef_adi, flags=re.UNICODE).strip("_")
    return FileResponse(
        path=pdf_path,
        media_type="application/pdf",
        filename=f"itibar_raporu_{safe_ad}_{report.id}.pdf",
    )
