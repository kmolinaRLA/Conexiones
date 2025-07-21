# Conexiones - Monitor de Servidores Corporativo

![Monitor de Servidores](https://img.shields.io/badge/Status-Operational-green)
![React](https://img.shields.io/badge/React-18+-blue)
![Node.js](https://img.shields.io/badge/Node.js-16+-green)

Sistema de monitoreo en tiempo real para servidores corporativos y conexiones MPLS nacionales. Permite validar el estado de conectividad, latencia y disponibilidad de servicios críticos.

## 🚀 Características

- **Monitoreo en Tiempo Real**: Actualización automática cada 30 segundos
- **Dashboard Intuitivo**: Interfaz moderna con indicadores visuales de estado
- **Servidores y Servicios**: Monitoreo de múltiples servicios por servidor
- **MPLS Nacionales**: Seguimiento de conexiones MPLS por departamento
- **Indicadores de Latencia**: 
  - 🟢 Verde: < 100ms (Óptimo)
  - 🟡 Amarillo: 100-300ms (Latencia Alta)
  - 🔴 Rojo: > 300ms o Sin conexión
- **API RESTful**: Backend robusto con endpoints para configuración

## 🏗️ Arquitectura

```
Conexiones/
├── server-monitor-backend/     # API Node.js + Express
│   ├── index.js               # Servidor principal
│   └── package.json           # Dependencias backend
├── server-monitor-frontend/    # Frontend React
│   ├── src/
│   │   ├── ServerMonitor.js   # Componente principal
│   │   └── App.js             # Aplicación React
│   └── package.json           # Dependencias frontend
└── package.json               # Scripts principales
```

## 📋 Requisitos Previos

- **Node.js**: v16.0.0 o superior
- **npm**: v7.0.0 o superior
- **Puerto 3000**: Para el frontend (React)
- **Puerto 3001**: Para el backend (API)

## 🛠️ Instalación

### Instalación Automática (Recomendada)

```bash
# Clonar el repositorio
git clone <repository-url>
cd Conexiones

# Instalar todas las dependencias
npm run install:all
```

### Instalación Manual

```bash
# Instalar dependencias del proyecto principal
npm install

# Instalar dependencias del backend
cd server-monitor-backend
npm install

# Instalar dependencias del frontend
cd ../server-monitor-frontend
npm install
```

## 🚀 Ejecución

### Inicio Completo del Sistema

```bash
# Desde la carpeta raíz - Inicia frontend y backend simultáneamente
npm start
```

### Inicio Individual

```bash
# Solo Backend (Puerto 3001)
npm run start:backend

# Solo Frontend (Puerto 3000)
npm run start:frontend
```

### Usando VS Code Tasks

También puedes usar la tarea predefinida en VS Code:
- Abrir Command Palette (`Ctrl+Shift+P`)
- Buscar "Tasks: Run Task"
- Seleccionar "Start Backend Server"

## 📡 API Endpoints

### Monitoreo
- `GET /api/servers/status` - Estado de todos los servidores
- `GET /api/mpls/status` - Estado de conexiones MPLS
- `GET /api/health` - Estado del API

### Configuración
- `GET /api/config` - Obtener configuración actual
- `POST /api/config/servers` - Actualizar servidores
- `POST /api/config/mpls` - Actualizar configuración MPLS

## ⚙️ Configuración

### Servidores

Edita el archivo `server-monitor-backend/index.js` para configurar los servidores a monitorear:

```javascript
let serversConfig = {
  servers: [
    {
      id: 'server1',
      name: 'Servidor Principal',
      ip: '192.168.1.100',
      services: [
        { name: 'Web Server', port: 80, type: 'HTTP' },
        { name: 'Database', port: 3306, type: 'MySQL' },
        { name: 'SSH', port: 22, type: 'SSH' }
      ]
    }
    // ... más servidores
  ]
};
```

### MPLS

```javascript
mpls: [
  {
    id: 'antioquia',
    name: 'Antioquia',
    ip: '10.1.1.1',
    port: 443,
    location: 'Medellín'
  }
  // ... más conexiones MPLS
]
```

## 🎨 Tecnologías Utilizadas

### Frontend
- **React 19**: Framework principal
- **Tailwind CSS**: Estilos y diseño
- **Lucide React**: Iconografía
- **PostCSS**: Procesamiento CSS

### Backend
- **Node.js**: Runtime de JavaScript
- **Express.js**: Framework web
- **CORS**: Manejo de políticas de origen cruzado
- **Net**: Módulo nativo para testing de conectividad

## 🔧 Desarrollo

### Estructura del Proyecto

- `/server-monitor-backend/`: API y lógica de monitoreo
- `/server-monitor-frontend/`: Interfaz de usuario React
- `/public/`: Archivos estáticos
- `/src/`: Código fuente de React

### Scripts Disponibles

```bash
npm run start          # Inicia frontend y backend
npm run start:backend  # Solo backend
npm run start:frontend # Solo frontend
npm run install:all    # Instala todas las dependencias
npm run build         # Construye el frontend para producción
```

## 🐛 Resolución de Problemas

### Error de Conexión Backend
```
Error: No se pudo conectar con el servidor backend
```
**Solución**: Verificar que el backend esté ejecutándose en puerto 3001

### Puerto en Uso
```
Error: EADDRINUSE
```
**Solución**: Liberar los puertos 3000 y 3001 o cambiar la configuración

### Dependencias
```
Module not found
```
**Solución**: Ejecutar `npm run install:all`

## 📊 Estados de Monitoreo

| Estado | Color | Condición | Descripción |
|--------|-------|-----------|-------------|
| Operativo | 🟢 Verde | Latencia < 100ms | Conexión óptima |
| Latencia Alta | 🟡 Amarillo | 100ms ≤ Latencia < 300ms | Conexión lenta |
| Sin Conexión | 🔴 Rojo | Latencia ≥ 300ms o Error | Problemas de conectividad |

## 🔄 Actualización Automática

El sistema actualiza automáticamente cada 30 segundos. También incluye:
- Botón de actualización manual
- Indicador de última actualización
- Manejo de errores de conectividad
- Estado de carga visual

## 📝 Logs y Monitoreo

Los logs se muestran en la consola del navegador y del servidor:

```bash
# Backend logs
Servidor backend ejecutándose en puerto 3001
API disponible en: http://localhost:3001/api

# Frontend logs (DevTools)
Error fetching server status: [error details]
```

## 🤝 Contribución

1. Fork el proyecto
2. Crear rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia ISC. Ver archivo `LICENSE` para más detalles.

## 👥 Soporte

Para soporte técnico o reportar problemas:
- Crear un issue en el repositorio
- Contactar al equipo de desarrollo

---

**Desarrollado con ❤️ para el monitoreo de infraestructura corporativa**
