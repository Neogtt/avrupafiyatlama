const express = require('express');
const router = express.Router();
const dbService = require('../services/databaseService');

// RAF fiyat hesaplama
router.post('/raf-price', (req, res) => {
  try {
    const {
      product_id,
      factory_price,
      customs_tax_type,
      customs_tax_rate,
      customs_tax_per_kg,
      kaffeesteuer_per_kg,
      weight_per_box,
      items_per_box,
      vat_rate,
      shipping_type,
      shipping_total_cost,
      pallet_box_count,
      dealer_margin,
      supermarket_margin
    } = req.body;

    // Validasyon
    if (factory_price === undefined || factory_price === null) {
      return res.status(400).json({ error: 'Fabrika fiyatı gereklidir' });
    }

    // 1. Gümrük vergisi hesaplama
    let customs_tax = 0;
    const taxType = customs_tax_type || 'percentage';
    
    if (taxType === 'per_kg') {
      // KG başına vergi hesaplama
      if (customs_tax_per_kg && customs_tax_per_kg > 0) {
        // Eğer KG başına vergi girilmişse, ağırlık ve vergi miktarı gerekli
        if (!weight_per_box || weight_per_box <= 0) {
          return res.status(400).json({ error: 'KG başına vergi için koli ağırlığı gereklidir' });
        }
        customs_tax = weight_per_box * customs_tax_per_kg;
      } else {
        // KG başına vergi girilmemişse, sadece yüzde olarak hesapla veya 0
        customs_tax = factory_price * ((customs_tax_rate || 0) / 100);
      }
    } else {
      // Yüzde olarak vergi hesaplama
      customs_tax = factory_price * ((customs_tax_rate || 0) / 100);
    }
    
    const price_after_customs = factory_price + customs_tax;

    // 2. Kaffeesteuer (Kahve Vergisi) hesaplama (kg başına)
    let kaffeesteuer_amount = 0;
    if (kaffeesteuer_per_kg && kaffeesteuer_per_kg > 0) {
      if (!weight_per_box || weight_per_box <= 0) {
        return res.status(400).json({ error: 'Kaffeesteuer için koli ağırlığı gereklidir' });
      }
      kaffeesteuer_amount = weight_per_box * kaffeesteuer_per_kg;
    }
    const price_after_kaffeesteuer = price_after_customs + kaffeesteuer_amount;

    // 3. KDV hesaplama (gümrük vergisi + kahve vergisi dahil fiyat üzerinden)
    const vat_amount = price_after_kaffeesteuer * (vat_rate / 100);
    const price_after_vat = price_after_kaffeesteuer + vat_amount;

    // 3. Nakliye maliyeti hesaplama
    let pallet_capacity;
    if (shipping_type === 'tir') {
      pallet_capacity = 33;
    } else if (shipping_type === 'konteyner') {
      pallet_capacity = 24;
    } else {
      return res.status(400).json({ error: 'Geçersiz nakliye tipi. "tir" veya "konteyner" olmalıdır.' });
    }

    if (!shipping_total_cost || shipping_total_cost <= 0) {
      return res.status(400).json({ error: 'Nakliye toplam maliyeti gereklidir' });
    }

    if (!pallet_box_count || pallet_box_count <= 0) {
      return res.status(400).json({ error: 'Palet üstü koli sayısı gereklidir' });
    }

    // Palet başına maliyet
    const cost_per_pallet = shipping_total_cost / pallet_capacity;
    
    // Koli başına maliyet
    const shipping_cost_per_box = cost_per_pallet / pallet_box_count;

    // 4. Nakliye maliyeti eklenmiş fiyat (koli fiyatı)
    const price_with_shipping = price_after_vat + shipping_cost_per_box;

    // 5. Nakliye sonrası birim fiyat hesaplama (koli içi adete bölünmüş)
    const itemsPerBox = parseInt(items_per_box) || 1;
    const unit_price_after_shipping = itemsPerBox > 0 ? price_with_shipping / itemsPerBox : price_with_shipping;

    // 6. Bayi karı ekleme (birim fiyat üzerinden)
    const dealer_margin_amount_per_unit = unit_price_after_shipping * ((dealer_margin || 0) / 100);
    const unit_price_after_dealer = unit_price_after_shipping + dealer_margin_amount_per_unit;

    // 7. Süpermarket karı ekleme (birim fiyat üzerinden)
    const supermarket_margin_amount_per_unit = unit_price_after_dealer * ((supermarket_margin || 0) / 100);
    const final_raf_price = unit_price_after_dealer + supermarket_margin_amount_per_unit;

    // 8. Koli fiyatı (final birim fiyat * koli içi adet)
    const final_box_price = final_raf_price * itemsPerBox;

    // Sonuçları hazırla
    const calculation = {
      factory_price: parseFloat(factory_price.toFixed(2)),
      customs_tax_type: taxType,
      customs_tax_rate: parseFloat(customs_tax_rate || 0),
      customs_tax_per_kg: parseFloat(customs_tax_per_kg || 0),
      weight_per_box: parseFloat(weight_per_box || 0),
      customs_tax: parseFloat(customs_tax.toFixed(2)),
      price_after_customs: parseFloat(price_after_customs.toFixed(2)),
      kaffeesteuer_per_kg: parseFloat(kaffeesteuer_per_kg || 0),
      kaffeesteuer_amount: parseFloat(kaffeesteuer_amount.toFixed(2)),
      price_after_kaffeesteuer: parseFloat(price_after_kaffeesteuer.toFixed(2)),
      vat_rate: parseFloat(vat_rate || 0),
      vat_amount: parseFloat(vat_amount.toFixed(2)),
      price_after_vat: parseFloat(price_after_vat.toFixed(2)),
      shipping_type,
      shipping_total_cost: parseFloat(shipping_total_cost.toFixed(2)),
      pallet_capacity,
      cost_per_pallet: parseFloat(cost_per_pallet.toFixed(2)),
      pallet_box_count: parseInt(pallet_box_count),
      shipping_cost_per_box: parseFloat(shipping_cost_per_box.toFixed(2)),
      price_with_shipping: parseFloat(price_with_shipping.toFixed(2)),
      items_per_box: itemsPerBox,
      unit_price_after_shipping: parseFloat(unit_price_after_shipping.toFixed(2)),
      dealer_margin: parseFloat(dealer_margin || 0),
      dealer_margin_amount_per_unit: parseFloat(dealer_margin_amount_per_unit.toFixed(2)),
      unit_price_after_dealer: parseFloat(unit_price_after_dealer.toFixed(2)),
      supermarket_margin: parseFloat(supermarket_margin || 0),
      supermarket_margin_amount_per_unit: parseFloat(supermarket_margin_amount_per_unit.toFixed(2)),
      final_raf_price: parseFloat(final_raf_price.toFixed(2)),
      final_box_price: parseFloat(final_box_price.toFixed(2))
    };

    // Hesaplama geçmişine kaydet
    if (product_id) {
      const db = dbService.getDatabase();
      db.prepare(`
        INSERT INTO calculation_history (
          product_id, factory_price, customs_tax, vat_amount, 
          shipping_cost_per_box, dealer_margin, supermarket_margin, final_raf_price
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        product_id,
        factory_price,
        customs_tax,
        vat_amount,
        shipping_cost_per_box,
        dealer_margin || 0,
        supermarket_margin || 0,
        final_raf_price
      );
    }

    res.json(calculation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// RAF fiyatından fabrika fiyatına geriye dönük hesaplama
router.post('/reverse-calculation', (req, res) => {
  try {
    const {
      raf_price_unit,
      customs_tax_type,
      customs_tax_rate,
      customs_tax_per_kg,
      kaffeesteuer_per_kg,
      weight_per_box,
      items_per_box,
      vat_rate,
      shipping_type,
      shipping_total_cost,
      pallet_box_count,
      dealer_margin,
      supermarket_margin
    } = req.body;

    // Validasyon
    if (raf_price_unit === undefined || raf_price_unit === null || raf_price_unit <= 0) {
      return res.status(400).json({ error: 'RAF fiyatı (birim) gereklidir' });
    }

    const itemsPerBox = parseInt(items_per_box) || 1;
    const rafPriceUnit = parseFloat(raf_price_unit);

    // 1. Süpermarket karını düşür (birim fiyattan)
    const supermarketMarginRate = parseFloat(supermarket_margin || 0) / 100;
    const price_before_supermarket = rafPriceUnit / (1 + supermarketMarginRate);
    const supermarket_margin_amount_per_unit = rafPriceUnit - price_before_supermarket;

    // 2. Bayi karını düşür (birim fiyattan)
    const dealerMarginRate = parseFloat(dealer_margin || 0) / 100;
    const price_before_dealer = price_before_supermarket / (1 + dealerMarginRate);
    const dealer_margin_amount_per_unit = price_before_supermarket - price_before_dealer;

    // 3. Nakliye maliyetini hesapla ve düşür
    let pallet_capacity;
    if (shipping_type === 'tir') {
      pallet_capacity = 33;
    } else if (shipping_type === 'konteyner') {
      pallet_capacity = 24;
    } else {
      return res.status(400).json({ error: 'Geçersiz nakliye tipi. "tir" veya "konteyner" olmalıdır.' });
    }

    if (!shipping_total_cost || shipping_total_cost <= 0) {
      return res.status(400).json({ error: 'Nakliye toplam maliyeti gereklidir' });
    }

    if (!pallet_box_count || pallet_box_count <= 0) {
      return res.status(400).json({ error: 'Palet üstü koli sayısı gereklidir' });
    }

    // Palet başına maliyet
    const cost_per_pallet = shipping_total_cost / pallet_capacity;
    // Koli başına maliyet
    const shipping_cost_per_box = cost_per_pallet / pallet_box_count;
    // Birim başına nakliye maliyeti
    const shipping_cost_per_unit = shipping_cost_per_box / itemsPerBox;

    // Nakliye sonrası birim fiyat (nakliye maliyeti düşürülmüş)
    const unit_price_after_shipping = price_before_dealer;
    // Nakliye öncesi birim fiyat
    const price_before_shipping_unit = unit_price_after_shipping - shipping_cost_per_unit;

    // Koli fiyatı (nakliye öncesi)
    const price_before_shipping_box = price_before_shipping_unit * itemsPerBox;

    // 4. KDV'yi düşür
    const vatRate = parseFloat(vat_rate || 0) / 100;
    const price_before_vat = price_before_shipping_box / (1 + vatRate);
    const vat_amount = price_before_shipping_box - price_before_vat;

    // 5. Kaffeesteuer (Kahve Vergisi) düşür (KDV öncesi fiyattan)
    let kaffeesteuer_amount = 0;
    let price_before_kaffeesteuer = price_before_vat;
    if (kaffeesteuer_per_kg && kaffeesteuer_per_kg > 0) {
      if (!weight_per_box || weight_per_box <= 0) {
        return res.status(400).json({ error: 'Kaffeesteuer için koli ağırlığı gereklidir' });
      }
      kaffeesteuer_amount = weight_per_box * parseFloat(kaffeesteuer_per_kg);
      price_before_kaffeesteuer = price_before_vat - kaffeesteuer_amount;
    }

    // 6. Gümrük vergisini düşür
    let customs_tax = 0;
    let factory_price = 0;
    const taxType = customs_tax_type || 'percentage';

    if (taxType === 'per_kg') {
      // KG başına vergi
      if (customs_tax_per_kg && customs_tax_per_kg > 0) {
        // Eğer KG başına vergi girilmişse, ağırlık gerekli
        if (!weight_per_box || weight_per_box <= 0) {
          return res.status(400).json({ error: 'KG başına vergi için koli ağırlığı gereklidir' });
        }
        customs_tax = weight_per_box * parseFloat(customs_tax_per_kg);
        factory_price = price_before_kaffeesteuer - customs_tax;
      } else {
        // KG başına vergi girilmemişse, yüzde olarak hesapla veya direkt fiyat
        const customsTaxRate = parseFloat(customs_tax_rate || 0) / 100;
        if (customsTaxRate > 0) {
          factory_price = price_before_kaffeesteuer / (1 + customsTaxRate);
          customs_tax = price_before_kaffeesteuer - factory_price;
        } else {
          factory_price = price_before_kaffeesteuer;
          customs_tax = 0;
        }
      }
    } else {
      // Yüzde olarak vergi
      const customsTaxRate = parseFloat(customs_tax_rate || 0) / 100;
      factory_price = price_before_kaffeesteuer / (1 + customsTaxRate);
      customs_tax = price_before_kaffeesteuer - factory_price;
    }

    // Sonuçları hazırla
    const calculation = {
      raf_price_unit: parseFloat(rafPriceUnit.toFixed(2)),
      supermarket_margin: parseFloat(supermarket_margin || 0),
      supermarket_margin_amount_per_unit: parseFloat(supermarket_margin_amount_per_unit.toFixed(2)),
      price_before_supermarket: parseFloat(price_before_supermarket.toFixed(2)),
      dealer_margin: parseFloat(dealer_margin || 0),
      dealer_margin_amount_per_unit: parseFloat(dealer_margin_amount_per_unit.toFixed(2)),
      price_before_dealer: parseFloat(price_before_dealer.toFixed(2)),
      shipping_type,
      shipping_total_cost: parseFloat(shipping_total_cost.toFixed(2)),
      pallet_capacity,
      cost_per_pallet: parseFloat(cost_per_pallet.toFixed(2)),
      pallet_box_count: parseInt(pallet_box_count),
      shipping_cost_per_box: parseFloat(shipping_cost_per_box.toFixed(2)),
      shipping_cost_per_unit: parseFloat(shipping_cost_per_unit.toFixed(2)),
      unit_price_after_shipping: parseFloat(unit_price_after_shipping.toFixed(2)),
      price_before_shipping_unit: parseFloat(price_before_shipping_unit.toFixed(2)),
      price_before_shipping_box: parseFloat(price_before_shipping_box.toFixed(2)),
      vat_rate: parseFloat(vat_rate || 0),
      vat_amount: parseFloat(vat_amount.toFixed(2)),
      price_before_vat: parseFloat(price_before_vat.toFixed(2)),
      kaffeesteuer_per_kg: parseFloat(kaffeesteuer_per_kg || 0),
      kaffeesteuer_amount: parseFloat(kaffeesteuer_amount.toFixed(2)),
      price_before_kaffeesteuer: parseFloat(price_before_kaffeesteuer.toFixed(2)),
      customs_tax_type: taxType,
      customs_tax_rate: parseFloat(customs_tax_rate || 0),
      customs_tax_per_kg: parseFloat(customs_tax_per_kg || 0),
      weight_per_box: parseFloat(weight_per_box || 0),
      customs_tax: parseFloat(customs_tax.toFixed(2)),
      factory_price: parseFloat(factory_price.toFixed(2)),
      items_per_box: itemsPerBox,
      factory_price_per_unit: parseFloat((factory_price / itemsPerBox).toFixed(2))
    };

    res.json(calculation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Hesaplama geçmişini getir
router.get('/history', (req, res) => {
  try {
    const db = dbService.getDatabase();
    const history = db.prepare(`
      SELECT 
        ch.*,
        p.name as product_name,
        p.code as product_code
      FROM calculation_history ch
      LEFT JOIN products p ON ch.product_id = p.id
      ORDER BY ch.calculation_date DESC
      LIMIT 100
    `).all();
    
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

