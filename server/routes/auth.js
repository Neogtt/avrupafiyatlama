const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

// Kullanıcı bilgileri (production'da veritabanına taşınabilir)
const USERS = {
  admin: 'Seker12345!'
};

// JWT secret key (production'da environment variable'dan alınmalı)
const JWT_SECRET = process.env.JWT_SECRET || 'raf-fiyat-analiz-secret-key-2024';

// Login endpoint
router.post('/login', (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ 
        success: false,
        error: 'Kullanıcı adı ve şifre gereklidir' 
      });
    }

    // Kullanıcı kontrolü
    if (USERS[username] && USERS[username] === password) {
      // JWT token oluştur
      const token = jwt.sign(
        { username: username },
        JWT_SECRET,
        { expiresIn: '24h' } // 24 saat geçerli
      );

      return res.json({
        success: true,
        message: 'Giriş başarılı',
        token: token,
        username: username
      });
    } else {
      return res.status(401).json({
        success: false,
        error: 'Kullanıcı adı veya şifre hatalı'
      });
    }
  } catch (error) {
    console.error('Login hatası:', error);
    return res.status(500).json({
      success: false,
      error: 'Giriş işlemi sırasında bir hata oluştu'
    });
  }
});

// Token doğrulama endpoint
router.get('/verify', (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '') || req.query.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Token bulunamadı'
      });
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      return res.json({
        success: true,
        valid: true,
        username: decoded.username
      });
    } catch (error) {
      return res.status(401).json({
        success: false,
        valid: false,
        error: 'Geçersiz veya süresi dolmuş token'
      });
    }
  } catch (error) {
    console.error('Token doğrulama hatası:', error);
    return res.status(500).json({
      success: false,
      error: 'Token doğrulama sırasında bir hata oluştu'
    });
  }
});

// Logout endpoint (client-side token silme için)
router.post('/logout', (req, res) => {
  return res.json({
    success: true,
    message: 'Çıkış başarılı'
  });
});

module.exports = router;

