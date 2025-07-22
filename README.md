# Conexiones - Monitor de Servidores Corporativo

![Monitor de Servidores](https://img.shields.io/badge/Status-Operational-green)
![React](https://img.shields.io/badge/React-18+-blue)
![Node.js](https://img.shields.io/badge/Node.js-16+-green)
![Actualización](https://img.shields.io/badge/Actualización-5s-orange)

Sistema de monitoreo en tiempo real para servidores corporativos y conexiones MPLS nacionales. Permite validar el estado de conectividad, latencia y disponibilidad de servicios críticos con métricas avanzadas tipo Grafana.

## 🚀 Características Principales

- **⚡ Monitoreo Ultra-Rápido**: Actualización automática cada 5 segundos
- **📊 Métricas Avanzadas**: Gráficos históricos tipo Grafana con análisis temporal
- **🖥️ Dashboard Intuitivo**: Interfaz moderna con indicadores visuales de estado
- **🔧 Monitoreo Flexible**: 
  - **Ping ICMP**: Para servidores sin servicios específicos
  - **TCP Socket**: Para servicios específicos por puerto
- **🌐 MPLS Nacionales**: Seguimiento de conexiones por departamento
- **📈 Análisis Temporal**: Rangos de 15m, 1h, 6h, 24h
- **🎯 Indicadores de Latencia**: 
  - 🟢 Verde: < 100ms (Óptimo)
  - 🟡 Amarillo: 100-300ms (Latencia Alta)
  - 🔴 Rojo: > 300ms o Sin conexión
- **💾 Almacenamiento Histórico**: Hasta 1000 métricas por elemento

## 🏗️ Arquitectura del Sistema

```
Conexiones/
├── server-monitor-backend/     # API Node.js + Express
│   ├── index.js               # Servidor principal con métricas
│   └── package.json           # Dependencias backend
├── server-monitor-frontend/    # Frontend React
│   ├── src/
│   │   ├── ServerMonitor.js   # Componente principal con gráficos
│   │   ├── App.js             # Aplicación React
│   │   └── index.css          # Estilos Tailwind
│   └── package.json           # Dependencias frontend
├── config.json                # ⚙️ Configuración central
├── package.json               # Scripts principales
└── README.md                  # Este archivo
```

## 📋 Requisitos Previos

### Sistema Operativo
- **Windows 10/11** (recomendado)
- **Linux/macOS** (compatible)

### Software Requerido

1. **Node.js** (v16.0.0 o superior)
   - Descargar desde: https://nodejs.org/
   - Verificar instalación: `node --version`
   - Debe mostrar algo como: `v18.17.0`

2. **npm** (incluido con Node.js)
   - Verificar: `npm --version`
   - Debe mostrar algo como: `9.6.7`

3. **Git** (opcional, para clonar)
   - Descargar desde: https://git-scm.com/

### Puertos Requeridos
- **Puerto 3000**: Frontend React
- **Puerto 3001**: Backend API
- **Acceso de red**: Para hacer ping y conexiones TCP

## 📦 Instalación Completa

### Opción 1: Instalación Automática (Recomendada)

```bash
# 1. Clonar o descargar el proyecto
git clone https://github.com/tu-repo/Conexiones.git
# O descargar ZIP y extraer

# 2. Navegar al directorio
cd Conexiones

# 3. Instalación automática de TODO
npm run install:all

# 4. Iniciar el sistema completo
npm start
```

### Opción 2: Instalación Manual Paso a Paso

```bash
# 1. Instalar dependencias principales
npm install

# 2. Instalar dependencias del backend
cd server-monitor-backend
npm install

# 3. Regresar y instalar frontend
cd ..
cd server-monitor-frontend
npm install

# 4. Regresar al directorio raíz
cd ..

# 5. Iniciar el sistema
npm start
```

### Opción 3: Instalación Sin Git

1. **Descargar** el proyecto como ZIP
2. **Extraer** en el directorio deseado
3. **Abrir terminal** en la carpeta extraída
4. **Ejecutar** los comandos de instalación manual

## 🚀 Ejecución del Sistema

### Inicio Completo (Recomendado)
```bash
# Desde la carpeta raíz - Inicia frontend y backend automáticamente
npm start
```

Esto abrirá:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001

### Inicio Individual
```bash
# Solo Backend (Puerto 3001)
npm run start:backend

# Solo Frontend (Puerto 3000) 
npm run start:frontend
```

### Verificación de Funcionamiento

1. **Abrir navegador** en http://localhost:3000
2. **Verificar estado** del API: http://localhost:3001/api/health
3. **Comprobar** que aparecen servidores y MPLS

## ⚙️ Configuración Personalizada

### Archivo de Configuración Principal

Edita `config.json` para personalizar:

```json
{
  "monitoring": {
    "updateInterval": 5000,      // Actualización cada 5 segundos
    "connectionTimeout": 3000,   // Timeout de 3 segundos
    "latencyThresholds": {
      "good": 100,              // Verde < 100ms
      "warning": 300            // Amarillo > 300ms
    }
  },
  "servers": [
    {
      "id": "mi-servidor",
      "name": "Mi Servidor Web",
      "ip": "192.168.1.100",
      "services": [
        { "name": "Web", "port": 80, "type": "HTTP" },
        { "name": "HTTPS", "port": 443, "type": "HTTPS" }
      ]
    },
    {
      "id": "servidor-ping",
      "name": "Servidor Solo Ping",
      "ip": "192.168.1.200",
      "services": []              // Solo ping ICMP
    }
  ],
  "mpls": [
    {
      "id": "mi-sucursal",
      "name": "Mi Sucursal",
      "ip": "10.1.1.1",
      "port": 443,
      "location": "Ciudad"
    }
  ]
}
```

### Tipos de Monitoreo

**🏓 Solo Ping** (services: [])
- Usa ping ICMP nativo del sistema
- Más rápido y menos intrusivo
- Ideal para servidores sin servicios específicos

**🔌 Servicios TCP** (services: [...])
- Verifica conexión a puertos específicos
- Monitoreo detallado por servicio
- Ideal para aplicaciones y bases de datos

## 📡 API Endpoints Disponibles

### Monitoreo Principal
```bash
GET /api/servers/status    # Estado de todos los servidores
GET /api/mpls/status       # Estado de conexiones MPLS
GET /api/health           # Estado del sistema
```

### Métricas Avanzadas
```bash
GET /api/metrics/servers/{id}?timeRange=1h    # Métricas de servidor
GET /api/metrics/mpls/{id}?timeRange=6h       # Métricas de MPLS
GET /api/metrics/summary                      # Resumen general
```

### Configuración
```bash
GET /api/config           # Configuración actual
```

## 🎨 Tecnologías Utilizadas

### Frontend
- **React 18**: Framework principal
- **Tailwind CSS**: Diseño y estilos
- **Recharts**: Gráficos y métricas
- **Lucide React**: Iconografía moderna
- **React Modal**: Ventanas modales

### Backend  
- **Node.js**: Runtime de JavaScript
- **Express.js**: Framework web robusto
- **Net**: Testing de conectividad TCP
- **Child Process**: Ejecución de ping nativo
- **CORS**: Políticas de origen cruzado

## 🔧 Scripts Disponibles

```bash
# Instalación
npm run install:all       # Instala todas las dependencias

# Ejecución
npm start                 # Inicia frontend y backend
npm run start:backend     # Solo backend (puerto 3001)
npm run start:frontend    # Solo frontend (puerto 3000)

# Desarrollo
npm run build            # Construye para producción
npm test                 # Ejecuta pruebas
```

## 🐛 Resolución de Problemas

### ❌ Error: "No se pudo conectar con el servidor backend"

**Causa**: El backend no está ejecutándose
```bash
# Solución
cd server-monitor-backend
npm start
# O desde la raíz:
npm run start:backend
```

### ❌ Error: "EADDRINUSE: Puerto en uso"

**Causa**: Los puertos 3000 o 3001 están ocupados
```bash
# Windows - Liberar puerto
netstat -ano | findstr :3000
taskkill /PID [número] /F

# Linux/Mac - Liberar puerto
lsof -ti:3000 | xargs kill -9
```

### ❌ Error: "Module not found"

**Causa**: Dependencias no instaladas
```bash
# Solución
npm run install:all
```

### ❌ Error: "ping: comando no encontrado"

**Causa**: Sistema sin ping nativo (muy raro)
- **Windows**: Viene preinstalado
- **Linux**: `sudo apt install iputils-ping`
- **Mac**: Viene preinstalado

### ❌ Error de permisos de red

**Causa**: Firewall o políticas corporativas
- **Configurar firewall** para permitir puertos 3000, 3001
- **Ejecutar como administrador** si es necesario
- **Verificar políticas** de red corporativa

## 📊 Estados y Métricas

### Estados de Conexión
| Estado | Color | Condición | Descripción |
|--------|-------|-----------|-------------|
| Operativo | 🟢 Verde | Latencia < 100ms | Conexión óptima |
| Latencia Alta | 🟡 Amarillo | 100-300ms | Conexión lenta |
| Sin Conexión | 🔴 Rojo | > 300ms o Error | Fallo de conectividad |

### Métricas Disponibles
- **📈 Latencia en tiempo real**: Gráficos de líneas
- **📊 Disponibilidad**: Porcentaje de uptime  
- **⏱️ Latencia promedio, máxima, mínima**
- **🔄 Historial de estados**: Últimos cambios
- **📋 Tabla de datos**: Registros detallados

### Rangos Temporales
- **15 minutos**: Monitoreo inmediato
- **1 hora**: Seguimiento detallado
- **6 horas**: Análisis de tendencias
- **24 horas**: Vista panorámica diaria

## 🚀 Despliegue en Producción

### 1. Preparación
```bash
# Construir frontend optimizado
cd server-monitor-frontend
npm run build

# Volver al directorio raíz
cd ..
```

### 2. Variables de Entorno
```bash
# Archivo .env
NODE_ENV=production
PORT=3001
FRONTEND_PORT=3000
```

### 3. Proceso Daemon (Linux)
```bash
# Con PM2
npm install -g pm2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 4. Servicio Windows
- Usar **node-windows** para crear servicio
- O ejecutar en **Task Scheduler**

## 📁 Estructura de Archivos Completa

```
Conexiones/
├── 📁 server-monitor-backend/
│   ├── 📄 index.js              # Servidor principal con métricas
│   ├── 📄 package.json          # Dependencias backend
│   └── 📄 package-lock.json     # Lock de versiones
├── 📁 server-monitor-frontend/
│   ├── 📁 src/
│   │   ├── 📄 ServerMonitor.js  # Componente principal
│   │   ├── 📄 App.js            # App React
│   │   ├── 📄 index.js          # Entry point
│   │   └── 📄 index.css         # Estilos Tailwind
│   ├── 📁 public/
│   │   ├── 📄 index.html        # Template HTML
│   │   └── 📄 favicon.ico       # Icono
│   ├── 📄 package.json          # Dependencias frontend
│   ├── 📄 tailwind.config.js    # Config Tailwind
│   └── 📄 package-lock.json     # Lock de versiones
├── ⚙️ config.json               # Configuración central
├── 📄 package.json              # Scripts principales
├── 📄 README.md                 # Esta documentación
└── 📄 .gitignore               # Archivos ignorados
```

## 🤝 Soporte y Contribución

### Reportar Problemas
1. **Verificar** que el problema persiste después de reiniciar
2. **Revisar** los logs de consola (F12 en navegador)
3. **Crear issue** con información detallada:
   - Sistema operativo
   - Versión de Node.js
   - Mensaje de error completo
   - Pasos para reproducir

### Contribuir
1. **Fork** el proyecto
2. **Crear rama**: `git checkout -b feature/nueva-funcionalidad`
3. **Hacer cambios** y commit: `git commit -am 'Descripción'`
4. **Push**: `git push origin feature/nueva-funcionalidad`
5. **Pull Request** con descripción detallada

## 📋 Checklist de Instalación

- [ ] Node.js v16+ instalado
- [ ] npm funcionando correctamente
- [ ] Proyecto descargado/clonado
- [ ] `npm run install:all` ejecutado sin errores
- [ ] `npm start` inicia ambos servicios
- [ ] http://localhost:3000 muestra la interfaz
- [ ] http://localhost:3001/api/health responde OK
- [ ] config.json configurado según necesidades
- [ ] Firewall configurado para puertos 3000, 3001

## 📄 Licencia

Este proyecto está bajo la **Licencia ISC**. Libre para uso comercial y personal.

## 🏆 Características Avanzadas

- **🔄 Auto-actualización**: Sin intervención manual
- **📱 Responsive**: Funciona en móviles y tablets  
- **⚡ Optimizado**: Carga rápida y eficiente
- **🛡️ Robusto**: Manejo de errores y reconexión
- **📊 Escalable**: Fácil agregar nuevos servidores
- **🎨 Profesional**: Diseño corporativo moderno

---

**🚀 Desarrollado con ❤️ para el monitoreo profesional de infraestructura corporativa**

**📞 ¿Necesitas ayuda?** Crea un issue o contacta al equipo de desarrollo.
