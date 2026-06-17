# İtibar Tespit — Backend

Python + FastAPI tabanlı scraping, risk analizi ve PDF export servisi.

## Kurulum

```bash
cd backend
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
playwright install chromium  # LinkedIn scraper için
```

## Ortam Değişkenleri

```bash
cp .env.example .env
# .env dosyasını düzenleyin
```

| Değişken | Açıklama | Varsayılan |
|---|---|---|
| `FOUNDRY_LOCAL_MODEL` | Foundry Local model alias | `phi-3.5-mini-instruct-cuda-gpu` |
| `DATABASE_URL` | SQLAlchemy bağlantı URL'i | `sqlite:///./itibar_tespit.db` |
| `CORS_ORIGINS` | Frontend URL (virgülle ayrılmış) | `http://localhost:3000` |
| `SCRAPER_TIMEOUT` | HTTP istek zaman aşımı (sn) | `30` |
| `SCRAPER_RATE_LIMIT_DELAY` | İstekler arası bekleme (sn) | `2.0` |

## Çalıştırma

```bash
uvicorn main:app --reload --port 8000
```

API dokümantasyonu: http://localhost:8000/docs

## Testler

```bash
pytest tests/ -v
```
