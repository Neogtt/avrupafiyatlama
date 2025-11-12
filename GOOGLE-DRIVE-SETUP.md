# 📁 Google Drive Entegrasyonu Kurulumu

## 🎯 Amaç
Excel dosyalarını otomatik olarak Google Drive'a yükleyip herkese açık erişim vermek.

## 📋 Adım 1: Google Cloud Console'da Proje Oluşturma

1. **Google Cloud Console'a gidin**
   - https://console.cloud.google.com/
   - Google hesabınızla giriş yapın

2. **Yeni Proje Oluşturun**
   - "Select a project" → "New Project"
   - Proje adı: `RAF Fiyat Analizi` (veya istediğiniz isim)
   - "Create" tıklayın

3. **Google Drive API'yi Etkinleştirin**
   - Sol menüden "APIs & Services" → "Library"
   - "Google Drive API" arayın
   - "Enable" tıklayın

## 📋 Adım 2: OAuth 2.0 Credentials Oluşturma

1. **Credentials Oluşturun**
   - "APIs & Services" → "Credentials"
   - "+ CREATE CREDENTIALS" → "OAuth client ID"

2. **OAuth Consent Screen Ayarları**
   - İlk kez yapıyorsanız "Configure Consent Screen" tıklayın
   - User Type: "External" seçin
   - App name: `RAF Fiyat Analizi`
   - User support email: Email adresiniz
   - Developer contact: Email adresiniz
   - "Save and Continue" tıklayın
   - Scopes: Varsayılanları bırakın, "Save and Continue"
   - Test users: Email adresinizi ekleyin (test için)
   - "Save and Continue" → "Back to Dashboard"

3. **OAuth Client ID Oluşturun**
   - Application type: "Desktop app" seçin
   - Name: `RAF Fiyat Analizi Desktop`
   - "Create" tıklayın

4. **Credentials İndirin**
   - Oluşturulan OAuth client'ın yanındaki indirme ikonuna tıklayın
   - İndirilen JSON dosyasını `credentials.json` olarak kaydedin
   - Dosyayı `D:\RAF FİYAT ANALİZ\` klasörüne kopyalayın

## 📋 Adım 3: İlk Yetkilendirme

### Yöntem 1: API Endpoint Kullanarak

1. **Sunucuyu başlatın**
   ```bash
   npm start
   ```

2. **Yetkilendirme URL'ini alın**
   - Tarayıcıda: `http://localhost:3001/api/export/auth-url`
   - Dönen `authUrl` değerini kopyalayın

3. **Yetkilendirme yapın**
   - URL'yi tarayıcıda açın
   - Google hesabınızla giriş yapın
   - "Allow" tıklayın
   - Yönlendirilen URL'deki `code` parametresini kopyalayın

4. **Token'ı kaydedin**
   - Tarayıcıda: `http://localhost:3001/api/export/auth-callback?code=YOUR_CODE`
   - `YOUR_CODE` yerine kopyaladığınız code'u yapıştırın
   - Başarılı mesajı göreceksiniz
   - `token.json` dosyası otomatik oluşturulacak

### Yöntem 2: Manuel Script (Alternatif)

`setup-google-drive.js` dosyasını çalıştırın (ileride oluşturulacak).

## 📋 Adım 4: Excel Export ve Drive'a Yükleme

### API Endpoint'leri:

1. **Sadece Excel İndir** (Drive'a yüklemeden)
   ```
   GET http://localhost:3001/api/export/excel
   ```

2. **Excel Oluştur ve Drive'a Yükle**
   ```
   GET http://localhost:3001/api/export/excel-drive
   ```
   
   **Yanıt:**
   ```json
   {
     "success": true,
     "message": "Excel dosyası Google Drive'a başarıyla yüklendi",
     "driveInfo": {
       "fileId": "1ABC...",
       "fileName": "RAF_Fiyat_Analizi_Urunler.xlsx",
       "webViewLink": "https://drive.google.com/file/d/...",
       "webContentLink": "https://drive.google.com/uc?export=download&id=...",
       "directDownloadLink": "https://drive.google.com/uc?export=download&id=..."
     }
   }
   ```

## 🎨 Frontend Entegrasyonu

Frontend'de buton ekleyerek kullanıcıların tek tıkla Excel'i Drive'a yükleyebilmesini sağlayabilirsiniz.

## ⚠️ Önemli Notlar

1. **Credentials Güvenliği**
   - `credentials.json` ve `token.json` dosyalarını `.gitignore`'a ekleyin
   - Bu dosyaları GitHub'a push etmeyin!

2. **Token Yenileme**
   - Token süresi dolduğunda yeniden yetkilendirme gerekebilir
   - `/api/export/auth-url` endpoint'ini tekrar kullanın

3. **Production'da**
   - OAuth redirect URI'yi production URL'inize göre güncelleyin
   - Google Cloud Console'da production URL'i ekleyin

## 🔧 Sorun Giderme

### "credentials.json bulunamadı" hatası
- Dosyanın `D:\RAF FİYAT ANALİZ\` klasöründe olduğundan emin olun
- Dosya adının tam olarak `credentials.json` olduğunu kontrol edin

### "token.json bulunamadı" hatası
- İlk yetkilendirmeyi yapın (`/api/export/auth-url` ve `/api/export/auth-callback`)

### "Access denied" hatası
- OAuth consent screen'de test user olarak email adresinizi eklediğinizden emin olun
- Production'da app'i verify etmeniz gerekebilir

## 📚 Kaynaklar

- [Google Drive API Documentation](https://developers.google.com/drive/api/v3/about-sdk)
- [OAuth 2.0 Setup](https://developers.google.com/identity/protocols/oauth2)

