# 🔐 Render'da Secret File Yükleme - Service Account

## 🎯 Render'da Secret File Kullanımı

Render'da `service-account.json` dosyasını secret file olarak yükleyebilirsiniz. Bu dosya production'da environment variable veya secret file olarak kullanılabilir.

## 📋 Yöntem 1: Environment Variable (Önerilen)

### Adım 1: JSON'u Base64'e Çevir

Service Account JSON dosyasını Base64 formatına çevirin:

**Windows PowerShell:**
```powershell
$content = Get-Content "D:\RAF FİYAT ANALİZ\service-account.json" -Raw
$bytes = [System.Text.Encoding]::UTF8.GetBytes($content)
$base64 = [Convert]::ToBase64String($bytes)
Write-Host $base64
```

**Veya Online Tool:**
- https://www.base64encode.org/ kullanın
- JSON dosyasının içeriğini yapıştırın
- Base64 çıktısını kopyalayın

### Adım 2: Render Dashboard'da Environment Variable Ekle

1. Render Dashboard → Servisinize gidin
2. **"Environment"** sekmesine tıklayın
3. **"Add Environment Variable"** tıklayın
4. **Key**: `SERVICE_ACCOUNT_JSON`
5. **Value**: Base64 çıktısını yapıştırın
6. **"Save Changes"** tıklayın

### Adım 3: Kodda Base64'ü Decode Et

`server/routes/export.js` dosyasını güncelleyin:

```javascript
// Service Account'u environment variable'dan oku
function getServiceAccount() {
  if (process.env.SERVICE_ACCOUNT_JSON) {
    // Base64'ten decode et
    const base64Content = process.env.SERVICE_ACCOUNT_JSON;
    const jsonContent = Buffer.from(base64Content, 'base64').toString('utf8');
    return JSON.parse(jsonContent);
  } else if (fs.existsSync(SERVICE_ACCOUNT_PATH)) {
    // Local development için dosyadan oku
    return readJsonFile(SERVICE_ACCOUNT_PATH);
  } else {
    throw new Error('Service Account bulunamadı. SERVICE_ACCOUNT_JSON environment variable veya service-account.json dosyası gerekli.');
  }
}
```

## 📋 Yöntem 2: Secret File (Render Disk)

### Adım 1: Render Dashboard'da Secret File Ekle

1. Render Dashboard → Servisinize gidin
2. **"Environment"** sekmesine tıklayın
3. **"Secret Files"** bölümüne gidin
4. **"Add Secret File"** tıklayın
5. **Filename**: `service-account.json`
6. **Contents**: JSON dosyasının içeriğini yapıştırın
7. **"Save"** tıklayın

### Adım 2: Kodda Dosya Yolunu Güncelle

Render'da secret file'lar `/etc/secrets/` klasörüne yüklenir. Kodu güncelleyin:

```javascript
const SERVICE_ACCOUNT_PATH = process.env.RENDER 
  ? '/etc/secrets/service-account.json'  // Production (Render)
  : path.join(__dirname, '../../service-account.json');  // Local development
```

## 📋 Yöntem 3: Render Disk (Persistent Disk)

**NOT**: Bu yöntem sadece **Starter Plan ($7/ay)** ile çalışır!

### Adım 1: Disk Ekle

1. Render Dashboard → Servisinize gidin
2. **"Settings"** → **"Disks"** sekmesi
3. **"Add Disk"** tıklayın
4. **Name**: `service-account-disk`
5. **Mount Path**: `/opt/render/project/src/secrets`
6. **Size**: `1 GB`
7. **"Add Disk"** tıklayın

### Adım 2: Dosyayı Yükle

1. Deploy sonrası SSH ile bağlanın veya
2. İlk deploy'da dosyayı otomatik oluşturun

## 🔧 Kod Güncellemesi (Otomatik)

Aşağıdaki kod hem local hem production'da çalışır:

```javascript
// Service Account path'i otomatik belirle
const SERVICE_ACCOUNT_PATH = 
  process.env.SERVICE_ACCOUNT_JSON 
    ? null  // Environment variable kullanılacak
    : (process.env.RENDER 
      ? '/etc/secrets/service-account.json'  // Render secret file
      : path.join(__dirname, '../../service-account.json'));  // Local
```

## ✅ Önerilen Yöntem: Environment Variable (Base64)

**Avantajları:**
- ✅ Ücretsiz (Free plan'da çalışır)
- ✅ Kolay yönetim
- ✅ Güvenli
- ✅ Hızlı

**Adımlar:**
1. JSON'u Base64'e çevir
2. Render'da `SERVICE_ACCOUNT_JSON` environment variable ekle
3. Kodda Base64 decode et

## 🚀 Hızlı Başlangıç

### 1. Base64 Çevir (PowerShell)

```powershell
cd "D:\RAF FİYAT ANALİZ"
$json = Get-Content "service-account.json" -Raw
$bytes = [System.Text.Encoding]::UTF8.GetBytes($json)
$base64 = [Convert]::ToBase64String($bytes)
$base64 | Out-File "service-account-base64.txt"
Write-Host "Base64 çıktısı service-account-base64.txt dosyasına kaydedildi"
```

### 2. Render'da Ekle

1. Dashboard → Environment
2. Key: `SERVICE_ACCOUNT_JSON`
3. Value: Base64 çıktısını yapıştır
4. Save

### 3. Kod Güncelle (Otomatik yapılacak)

Kod otomatik olarak environment variable'dan okuyacak şekilde güncellenecek.

## 📝 Notlar

- Secret file'lar Render'da `/etc/secrets/` klasörüne yüklenir
- Environment variable'lar daha esnek ve kolay yönetilir
- Base64 encoding güvenli ve standart bir yöntemdir
- Production'da asla JSON dosyasını repository'ye push etmeyin!

