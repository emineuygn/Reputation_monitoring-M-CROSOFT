from pydantic import BaseModel
from typing import List, Optional, Literal
from datetime import datetime
from enum import Enum


class RiskSeverity(str, Enum):
    dusuk = "düşük"
    orta = "orta"
    yuksek = "yüksek"


AnalizTuru = Literal["sirket", "kisi"]


class AnalyzeRequest(BaseModel):
    hedef_adi: str
    analiz_turu: AnalizTuru = "sirket"


class RedFlag(BaseModel):
    kaynak: str
    baslik: str
    ozet: str
    ciddiyet: RiskSeverity
    url: Optional[str] = None


class Haber(BaseModel):
    baslik: str
    url: Optional[str] = None


class SourceResult(BaseModel):
    kaynak_adi: str
    url: Optional[str] = None
    bulunan_icerik_ozeti: str
    sonuc_sayisi: int = 0
    haberler: List[Haber] = []


class AnalyzeResponse(BaseModel):
    id: Optional[int] = None
    hedef_adi: str
    analiz_turu: AnalizTuru = "sirket"
    risk_skoru: int
    risk_seviyesi: RiskSeverity
    kirmizi_bayraklar: List[RedFlag]
    kaynaklar: List[SourceResult]
    genel_ozet: str
    tarih: datetime

    class Config:
        from_attributes = True
