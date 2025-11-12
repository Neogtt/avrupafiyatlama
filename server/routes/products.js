const express = require('express');
const router = express.Router();
const dbService = require('../services/databaseService');

// Tüm ürünleri getir
router.get('/', (req, res) => {
  try {
    const db = dbService.getDatabase();
    const products = db.prepare('SELECT * FROM products ORDER BY name').all();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Ürün getir (ID ile)
router.get('/:id', (req, res) => {
  try {
    const db = dbService.getDatabase();
    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Ürün bulunamadı' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Yeni ürün ekle
router.post('/', (req, res) => {
  try {
    const { 
      name, 
      code,
      gtip_code,
      coffee_ratio,
      factory_price, 
      customs_tax_type,
      customs_tax_rate, 
      customs_tax_per_kg,
      kaffeesteuer_per_kg,
      weight_per_box,
      items_per_box,
      vat_rate, 
      pallet_box_count 
    } = req.body;
    
    if (!name || factory_price === undefined) {
      return res.status(400).json({ error: 'Ürün adı ve fabrika fiyatı zorunludur' });
    }

    const db = dbService.getDatabase();
    const stmt = db.prepare(`
      INSERT INTO products (
        name, code, gtip_code, coffee_ratio, factory_price, customs_tax_type, customs_tax_rate, 
        customs_tax_per_kg, kaffeesteuer_per_kg, weight_per_box, items_per_box, vat_rate, pallet_box_count
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(
      name,
      code || null,
      gtip_code || null,
      coffee_ratio || 0,
      factory_price,
      customs_tax_type || 'percentage',
      customs_tax_rate || 0,
      customs_tax_per_kg || 0,
      kaffeesteuer_per_kg || 0,
      weight_per_box || 0,
      (items_per_box !== undefined && items_per_box !== null && items_per_box !== '') ? parseInt(items_per_box) : 1,
      vat_rate || 0,
      pallet_box_count || 1
    );

    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Ürün güncelle
router.put('/:id', (req, res) => {
  try {
    const { 
      name, 
      code,
      gtip_code,
      coffee_ratio,
      factory_price, 
      customs_tax_type,
      customs_tax_rate, 
      customs_tax_per_kg,
      kaffeesteuer_per_kg,
      weight_per_box,
      items_per_box,
      vat_rate, 
      pallet_box_count
    } = req.body;
    
    const db = dbService.getDatabase();
    const stmt = db.prepare(`
      UPDATE products 
      SET name = ?, code = ?, gtip_code = ?, coffee_ratio = ?, factory_price = ?, customs_tax_type = ?,
          customs_tax_rate = ?, customs_tax_per_kg = ?, kaffeesteuer_per_kg = ?, weight_per_box = ?,
          items_per_box = ?, vat_rate = ?, pallet_box_count = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    
    stmt.run(
      name,
      code || null,
      gtip_code || null,
      coffee_ratio || 0,
      factory_price,
      customs_tax_type || 'percentage',
      customs_tax_rate || 0,
      customs_tax_per_kg || 0,
      kaffeesteuer_per_kg || 0,
      weight_per_box || 0,
      (items_per_box !== undefined && items_per_box !== null && items_per_box !== '') ? parseInt(items_per_box) : 1,
      vat_rate || 0,
      pallet_box_count || 1,
      req.params.id
    );

    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Ürün bulunamadı' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Ürün sil
router.delete('/:id', (req, res) => {
  try {
    const db = dbService.getDatabase();
    
    // Transaction kullanarak güvenli silme
    const deleteTransaction = db.transaction(() => {
      // Önce ilgili hesaplama geçmişi kayıtlarını sil (CASCADE varsa otomatik silinir, ama yine de manuel silme yapıyoruz)
      db.prepare('DELETE FROM calculation_history WHERE product_id = ?').run(req.params.id);
      
      // Sonra ürünü sil (CASCADE sayesinde ilgili kayıtlar otomatik silinir)
      const stmt = db.prepare('DELETE FROM products WHERE id = ?');
      const result = stmt.run(req.params.id);
      
      if (result.changes === 0) {
        throw new Error('Ürün bulunamadı');
      }
      
      return { message: 'Ürün başarıyla silindi' };
    });
    
    const result = deleteTransaction();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

