# Render Deploy Talimatları

## 🚀 Render'a Deploy Etme Adımları

### 1. GitHub'a Push Edin
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/kullanici-adi/raf-fiyat-analiz.git
git push -u origin main
```

### 2. Render Dashboard'a Giriş Yapın
- https://render.com adresine gidin
- GitHub hesabınızla giriş yapın
- "New +" butonuna tıklayın
- "Web Service" seçin

### 3. Repository Bağlayın
- GitHub repository'nizi seçin
- Branch: `main` (veya `master`)

### 4. Servis Ayarları

#### Otomatik Deploy (render.yaml kullanarak):
- Render otomatik olarak `render.yaml` dosyasını okuyacak
- Ayarlar otomatik uygulanacak

#### Manuel Ayarlar (render.yaml yoksa):
- **Name**: `raf-fiyat-analiz` (veya istediğiniz isim)
- **Environment**: `Node`
- **Build Command**: 
  ```bash
  npm run install-all && npm run build
  ```
- **Start Command**: 
  ```bash
  npm start
  ```
- **Plan**: `Free` (veya istediğiniz plan)

### 5. Environment Variables
Render otomatik olarak şunları ayarlar:
- `NODE_ENV=production`
- `PORT=10000` (Render otomatik atar)

**ÖNEMLİ**: Frontend için `REACT_APP_API_URL` eklemeyin! 
Production'da frontend ve backend aynı domain'de çalışır, 
relative path kullanılır.

### 6. Persistent Disk (Veritabanı için)
- **Disk Name**: `raf-fiyat-db`
- **Mount Path**: `/opt/render/project/src/data`
- **Size**: `1 GB` (ücretsiz plan için yeterli)

**NOT**: Render'ın ücretsiz planında persistent disk yok!
Alternatif çözümler:
1. **Ücretli plan** kullanın (Starter: $7/ay)
2. **External database** kullanın (PostgreSQL, MongoDB)
3. **Heroku Postgres** (ücretsiz alternatif)

### 7. Deploy
- "Create Web Service" butonuna tıklayın
- İlk deploy 5-10 dakika sürebilir
- Deploy tamamlandığında URL alacaksınız: `https://raf-fiyat-analiz.onrender.com`

## ⚠️ Önemli Notlar

### SQLite ve Render Free Plan
Render'ın **ücretsiz planında persistent disk yok**! Bu demek oluyor ki:
- Her deploy'da veritabanı sıfırlanır
- Veriler kaybolur

### Çözümler:

#### Seçenek 1: Render Starter Plan ($7/ay)
- Persistent disk desteği var
- Veriler kalıcı olur

#### Seçenek 2: PostgreSQL'e Geçiş
- Render'ın ücretsiz PostgreSQL servisi var
- Veritabanı kodunu PostgreSQL'e uyarlamak gerekir

#### Seçenek 3: External Storage
- AWS S3, Google Cloud Storage gibi servisler
- Veritabanı dosyasını cloud'da saklamak

## 🔧 Sorun Giderme

### Build Hatası
```bash
# Logları kontrol edin
# Render Dashboard > Logs
```

### Veritabanı Hatası
- Disk mount path'i kontrol edin
- `data` klasörünün yazılabilir olduğundan emin olun

### API Bağlantı Hatası
- Frontend build'inde API URL'i kontrol edin
- Production'da relative path kullanılmalı (`/api`)

## 📝 Deploy Sonrası

1. **URL'i Test Edin**: `https://your-app.onrender.com`
2. **Veritabanını Kontrol Edin**: İlk kullanımda otomatik oluşur
3. **Logları İzleyin**: Render Dashboard > Logs

## 🔄 Güncelleme

Her `git push` sonrası otomatik deploy yapılır.

```bash
git add .
git commit -m "Update"
git push
```

## 💡 İpuçları

- İlk deploy uzun sürebilir (5-10 dk)
- Free plan'da 15 dakika inaktiflikten sonra uyku moduna geçer
- İlk istek 30-60 saniye sürebilir (cold start)
- Production'da `NODE_ENV=production` olduğundan emin olun

