const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, '../../data/raf_fiyat.db');

// Ensure data directory exists
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

let db = null;

function getDatabase() {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('foreign_keys = ON');
  }
  return db;
}

function initializeDatabase() {
  const database = getDatabase();
  
  // Ürünler tablosu
  database.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      code TEXT UNIQUE,
      gtip_code TEXT,
      coffee_ratio REAL DEFAULT 0,
      factory_price REAL NOT NULL,
      customs_tax_type TEXT DEFAULT 'percentage',
      customs_tax_rate REAL DEFAULT 0,
      customs_tax_per_kg REAL DEFAULT 0,
      kaffeesteuer_per_kg REAL DEFAULT 0,
      weight_per_box REAL DEFAULT 0,
      items_per_box INTEGER DEFAULT 1,
      vat_rate REAL DEFAULT 0,
      pallet_box_count INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Mevcut tabloya yeni kolonları ekle (migration)
  try {
    database.exec(`ALTER TABLE products ADD COLUMN customs_tax_type TEXT DEFAULT 'percentage'`);
  } catch (e) {
    // Kolon zaten varsa hata vermez
  }
  try {
    database.exec(`ALTER TABLE products ADD COLUMN customs_tax_per_kg REAL DEFAULT 0`);
  } catch (e) {
    // Kolon zaten varsa hata vermez
  }
  try {
    database.exec(`ALTER TABLE products ADD COLUMN weight_per_box REAL DEFAULT 0`);
  } catch (e) {
    // Kolon zaten varsa hata vermez
  }
  try {
    database.exec(`ALTER TABLE products ADD COLUMN items_per_box INTEGER DEFAULT 1`);
  } catch (e) {
    // Kolon zaten varsa hata vermez
  }
  // Yeni kolonlar: GTİP, Kahve Oranı, Kaffeesteuer
  try {
    database.exec(`ALTER TABLE products ADD COLUMN gtip_code TEXT`);
  } catch (e) {
    // Kolon zaten varsa hata vermez
  }
  try {
    database.exec(`ALTER TABLE products ADD COLUMN coffee_ratio REAL DEFAULT 0`);
  } catch (e) {
    // Kolon zaten varsa hata vermez
  }
  try {
    database.exec(`ALTER TABLE products ADD COLUMN kaffeesteuer_per_kg REAL DEFAULT 0`);
  } catch (e) {
    // Kolon zaten varsa hata vermez
  }

  // Foreign key CASCADE migration - calculation_history tablosunu yeniden oluştur
  try {
    // Mevcut tabloyu kontrol et
    const tableInfo = database.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='calculation_history'").get();
    if (tableInfo) {
      // Mevcut verileri yedekle
      const oldData = database.prepare('SELECT * FROM calculation_history').all();
      
      // Eski tabloyu sil
      database.exec('DROP TABLE IF EXISTS calculation_history');
      
      // Yeni tabloyu CASCADE ile oluştur
      database.exec(`
        CREATE TABLE calculation_history (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          product_id INTEGER,
          factory_price REAL,
          customs_tax REAL,
          vat_amount REAL,
          shipping_cost_per_box REAL,
          dealer_margin REAL,
          supermarket_margin REAL,
          final_raf_price REAL,
          calculation_date DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
        )
      `);
      
      // Verileri geri yükle (ID'leri otomatik oluştur)
      if (oldData.length > 0) {
        const insertStmt = database.prepare(`
          INSERT INTO calculation_history 
          (product_id, factory_price, customs_tax, vat_amount, shipping_cost_per_box, dealer_margin, supermarket_margin, final_raf_price, calculation_date)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        oldData.forEach(row => {
          insertStmt.run(
            row.product_id,
            row.factory_price,
            row.customs_tax,
            row.vat_amount,
            row.shipping_cost_per_box,
            row.dealer_margin,
            row.supermarket_margin,
            row.final_raf_price,
            row.calculation_date
          );
        });
      }
    }
  } catch (e) {
    // Migration hatası - logla ama devam et
    console.log('Foreign key CASCADE migration hatası (normal olabilir):', e.message);
  }

  // Nakliye ayarları tablosu
  database.exec(`
    CREATE TABLE IF NOT EXISTS shipping_settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      shipping_type TEXT NOT NULL,
      total_cost REAL NOT NULL,
      pallet_capacity INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Kar oranları tablosu
  database.exec(`
    CREATE TABLE IF NOT EXISTS margin_settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      dealer_margin REAL DEFAULT 0,
      supermarket_margin REAL DEFAULT 0,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Hesaplama geçmişi
  database.exec(`
    CREATE TABLE IF NOT EXISTS calculation_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER,
      factory_price REAL,
      customs_tax REAL,
      vat_amount REAL,
      shipping_cost_per_box REAL,
      dealer_margin REAL,
      supermarket_margin REAL,
      final_raf_price REAL,
      calculation_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    )
  `);

  // Varsayılan kar oranları ekle
  const marginCheck = database.prepare('SELECT COUNT(*) as count FROM margin_settings').get();
  if (marginCheck.count === 0) {
    database.prepare('INSERT INTO margin_settings (dealer_margin, supermarket_margin) VALUES (?, ?)')
      .run(0, 0);
  }

  console.log('Veritabanı başarıyla başlatıldı');
}

function closeDatabase() {
  if (db) {
    db.close();
    db = null;
  }
}

module.exports = {
  getDatabase,
  initializeDatabase,
  closeDatabase
};

