# ⚡ Hızlı Kurulum - 3 Adım

## 🎯 credentials.json Dosyası Oluşturma

### Adım 1: Google Cloud Console (2 dakika)

1. **https://console.cloud.google.com/** → Giriş yapın
2. **"Select a project"** → **"New Project"** → İsim verin → **"Create"**
3. **"APIs & Services"** → **"Library"** → **"Google Drive API"** → **"Enable"**
4. **"APIs & Services"** → **"Credentials"** → **"+ CREATE CREDENTIALS"** → **"OAuth client ID"**
5. **Application type**: **"Desktop app"** → İsim verin → **"Create"**
6. **⬇️ Download JSON** ikonuna tıklayın

### Adım 2: Dosyayı Kopyalayın (30 saniye)

1. İndirilen JSON dosyasını açın
2. İçeriğini kopyalayın
3. `D:\RAF FİYAT ANALİZ\` klasörüne gidin
4. **Yeni dosya**: `credentials.json` oluşturun
5. İçeriği yapıştırın ve kaydedin

### Adım 3: Yetkilendirme (1 dakika)

1. Sunucuyu başlatın: `npm start`
2. Tarayıcıda: `http://localhost:3001/api/export/auth-url`
3. Dönen `authUrl` değerini kopyalayıp tarayıcıda açın
4. Google hesabınızla giriş yapın → **"Allow"** tıklayın
5. Yönlendirilen URL'deki `code=` sonrasını kopyalayın
6. Tarayıcıda: `http://localhost:3001/api/export/auth-callback?code=YOUR_CODE`
7. ✅ Başarılı mesajı göreceksiniz!

## 🎉 Tamamlandı!

Artık **"Drive'a Yükle"** butonunu kullanabilirsiniz!

## 📖 Detaylı Kurulum

Daha detaylı bilgi için `GOOGLE-DRIVE-KURULUM.md` dosyasına bakın.

