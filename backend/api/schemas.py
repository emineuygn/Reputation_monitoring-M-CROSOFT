from pydantic import BaseModel, EmailStr
from typing import List, Optional, Literal
from datetime import datetime
from enum import Enum


class UserCreate(BaseModel):
    email: EmailStr
    password: str
    ad_soyad: Optional[str] = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: int
    email: str
    ad_soyad: Optional[str] = None

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


class RiskSeverity(str, Enum):
    dusuk = "düşük"
    orta = "orta"
    yuksek = "yüksek"


AnalizTuru = Literal["sirket", "kisi"]


class AnalyzeRequest(BaseModel):
    hedef_adi: str
    analiz_turu: AnalizTuru = "sirket"
    vergi_no: Optional[str] = None
    nace_kodu: Optional[str] = None


class RedFlag(BaseModel):
    kaynak: str
    baslik: str
    ozet: str
    ciddiyet: RiskSeverity
    url: Optional[str] = None


class GundemHaber(BaseModel):
    baslik: str
    url: Optional[str] = None
    kaynak: str = "Google Haberler"


class GundemResponse(BaseModel):
    haberler: List[GundemHaber]
    guncellenme: datetime


class StatsResponse(BaseModel):
    toplam_sorgu: int
    ortalama_risk: float
    yuksek_riskli_sayisi: int
    bu_ay_sorgu: int


class NaceKodu(BaseModel):
    kod: str
    aciklama: str
    grup: Optional[str] = None


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
    vergi_no: Optional[str] = None
    nace_kodu: Optional[str] = None
    risk_skoru: int
    risk_seviyesi: RiskSeverity
    kirmizi_bayraklar: List[RedFlag]
    kaynaklar: List[SourceResult]
    genel_ozet: str
    kisa_yorum: str
    tarih: datetime

    class Config:
        from_attributes = True
