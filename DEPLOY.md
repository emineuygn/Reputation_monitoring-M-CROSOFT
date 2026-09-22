# Canlıya Alma (Vercel + Render)

Bu rehber backend'i **Render**'a, frontend'i **Vercel**'e nasıl deploy edeceğinizi anlatır.
İkisi de production domain'lerinde **HTTPS'i otomatik ve ücretsiz** sağlar — ayrıca sertifika
kurulumu yapmanıza gerek yok.

## 1. Backend — Render

### a) Blueprint ile (önerilen, tek adım)

1. Bu repoyu GitHub'a push edin.
2. [render.com](https://render.com) → **New** → **Blueprint** → repoyu seçin. Render, kök
   dizindeki `render.yaml` dosyasını otomatik bulup backend servisini ve ücretsiz bir
   PostgreSQL veritabanını birlikte oluşturur.
3. `CORS_ORIGINS` değişkenini Render dashboard'undan gerçek Vercel adresinizle güncelleyin
   (frontend'i deploy ettikten sonra — bkz. adım 2).

### b) Manuel (Blueprint çalışmazsa)

1. Render'da **New** → **Web Service** → repoyu seçin.
2. **Runtime**: Docker, **Dockerfile Path**: `backend/Dockerfile`, **Docker Context**: `backend`.
3. **Health Check Path**: `/health`
4. Ortam değişkenleri (Environment):
   - `JWT_SECRET` — güçlü, rastgele bir değer (örn. `python3 -c "import secrets; print(secrets.token_hex(32))"`)
   - `JWT_ALGORITHM` = `HS256`
   - `JWT_EXPIRE_MINUTES` = `10080`
   - `CORS_ORIGINS` = Vercel'deki frontend adresiniz (örn. `https://itibar-tespit.vercel.app`)
   - `DATABASE_URL` — bkz. aşağıdaki not

### ⚠️ Veritabanı: SQLite yerine Postgres kullanın

`DATABASE_URL` ayarlanmazsa uygulama varsayılan olarak SQLite dosyasına yazar. Render'ın ücretsiz
web servislerinde disk **kalıcı değildir** — her yeniden deploy'da (kod güncellemesi, yeniden
başlatma) SQLite dosyasındaki tüm kullanıcılar ve raporlar **silinir**. Bunun yerine Render'da
ücretsiz bir PostgreSQL veritabanı oluşturup `DATABASE_URL`'i onun bağlantı adresine ayarlayın
(Blueprint bunu otomatik yapar). Kod tarafında ekstra bir şey yapmanıza gerek yok — SQLAlchemy
bağlantı adresine göre otomatik uyum sağlıyor.

### Not: Foundry Local (AI analiz) bulut ortamında çalışmaz

`RiskAnalyzer`, yerel makinenizde çalışan Foundry Local servisine bağlanır. Render sunucularında
bu servis yoktur, dolayısıyla AI destekli özet üretilemez — uygulama otomatik olarak anahtar
kelime tabanlı analiz moduna düşer (kod zaten bunu `_fallback_response` ile yönetiyor, ek bir
işlem gerekmiyor). Gerçek AI analizi istiyorsanız `agent/foundry_client.py`'ı bulutta çalışan bir
LLM API'sine (örn. bir Anthropic/OpenAI uyumlu uç nokta) bağlamanız gerekir — bu ayrı bir iş.

## 2. Frontend — Vercel

1. [vercel.com](https://vercel.com) → **Add New** → **Project** → repoyu seçin.
2. **Root Directory**: `frontend` olarak ayarlayın.
3. Ortam değişkeni ekleyin: `NEXT_PUBLIC_API_URL` = Render backend'inizin adresi
   (örn. `https://itibar-tespit-backend.onrender.com`).
4. Deploy edin. Vercel Next.js'i otomatik tanır, ekstra ayar gerekmez.

Deploy tamamlandıktan sonra Vercel'in verdiği domain'i (`https://....vercel.app`) Render'daki
`CORS_ORIGINS` değişkenine geri yazıp backend servisini yeniden başlatın (Render dashboard'unda
**Manual Deploy** ile).

## 3. Kontrol listesi

- [ ] Render backend `https://...onrender.com/health` → `{"status":"ok"}` dönüyor
- [ ] Render'da `DATABASE_URL` Postgres'e işaret ediyor (SQLite değil)
- [ ] `JWT_SECRET` production'a özel, rastgele bir değer (`.env`'deki dev değeri değil)
- [ ] `CORS_ORIGINS` gerçek Vercel domain'ini içeriyor
- [ ] Vercel'de `NEXT_PUBLIC_API_URL` Render backend adresine işaret ediyor
- [ ] Siteye `https://` ile erişiliyor (her iki platform da bunu otomatik sağlar)

## İleride kendi sunucunuza (VPS) taşımak isterseniz

Backend için `backend/Dockerfile` zaten hazır — herhangi bir Docker destekli VPS'te
(DigitalOcean, Hetzner vb.) aynı image'i çalıştırıp önüne bir reverse proxy (Caddy veya
nginx + Let's Encrypt/Certbot) koyarak HTTPS sağlayabilirsiniz. Caddy otomatik sertifika
yönetimi yaptığı için en az efor isteyen seçenektir. İstersen o zaman ayrı bir rehber çıkarırız.
