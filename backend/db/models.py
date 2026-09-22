from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.sql import func
from db.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    ad_soyad = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)


class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    hedef_adi = Column(String(255), index=True, nullable=False)
    analiz_turu = Column(String(10), nullable=False, default="sirket")
    vergi_no = Column(String(20), nullable=True)
    nace_kodu = Column(String(20), nullable=True)
    risk_skoru = Column(Integer, nullable=False)
    risk_seviyesi = Column(String(20), nullable=False)
    ozet = Column(Text, nullable=True)
    kisa_yorum = Column(Text, nullable=True)
    kirmizi_bayraklar = Column(Text, nullable=True)
    kaynaklar = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
