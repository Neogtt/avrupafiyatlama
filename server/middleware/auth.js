const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'raf-fiyat-analiz-secret-key-2024';

// JWT token doğrulama middleware
function authenticateToken(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '') || req.query.token;

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Yetkilendirme gerekli. Lütfen giriş yapın.'
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // Kullanıcı bilgisini request'e ekle
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: 'Geçersiz veya süresi dolmuş token. Lütfen tekrar giriş yapın.'
    });
  }
}

module.exports = authenticateToken;

