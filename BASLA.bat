@echo off
chcp 65001 >nul
echo ========================================
echo RAF Fiyat Analizi - Tüm Servisler
echo ========================================
echo.

cd /d "%~dp0"

echo Bağımlılıklar kontrol ediliyor...
if not exist "node_modules" (
    echo Backend bağımlılıkları yükleniyor...
    call npm install
)

if not exist "client\node_modules" (
    echo Frontend bağımlılıkları yükleniyor...
    cd client
    call npm install
    cd ..
)

echo.
echo ========================================
echo Servisler başlatılıyor...
echo ========================================
echo.

REM Backend sunucusunu başlat
start "RAF Fiyat Analizi - Backend" cmd /k "npm start"

REM 3 saniye bekle
timeout /t 3 /nobreak >nul

REM Frontend'i başlat
start "RAF Fiyat Analizi - Frontend" cmd /k "cd client && npm start"

echo.
echo ========================================
echo Servisler başlatıldı!
echo ========================================
echo.
echo Backend: http://localhost:3001
echo Frontend: http://localhost:3000
echo.
echo Servisleri kapatmak için açılan pencerelerde Ctrl+C tuşlarına basın
echo.
pause

