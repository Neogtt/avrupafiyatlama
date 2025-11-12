import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

// Production'da relative path kullan, development'ta localhost
const API_BASE = process.env.REACT_APP_API_URL || 
  (process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:3001/api');

// Debug için API_BASE'i console'a yazdır
if (process.env.NODE_ENV === 'development') {
  console.log('API_BASE:', API_BASE);
  console.log('NODE_ENV:', process.env.NODE_ENV);
}

function App() {
  const [calculationMode, setCalculationMode] = useState('forward'); // 'forward' veya 'reverse'
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [calculation, setCalculation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [margins, setMargins] = useState({ dealer_margin: 0, supermarket_margin: 0 });

  // Form state
  const [formData, setFormData] = useState({
    factory_price: '',
    customs_tax_type: 'percentage',
    customs_tax_rate: '',
    customs_tax_per_kg: '',
    kaffeesteuer_per_kg: '',
    weight_per_box: '',
    items_per_box: '',
    vat_rate: '',
    shipping_type: 'tir',
    shipping_total_cost: '',
    pallet_box_count: '',
    dealer_margin: '',
    supermarket_margin: ''
  });

  // Reverse calculation form state
  const [reverseFormData, setReverseFormData] = useState({
    raf_price_unit: '',
    customs_tax_type: 'percentage',
    customs_tax_rate: '',
    customs_tax_per_kg: '',
    kaffeesteuer_per_kg: '',
    weight_per_box: '',
    items_per_box: '',
    vat_rate: '',
    shipping_type: 'tir',
    shipping_total_cost: '',
    pallet_box_count: '',
    dealer_margin: '',
    supermarket_margin: ''
  });

  // Ürün yönetimi state
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: '',
    code: '',
    gtip_code: '',
    coffee_ratio: '',
    factory_price: '',
    customs_tax_type: 'percentage',
    customs_tax_rate: '',
    customs_tax_per_kg: '',
    kaffeesteuer_per_kg: '',
    weight_per_box: '',
    items_per_box: '',
    vat_rate: '',
    pallet_box_count: ''
  });

  useEffect(() => {
    loadProducts();
    loadMargins();
  }, []);

  const loadProducts = async () => {
    try {
      console.log('Ürünler yükleniyor...', API_BASE);
      const response = await axios.get(`${API_BASE}/products`);
      console.log('Ürünler yüklendi:', response.data?.length || 0);
      setProducts(response.data || []);
    } catch (error) {
      console.error('Ürünler yüklenirken hata:', error);
      console.error('Hata detayı:', error.response?.data || error.message);
      setProducts([]); // Hata durumunda boş array
      // Kullanıcıya bilgi ver (sadece production'da değil, her yerde)
      if (error.response?.status === 404 || error.code === 'ECONNREFUSED') {
        console.warn('API bağlantı hatası - backend çalışıyor mu?');
      }
    }
  };

  const loadMargins = async () => {
    try {
      const response = await axios.get(`${API_BASE}/settings/margins`);
      setMargins(response.data);
      setFormData(prev => ({
        ...prev,
        dealer_margin: response.data.dealer_margin || '',
        supermarket_margin: response.data.supermarket_margin || ''
      }));
      setReverseFormData(prev => ({
        ...prev,
        dealer_margin: response.data.dealer_margin || '',
        supermarket_margin: response.data.supermarket_margin || ''
      }));
    } catch (error) {
      console.error('Kar oranları yüklenirken hata:', error);
    }
  };

  const handleProductSelect = (product) => {
    setSelectedProduct(product);
    setFormData({
      factory_price: product.factory_price || '',
      customs_tax_type: product.customs_tax_type || 'percentage',
      customs_tax_rate: product.customs_tax_rate || '',
      customs_tax_per_kg: product.customs_tax_per_kg || '',
      kaffeesteuer_per_kg: product.kaffeesteuer_per_kg || '',
      weight_per_box: product.weight_per_box || '',
      items_per_box: product.items_per_box || '',
      vat_rate: product.vat_rate || '',
      shipping_type: 'tir',
      shipping_total_cost: '',
      pallet_box_count: product.pallet_box_count || '',
      dealer_margin: margins.dealer_margin || '',
      supermarket_margin: margins.supermarket_margin || ''
    });
    setReverseFormData({
      raf_price_unit: '',
      customs_tax_type: product.customs_tax_type || 'percentage',
      customs_tax_rate: product.customs_tax_rate || '',
      customs_tax_per_kg: product.customs_tax_per_kg || '',
      kaffeesteuer_per_kg: product.kaffeesteuer_per_kg || '',
      weight_per_box: product.weight_per_box || '',
      items_per_box: product.items_per_box || '',
      vat_rate: product.vat_rate || '',
      shipping_type: 'tir',
      shipping_total_cost: '',
      pallet_box_count: product.pallet_box_count || '',
      dealer_margin: margins.dealer_margin || '',
      supermarket_margin: margins.supermarket_margin || ''
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCalculate = async () => {
    setLoading(true);
    try {
      const payload = {
        product_id: selectedProduct?.id || null,
        factory_price: parseFloat(formData.factory_price),
        customs_tax_type: formData.customs_tax_type,
        customs_tax_rate: parseFloat(formData.customs_tax_rate) || 0,
        customs_tax_per_kg: parseFloat(formData.customs_tax_per_kg) || 0,
        kaffeesteuer_per_kg: parseFloat(formData.kaffeesteuer_per_kg) || 0,
        weight_per_box: parseFloat(formData.weight_per_box) || 0,
        items_per_box: parseInt(formData.items_per_box) || 1,
        vat_rate: parseFloat(formData.vat_rate) || 0,
        shipping_type: formData.shipping_type,
        shipping_total_cost: parseFloat(formData.shipping_total_cost),
        pallet_box_count: parseInt(formData.pallet_box_count) || 1,
        dealer_margin: parseFloat(formData.dealer_margin) || 0,
        supermarket_margin: parseFloat(formData.supermarket_margin) || 0
      };

      const response = await axios.post(`${API_BASE}/calculations/raf-price`, payload);
      setCalculation(response.data);
    } catch (error) {
      alert('Hesaplama hatası: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleReverseCalculate = async () => {
    setLoading(true);
    try {
      const payload = {
        raf_price_unit: parseFloat(reverseFormData.raf_price_unit),
        customs_tax_type: reverseFormData.customs_tax_type,
        customs_tax_rate: parseFloat(reverseFormData.customs_tax_rate) || 0,
        customs_tax_per_kg: parseFloat(reverseFormData.customs_tax_per_kg) || 0,
        kaffeesteuer_per_kg: parseFloat(reverseFormData.kaffeesteuer_per_kg) || 0,
        weight_per_box: parseFloat(reverseFormData.weight_per_box) || 0,
        items_per_box: parseInt(reverseFormData.items_per_box) || 1,
        vat_rate: parseFloat(reverseFormData.vat_rate) || 0,
        shipping_type: reverseFormData.shipping_type,
        shipping_total_cost: parseFloat(reverseFormData.shipping_total_cost),
        pallet_box_count: parseInt(reverseFormData.pallet_box_count) || 1,
        dealer_margin: parseFloat(reverseFormData.dealer_margin) || 0,
        supermarket_margin: parseFloat(reverseFormData.supermarket_margin) || 0
      };

      const response = await axios.post(`${API_BASE}/calculations/reverse-calculation`, payload);
      setCalculation(response.data);
    } catch (error) {
      alert('Hesaplama hatası: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProduct = async () => {
    try {
      const payload = {
        name: productForm.name,
        code: productForm.code || null,
        gtip_code: productForm.gtip_code || null,
        coffee_ratio: parseFloat(productForm.coffee_ratio) || 0,
        factory_price: parseFloat(productForm.factory_price),
        customs_tax_type: productForm.customs_tax_type || 'percentage',
        customs_tax_rate: parseFloat(productForm.customs_tax_rate) || 0,
        customs_tax_per_kg: parseFloat(productForm.customs_tax_per_kg) || 0,
        kaffeesteuer_per_kg: parseFloat(productForm.kaffeesteuer_per_kg) || 0,
        weight_per_box: parseFloat(productForm.weight_per_box) || 0,
        items_per_box: productForm.items_per_box ? parseInt(productForm.items_per_box) : 1,
        vat_rate: parseFloat(productForm.vat_rate) || 0,
        pallet_box_count: productForm.pallet_box_count ? parseInt(productForm.pallet_box_count) : 1
      };

      if (editingProduct) {
        // Güncelleme
        await axios.put(`${API_BASE}/products/${editingProduct.id}`, payload);
        alert('Ürün başarıyla güncellendi');
      } else {
        // Yeni ekleme
        await axios.post(`${API_BASE}/products`, payload);
        alert('Ürün başarıyla kaydedildi');
      }
      
      setShowProductForm(false);
      setEditingProduct(null);
      setProductForm({
        name: '',
        code: '',
        gtip_code: '',
        coffee_ratio: '',
        factory_price: '',
        customs_tax_type: 'percentage',
        customs_tax_rate: '',
        customs_tax_per_kg: '',
        kaffeesteuer_per_kg: '',
        weight_per_box: '',
        items_per_box: '',
        vat_rate: '',
        pallet_box_count: ''
      });
      loadProducts();
    } catch (error) {
      alert('Ürün kaydedilirken hata: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleEditProduct = (product, e) => {
    e.stopPropagation(); // Ürün seçimini engelle
    setEditingProduct(product);
    setProductForm({
      name: product.name || '',
      code: product.code || '',
      gtip_code: product.gtip_code || '',
      coffee_ratio: product.coffee_ratio || '',
      factory_price: product.factory_price || '',
      customs_tax_type: product.customs_tax_type || 'percentage',
      customs_tax_rate: product.customs_tax_rate || '',
      customs_tax_per_kg: product.customs_tax_per_kg || '',
      kaffeesteuer_per_kg: product.kaffeesteuer_per_kg || '',
      weight_per_box: product.weight_per_box || '',
      items_per_box: product.items_per_box || '',
      vat_rate: product.vat_rate || '',
      pallet_box_count: product.pallet_box_count || ''
    });
    setShowProductForm(true);
  };

  const handleDeleteProduct = async (productId, e) => {
    e.stopPropagation(); // Ürün seçimini engelle
    if (!window.confirm('Bu ürünü silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      await axios.delete(`${API_BASE}/products/${productId}`);
      alert('Ürün başarıyla silindi');
      loadProducts();
      if (selectedProduct?.id === productId) {
        setSelectedProduct(null);
      }
    } catch (error) {
      alert('Ürün silinirken hata: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleCancelEdit = () => {
    setShowProductForm(false);
    setEditingProduct(null);
    setProductForm({
      name: '',
      code: '',
      gtip_code: '',
      coffee_ratio: '',
      factory_price: '',
      customs_tax_type: 'percentage',
      customs_tax_rate: '',
      customs_tax_per_kg: '',
      kaffeesteuer_per_kg: '',
      weight_per_box: '',
      items_per_box: '',
      vat_rate: '',
      pallet_box_count: ''
    });
  };

  const handleSaveMargins = async () => {
    try {
      await axios.put(`${API_BASE}/settings/margins`, {
        dealer_margin: parseFloat(formData.dealer_margin) || 0,
        supermarket_margin: parseFloat(formData.supermarket_margin) || 0
      });
      await loadMargins();
      alert('Kar oranları kaydedildi');
    } catch (error) {
      alert('Kar oranları kaydedilirken hata: ' + (error.response?.data?.error || error.message));
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>RAF Fiyat Analizi</h1>
        <p>Avrupa Gümrük Vergisi ve Maliyet Hesaplama Sistemi</p>
      </header>

      <div className="container">
        <div className="main-content">
          {/* Hesaplama Modu Seçimi */}
          <section className="card" style={{ marginBottom: '20px' }}>
            <h2>Hesaplama Modu</h2>
            <div style={{ display: 'flex', gap: '20px', marginTop: '15px' }}>
              <button
                className={`btn ${calculationMode === 'forward' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => {
                  setCalculationMode('forward');
                  setCalculation(null);
                }}
                style={{ flex: 1, padding: '15px', fontSize: '16px' }}
              >
                📈 Fabrika Fiyatından → RAF Fiyatına
              </button>
              <button
                className={`btn ${calculationMode === 'reverse' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => {
                  setCalculationMode('reverse');
                  setCalculation(null);
                }}
                style={{ flex: 1, padding: '15px', fontSize: '16px' }}
              >
                📉 RAF Fiyatından → Fabrika Fiyatına
              </button>
            </div>
          </section>

          {/* Ürün Seçimi */}
          <section className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <h2 style={{ margin: 0 }}>Ürün Seçimi</h2>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  className="btn btn-secondary"
                  onClick={async () => {
                    try {
                      // Excel dosyasını indir
                      const link = document.createElement('a');
                      link.href = `${API_BASE}/export/excel`;
                      link.download = 'RAF_Fiyat_Analizi_Urunler.xlsx';
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    } catch (error) {
                      alert('Excel indirme hatası: ' + error.message);
                    }
                  }}
                  title="Excel İndir"
                >
                  📥 Excel İndir
                </button>
                <button
                  className="btn btn-primary"
                  onClick={async () => {
                    try {
                      // Önceki fileId'yi localStorage'dan al
                      const savedFileId = localStorage.getItem('driveFileId');
                      const fileIdParam = savedFileId ? `?fileId=${savedFileId}` : '';
                      
                      const response = await axios.get(`${API_BASE}/export/excel-drive${fileIdParam}`);
                      if (response.data.success) {
                        const driveInfo = response.data.driveInfo;
                        
                        // FileId'yi kaydet (bir sonraki seferde güncellemek için)
                        if (driveInfo.fileId) {
                          localStorage.setItem('driveFileId', driveInfo.fileId);
                        }
                        
                        alert(`Excel dosyası Google Drive'a ${driveInfo.updated ? 'güncellendi' : 'yüklendi'}!\n\nDosya ID: ${driveInfo.fileId}\n\nDosya Adı: ${driveInfo.fileName}\n\nDrive Link: ${driveInfo.webViewLink}\n\nİndirme Linki: ${driveInfo.directDownloadLink}`);
                        // Linki yeni sekmede aç
                        window.open(driveInfo.webViewLink, '_blank');
                        // Verileri yenile
                        loadProducts();
                      }
                    } catch (error) {
                      alert('Google Drive yükleme hatası: ' + (error.response?.data?.error || error.message));
                    }
                  }}
                  title="Excel'i Google Drive'a Yükle (Mevcut dosyayı günceller)"
                >
                  ☁️ Drive'a Yükle
                </button>
                <button
                  className="btn btn-success"
                  onClick={async () => {
                    // Önceki fileId'yi localStorage'dan al veya varsayılan kullan
                    const savedFileId = localStorage.getItem('driveFileId') || '106tReHz9EUDdtBh4T05BnKLeh8QTSa-y';
                    const fileId = window.prompt('Google Drive File ID girin:\n\nÖrnek: 106tReHz9EUDdtBh4T05BnKLeh8QTSa-y', savedFileId);
                    if (!fileId) return;
                    
                    // FileId'yi kaydet
                    localStorage.setItem('driveFileId', fileId.trim());
                    
                    const syncMode = window.confirm('Mevcut verileri silip yeniden mi yükleyelim?\n\nOK = Tümünü sil ve yeniden yükle\nCancel = Mevcut verilerle birleştir');
                    
                    try {
                      setLoading(true);
                      const response = await axios.post(`${API_BASE}/import/drive-sync`, {
                        fileId: fileId.trim(),
                        syncMode: syncMode ? 'replace' : 'merge'
                      });
                      
                      if (response.data.success) {
                        const result = response.data.result;
                        alert(`✅ Google Drive'dan başarıyla yüklendi!\n\nDosya: ${response.data.fileName}\n\nYeni: ${result.imported} ürün\nGüncellenen: ${result.updated} ürün\nAtlanan: ${result.skipped} satır`);
                        loadProducts();
                      }
                    } catch (error) {
                      alert('Google Drive\'dan yükleme hatası: ' + (error.response?.data?.error || error.message));
                    } finally {
                      setLoading(false);
                    }
                  }}
                  title="Google Drive'dan Excel Yükle ve Senkronize Et"
                >
                  📥 Drive'dan Yükle
                </button>
              </div>
            </div>
            <div className="product-list">
              {products.map(product => (
                <div
                  key={product.id}
                  className={`product-item ${selectedProduct?.id === product.id ? 'selected' : ''}`}
                  onClick={() => handleProductSelect(product)}
                >
                  <div className="product-info">
                    <div className="product-name">{product.name}</div>
                    <div className="product-details">
                      {product.code && <span>Kod: {product.code}</span>}
                      {product.gtip_code && <span>GTİP: {product.gtip_code}</span>}
                      {product.coffee_ratio > 0 && <span>Kahve: {product.coffee_ratio}%</span>}
                      <span>Fiyat: {product.factory_price} €</span>
                    </div>
                  </div>
                  <div className="product-actions" onClick={(e) => e.stopPropagation()}>
                    <button
                      className="btn btn-edit"
                      onClick={(e) => handleEditProduct(product, e)}
                      title="Düzenle"
                    >
                      ✏️
                    </button>
                    <button
                      className="btn btn-delete"
                      onClick={(e) => handleDeleteProduct(product.id, e)}
                      title="Sil"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
              <button
                className="btn btn-secondary"
                onClick={() => {
                  if (showProductForm) {
                    handleCancelEdit();
                  } else {
                    setEditingProduct(null);
                    setShowProductForm(true);
                  }
                }}
              >
                {showProductForm ? 'İptal' : '+ Yeni Ürün Ekle'}
              </button>
            </div>

            {showProductForm && (
              <div className="product-form">
                <h3>{editingProduct ? 'Ürünü Düzenle' : 'Yeni Ürün Ekle'}</h3>
                <div className="form-group">
                  <label>Ürün Adı *</label>
                  <input
                    type="text"
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Ürün Kodu</label>
                    <input
                      type="text"
                      value={productForm.code}
                      onChange={(e) => setProductForm({ ...productForm, code: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>GTİP Kodu</label>
                    <input
                      type="text"
                      value={productForm.gtip_code}
                      onChange={(e) => setProductForm({ ...productForm, gtip_code: e.target.value })}
                      placeholder="Örn: 2101.12.92.9000"
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Kahve Oranı (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={productForm.coffee_ratio}
                      onChange={(e) => setProductForm({ ...productForm, coffee_ratio: e.target.value })}
                      placeholder="Örn: 18.3"
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Fabrika Fiyatı (€) *</label>
                    <input
                      type="number"
                      step="0.01"
                      value={productForm.factory_price}
                      onChange={(e) => setProductForm({ ...productForm, factory_price: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Gümrük Vergisi Tipi</label>
                    <select
                      value={productForm.customs_tax_type}
                      onChange={(e) => setProductForm({ ...productForm, customs_tax_type: e.target.value })}
                    >
                      <option value="percentage">Yüzde (%)</option>
                      <option value="per_kg">KG Başına (€/kg)</option>
                    </select>
                  </div>
                </div>
                {productForm.customs_tax_type === 'percentage' ? (
                  <div className="form-group">
                    <label>Gümrük Vergisi Oranı (%)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={productForm.customs_tax_rate}
                      onChange={(e) => setProductForm({ ...productForm, customs_tax_rate: e.target.value })}
                    />
                  </div>
                ) : (
                  <div className="form-row">
                    <div className="form-group">
                      <label>KG Başına Gümrük Vergisi (€/kg)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={productForm.customs_tax_per_kg}
                        onChange={(e) => setProductForm({ ...productForm, customs_tax_per_kg: e.target.value })}
                        placeholder="Opsiyonel"
                      />
                    </div>
                    <div className="form-group">
                      <label>Koli Başına Ağırlık (kg) {(productForm.customs_tax_type === 'per_kg' && productForm.customs_tax_per_kg) || productForm.kaffeesteuer_per_kg ? '*' : ''}</label>
                      <input
                        type="number"
                        step="0.01"
                        value={productForm.weight_per_box}
                        onChange={(e) => setProductForm({ ...productForm, weight_per_box: e.target.value })}
                      />
                    </div>
                  </div>
                )}
                <div className="form-row">
                  <div className="form-group">
                    <label>KDV Oranı (%)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={productForm.vat_rate}
                      onChange={(e) => setProductForm({ ...productForm, vat_rate: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Koli İçi Adet *</label>
                    <input
                      type="number"
                      value={productForm.items_per_box}
                      onChange={(e) => setProductForm({ ...productForm, items_per_box: e.target.value })}
                      placeholder="1 koli içinde kaç adet var?"
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Kaffeesteuer (Kahve Vergisi) (€/kg)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={productForm.kaffeesteuer_per_kg}
                      onChange={(e) => setProductForm({ ...productForm, kaffeesteuer_per_kg: e.target.value })}
                      placeholder="Örn: 0.94 veya 0.26 (0 = muaf)"
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Palet Üstü Koli Sayısı</label>
                    <input
                      type="number"
                      value={productForm.pallet_box_count}
                      onChange={(e) => setProductForm({ ...productForm, pallet_box_count: e.target.value })}
                    />
                  </div>
                </div>
                <div className="button-group">
                  <button className="btn btn-primary" onClick={handleSaveProduct}>
                    {editingProduct ? 'Güncelle' : 'Kaydet'}
                  </button>
                  <button className="btn btn-secondary" onClick={handleCancelEdit}>
                    İptal
                  </button>
                </div>
              </div>
            )}
          </section>

          {/* Hesaplama Formu - Forward (Fabrika → RAF) */}
          {calculationMode === 'forward' && (
          <section className="card">
            <h2>Hesaplama Parametreleri</h2>
            <div className="form-grid">
              <div className="form-group">
                <label>Fabrika Fiyatı (€) *</label>
                <input
                  type="number"
                  step="0.01"
                  name="factory_price"
                  value={formData.factory_price}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label>Gümrük Vergisi Tipi</label>
                <select
                  name="customs_tax_type"
                  value={formData.customs_tax_type}
                  onChange={handleInputChange}
                >
                  <option value="percentage">Yüzde (%)</option>
                  <option value="per_kg">KG Başına (€/kg)</option>
                </select>
              </div>

              {formData.customs_tax_type === 'percentage' ? (
                <div className="form-group">
                  <label>Gümrük Vergisi Oranı (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    name="customs_tax_rate"
                    value={formData.customs_tax_rate}
                    onChange={handleInputChange}
                  />
                </div>
              ) : (
                <>
                  <div className="form-group">
                    <label>KG Başına Gümrük Vergisi (€/kg)</label>
                    <input
                      type="number"
                      step="0.01"
                      name="customs_tax_per_kg"
                      value={formData.customs_tax_per_kg}
                      onChange={handleInputChange}
                      placeholder="Opsiyonel"
                    />
                  </div>
                  <div className="form-group">
                    <label>Koli Başına Ağırlık (kg) {(formData.customs_tax_type === 'per_kg' && formData.customs_tax_per_kg) || formData.kaffeesteuer_per_kg ? '*' : ''}</label>
                    <input
                      type="number"
                      step="0.01"
                      name="weight_per_box"
                      value={formData.weight_per_box}
                      onChange={handleInputChange}
                    />
                  </div>
                </>
              )}

              <div className="form-group">
                <label>KDV Oranı (%)</label>
                <input
                  type="number"
                  step="0.01"
                  name="vat_rate"
                  value={formData.vat_rate}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label>Kaffeesteuer (Kahve Vergisi) (€/kg)</label>
                <input
                  type="number"
                  step="0.01"
                  name="kaffeesteuer_per_kg"
                  value={formData.kaffeesteuer_per_kg}
                  onChange={handleInputChange}
                  placeholder="Örn: 0.94 veya 0.26 (0 = muaf)"
                />
              </div>

              {(formData.customs_tax_type === 'per_kg' || formData.kaffeesteuer_per_kg) && (
                <div className="form-group">
                  <label>Koli Başına Ağırlık (kg) {formData.customs_tax_type === 'per_kg' ? '*' : ''}</label>
                  <input
                    type="number"
                    step="0.01"
                    name="weight_per_box"
                    value={formData.weight_per_box}
                    onChange={handleInputChange}
                  />
                </div>
              )}

              <div className="form-group">
                <label>Nakliye Tipi *</label>
                <select
                  name="shipping_type"
                  value={formData.shipping_type}
                  onChange={handleInputChange}
                >
                  <option value="tir">Tır (33 Palet)</option>
                  <option value="konteyner">Konteyner (24 Palet)</option>
                </select>
              </div>

              <div className="form-group">
                <label>Nakliye Toplam Bedeli (€) *</label>
                <input
                  type="number"
                  step="0.01"
                  name="shipping_total_cost"
                  value={formData.shipping_total_cost}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label>Palet Üstü Koli Sayısı *</label>
                <input
                  type="number"
                  name="pallet_box_count"
                  value={formData.pallet_box_count}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label>Koli İçi Adet *</label>
                <input
                  type="number"
                  name="items_per_box"
                  value={formData.items_per_box}
                  onChange={handleInputChange}
                  placeholder="1 koli içinde kaç adet var?"
                />
              </div>

              <div className="form-group">
                <label>Bayi Karı (%)</label>
                <input
                  type="number"
                  step="0.01"
                  name="dealer_margin"
                  value={formData.dealer_margin}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label>Süpermarket Karı (%)</label>
                <input
                  type="number"
                  step="0.01"
                  name="supermarket_margin"
                  value={formData.supermarket_margin}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="button-group">
              <button
                className="btn btn-primary btn-large"
                onClick={handleCalculate}
                disabled={loading}
              >
                {loading ? 'Hesaplanıyor...' : 'RAF Fiyatını Hesapla'}
              </button>
              <button
                className="btn btn-secondary"
                onClick={handleSaveMargins}
              >
                Kar Oranlarını Kaydet
              </button>
            </div>
          </section>
        )}

        {/* Hesaplama Formu - Reverse (RAF → Fabrika) */}
        {calculationMode === 'reverse' && (
        <section className="card">
          <h2>Hesaplama Parametreleri (Geriye Dönük)</h2>
          <div className="form-grid">
            <div className="form-group">
              <label>RAF Fiyatı - Birim (Adet) (€) *</label>
              <input
                type="number"
                step="0.01"
                name="raf_price_unit"
                value={reverseFormData.raf_price_unit}
                onChange={(e) => setReverseFormData({ ...reverseFormData, raf_price_unit: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Gümrük Vergisi Tipi</label>
              <select
                name="customs_tax_type"
                value={reverseFormData.customs_tax_type}
                onChange={(e) => setReverseFormData({ ...reverseFormData, customs_tax_type: e.target.value })}
              >
                <option value="percentage">Yüzde (%)</option>
                <option value="per_kg">KG Başına (€/kg)</option>
              </select>
            </div>
            {reverseFormData.customs_tax_type === 'percentage' ? (
              <div className="form-group">
                <label>Gümrük Vergisi Oranı (%)</label>
                <input
                  type="number"
                  step="0.01"
                  name="customs_tax_rate"
                  value={reverseFormData.customs_tax_rate}
                  onChange={(e) => setReverseFormData({ ...reverseFormData, customs_tax_rate: e.target.value })}
                />
              </div>
            ) : (
              <>
                <div className="form-group">
                  <label>KG Başına Gümrük Vergisi (€/kg)</label>
                  <input
                    type="number"
                    step="0.01"
                    name="customs_tax_per_kg"
                    value={reverseFormData.customs_tax_per_kg}
                    onChange={(e) => setReverseFormData({ ...reverseFormData, customs_tax_per_kg: e.target.value })}
                    placeholder="Opsiyonel"
                  />
                </div>
                <div className="form-group">
                  <label>Koli Ağırlığı (kg) {(reverseFormData.customs_tax_type === 'per_kg' && reverseFormData.customs_tax_per_kg) || reverseFormData.kaffeesteuer_per_kg ? '*' : ''}</label>
                  <input
                    type="number"
                    step="0.01"
                    name="weight_per_box"
                    value={reverseFormData.weight_per_box}
                    onChange={(e) => setReverseFormData({ ...reverseFormData, weight_per_box: e.target.value })}
                  />
                </div>
              </>
            )}
            <div className="form-group">
              <label>Koli İçi Adet</label>
              <input
                type="number"
                name="items_per_box"
                value={reverseFormData.items_per_box}
                onChange={(e) => setReverseFormData({ ...reverseFormData, items_per_box: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>KDV Oranı (%)</label>
              <input
                type="number"
                step="0.01"
                name="vat_rate"
                value={reverseFormData.vat_rate}
                onChange={(e) => setReverseFormData({ ...reverseFormData, vat_rate: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Kaffeesteuer (Kahve Vergisi) (€/kg)</label>
              <input
                type="number"
                step="0.01"
                name="kaffeesteuer_per_kg"
                value={reverseFormData.kaffeesteuer_per_kg}
                onChange={(e) => setReverseFormData({ ...reverseFormData, kaffeesteuer_per_kg: e.target.value })}
                placeholder="Örn: 0.94 veya 0.26 (0 = muaf)"
              />
            </div>
            {(reverseFormData.customs_tax_type === 'per_kg' || reverseFormData.kaffeesteuer_per_kg) && (
              <div className="form-group">
                <label>Koli Başına Ağırlık (kg) {reverseFormData.customs_tax_type === 'per_kg' ? '*' : ''}</label>
                <input
                  type="number"
                  step="0.01"
                  name="weight_per_box"
                  value={reverseFormData.weight_per_box}
                  onChange={(e) => setReverseFormData({ ...reverseFormData, weight_per_box: e.target.value })}
                />
              </div>
            )}
            <div className="form-group">
              <label>Nakliye Tipi</label>
              <select
                name="shipping_type"
                value={reverseFormData.shipping_type}
                onChange={(e) => setReverseFormData({ ...reverseFormData, shipping_type: e.target.value })}
              >
                <option value="tir">TIR (33 Palet)</option>
                <option value="konteyner">Konteyner (24 Palet)</option>
              </select>
            </div>
            <div className="form-group">
              <label>Nakliye Toplam Maliyeti (€)</label>
              <input
                type="number"
                step="0.01"
                name="shipping_total_cost"
                value={reverseFormData.shipping_total_cost}
                onChange={(e) => setReverseFormData({ ...reverseFormData, shipping_total_cost: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Palet Üstü Koli Sayısı</label>
              <input
                type="number"
                name="pallet_box_count"
                value={reverseFormData.pallet_box_count}
                onChange={(e) => setReverseFormData({ ...reverseFormData, pallet_box_count: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Bayi Karı (%)</label>
              <input
                type="number"
                step="0.01"
                name="dealer_margin"
                value={reverseFormData.dealer_margin}
                onChange={(e) => setReverseFormData({ ...reverseFormData, dealer_margin: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Süpermarket Karı (%)</label>
              <input
                type="number"
                step="0.01"
                name="supermarket_margin"
                value={reverseFormData.supermarket_margin}
                onChange={(e) => setReverseFormData({ ...reverseFormData, supermarket_margin: e.target.value })}
              />
            </div>
          </div>

          <div className="button-group">
            <button
              className="btn btn-primary btn-large"
              onClick={handleReverseCalculate}
              disabled={loading}
            >
              {loading ? 'Hesaplanıyor...' : 'Fabrika Fiyatını Hesapla'}
            </button>
          </div>
        </section>
        )}

        {/* Sonuçlar */}
          {calculation && (
            <section className="card results">
              <h2>Hesaplama Sonuçları</h2>
              <div className="results-grid">
                {/* Forward Calculation Results (Fabrika → RAF) */}
                {calculation.factory_price && !calculation.raf_price_unit && (
                  <>
                <div className="result-item">
                  <label>Fabrika Fiyatı:</label>
                  <span>{calculation.factory_price} €</span>
                </div>
                <div className="result-item">
                  <label>
                    Gümrük Vergisi 
                    {calculation.customs_tax_type === 'per_kg' 
                      ? ` (${calculation.customs_tax_per_kg} €/kg × ${calculation.weight_per_box} kg)` 
                      : ` (${calculation.customs_tax_rate}%)`}:
                  </label>
                  <span>{calculation.customs_tax} €</span>
                </div>
                <div className="result-item">
                  <label>Gümrük Sonrası Fiyat:</label>
                  <span>{calculation.price_after_customs} €</span>
                </div>
                {calculation.kaffeesteuer_per_kg > 0 && (
                  <>
                    <div className="result-item">
                      <label>Kaffeesteuer ({calculation.kaffeesteuer_per_kg} €/kg):</label>
                      <span>{calculation.kaffeesteuer_amount} €</span>
                    </div>
                    <div className="result-item">
                      <label>Kahve Vergisi Sonrası Fiyat (Koli):</label>
                      <span>{calculation.price_after_kaffeesteuer} €</span>
                    </div>
                  </>
                )}
                <div className="result-item">
                  <label>KDV ({calculation.vat_rate}%):</label>
                  <span>{calculation.vat_amount} €</span>
                </div>
                <div className="result-item">
                  <label>KDV Sonrası Fiyat:</label>
                  <span>{calculation.price_after_vat} €</span>
                </div>
                <div className="result-item">
                  <label>Koli Başına Nakliye Maliyeti:</label>
                  <span>{calculation.shipping_cost_per_box} €</span>
                </div>
                <div className="result-item">
                  <label>Nakliye Sonrası Fiyat (Koli):</label>
                  <span>{calculation.price_with_shipping} €</span>
                </div>
                {calculation.items_per_box > 1 && (
                  <div className="result-item highlight" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                    <label>Nakliye Sonrası Birim Fiyat (Adet):</label>
                    <span>{calculation.unit_price_after_shipping} €</span>
                    <div style={{ fontSize: '0.9rem', marginTop: '0.5rem', opacity: 0.9 }}>
                      ({calculation.price_with_shipping} € ÷ {calculation.items_per_box} adet)
                    </div>
                  </div>
                )}
                <div className="result-item">
                  <label>Bayi Karı ({calculation.dealer_margin}%) - Birim:</label>
                  <span>{calculation.dealer_margin_amount_per_unit} €</span>
                </div>
                <div className="result-item">
                  <label>Bayi Sonrası Birim Fiyat:</label>
                  <span>{calculation.unit_price_after_dealer} €</span>
                </div>
                <div className="result-item">
                  <label>Süpermarket Karı ({calculation.supermarket_margin}%) - Birim:</label>
                  <span>{calculation.supermarket_margin_amount_per_unit} €</span>
                </div>
                <div className="result-item highlight" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
                  <label>RAF FİYATI (Birim - Adet):</label>
                  <span>{calculation.final_raf_price} €</span>
                </div>
                {calculation.items_per_box > 1 && (
                  <div className="result-item highlight">
                    <label>RAF FİYATI (Koli):</label>
                    <span>{calculation.final_box_price} €</span>
                    <div style={{ fontSize: '0.9rem', marginTop: '0.5rem', opacity: 0.9 }}>
                      ({calculation.final_raf_price} € × {calculation.items_per_box} adet)
                    </div>
                  </div>
                )}
                </>
                )}

                {/* Reverse Calculation Results (RAF → Fabrika) */}
                {calculation.raf_price_unit && (
                  <>
                <div className="result-item highlight" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
                  <label>RAF Fiyatı (Birim - Adet):</label>
                  <span>{calculation.raf_price_unit} €</span>
                </div>
                <div className="result-item">
                  <label>Süpermarket Karı ({calculation.supermarket_margin}%) - Birim:</label>
                  <span>{calculation.supermarket_margin_amount_per_unit} €</span>
                </div>
                <div className="result-item">
                  <label>Süpermarket Öncesi Birim Fiyat:</label>
                  <span>{calculation.price_before_supermarket} €</span>
                </div>
                <div className="result-item">
                  <label>Bayi Karı ({calculation.dealer_margin}%) - Birim:</label>
                  <span>{calculation.dealer_margin_amount_per_unit} €</span>
                </div>
                <div className="result-item">
                  <label>Bayi Öncesi Birim Fiyat:</label>
                  <span>{calculation.price_before_dealer} €</span>
                </div>
                <div className="result-item">
                  <label>Birim Başına Nakliye Maliyeti:</label>
                  <span>{calculation.shipping_cost_per_unit} €</span>
                </div>
                <div className="result-item">
                  <label>Nakliye Öncesi Birim Fiyat:</label>
                  <span>{calculation.price_before_shipping_unit} €</span>
                </div>
                <div className="result-item">
                  <label>Nakliye Öncesi Koli Fiyatı:</label>
                  <span>{calculation.price_before_shipping_box} €</span>
                </div>
                <div className="result-item">
                  <label>KDV ({calculation.vat_rate}%):</label>
                  <span>{calculation.vat_amount} €</span>
                </div>
                <div className="result-item">
                  <label>KDV Öncesi Fiyat (Koli):</label>
                  <span>{calculation.price_before_vat} €</span>
                </div>
                {calculation.kaffeesteuer_per_kg > 0 && (
                  <>
                    <div className="result-item">
                      <label>Kaffeesteuer ({calculation.kaffeesteuer_per_kg} €/kg):</label>
                      <span>{calculation.kaffeesteuer_amount} €</span>
                    </div>
                    <div className="result-item">
                      <label>Kahve Vergisi Öncesi Fiyat (Koli):</label>
                      <span>{calculation.price_before_kaffeesteuer} €</span>
                    </div>
                  </>
                )}
                <div className="result-item">
                  <label>
                    Gümrük Vergisi 
                    {calculation.customs_tax_type === 'per_kg' 
                      ? ` (${calculation.customs_tax_per_kg} €/kg × ${calculation.weight_per_box} kg)` 
                      : ` (${calculation.customs_tax_rate}%)`}:
                  </label>
                  <span>{calculation.customs_tax} €</span>
                </div>
                <div className="result-item highlight" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                  <label>FABRİKA FİYATI (EXW) - Koli:</label>
                  <span>{calculation.factory_price} €</span>
                </div>
                {calculation.items_per_box > 1 && (
                  <div className="result-item highlight">
                    <label>FABRİKA FİYATI (EXW) - Birim (Adet):</label>
                    <span>{calculation.factory_price_per_unit} €</span>
                    <div style={{ fontSize: '0.9rem', marginTop: '0.5rem', opacity: 0.9 }}>
                      ({calculation.factory_price} € ÷ {calculation.items_per_box} adet)
                    </div>
                  </div>
                )}
                </>
                )}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;

