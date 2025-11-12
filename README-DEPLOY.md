# 🚀 GitHub Push ve Render Deploy Talimatları

## ✅ Hazırlık Tamamlandı!

Tüm dosyalar deploy için hazırlandı:
- ✅ `render.yaml` - Render konfigürasyonu
- ✅ `.gitignore` - Git ignore dosyası
- ✅ `package.json` - Node.js engine belirtildi
- ✅ API path'leri production için ayarlandı
- ✅ Git repository oluşturuldu ve commit yapıldı

## 📤 GitHub'a Push Etme

### Yöntem 1: Batch Dosyası (Önerilen)
1. `GIT-PUSH.bat` dosyasına çift tıklayın
2. GitHub kullanıcı adı ve şifre istenebilir
3. Push işlemi otomatik tamamlanır

### Yöntem 2: Manuel Komutlar
PowerShell veya CMD'de:

```bash
# Klasöre git
cd "D:\RAF FİYAT ANALİZ"

# Remote ekle (eğer yoksa)
git remote remove origin
git remote add origin https://github.com/Neogtt/avrupafiyatlama.git

# Branch'i main yap
git branch -M main

# Push et
git push -u origin main
```

**NOT**: İlk push'ta GitHub kullanıcı adı ve şifre/token istenebilir.

## 🌐 Render'a Deploy

### Adım 1: Render Dashboard
1. https://render.com adresine gidin
2. GitHub hesabınızla giriş yapın
3. "New +" butonuna tıklayın
4. "Web Service" seçin

### Adım 2: Repository Bağlama
- **Repository**: `Neogtt/avrupafiyatlama` seçin
- **Branch**: `main`
- **Root Directory**: (boş bırakın)

### Adım 3: Servis Ayarları
Render otomatik olarak `render.yaml` dosyasını okuyacak ve ayarları uygulayacak:

- **Name**: `avrupafiyatlama`
- **Environment**: `Node`
- **Build Command**: `npm run install-all && npm run build`
- **Start Command**: `npm start`
- **Plan**: `Free` (veya `Starter` - $7/ay)

### Adım 4: Environment Variables
Render otomatik olarak ayarlar:
- `NODE_ENV=production`
- `PORT` (Render otomatik atar)

**ÖNEMLİ**: `REACT_APP_API_URL` eklemeyin! Production'da relative path (`/api`) kullanılır.

### Adım 5: Deploy
- "Create Web Service" butonuna tıklayın
- İlk deploy 5-10 dakika sürebilir
- Deploy tamamlandığında URL alacaksınız: `https://avrupafiyatlama.onrender.com`

## ⚠️ ÖNEMLİ: SQLite ve Free Plan

**Render Free Plan'da persistent disk yok!**
- Her deploy'da veritabanı sıfırlanır
- Veriler kaybolur

### Çözümler:

#### 1. Render Starter Plan ($7/ay) ✅ Önerilen
- Persistent disk desteği
- Veriler kalıcı
- `render.yaml`'da disk ayarlarını açın

#### 2. PostgreSQL'e Geçiş
- Render'ın ücretsiz PostgreSQL servisi
- Veritabanı kodunu PostgreSQL'e uyarlamak gerekir

#### 3. Railway (Alternatif)
- Ücretsiz tier'da persistent disk var
- Daha kolay kurulum

## 🔧 Sorun Giderme

### Push Hatası
```bash
# GitHub credentials kontrol edin
# Personal Access Token kullanabilirsiniz
# Settings > Developer settings > Personal access tokens
```

### Build Hatası
- Render Dashboard > Logs bölümünden kontrol edin
- Genellikle `node_modules` veya build hatası

### Veritabanı Hatası
- Free plan'da veritabanı kalıcı değil
- Starter plan kullanın veya PostgreSQL'e geçin

## 📝 Deploy Sonrası

1. ✅ URL'i test edin: `https://your-app.onrender.com`
2. ✅ Veritabanını kontrol edin (ilk kullanımda otomatik oluşur)
3. ✅ Logları izleyin: Render Dashboard > Logs

## 🔄 Güncelleme

Her `git push` sonrası otomatik deploy yapılır:

```bash
git add .
git commit -m "Update"
git push
```

## 📞 Yardım

Detaylı bilgi için:
- `RENDER-DEPLOY.md` - Render deploy detayları
- `DEPLOY.md` - Genel deploy bilgileri
- Render Dashboard > Docs

