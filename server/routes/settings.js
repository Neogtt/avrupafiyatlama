const express = require('express');
const router = express.Router();
const dbService = require('../services/databaseService');

// Kar oranlarını getir
router.get('/margins', (req, res) => {
  try {
    const db = dbService.getDatabase();
    const margins = db.prepare('SELECT * FROM margin_settings ORDER BY id DESC LIMIT 1').get();
    if (!margins) {
      return res.json({ dealer_margin: 0, supermarket_margin: 0 });
    }
    res.json(margins);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Kar oranlarını güncelle
router.put('/margins', (req, res) => {
  try {
    const { dealer_margin, supermarket_margin } = req.body;
    
    const db = dbService.getDatabase();
    
    // Mevcut kaydı kontrol et
    const existing = db.prepare('SELECT * FROM margin_settings ORDER BY id DESC LIMIT 1').get();
    
    if (existing) {
      // Güncelle
      db.prepare(`
        UPDATE margin_settings 
        SET dealer_margin = ?, supermarket_margin = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(dealer_margin || 0, supermarket_margin || 0, existing.id);
    } else {
      // Yeni kayıt ekle
      db.prepare(`
        INSERT INTO margin_settings (dealer_margin, supermarket_margin)
        VALUES (?, ?)
      `).run(dealer_margin || 0, supermarket_margin || 0);
    }
    
    const updated = db.prepare('SELECT * FROM margin_settings ORDER BY id DESC LIMIT 1').get();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

