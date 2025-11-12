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

// Auth middleware (sadece API route'ları için, static file serving'den önce)
const authenticateToken = require('./middleware/auth');

// API Routes (static file serving'den ÖNCE olmalı)
app.use('/api/auth', require('./routes/auth')); // Auth route'ları middleware'den önce
app.use('/api/products', authenticateToken, require('./routes/products'));
app.use('/api/calculations', authenticateToken, require('./routes/calculations'));
app.use('/api/settings', authenticateToken, require('./routes/settings'));
app.use('/api/export', authenticateToken, require('./routes/export'));
app.use('/api/import', authenticateToken, require('./routes/import'));

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

