const express = require('express');
const router = express.Router();
const dbService = require('../services/databaseService');
const ExcelJS = require('exceljs');
const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

// Google Drive API ayarları - Service Account
const SCOPES = ['https://www.googleapis.com/auth/drive.file'];
const SERVICE_ACCOUNT_PATH = path.join(__dirname, '../../service-account.json');

// JSON dosyasını güvenli şekilde oku
function readJsonFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  // BOM karakterini kaldır (UTF-8 BOM: \uFEFF)
  content = content.replace(/^\uFEFF/, '');
  // Başındaki ve sonundaki boşlukları temizle
  content = content.trim();
  return JSON.parse(content);
}

// Google Drive client oluştur (Service Account ile)
async function getDriveClient() {
  try {
    // Service Account dosyası var mı kontrol et
    if (!fs.existsSync(SERVICE_ACCOUNT_PATH)) {
      throw new Error('Google Drive service-account.json dosyası bulunamadı. Lütfen Google Cloud Console\'dan Service Account JSON key dosyasını indirip proje klasörüne service-account.json olarak ekleyin.');
    }

    const serviceAccount = readJsonFile(SERVICE_ACCOUNT_PATH);
    
    // Service Account ile JWT auth
    const auth = new google.auth.JWT(
      serviceAccount.client_email,
      null,
      serviceAccount.private_key,
      SCOPES
    );

    // Auth yap
    await auth.authorize();

    return google.drive({ version: 'v3', auth });
  } catch (error) {
    console.error('Google Drive client hatası:', error.message);
    throw error;
  }
}

// Excel dosyası oluştur
async function createExcelFile() {
  const db = dbService.getDatabase();
  const products = db.prepare('SELECT * FROM products ORDER BY name').all();

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Ürünler');

  // Başlıklar
  worksheet.columns = [
    { header: 'ID', key: 'id', width: 10 },
    { header: 'Ürün Adı', key: 'name', width: 30 },
    { header: 'Ürün Kodu', key: 'code', width: 15 },
    { header: 'GTİP Kodu', key: 'gtip_code', width: 20 },
    { header: 'Kahve Oranı (%)', key: 'coffee_ratio', width: 15 },
    { header: 'Fabrika Fiyatı (€)', key: 'factory_price', width: 18 },
    { header: 'Gümrük Vergisi Tipi', key: 'customs_tax_type', width: 20 },
    { header: 'Gümrük Vergisi Oranı (%)', key: 'customs_tax_rate', width: 22 },
    { header: 'KG Başına Gümrük Vergisi (€/kg)', key: 'customs_tax_per_kg', width: 28 },
    { header: 'Kaffeesteuer (€/kg)', key: 'kaffeesteuer_per_kg', width: 18 },
    { header: 'Koli Ağırlığı (kg)', key: 'weight_per_box', width: 18 },
    { header: 'Koli İçi Adet', key: 'items_per_box', width: 15 },
    { header: 'KDV Oranı (%)', key: 'vat_rate', width: 15 },
    { header: 'Palet Üstü Koli Sayısı', key: 'pallet_box_count', width: 22 },
    { header: 'Oluşturulma Tarihi', key: 'created_at', width: 20 },
    { header: 'Güncellenme Tarihi', key: 'updated_at', width: 20 }
  ];

  // Başlık stili
  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE0E0E0' }
  };

  // Verileri ekle
  products.forEach(product => {
    worksheet.addRow({
      id: product.id,
      name: product.name,
      code: product.code || '',
      gtip_code: product.gtip_code || '',
      coffee_ratio: product.coffee_ratio || 0,
      factory_price: product.factory_price,
      customs_tax_type: product.customs_tax_type === 'percentage' ? 'Yüzde (%)' : 'KG Başına (€/kg)',
      customs_tax_rate: product.customs_tax_rate || 0,
      customs_tax_per_kg: product.customs_tax_per_kg || 0,
      kaffeesteuer_per_kg: product.kaffeesteuer_per_kg || 0,
      weight_per_box: product.weight_per_box || 0,
      items_per_box: product.items_per_box || 1,
      vat_rate: product.vat_rate || 0,
      pallet_box_count: product.pallet_box_count || 1,
      created_at: product.created_at || '',
      updated_at: product.updated_at || ''
    });
  });

  // Dosya yolu
  const filePath = path.join(__dirname, '../../temp/urunler_export.xlsx');
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // Excel dosyasını kaydet
  await workbook.xlsx.writeFile(filePath);
  return filePath;
}

// Excel dosyasını Google Drive'a yükle
async function uploadToDrive(filePath, fileName = 'RAF_Fiyat_Analizi_Urunler.xlsx') {
  try {
    const drive = await getDriveClient();
    
    const fileMetadata = {
      name: fileName,
      parents: [] // Root klasörüne yükle, isterseniz belirli bir klasör ID'si ekleyebilirsiniz
    };

    const media = {
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      body: fs.createReadStream(filePath)
    };

    const response = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: 'id, name'
    });

    const fileId = response.data.id;

    // Herkese açık erişim ver
    await drive.permissions.create({
      fileId: fileId,
      requestBody: {
        role: 'reader',
        type: 'anyone'
      }
    });

    // Paylaşılabilir link oluştur
    const webViewLink = `https://drive.google.com/file/d/${fileId}/view`;
    const directDownloadLink = `https://drive.google.com/uc?export=download&id=${fileId}`;

    return {
      fileId: fileId,
      fileName: response.data.name,
      webViewLink: webViewLink,
      directDownloadLink: directDownloadLink
    };
  } catch (error) {
    console.error('Google Drive upload hatası:', error);
    throw error;
  }
}

// Excel export ve Drive'a yükle
router.get('/excel-drive', async (req, res) => {
  try {
    // Excel dosyası oluştur
    const filePath = await createExcelFile();
    
    // Google Drive'a yükle
    const driveInfo = await uploadToDrive(filePath);
    
    // Geçici dosyayı sil
    fs.unlinkSync(filePath);
    
    res.json({
      success: true,
      message: 'Excel dosyası Google Drive\'a başarıyla yüklendi',
      driveInfo: driveInfo
    });
  } catch (error) {
    console.error('Export hatası:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// Sadece Excel dosyası indir (Drive'a yüklemeden)
router.get('/excel', async (req, res) => {
  try {
    const filePath = await createExcelFile();
    
    res.download(filePath, 'RAF_Fiyat_Analizi_Urunler.xlsx', (err) => {
      if (err) {
        console.error('Download hatası:', err);
        res.status(500).json({ error: 'Dosya indirme hatası' });
      } else {
        // İndirme tamamlandıktan sonra geçici dosyayı sil
        setTimeout(() => {
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        }, 5000);
      }
    });
  } catch (error) {
    console.error('Excel export hatası:', error);
    res.status(500).json({ error: error.message });
  }
});

// Service Account durumunu kontrol et
router.get('/check-service-account', (req, res) => {
  try {
    if (!fs.existsSync(SERVICE_ACCOUNT_PATH)) {
      return res.json({ 
        configured: false,
        message: 'Service Account dosyası bulunamadı. Lütfen service-account.json dosyasını ekleyin.' 
      });
    }

    const serviceAccount = readJsonFile(SERVICE_ACCOUNT_PATH);
    
    return res.json({ 
      configured: true,
      client_email: serviceAccount.client_email,
      project_id: serviceAccount.project_id,
      message: 'Service Account yapılandırılmış ve hazır!' 
    });
  } catch (error) {
    return res.status(500).json({ 
      configured: false,
      error: error.message 
    });
  }
});

module.exports = router;

