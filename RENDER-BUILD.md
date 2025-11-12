# 🔧 Render Build Command Ayarı

## 📋 Build Command

Render Dashboard'da veya `render.yaml` dosyasında:

```bash
npm install && cd client && npm install && npm run build && cd ..
```

## 🔍 Adım Adım Açıklama

1. **`npm install`** - Backend dependencies yüklenir
2. **`cd client`** - Client klasörüne geçilir
3. **`npm install`** - Frontend dependencies yüklenir
4. **`npm run build`** - React app production build yapılır (client/build klasörüne)
5. **`cd ..`** - Root klasöre geri dönülür

## ⚙️ Start Command

```bash
npm start
```

Bu komut `server/index.js` dosyasını çalıştırır ve production modunda React build dosyalarını serve eder.

## 🎯 render.yaml Kullanımı

Eğer `render.yaml` dosyası kullanıyorsanız, otomatik olarak bu ayarlar uygulanır.

## 📝 Manuel Ayarlama (render.yaml yoksa)

Render Dashboard'da:

1. **Build Command**:
   ```
   npm install && cd client && npm install && npm run build && cd ..
   ```

2. **Start Command**:
   ```
   npm start
   ```

3. **Environment Variables**:
   - `NODE_ENV` = `production`
   - `PORT` = `10000` (Render otomatik atar, ama belirtmek iyi)

## ⚠️ Önemli Notlar

### better-sqlite3 Native Module

`better-sqlite3` native module olduğu için build sırasında derlenmesi gerekir. Render otomatik olarak yapar, ama bazen sorun çıkabilir.

**Çözüm**: Render'ın build loglarını kontrol edin. Eğer hata varsa, Node.js versiyonunu belirtin (`.nvmrc` dosyası var).

### Build Süresi

İlk build 5-10 dakika sürebilir:
- Backend dependencies: ~2-3 dk
- Frontend dependencies: ~3-4 dk
- React build: ~2-3 dk

### Build Cache

Render build cache kullanır, bu yüzden sonraki build'ler daha hızlı olur.

## 🐛 Sorun Giderme

### Build Hatası: "better-sqlite3 build failed"
- Node.js versiyonunu kontrol edin (`.nvmrc` dosyası: 18)
- Build loglarını kontrol edin

### Build Hatası: "client/build not found"
- `npm run build` komutunun çalıştığından emin olun
- `client/build` klasörünün oluştuğunu kontrol edin

### Build Hatası: "Module not found"
- `npm install` komutlarının başarılı olduğundan emin olun
- `node_modules` klasörlerinin oluştuğunu kontrol edin

## ✅ Doğru Build Command

```bash
npm install && cd client && npm install && npm run build && cd ..
```

Bu komut:
- ✅ Backend dependencies yükler
- ✅ Frontend dependencies yükler
- ✅ React production build yapar
- ✅ Server production modunda çalışır

## 🚀 Test

Deploy sonrası test edin:

```bash
# Build loglarını kontrol edin
# Render Dashboard → Logs

# Uygulamayı test edin
https://your-app.onrender.com
```

