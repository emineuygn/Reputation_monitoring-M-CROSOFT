# İtibar Tespit

Şirket ve kişiler için otomatik açık kaynak taraması yapan, risk skoru üreten bir
itibar/uyum analiz platformu. Haberleri, şikayetleri, KAP kayıtlarını, forum
içeriklerini ve LinkedIn profillerini tarayıp özetler; PDF rapor olarak dışa aktarır.

## 🔗 Canlı Demo

**https://reputation-monitoring-m-crosoft.vercel.app**

Demo giriş bilgileri:

| E-posta | Şifre |
|---|---|
| `demo@itibar-tespit.com` | `Demo2026Guvenli!` |

> Bu hesap yalnızca deneme amaçlıdır, gerçek/kişisel veri içermez.

## Proje Yapısı

- `backend/` — Python + FastAPI (scraping, risk analizi, PDF export, kimlik doğrulama)
- `frontend/` — Next.js 14 + TypeScript + Tailwind CSS

Kurulum ve geliştirme detayları için [backend/README.md](backend/README.md) ve
[frontend/README.md](frontend/README.md) dosyalarına bakın.

Canlıya alma (Render + Vercel) rehberi için [DEPLOY.md](DEPLOY.md).
