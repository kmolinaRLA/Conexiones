# Server Monitor Backend

Backend para el sistema de monitoreo de servidores y conexiones MPLS nacionales.

## Características

- **Verificación de conectividad en tiempo real**: Valida conexiones TCP a servidores y servicios específicos
- **Medición de latencia**: Calcula tiempos de respuesta para determinar la calidad de la conexión
- **Estados visuales**: Clasifica las conexiones en tres estados:
  - 🟢 Verde (good): Latencia < 100ms - Conexión estable
  - 🟡 Amarillo (warning): Latencia 100-300ms - Tiempos altos de latencia
  - 🔴 Rojo (error): Latencia > 300ms o sin conexión
- **Configuración dinámica**: Permite actualizar IPs y puertos sin reiniciar el servidor
- **Monitoreo de MPLS**: Seguimiento específico de conexiones MPLS por departamento

## API Endpoints

### Estado de Servidores
- `GET /api/servers/status` - Obtiene el estado de todos los servidores y sus servicios
- `GET /api/mpls/status` - Obtiene el estado de todas las conexiones MPLS nacionales

### Configuración
- `GET /api/config` - Obtiene la configuración actual de servidores y MPLS
- `POST /api/config/servers` - Actualiza la configuración de servidores
- `POST /api/config/mpls` - Actualiza la configuración de MPLS

### Utilidades
- `GET /api/health` - Endpoint de salud del servidor

## Instalación y Uso

1. Instalar dependencias:
```bash
npm install
```

2. Ejecutar en modo desarrollo:
```bash
npm run dev
```

3. Ejecutar en producción:
```bash
npm start
```

El servidor se ejecuta en el puerto 3001 por defecto.

## Configuración de Servidores

Los servidores se configuran en el objeto `serversConfig.servers`:

```javascript
{
  id: 'server1',
  name: 'Servidor Principal',
  ip: '192.168.1.100',
  services: [
    { name: 'Web Server', port: 80, type: 'HTTP' },
    { name: 'Database', port: 3306, type: 'MySQL' }
  ]
}
```

## Configuración de MPLS

Las conexiones MPLS se configuran en el objeto `serversConfig.mpls`:

```javascript
{
  id: 'antioquia',
  name: 'Antioquia',
  ip: '10.1.1.1',
  port: 443
}
```

## Estructura de Respuesta

### Servidores:
```json
{
  "id": "server1",
  "name": "Servidor Principal",
  "status": "good|warning|error",
  "services": [
    {
      "name": "Web Server",
      "type": "HTTP",
      "status": "good|warning|error",
      "latency": 45
    }
  ]
}
```

### MPLS:
```json
{
  "id": "antioquia",
  "name": "Antioquia",
  "status": "good|warning|error",
  "latency": 120
}
```

## Tecnologías Utilizadas

- **Node.js**: Runtime de JavaScript
- **Express.js**: Framework web
- **CORS**: Middleware para permitir peticiones cross-origin
- **Net**: Módulo nativo de Node.js para conexiones TCP
- **Performance API**: Para medición precisa de latencia

## Notas de Seguridad

- El servidor no expone información sensible como IPs o puertos en las respuestas del frontend
- Las configuraciones pueden ser actualizadas dinámicamente a través de la API
- Se recomienda usar HTTPS en producción
