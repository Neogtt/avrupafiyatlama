# 📊 Excel Export ve Google Drive Entegrasyonu

## 🎯 Özellikler

✅ Tüm ürünleri Excel formatında export etme
✅ Excel dosyasını doğrudan indirme
✅ Excel dosyasını Google Drive'a otomatik yükleme
✅ Herkese açık erişim linki oluşturma
✅ Tek tıkla kullanım

## 📋 Kurulum

### 1. Paketleri Yükleyin

```bash
cd "D:\RAF FİYAT ANALİZ"
npm install
```

Yeni paketler:
- `exceljs` - Excel dosyası oluşturma
- `googleapis` - Google Drive API

### 2. Google Drive API Kurulumu

Detaylı kurulum için `GOOGLE-DRIVE-SETUP.md` dosyasına bakın.

**Kısa Özet:**
1. Google Cloud Console'da proje oluşturun
2. Google Drive API'yi etkinleştirin
3. OAuth 2.0 credentials oluşturun
4. `credentials.json` dosyasını proje klasörüne ekleyin
5. İlk yetkilendirme yapın

## 🚀 Kullanım

### Frontend'den Kullanım

1. **Excel İndir Butonu** 📥
   - Ürün listesi bölümünde "Excel İndir" butonuna tıklayın
   - Excel dosyası tarayıcınıza indirilir
   - Dosya adı: `RAF_Fiyat_Analizi_Urunler.xlsx`

2. **Drive'a Yükle Butonu** ☁️
   - "Drive'a Yükle" butonuna tıklayın
   - Excel dosyası otomatik oluşturulur ve Google Drive'a yüklenir
   - Herkese açık erişim linki gösterilir
   - Link yeni sekmede açılır

### API Endpoint'leri

#### 1. Excel İndir
```
GET /api/export/excel
```
Excel dosyasını doğrudan indirir.

#### 2. Excel Oluştur ve Drive'a Yükle
```
GET /api/export/excel-drive
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

#### 3. Google Drive Yetkilendirme URL'i
```
GET /api/export/auth-url
```

#### 4. Google Drive Yetkilendirme Callback
```
GET /api/export/auth-callback?code=YOUR_CODE
```

## 📊 Excel Dosyası İçeriği

Excel dosyası şu kolonları içerir:

- ID
- Ürün Adı
- Ürün Kodu
- GTİP Kodu
- Kahve Oranı (%)
- Fabrika Fiyatı (€)
- Gümrük Vergisi Tipi
- Gümrük Vergisi Oranı (%)
- KG Başına Gümrük Vergisi (€/kg)
- Kaffeesteuer (€/kg)
- Koli Ağırlığı (kg)
- Koli İçi Adet
- KDV Oranı (%)
- Palet Üstü Koli Sayısı
- Oluşturulma Tarihi
- Güncellenme Tarihi

## ⚙️ Yapılandırma

### Google Drive Klasörü Belirleme

`server/routes/export.js` dosyasında `uploadToDrive` fonksiyonunda:

```javascript
const fileMetadata = {
  name: fileName,
  parents: ['FOLDER_ID_HERE'] // Belirli bir klasör ID'si ekleyin
};
```

### Dosya Adı Değiştirme

`uploadToDrive` fonksiyonunda `fileName` parametresini değiştirin.

## 🔒 Güvenlik

- `credentials.json` ve `token.json` dosyaları `.gitignore`'da
- Bu dosyaları GitHub'a push etmeyin!
- Production'da environment variables kullanın

## 🐛 Sorun Giderme

### "credentials.json bulunamadı"
- Dosyanın proje klasöründe olduğundan emin olun
- Dosya adının tam olarak `credentials.json` olduğunu kontrol edin

### "token.json bulunamadı"
- İlk yetkilendirmeyi yapın
- `/api/export/auth-url` endpoint'ini kullanın

### "Access denied"
- OAuth consent screen'de test user ekleyin
- Production'da app'i verify edin

### Excel dosyası boş
- Veritabanında ürün olup olmadığını kontrol edin
- Logları kontrol edin

## 📝 Notlar

- Excel dosyası her seferinde yeniden oluşturulur
- Drive'a yüklenen dosyalar kalıcıdır (manuel silinene kadar)
- Herkese açık link oluşturulur, paylaşım kolaydır
- Excel formatı: `.xlsx` (Excel 2007+)

