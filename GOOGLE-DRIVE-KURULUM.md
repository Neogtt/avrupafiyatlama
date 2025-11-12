# 🚀 Google Drive Kurulumu - Hızlı Başlangıç

## ⚠️ Hata: "credentials.json bulunamadı"

Bu hatayı alıyorsanız, Google Drive API için credentials dosyasını oluşturmanız gerekiyor.

## 📋 Adım Adım Kurulum (5 Dakika)

### 1️⃣ Google Cloud Console'a Gidin

1. **https://console.cloud.google.com/** adresine gidin
2. Google hesabınızla giriş yapın

### 2️⃣ Yeni Proje Oluşturun

1. Üst menüden **"Select a project"** → **"New Project"** tıklayın
2. **Project name**: `RAF Fiyat Analizi` (veya istediğiniz isim)
3. **"Create"** tıklayın
4. Oluşturulan projeyi seçin

### 3️⃣ Google Drive API'yi Etkinleştirin

1. Sol menüden **"APIs & Services"** → **"Library"** tıklayın
2. Arama kutusuna **"Google Drive API"** yazın
3. **"Google Drive API"** seçin
4. **"Enable"** (Etkinleştir) tıklayın

### 4️⃣ OAuth Consent Screen Ayarlayın

1. Sol menüden **"APIs & Services"** → **"OAuth consent screen"** tıklayın
2. **User Type**: **"External"** seçin → **"Create"**
3. **App information**:
   - **App name**: `RAF Fiyat Analizi`
   - **User support email**: Email adresinizi seçin
   - **Developer contact information**: Email adresinizi girin
4. **"Save and Continue"** tıklayın
5. **Scopes**: Varsayılanları bırakın → **"Save and Continue"**
6. **Test users**: 
   - **"+ ADD USERS"** tıklayın
   - Email adresinizi ekleyin
   - **"Add"** tıklayın
7. **"Save and Continue"** → **"Back to Dashboard"**

### 5️⃣ OAuth 2.0 Credentials Oluşturun

1. Sol menüden **"APIs & Services"** → **"Credentials"** tıklayın
2. Üstte **"+ CREATE CREDENTIALS"** → **"OAuth client ID"** seçin
3. **Application type**: **"Desktop app"** seçin
4. **Name**: `RAF Fiyat Analizi Desktop`
5. **"Create"** tıklayın
6. Bir popup açılacak - **"OK"** tıklayın

### 6️⃣ Credentials Dosyasını İndirin

1. **Credentials** sayfasında oluşturduğunuz OAuth client'ı bulun
2. Sağ taraftaki **⬇️ (Download JSON)** ikonuna tıklayın
3. İndirilen dosya genellikle şöyle bir isimle gelir: `client_secret_XXXXX.json`

### 7️⃣ Dosyayı Proje Klasörüne Kopyalayın

1. İndirilen JSON dosyasını açın
2. İçeriğini kopyalayın
3. `D:\RAF FİYAT ANALİZ\` klasörüne gidin
4. Yeni bir dosya oluşturun: **`credentials.json`**
5. Kopyaladığınız içeriği bu dosyaya yapıştırın
6. Dosyayı kaydedin

**ÖNEMLİ**: Dosya adı tam olarak **`credentials.json`** olmalı!

### 8️⃣ İlk Yetkilendirme

1. **Sunucuyu başlatın**:
   ```bash
   cd "D:\RAF FİYAT ANALİZ"
   npm start
   ```

2. **Tarayıcıda açın**:
   ```
   http://localhost:3001/api/export/auth-url
   ```

3. **Dönen JSON'dan `authUrl` değerini kopyalayın**:
   ```json
   {
     "authUrl": "https://accounts.google.com/o/oauth2/v2/auth?..."
   }
   ```

4. **URL'yi tarayıcıda açın**

5. **Google hesabınızı seçin** ve **"Allow"** (İzin Ver) tıklayın

6. **Yönlendirilen sayfada URL'yi kopyalayın** (şöyle bir URL olacak):
   ```
   http://localhost:3001/api/export/auth-callback?code=4/0AeanS...
   ```

7. **Code parametresini kopyalayın** (`code=` sonrasındaki kısım)

8. **Tarayıcıda açın**:
   ```
   http://localhost:3001/api/export/auth-callback?code=YOUR_CODE_HERE
   ```

9. **Başarı mesajı göreceksiniz**:
   ```json
   {
     "success": true,
     "message": "Google Drive yetkilendirmesi başarılı!"
   }
   ```

10. **`token.json` dosyası otomatik oluşturulacak**

### 9️⃣ Test Edin

1. Frontend'de **"Drive'a Yükle"** butonuna tıklayın
2. Excel dosyası Google Drive'a yüklenecek
3. Link gösterilecek

## ✅ Kurulum Tamamlandı!

Artık Excel dosyalarını Google Drive'a yükleyebilirsiniz!

## 🔧 Sorun Giderme

### "credentials.json bulunamadı"
- Dosyanın `D:\RAF FİYAT ANALİZ\` klasöründe olduğundan emin olun
- Dosya adının tam olarak `credentials.json` olduğunu kontrol edin
- Dosya uzantısının `.json` olduğundan emin olun (`.json.txt` değil!)

### "token.json bulunamadı"
- İlk yetkilendirmeyi yapın (Adım 8)
- `token.json` dosyası otomatik oluşturulur

### "Access denied" veya "User not found"
- OAuth consent screen'de test user olarak email adresinizi eklediğinizden emin olun
- Aynı Google hesabıyla giriş yaptığınızdan emin olun

### "Invalid client"
- `credentials.json` dosyasının doğru formatta olduğunu kontrol edin
- Google Cloud Console'dan yeni credentials oluşturup tekrar deneyin

## 📝 credentials.json Dosya Formatı

Dosya şöyle görünmelidir:

```json
{
  "installed": {
    "client_id": "XXXXX.apps.googleusercontent.com",
    "project_id": "raf-fiyat-analizi",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_secret": "XXXXX",
    "redirect_uris": ["http://localhost"]
  }
}
```

veya

```json
{
  "web": {
    "client_id": "XXXXX.apps.googleusercontent.com",
    "project_id": "raf-fiyat-analizi",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_secret": "XXXXX",
    "redirect_uris": ["http://localhost"]
  }
}
```

Her iki format da çalışır.

## 🎯 Hızlı Test

Kurulum tamamlandıktan sonra:

```bash
# Sunucuyu başlat
npm start

# Başka bir terminalde test et
curl http://localhost:3001/api/export/excel-drive
```

Başarılı yanıt alırsanız kurulum tamamlanmıştır!

