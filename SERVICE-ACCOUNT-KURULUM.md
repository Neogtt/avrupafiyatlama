# 🔐 Service Account Kurulumu - Google Drive

## 🎯 Service Account Nedir?

Service Account, kullanıcı etkileşimi gerektirmeyen bir Google API kimlik doğrulama yöntemidir. OAuth 2.0'dan çok daha basit ve otomatik çalışır.

## ✅ Avantajları

- ✅ Kullanıcı etkileşimi gerekmez
- ✅ Token yenileme gerekmez
- ✅ Otomatik çalışır
- ✅ Daha basit kurulum

## 📋 Adım Adım Kurulum

### 1️⃣ Google Cloud Console'da Service Account Oluşturma

1. **https://console.cloud.google.com/** adresine gidin
2. Projenizi seçin (veya yeni proje oluşturun)
3. Sol menüden **"APIs & Services"** → **"Credentials"** tıklayın
4. Üstte **"+ CREATE CREDENTIALS"** → **"Service account"** seçin

### 2️⃣ Service Account Bilgilerini Girin

1. **Service account name**: `raf-fiyat-drive` (veya istediğiniz isim)
2. **Service account ID**: Otomatik oluşturulur
3. **Description**: `RAF Fiyat Analizi Google Drive Upload`
4. **"Create and Continue"** tıklayın

### 3️⃣ Rol Atama (Opsiyonel)

1. **Grant this service account access to project** bölümünde:
   - **Role**: `Editor` veya `Storage Admin` seçin (veya boş bırakın)
2. **"Continue"** tıklayın
3. **"Done"** tıklayın

### 4️⃣ JSON Key Dosyasını İndirin

1. Oluşturulan Service Account'a tıklayın
2. **"Keys"** sekmesine gidin
3. **"Add Key"** → **"Create new key"** tıklayın
4. **Key type**: **"JSON"** seçin
5. **"Create"** tıklayın
6. JSON dosyası otomatik indirilir (genellikle `proje-ismi-xxxxx.json` gibi bir isimle)

### 5️⃣ Dosyayı Proje Klasörüne Kopyalayın

1. İndirilen JSON dosyasını `D:\RAF FİYAT ANALİZ\` klasörüne kopyalayın
2. Dosya adını **`service-account.json`** olarak değiştirin

**ÖNEMLİ**: Dosya adı tam olarak **`service-account.json`** olmalı!

### 6️⃣ Google Drive API'yi Etkinleştirin

1. **"APIs & Services"** → **"Library"** tıklayın
2. **"Google Drive API"** arayın
3. **"Google Drive API"** seçin
4. **"Enable"** (Etkinleştir) tıklayın

### 7️⃣ Service Account'a Drive Erişimi Verin (ÖNEMLİ!)

Service Account'un dosyaları Drive'a yükleyebilmesi için:

**Yöntem 1: Service Account Email'ini Paylaş**
1. Service Account'un **email adresini** kopyalayın (şöyle görünür: `raf-fiyat-drive@proje-ismi.iam.gserviceaccount.com`)
2. Google Drive'ınızda bir klasör oluşturun (veya mevcut bir klasörü kullanın)
3. Klasöre sağ tıklayın → **"Share"** (Paylaş)
4. Service Account email'ini ekleyin
5. **"Editor"** veya **"Viewer"** yetkisi verin
6. **"Send"** tıklayın

**Yöntem 2: Domain-Wide Delegation (Gelişmiş)**
- Kurumsal Google Workspace kullanıyorsanız domain-wide delegation yapabilirsiniz
- Çoğu kullanıcı için Yöntem 1 yeterlidir

## ✅ Kurulum Tamamlandı!

Artık Service Account hazır. Test edin:

1. Sunucuyu başlatın: `npm start`
2. Tarayıcıda: `http://localhost:3001/api/export/check-service-account`
3. Başarılı yanıt alırsanız kurulum tamamlanmıştır!

## 🚀 Kullanım

Frontend'de **"Drive'a Yükle"** butonuna tıklayın. Excel dosyası otomatik olarak Google Drive'a yüklenecek!

## 📝 service-account.json Dosya Formatı

Dosya şöyle görünmelidir:

```json
{
  "type": "service_account",
  "project_id": "proje-ismi",
  "private_key_id": "xxxxx",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "raf-fiyat-drive@proje-ismi.iam.gserviceaccount.com",
  "client_id": "xxxxx",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/..."
}
```

## 🔒 Güvenlik

- `service-account.json` dosyası `.gitignore`'da
- Bu dosyayı GitHub'a push etmeyin!
- Private key'i kimseyle paylaşmayın!

## 🐛 Sorun Giderme

### "service-account.json bulunamadı"
- Dosyanın `D:\RAF FİYAT ANALİZ\` klasöründe olduğundan emin olun
- Dosya adının tam olarak `service-account.json` olduğunu kontrol edin

### "Permission denied" veya "Access denied"
- Service Account email'ini Google Drive klasörüne eklediğinizden emin olun
- Klasöre "Editor" yetkisi verdiğinizden emin olun

### "Invalid JSON"
- Dosyanın geçerli JSON formatında olduğundan emin olun
- BOM karakteri olmadığından emin olun

## 💡 İpuçları

- Service Account email'ini bir Google Drive klasörüne ekleyerek, dosyaların nereye yükleneceğini kontrol edebilirsiniz
- Root klasöre yüklemek yerine belirli bir klasöre yüklemek için `uploadToDrive` fonksiyonunda `parents: ['FOLDER_ID']` kullanabilirsiniz

