FROM python:3.12-slim

# WeasyPrint (PDF üretimi) için Pango/Cairo/GDK-Pixbuf sistem kütüphaneleri.
# gdk-pixbuf paket adı Debian sürümüne göre değişebildiği için ikisini de dener.
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpango-1.0-0 libpangocairo-1.0-0 libcairo2 \
    libffi8 shared-mime-info fonts-dejavu-core \
    && (apt-get install -y --no-install-recommends libgdk-pixbuf-2.0-0 \
        || apt-get install -y --no-install-recommends libgdk-pixbuf2.0-0) \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# LinkedIn taraması (StealthyFetcher/patchright) için Chromium + OS bağımlılıkları.
# Bu adım başarısız olursa build durmasın — uygulama LinkedIn'siz de çalışmaya devam eder.
RUN patchright install --with-deps chromium || true

COPY . .

ENV PORT=8000
EXPOSE 8000

CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT}"]
