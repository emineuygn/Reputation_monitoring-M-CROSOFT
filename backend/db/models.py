from sqlalchemy import Column, Integer, String, Text, DateTime
from sqlalchemy.sql import func
from db.database import Base


class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    hedef_adi = Column(String(255), index=True, nullable=False)
    analiz_turu = Column(String(10), nullable=False, default="sirket")
    risk_skoru = Column(Integer, nullable=False)
    risk_seviyesi = Column(String(20), nullable=False)
    ozet = Column(Text, nullable=True)
    kirmizi_bayraklar = Column(Text, nullable=True)  # JSON string
    kaynaklar = Column(Text, nullable=True)           # JSON string
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
