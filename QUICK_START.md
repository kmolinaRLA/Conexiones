# Guía de Instalación y Uso Rápido

## 🚀 Instalación en 3 Pasos

### Paso 1: Requisitos
- **Node.js** v16+ [Descargar aquí](https://nodejs.org/)
- **Git** (opcional) [Descargar aquí](https://git-scm.com/)

### Paso 2: Instalación
```bash
# Opción A: Instalación automática (Recomendada)
cd Conexiones
npm run install:all

# Opción B: Ejecutar install.bat (Windows)
.\install.bat

# Opción C: Instalación manual
npm install
cd server-monitor-backend && npm install
cd ../server-monitor-frontend && npm install
```

### Paso 3: Iniciar Sistema
```bash
# Opción A: Comando npm
npm start

# Opción B: Script de PowerShell
.\start.ps1

# Opción C: Script batch
.\start.bat
```

## 🌐 URLs de Acceso

- **Frontend (Interfaz Web)**: http://localhost:3000
- **Backend (API)**: http://localhost:3001
- **API Health Check**: http://localhost:3001/api/health

## ⚙️ Configuración Rápida

### Personalizar Servidores
Editar `config.json` en la raíz del proyecto:

```json
{
  "servers": [
    {
      "id": "mi-servidor",
      "name": "Mi Servidor",
      "ip": "192.168.1.10",
      "services": [
        { "name": "Web", "port": 80, "type": "HTTP" },
        { "name": "SSH", "port": 22, "type": "SSH" }
      ]
    }
  ]
}
```

### Cambiar Intervalos de Actualización
```json
{
  "monitoring": {
    "updateInterval": 30000,
    "connectionTimeout": 5000,
    "latencyThresholds": {
      "good": 100,
      "warning": 300
    }
  }
}
```

## 🔧 Comandos Útiles

```bash
# Solo Backend
npm run start:backend

# Solo Frontend  
npm run start:frontend

# Construir para producción
npm run build

# Verificar estado
curl http://localhost:3001/api/health
```

## ❗ Problemas Comunes

### Puerto ocupado
```bash
# Verificar qué usa el puerto
netstat -ano | findstr :3001

# Terminar proceso
taskkill /PID [PID] /F
```

### Error de CORS
- Verificar que el backend esté en puerto 3001
- Verificar que el frontend esté en puerto 3000

### Dependencias faltantes
```bash
npm run install:all
```

## 📊 Estados de Conexión

- 🟢 **Verde**: Latencia < 100ms (Óptimo)
- 🟡 **Amarillo**: 100-300ms (Latencia Alta)  
- 🔴 **Rojo**: >300ms o Sin conexión

## 📁 Estructura del Proyecto

```
Conexiones/
├── server-monitor-backend/    # API Node.js
├── server-monitor-frontend/   # React App
├── config.json               # Configuración
├── README.md                 # Documentación
├── TROUBLESHOOTING.md        # Solución de problemas
├── start.ps1                 # Script PowerShell
└── install.bat              # Instalador Windows
```

## 🆘 Soporte

Si tienes problemas:
1. Consultar `TROUBLESHOOTING.md`
2. Verificar logs en consola
3. Reportar issue con detalles del error
