# Guía de Solución de Problemas - Conexiones

## Problemas Comunes y Soluciones

### 1. Error: "Module not found" o "Cannot find module"

**Síntomas:**
```
Error: Cannot find module 'express'
Error: Cannot find module 'react-scripts'
"react-scripts" no se reconoce como un comando interno o externo
```

**Solución:**
```bash
# Para react-scripts específicamente:
cd server-monitor-frontend
npm install react-scripts@5.0.1

# Para reinstalar todas las dependencias:
npm run install:all

# O instalación manual completa:
cd server-monitor-backend
npm install
cd ../server-monitor-frontend
Remove-Item node_modules -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item package-lock.json -Force -ErrorAction SilentlyContinue
npm install
```

### 2. Error: "Port 3000/3001 is already in use"

**Síntomas:**
```
Error: listen EADDRINUSE: address already in use :::3001
```

**Solución:**
1. **Encontrar el proceso que usa el puerto:**
   ```powershell
   netstat -ano | findstr :3001
   netstat -ano | findstr :3000
   ```

2. **Terminar el proceso:**
   ```powershell
   taskkill /PID [PID_NUMBER] /F
   ```

3. **O cambiar el puerto en el código:**
   - Backend: Modificar `PORT = 3001` en `server-monitor-backend/index.js`
   - Frontend: Se asigna automáticamente el siguiente puerto disponible

### 3. Error de CORS en el Frontend

**Síntomas:**
```
Access to fetch at 'http://localhost:3001' from origin 'http://localhost:3000' has been blocked by CORS policy
```

**Solución:**
- Verificar que el backend tenga configurado CORS (ya incluido)
- Asegurar que el backend esté ejecutándose en puerto 3001

### 4. "No se pudo conectar con el servidor backend"

**Síntomas:**
- Mensaje de error en la interfaz web
- Datos no cargan

**Solución:**
1. **Verificar que el backend esté ejecutándose:**
   ```powershell
   curl http://localhost:3001/api/health
   ```

2. **Si no responde, iniciar el backend:**
   ```bash
   cd server-monitor-backend
   npm run dev
   ```

### 5. Problemas con PowerShell y Scripts

**Síntomas:**
```
cannot be loaded because running scripts is disabled on this system
```

**Solución:**
```powershell
# Ejecutar como administrador
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### 6. Frontend no carga o página en blanco

**Síntomas:**
- Página web en blanco
- Error en consola del navegador

**Solución:**
1. **Verificar consola del navegador (F12)**
2. **Limpiar caché:**
   ```
   Ctrl + F5 (recarga forzada)
   ```
3. **Reinstalar dependencias del frontend:**
   ```bash
   cd server-monitor-frontend
   rm -rf node_modules package-lock.json
   npm install
   ```

### 7. Datos de monitoreo no se actualizan

**Síntomas:**
- Interfaz carga pero los datos no cambian
- Estados siempre aparecen como "Sin conexión"

**Solución:**
1. **Verificar conectividad de red**
2. **Revisar configuración de IPs en backend:**
   ```javascript
   // En server-monitor-backend/index.js
   // Cambiar IPs por servidores accesibles
   ```
3. **Usar el servidor demo (localhost)** que ya está configurado

### 8. Errores de Instalación de npm

**Síntomas:**
```
npm ERR! peer dep missing
npm WARN deprecated
```

**Solución:**
```bash
# Limpiar caché de npm
npm cache clean --force

# Eliminar node_modules y reinstalar
rm -rf node_modules package-lock.json
npm install
```

### 9. Problemas con Tailwind CSS

**Síntomas:**
- Estilos no se aplican
- Interfaz sin diseño

**Solución:**
1. **Verificar archivo de configuración de Tailwind**
2. **Reinstalar dependencias CSS:**
   ```bash
   cd server-monitor-frontend
   npm install tailwindcss autoprefixer postcss
   ```

## Comandos Útiles para Diagnóstico

### Verificar Estado de Servicios
```bash
# Estado del backend
curl http://localhost:3001/api/health

# Estado de servidores
curl http://localhost:3001/api/servers/status

# Estado de MPLS
curl http://localhost:3001/api/mpls/status
```

### Verificar Puertos en Uso
```powershell
# Windows
netstat -ano | findstr :3000
netstat -ano | findstr :3001

# Proceso específico
Get-Process -Id [PID]
```

### Logs y Debugging
```bash
# Ver logs del backend
cd server-monitor-backend
npm run dev

# Ver logs del frontend (en navegador)
F12 > Console
```

## Configuración de Desarrollo

### Variables de Entorno (Opcional)
Crear archivo `.env` en `server-monitor-backend/`:
```
PORT=3001
NODE_ENV=development
```

### Configuración de Red
Si necesitas acceso desde otras máquinas:
```javascript
// En server-monitor-backend/index.js
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor ejecutándose en puerto ${PORT}`);
});
```

## Contacto de Soporte

Si los problemas persisten:
1. Revisar este documento completamente
2. Verificar logs en consola
3. Reportar el error específico con:
   - Sistema operativo
   - Versión de Node.js (`node --version`)
   - Versión de npm (`npm --version`)
   - Mensaje de error completo
   - Pasos para reproducir el problema
