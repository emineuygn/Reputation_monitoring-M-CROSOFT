# İtibar Tespit — Frontend

Next.js 14 (App Router) + TypeScript + Tailwind CSS tabanlı kullanıcı arayüzü.

## Kurulum

```bash
cd frontend
npm install
```

## Ortam Değişkenleri

```bash
cp .env.local.example .env.local
# .env.local dosyasını düzenleyin
```

| Değişken | Açıklama | Varsayılan |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Backend API adresi | `http://localhost:8000` |

## Çalıştırma

```bash
npm run dev
```

Uygulama: http://localhost:3000

## Sayfalar

| Sayfa | Yol | Açıklama |
|---|---|---|
| Ana Sayfa | `/` | Firma arama |
| Dashboard | `/dashboard` | Analiz sonuçları |
| Rapor Detayı | `/company/[id]` | Geçmiş rapor detayı |
| Geçmiş | `/history` | Tüm sorgular |
