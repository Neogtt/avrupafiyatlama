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

// Service Account'u al (Environment variable veya dosyadan)
function getServiceAccount() {
  // Önce environment variable'dan dene (Render production)
  if (process.env.SERVICE_ACCOUNT_JSON) {
    try {
      // Base64'ten decode et
      const base64Content = process.env.SERVICE_ACCOUNT_JSON;
      const jsonContent = Buffer.from(base64Content, 'base64').toString('utf8');
      return JSON.parse(jsonContent);
    } catch (error) {
      console.error('SERVICE_ACCOUNT_JSON decode hatası:', error.message);
      throw new Error('SERVICE_ACCOUNT_JSON environment variable geçersiz format. Base64 encoded JSON olmalı.');
    }
  }
  
  // Render secret file'dan dene
  const renderSecretPath = '/etc/secrets/service-account.json';
  if (process.env.RENDER && fs.existsSync(renderSecretPath)) {
    return readJsonFile(renderSecretPath);
  }
  
  // Local development için dosyadan oku
  if (fs.existsSync(SERVICE_ACCOUNT_PATH)) {
    return readJsonFile(SERVICE_ACCOUNT_PATH);
  }
  
  throw new Error('Service Account bulunamadı. SERVICE_ACCOUNT_JSON environment variable, /etc/secrets/service-account.json (Render secret file) veya service-account.json (local) dosyası gerekli.');
}

// Google Drive client oluştur (Service Account ile)
async function getDriveClient() {
  try {
    const serviceAccount = getServiceAccount();
    
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

// Excel dosyasını Google Drive'a yükle (mevcut dosyayı güncelle veya yeni oluştur)
async function uploadToDrive(filePath, fileName = 'RAF_Fiyat_Analizi_Urunler.xlsx', existingFileId = null) {
  try {
    const drive = await getDriveClient();
    
    if (existingFileId) {
      // Mevcut dosyayı güncelle
      const media = {
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        body: fs.createReadStream(filePath)
      };

      await drive.files.update({
        fileId: existingFileId,
        media: media,
        fields: 'id, name, webViewLink'
      });

      const webViewLink = `https://drive.google.com/file/d/${existingFileId}/view`;
      const directDownloadLink = `https://drive.google.com/uc?export=download&id=${existingFileId}`;

      return {
        fileId: existingFileId,
        fileName: fileName,
        webViewLink: webViewLink,
        directDownloadLink: directDownloadLink,
        updated: true
      };
    }
    
    // Yeni dosya oluştur
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

// Excel export ve Drive'a yükle (mevcut dosyayı güncelle veya yeni oluştur)
router.get('/excel-drive', async (req, res) => {
  try {
    const existingFileId = req.query.fileId || null; // Query parametresinden fileId al
    
    // Excel dosyası oluştur
    const filePath = await createExcelFile();
    
    // Google Drive'a yükle (mevcut dosyayı güncelle veya yeni oluştur)
    const driveInfo = await uploadToDrive(filePath, 'RAF_Fiyat_Analizi_Urunler.xlsx', existingFileId);
    
    // Geçici dosyayı sil
    fs.unlinkSync(filePath);
    
    res.json({
      success: true,
      message: existingFileId ? 'Excel dosyası Google Drive\'da güncellendi' : 'Excel dosyası Google Drive\'a başarıyla yüklendi',
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
    const serviceAccount = getServiceAccount();
    
    return res.json({ 
      configured: true,
      source: process.env.SERVICE_ACCOUNT_JSON ? 'Environment Variable (Base64)' 
        : (process.env.RENDER && fs.existsSync('/etc/secrets/service-account.json') ? 'Render Secret File' 
        : 'Local File'),
      client_email: serviceAccount.client_email,
      project_id: serviceAccount.project_id,
      message: 'Service Account yapılandırılmış ve hazır!' 
    });
  } catch (error) {
    return res.json({ 
      configured: false,
      error: error.message,
      message: 'Service Account bulunamadı. Lütfen yapılandırın.' 
    });
  }
});

module.exports = router;

