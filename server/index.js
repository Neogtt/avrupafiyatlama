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

// API Routes
app.use('/api/products', require('./routes/products'));
app.use('/api/calculations', require('./routes/calculations'));
app.use('/api/settings', require('./routes/settings'));
app.use('/api/export', require('./routes/export'));

// Serve static files from React app
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build/index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`RAF Fiyat Analizi sunucusu ${PORT} portunda çalışıyor`);
});

