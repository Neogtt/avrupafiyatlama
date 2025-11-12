# RAF Fiyat Analizi

Avrupa için gümrük vergisi, KDV, nakliye maliyeti ve kar marjlarını hesaplayarak RAF fiyatını belirleyen sistem.

## Özellikler

- ✅ Ürün yönetimi (SQLite veritabanı)
- ✅ Her ürün için özel gümrük vergisi oranı
- ✅ KDV hesaplama
- ✅ Nakliye maliyeti hesaplama (Tır: 33 palet, Konteyner: 24 palet)
- ✅ Palet üstü koli sayısına göre koli başına maliyet
- ✅ Bayi karı ve süpermarket karı yönetimi
- ✅ Fabrika fiyatından RAF fiyatına kadar detaylı hesaplama
- ✅ Hesaplama geçmişi

## Kurulum

### 1. Bağımlılıkları Yükle

```bash
cd "D:\RAF FİYAT ANALİZ"
npm install
cd client
npm install
cd ..
```

### 2. Sunucuyu Başlat

```bash
npm start
```

Sunucu `http://localhost:3001` adresinde çalışacaktır.

### 3. Frontend'i Başlat (Ayrı Terminal)

```bash
cd client
npm start
```

Frontend `http://localhost:3000` adresinde açılacaktır.

## Kullanım

1. **Ürün Ekleme**: "Yeni Ürün Ekle" butonuna tıklayarak ürün bilgilerini girin
2. **Ürün Seçimi**: Listeden bir ürün seçin (otomatik olarak bilgileri doldurur)
3. **Parametreleri Girin**:
   - Fabrika fiyatı
   - Gümrük vergisi oranı (%)
   - KDV oranı (%)
   - Nakliye tipi (Tır veya Konteyner)
   - Nakliye toplam bedeli
   - Palet üstü koli sayısı
   - Bayi karı (%)
   - Süpermarket karı (%)
4. **Hesapla**: "RAF Fiyatını Hesapla" butonuna tıklayın
5. **Sonuçları Görüntüle**: Detaylı hesaplama sonuçları ekranda görüntülenecektir

## Hesaplama Formülü

1. **Gümrük Vergisi** = Fabrika Fiyatı × (Gümrük Vergisi Oranı / 100)
2. **Gümrük Sonrası Fiyat** = Fabrika Fiyatı + Gümrük Vergisi
3. **KDV** = Gümrük Sonrası Fiyat × (KDV Oranı / 100)
4. **KDV Sonrası Fiyat** = Gümrük Sonrası Fiyat + KDV
5. **Palet Başına Maliyet** = Nakliye Toplam Bedeli / Palet Kapasitesi (33 veya 24)
6. **Koli Başına Nakliye** = Palet Başına Maliyet / Palet Üstü Koli Sayısı
7. **Nakliye Sonrası Fiyat** = KDV Sonrası Fiyat + Koli Başına Nakliye
8. **Bayi Karı** = Nakliye Sonrası Fiyat × (Bayi Karı / 100)
9. **Bayi Sonrası Fiyat** = Nakliye Sonrası Fiyat + Bayi Karı
10. **Süpermarket Karı** = Bayi Sonrası Fiyat × (Süpermarket Karı / 100)
11. **RAF FİYATI** = Bayi Sonrası Fiyat + Süpermarket Karı

## Veritabanı

SQLite veritabanı `data/raf_fiyat.db` dosyasında saklanır.

### Tablolar:
- `products`: Ürün bilgileri
- `shipping_settings`: Nakliye ayarları
- `margin_settings`: Kar oranları
- `calculation_history`: Hesaplama geçmişi

## API Endpoints

### Ürünler
- `GET /api/products` - Tüm ürünleri getir
- `GET /api/products/:id` - Ürün detayı
- `POST /api/products` - Yeni ürün ekle
- `PUT /api/products/:id` - Ürün güncelle
- `DELETE /api/products/:id` - Ürün sil

### Hesaplamalar
- `POST /api/calculations/raf-price` - RAF fiyat hesapla
- `GET /api/calculations/history` - Hesaplama geçmişi

### Ayarlar
- `GET /api/settings/margins` - Kar oranlarını getir
- `PUT /api/settings/margins` - Kar oranlarını güncelle

## Teknolojiler

- **Backend**: Node.js, Express, SQLite (better-sqlite3)
- **Frontend**: React
- **Veritabanı**: SQLite

## 🚀 Deploy (Render)

Detaylı deploy talimatları için `RENDER-DEPLOY.md` dosyasına bakın.

### Hızlı Başlangıç:
1. GitHub'a push edin
2. Render.com'a giriş yapın
3. "New Web Service" seçin
4. Repository'nizi bağlayın
5. `render.yaml` dosyası otomatik ayarları uygular

**ÖNEMLİ**: Render Free Plan'da SQLite verileri kalıcı değil! 
Starter Plan ($7/ay) veya PostgreSQL kullanın.

## Lisans

ISC
