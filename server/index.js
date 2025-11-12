const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const dbService = require('./services/databaseService');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Initialize database
dbService.initializeDatabase();

// API Routes (static file serving'den ÖNCE olmalı)
app.use('/api/products', require('./routes/products'));
app.use('/api/calculations', require('./routes/calculations'));
app.use('/api/settings', require('./routes/settings'));
app.use('/api/export', require('./routes/export'));
app.use('/api/import', require('./routes/import'));

// Serve static files from React app (production'da)
const buildPath = path.join(__dirname, '../client/build');
if (process.env.NODE_ENV === 'production' && require('fs').existsSync(buildPath)) {
  app.use(express.static(buildPath));
  // Tüm non-API route'ları için index.html gönder (React Router için)
  app.get('*', (req, res) => {
    // API route'larını atla
    if (req.path.startsWith('/api/')) {
      return res.status(404).json({ error: 'API endpoint bulunamadı' });
    }
    res.sendFile(path.join(buildPath, 'index.html'));
  });
} else if (process.env.NODE_ENV === 'production') {
  console.warn('⚠️  UYARI: client/build klasörü bulunamadı! Frontend build edilmiş mi?');
}

app.listen(PORT, () => {
  console.log(`RAF Fiyat Analizi sunucusu ${PORT} portunda çalışıyor`);
});

