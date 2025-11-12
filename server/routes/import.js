const express = require('express');
const router = express.Router();
const multer = require('multer');
const dbService = require('../services/databaseService');
const ExcelJS = require('exceljs');
const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

// Multer configuration for file upload
const upload = multer({ 
  dest: path.join(__dirname, '../../temp/'),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Google Drive API ayarları - Service Account
const SCOPES = ['https://www.googleapis.com/auth/drive.readonly', 'https://www.googleapis.com/auth/drive.file'];
const SERVICE_ACCOUNT_PATH = path.join(__dirname, '../../service-account.json');

// JSON dosyasını güvenli şekilde oku
function readJsonFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  content = content.replace(/^\uFEFF/, '');
  content = content.trim();
  return JSON.parse(content);
}

// Service Account'u al
function getServiceAccount() {
  if (process.env.SERVICE_ACCOUNT_JSON) {
    try {
      const base64Content = process.env.SERVICE_ACCOUNT_JSON;
      const jsonContent = Buffer.from(base64Content, 'base64').toString('utf8');
      return JSON.parse(jsonContent);
    } catch (error) {
      console.error('SERVICE_ACCOUNT_JSON decode hatası:', error.message);
      throw new Error('SERVICE_ACCOUNT_JSON environment variable geçersiz format.');
    }
  }
  
  const renderSecretPath = '/etc/secrets/service-account.json';
  if (process.env.RENDER && fs.existsSync(renderSecretPath)) {
    return readJsonFile(renderSecretPath);
  }
  
  if (fs.existsSync(SERVICE_ACCOUNT_PATH)) {
    return readJsonFile(SERVICE_ACCOUNT_PATH);
  }
  
  throw new Error('Service Account bulunamadı.');
}

// Google Drive client oluştur
async function getDriveClient() {
  try {
    const serviceAccount = getServiceAccount();
    
    const auth = new google.auth.JWT(
      serviceAccount.client_email,
      null,
      serviceAccount.private_key,
      SCOPES
    );

    await auth.authorize();
    return google.drive({ version: 'v3', auth });
  } catch (error) {
    console.error('Google Drive client hatası:', error.message);
    throw error;
  }
}

// Google Drive'dan Excel dosyasını indir
async function downloadFromDrive(fileId) {
  try {
    const drive = await getDriveClient();
    
    // Dosya bilgilerini al
    const fileInfo = await drive.files.get({
      fileId: fileId,
      fields: 'name, mimeType'
    });

    // Dosyayı indir
    const response = await drive.files.get(
      { fileId: fileId, alt: 'media' },
      { responseType: 'stream' }
    );

    // Geçici dosya yolu
    const tempDir = path.join(__dirname, '../../temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    const filePath = path.join(tempDir, `import_${Date.now()}.xlsx`);
    const writeStream = fs.createWriteStream(filePath);

    return new Promise((resolve, reject) => {
      response.data
        .on('end', () => {
          resolve({ filePath, fileName: fileInfo.data.name });
        })
        .on('error', (err) => {
          reject(err);
        })
        .pipe(writeStream);
    });
  } catch (error) {
    console.error('Google Drive download hatası:', error);
    throw error;
  }
}

// Excel dosyasını parse et ve veritabanına kaydet
async function importExcelToDatabase(filePath, syncMode = 'merge') {
  try {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);

    const worksheet = workbook.getWorksheet('Ürünler') || workbook.worksheets[0];
    if (!worksheet) {
      throw new Error('Excel dosyasında veri bulunamadı');
    }

    const db = dbService.getDatabase();
    const insertStmt = db.prepare(`
      INSERT INTO products (
        name, code, gtip_code, coffee_ratio, factory_price, customs_tax_type, customs_tax_rate,
        customs_tax_per_kg, kaffeesteuer_per_kg, weight_per_box, items_per_box, vat_rate, pallet_box_count
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const updateStmt = db.prepare(`
      UPDATE products SET
        name = ?, code = ?, gtip_code = ?, coffee_ratio = ?, factory_price = ?,
        customs_tax_type = ?, customs_tax_rate = ?, customs_tax_per_kg = ?,
        kaffeesteuer_per_kg = ?, weight_per_box = ?, items_per_box = ?,
        vat_rate = ?, pallet_box_count = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    const checkStmt = db.prepare('SELECT id FROM products WHERE id = ?');
    
    let imported = 0;
    let updated = 0;
    let skipped = 0;

    // İlk satır başlık, 2. satırdan başla
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // Başlık satırını atla

      try {
        const id = row.getCell(1).value ? parseInt(row.getCell(1).value) : null;
        const name = row.getCell(2).value?.toString().trim();
        
        if (!name) {
          skipped++;
          return; // İsim yoksa atla
        }

        const code = row.getCell(3).value?.toString().trim() || null;
        const gtip_code = row.getCell(4).value?.toString().trim() || null;
        const coffee_ratio = parseFloat(row.getCell(5).value) || 0;
        const factory_price = parseFloat(row.getCell(6).value) || 0;
        
        // Gümrük vergisi tipi
        const customsTaxTypeCell = row.getCell(7).value?.toString().trim() || '';
        const customs_tax_type = customsTaxTypeCell.includes('KG') || customsTaxTypeCell.includes('kg') ? 'per_kg' : 'percentage';
        const customs_tax_rate = parseFloat(row.getCell(8).value) || 0;
        const customs_tax_per_kg = parseFloat(row.getCell(9).value) || 0;
        const kaffeesteuer_per_kg = parseFloat(row.getCell(10).value) || 0;
        const weight_per_box = parseFloat(row.getCell(11).value) || 0;
        const items_per_box = parseInt(row.getCell(12).value) || 1;
        const vat_rate = parseFloat(row.getCell(13).value) || 0;
        const pallet_box_count = parseInt(row.getCell(14).value) || 1;

        if (syncMode === 'replace' && rowNumber === 2) {
          // İlk import'ta tüm verileri sil (sadece bir kez)
          db.exec('DELETE FROM products');
        }

        // ID varsa ve veritabanında mevcutsa güncelle
        if (id && checkStmt.get(id)) {
          updateStmt.run(
            name, code, gtip_code, coffee_ratio, factory_price,
            customs_tax_type, customs_tax_rate, customs_tax_per_kg,
            kaffeesteuer_per_kg, weight_per_box, items_per_box,
            vat_rate, pallet_box_count, id
          );
          updated++;
        } else {
          // Yeni kayıt ekle
          insertStmt.run(
            name, code, gtip_code, coffee_ratio, factory_price,
            customs_tax_type, customs_tax_rate, customs_tax_per_kg,
            kaffeesteuer_per_kg, weight_per_box, items_per_box,
            vat_rate, pallet_box_count
          );
          imported++;
        }
      } catch (error) {
        console.error(`Satır ${rowNumber} işlenirken hata:`, error.message);
        skipped++;
      }
    });

    return { imported, updated, skipped };
  } catch (error) {
    console.error('Excel import hatası:', error);
    throw error;
  }
}

// Google Drive'dan Excel indir ve veritabanına aktar
router.post('/drive-sync', async (req, res) => {
  try {
    const { fileId, syncMode = 'merge' } = req.body; // syncMode: 'merge' veya 'replace'
    
    if (!fileId) {
      return res.status(400).json({ error: 'Google Drive fileId gerekli' });
    }

    // Google Drive'dan indir
    const { filePath, fileName } = await downloadFromDrive(fileId);
    
    try {
      // Excel'i parse et ve veritabanına kaydet
      const result = await importExcelToDatabase(filePath, syncMode);
      
      // Geçici dosyayı sil
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      res.json({
        success: true,
        message: 'Google Drive\'dan Excel dosyası başarıyla indirildi ve veritabanına aktarıldı',
        fileName: fileName,
        result: result
      });
    } catch (importError) {
      // Hata olsa bile geçici dosyayı temizle
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      throw importError;
    }
  } catch (error) {
    console.error('Drive sync hatası:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// Excel dosyasını yükle ve veritabanına aktar (multipart/form-data)
router.post('/excel-upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Excel dosyası yüklenmedi' });
    }

    const filePath = req.file.path;
    const syncMode = req.body.syncMode || 'merge';

    // Dosya uzantısını kontrol et
    if (!req.file.originalname.endsWith('.xlsx') && !req.file.originalname.endsWith('.xls')) {
      fs.unlinkSync(filePath);
      return res.status(400).json({ error: 'Sadece Excel dosyaları (.xlsx, .xls) kabul edilir' });
    }

    // Geçici dosyayı .xlsx uzantısıyla yeniden adlandır
    const newFilePath = filePath + '.xlsx';
    fs.renameSync(filePath, newFilePath);

    try {
      // Excel'i parse et ve veritabanına kaydet
      const result = await importExcelToDatabase(newFilePath, syncMode);
      
      // Geçici dosyayı sil
      if (fs.existsSync(newFilePath)) {
        fs.unlinkSync(newFilePath);
      }

      res.json({
        success: true,
        message: 'Excel dosyası başarıyla yüklendi ve veritabanına aktarıldı',
        result: result
      });
    } catch (importError) {
      if (fs.existsSync(newFilePath)) {
        fs.unlinkSync(newFilePath);
      }
      throw importError;
    }
  } catch (error) {
    console.error('Excel upload hatası:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

module.exports = router;

