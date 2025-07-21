@echo off
echo =============================================
echo   Instalador de Conexiones - Monitor de Servidores
echo =============================================
echo.

echo [1/4] Instalando dependencias del proyecto principal...
call npm install
if %errorlevel% neq 0 (
    echo Error: Falló la instalación del proyecto principal
    pause
    exit /b 1
)

echo.
echo [2/4] Instalando dependencias del backend...
cd server-monitor-backend
call npm install
if %errorlevel% neq 0 (
    echo Error: Falló la instalación del backend
    pause
    exit /b 1
)

echo.
echo [3/4] Instalando dependencias del frontend...
cd ..\server-monitor-frontend
call npm install
if %errorlevel% neq 0 (
    echo Error: Falló la instalación del frontend
    pause
    exit /b 1
)

cd ..
echo.
echo [4/4] Verificando instalación...
echo ✓ Proyecto principal: OK
echo ✓ Backend: OK
echo ✓ Frontend: OK
echo.
echo =============================================
echo   ¡Instalación completada exitosamente!
echo =============================================
echo.
echo Para iniciar el sistema ejecute:
echo   npm start
echo.
echo O use los comandos individuales:
echo   npm run start:backend  (Solo backend)
echo   npm run start:frontend (Solo frontend)
echo.
pause
