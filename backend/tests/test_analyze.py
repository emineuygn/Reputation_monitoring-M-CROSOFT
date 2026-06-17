import pytest
from unittest.mock import AsyncMock, patch, MagicMock
from fastapi.testclient import TestClient
from datetime import datetime, timezone

from main import app
from api.schemas import AnalyzeResponse, SourceResult, RiskSeverity

client = TestClient(app)

MOCK_SOURCE = SourceResult(
    kaynak_adi="Test Kaynak",
    url="https://example.com",
    bulunan_icerik_ozeti="Test içerik özeti",
    sonuc_sayisi=3,
)

MOCK_ANALYSIS = AnalyzeResponse(
    id=None,
    firma_adi="Test Firma",
    risk_skoru=25,
    risk_seviyesi=RiskSeverity.dusuk,
    kirmizi_bayraklar=[],
    kaynaklar=[MOCK_SOURCE],
    genel_ozet="Test firma düşük riskli görünmektedir.",
    tarih=datetime.now(timezone.utc),
)


@pytest.mark.asyncio
async def test_analyze_endpoint_success():
    with (
        patch("api.routes.analyze.NewsScraper") as MockNews,
        patch("api.routes.analyze.GoogleNewsScraper") as MockGoogle,
        patch("api.routes.analyze.SikayetvarScraper") as MockSikayet,
        patch("api.routes.analyze.KapScraper") as MockKap,
        patch("api.routes.analyze.ForumScraper") as MockForum,
        patch("api.routes.analyze.LinkedinScraper") as MockLinkedin,
        patch("api.routes.analyze.RiskAnalyzer") as MockAnalyzer,
    ):
        for Mock in [MockNews, MockGoogle, MockSikayet, MockKap, MockForum, MockLinkedin]:
            instance = Mock.return_value
            instance.scrape = AsyncMock(return_value=MOCK_SOURCE)

        analyzer_instance = MockAnalyzer.return_value
        analyzer_instance.analyze = AsyncMock(return_value=MOCK_ANALYSIS)

        response = client.post("/api/analyze", json={"firma_adi": "Test Firma"})

    assert response.status_code == 200
    data = response.json()
    assert data["firma_adi"] == "Test Firma"
    assert "risk_skoru" in data
    assert "risk_seviyesi" in data
    assert "kirmizi_bayraklar" in data
    assert "kaynaklar" in data


def test_analyze_empty_name():
    response = client.post("/api/analyze", json={"firma_adi": ""})
    assert response.status_code == 400


def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}
