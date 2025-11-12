# 🚀 Deploy Talimatları

## GitHub'a Push Etme

### 1. Git Repository Hazırlığı
```bash
cd "D:\RAF FİYAT ANALİZ"
git init
git add .
git commit -m "Initial commit: RAF Fiyat Analizi - Render deploy hazır"
```

### 2. GitHub Repository'ye Bağlama
```bash
git remote add origin https://github.com/Neogtt/avrupafiyatlama.git
git branch -M main
git push -u origin main
```

## Render'a Deploy

### Adım 1: Render Dashboard
1. https://render.com adresine gidin
2. GitHub hesabınızla giriş yapın
3. "New +" butonuna tıklayın
4. "Web Service" seçin

### Adım 2: Repository Bağlama
- GitHub repository'nizi seçin: `Neogtt/avrupafiyatlama`
- Branch: `main`

### Adım 3: Servis Ayarları
Render otomatik olarak `render.yaml` dosyasını okuyacak ve ayarları uygulayacak.

**Manuel ayarlar gerekirse:**
- **Name**: `avrupafiyatlama` (veya istediğiniz isim)
- **Environment**: `Node`
- **Build Command**: `npm run install-all && npm run build`
- **Start Command**: `npm start`
- **Plan**: `Free` (veya `Starter` - $7/ay, persistent disk için)

### Adım 4: Environment Variables
Render otomatik olarak ayarlar:
- `NODE_ENV=production`
- `PORT` (Render otomatik atar)

**ÖNEMLİ**: `REACT_APP_API_URL` eklemeyin! Production'da relative path kullanılır.

### Adım 5: Persistent Disk (Sadece Starter Plan)
**Free Plan'da persistent disk yok!**

Starter Plan ($7/ay) için:
- **Disk Name**: `avrupafiyatlama-db`
- **Mount Path**: `/opt/render/project/src/data`
- **Size**: `1 GB`

### Adım 6: Deploy
- "Create Web Service" butonuna tıklayın
- İlk deploy 5-10 dakika sürebilir
- Deploy tamamlandığında URL alacaksınız

## ⚠️ Önemli Notlar

### SQLite ve Render Free Plan
Render'ın **ücretsiz planında persistent disk yok**!
- Her deploy'da veritabanı sıfırlanır
- Veriler kaybolur
- **Çözüm**: Starter Plan ($7/ay) veya PostgreSQL

### Alternatif Çözümler

#### 1. Render Starter Plan ($7/ay)
- ✅ Persistent disk desteği
- ✅ Veriler kalıcı
- ✅ Daha hızlı

#### 2. PostgreSQL'e Geçiş
- Render'ın ücretsiz PostgreSQL servisi
- Veritabanı kodunu PostgreSQL'e uyarlamak gerekir

#### 3. Railway (Alternatif)
- Ücretsiz tier'da persistent disk var
- Daha kolay kurulum

## 🔧 Sorun Giderme

### Build Hatası
```bash
# Render Dashboard > Logs bölümünden kontrol edin
# Genellikle node_modules veya build hatası
```

### Veritabanı Hatası
- Free plan'da veritabanı kalıcı değil
- Starter plan kullanın veya PostgreSQL'e geçin

### API Bağlantı Hatası
- Frontend build'inde API URL kontrol edin
- Production'da `/api` relative path kullanılmalı

## 📝 Deploy Sonrası Kontroller

1. ✅ URL'i test edin: `https://your-app.onrender.com`
2. ✅ Veritabanını kontrol edin (ilk kullanımda otomatik oluşur)
3. ✅ Logları izleyin: Render Dashboard > Logs
4. ✅ API endpoint'lerini test edin

## 🔄 Güncelleme

Her `git push` sonrası otomatik deploy yapılır:

```bash
git add .
git commit -m "Update"
git push
```

## 💡 İpuçları

- İlk deploy uzun sürebilir (5-10 dk)
- Free plan'da 15 dakika inaktiflikten sonra uyku modu
- İlk istek 30-60 saniye sürebilir (cold start)
- Production'da `NODE_ENV=production` olduğundan emin olun

