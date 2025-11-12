# ⚡ Service Account Hızlı Kurulum

## 🎯 3 Adımda Kurulum

### 1️⃣ Google Cloud Console'da Service Account Oluştur

1. **https://console.cloud.google.com/** → Projenizi seçin
2. **"APIs & Services"** → **"Credentials"** → **"+ CREATE CREDENTIALS"** → **"Service account"**
3. **Name**: `raf-fiyat-drive` → **"Create and Continue"**
4. **"Done"** tıklayın

### 2️⃣ JSON Key İndir

1. Oluşturulan Service Account'a tıklayın
2. **"Keys"** sekmesi → **"Add Key"** → **"Create new key"**
3. **JSON** seçin → **"Create"**
4. JSON dosyası indirilir

### 3️⃣ Dosyayı Kopyala

1. İndirilen JSON dosyasını `D:\RAF FİYAT ANALİZ\` klasörüne kopyalayın
2. Dosya adını **`service-account.json`** olarak değiştirin

## ✅ Hazır!

Artık **"Drive'a Yükle"** butonunu kullanabilirsiniz!

## 🔑 ÖNEMLİ: Drive Erişimi

Service Account'un dosyaları yükleyebilmesi için:

1. Service Account'un **email adresini** kopyalayın (JSON dosyasındaki `client_email`)
2. Google Drive'ınızda bir klasör oluşturun
3. Klasöre sağ tıklayın → **"Share"**
4. Service Account email'ini ekleyin → **"Editor"** yetkisi verin
5. **"Send"** tıklayın

**VEYA** root klasöre yüklemek için Service Account email'ini "My Drive" klasörüne ekleyin.

## 🧪 Test

```bash
# Sunucuyu başlat
npm start

# Tarayıcıda test et
http://localhost:3001/api/export/check-service-account
```

Başarılı yanıt alırsanız kurulum tamamlanmıştır!

## 📖 Detaylı Kurulum

Daha fazla bilgi için `SERVICE-ACCOUNT-KURULUM.md` dosyasına bakın.

