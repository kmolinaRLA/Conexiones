const express = require('express');
const cors = require('cors');
const net = require('net');
const fs = require('fs');
const path = require('path');
const { performance } = require('perf_hooks');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Cargar configuración desde archivo
let serversConfig;
try {
  const configPath = path.join(__dirname, '..', 'config.json');
  const configData = fs.readFileSync(configPath, 'utf8');
  const config = JSON.parse(configData);
  serversConfig = {
    servers: config.servers,
    mpls: config.mpls,
    monitoring: config.monitoring
  };
  console.log('Configuración cargada desde config.json');
} catch (error) {
  console.log('No se pudo cargar config.json, usando configuración por defecto');
  // Configuración por defecto si no existe el archivo
  serversConfig = {
    servers: [
      {
        id: 'Servidor Conexion SAP Hanna',
        name: 'Servidor de conexion applicaciones SAP',
        ip: '10.238.83.84',
        services: [
          { name: 'Conexion SAP', port: 30015, type: 'HTTP' },
        ]
      },
      {
        id: 'Servidor RLABOGS-DB02',
        name: 'Servidor RLABOGS-DB02',
        ip: '10.10.1.252',
        services: [
          { name: 'Afiliaciones', port: 27732, type: 'HTTP' },
          { name: 'Payu', port: 8005, type: 'HTTP' },
          { name: 'API', port: 37834, type: 'HTTP' },
          { name: 'Portal Clientes', port: 8089, type: 'HTTP' }
        ]
      },
      {
        id: 'Servidor RLABOGS-APP',
        name: 'Servidor RLABOGS-APP',
        ip: '10.238.83.86',
        services: [
          { name: 'Portal Empleados', port: 8081, type: 'HTTP' },
          { name: 'Synergy', port: 443, type: 'HTTP' },

        ]
      },
      {
        id: 'Servidor de Impresion',
        name: 'Servidor de Impresion',
        ip: '10.10.0.30',
        services: [
          { name: 'Servicio de Impresion', port: 631, type: 'TCP' },
        ]
      }
    ],
    mpls: [
      {
        id: 'Bogotá',
        name: 'Bogotá',
        ip: '10.10.40.1',
        port: 443,
        location: 'Bogotá'
      },
      {
        id: 'San Felipe',
        name: 'San Felipe',
        ip: '10.10.41.1',
        port: 443,
        location: 'Bogotá Sede 2'
      },
      {
        id: 'Santander',
        name: 'Santander',
        ip: '10.10.103.1',
        port: 443,
        location: 'Bucaramanga'
      },
      {
        id: 'Valle del Cauca',
        name: 'Valle del Cauca',
        ip: '10.10.104.1',
        port: 443,
        location: 'Cali'
      },
      {
        id: 'Antioquia',
        name: 'Antioquia',
        ip: '10.10.105.1',
        port: 443,
        location: 'Medellín'
      },
      {
        id: 'Nariño',
        name: 'Nariño',
        ip: '10.10.106.1',
        port: 443,
        location: 'Pasto'
      },
      {
        id: 'Risaralda',
        name: 'Risaralda',
        ip: '10.10.107.1',
        port: 443,
        location: 'Pereira'
      },
      {
        id: 'Bolívar',
        name: 'Bolívar',
        ip: '10.10.109.1',
        port: 443,
        location: 'Cartagena'
      },
      {
        id: 'Caquetá',
        name: 'Caquetá',
        ip: '10.10.110.1',
        port: 443,
        location: 'Florencia'
      },
      {
        id: 'Tolima',
        name: 'Tolima',
        ip: '10.10.220.1',
        port: 443,
        location: 'Ibague'
      },
      {
        id: 'Putumayo',
        name: 'Putumayo',
        ip: '10.10.112.1',
        port: 443,
        location: 'Mocoa'
      },
      {
        id: 'Huila',
        name: 'Huila',
        ip: '10.10.113.1',
        port: 443,
        location: 'Neiva'
      },
      {
        id: 'Meta',
        name: 'Meta',
        ip: '10.10.119.1',
        port: 443,
        location: 'Villavicencio'
      },
      {
        id: 'Atlantico',
        name: 'Atlantico',
        ip: '10.10.120.1',
        port: 443,
        location: 'Barranquilla'
      }
    ],
    monitoring: {
      updateInterval: 30000,
      connectionTimeout: 5000,
      latencyThresholds: {
        good: 100,
        warning: 300
      }
    }
  };
}// Función para verificar conectividad y latencia
const checkConnection = (ip, port, timeout = serversConfig.monitoring?.connectionTimeout || 5000) => {
  return new Promise((resolve) => {
    const startTime = performance.now();
    const socket = new net.Socket();
    
    socket.setTimeout(timeout);
    
    socket.on('connect', () => {
      const latency = Math.round(performance.now() - startTime);
      socket.destroy();
      resolve({ 
        status: 'connected', 
        latency: latency,
        statusCode: getStatusByLatency(latency)
      });
    });
    
    socket.on('timeout', () => {
      socket.destroy();
      resolve({ 
        status: 'timeout', 
        latency: null,
        statusCode: 'red'
      });
    });
    
    socket.on('error', () => {
      socket.destroy();
      resolve({ 
        status: 'error', 
        latency: null,
        statusCode: 'red'
      });
    });
    
    socket.connect(port, ip);
  });
};

// Función para determinar el estado basado en la latencia
const getStatusByLatency = (latency) => {
  const thresholds = serversConfig.monitoring?.latencyThresholds || { good: 100, warning: 300 };
  if (latency < thresholds.good) return 'green';      // Verde
  if (latency < thresholds.warning) return 'yellow';   // Amarillo
  return 'red';                        // Rojo
};

// Endpoint para obtener el estado de todos los servidores
app.get('/api/servers/status', async (req, res) => {
  try {
    const serversStatus = await Promise.all(
      serversConfig.servers.map(async (server) => {
        const servicesStatus = await Promise.all(
          server.services.map(async (service) => {
            const result = await checkConnection(server.ip, service.port);
            return {
              name: service.name,
              type: service.type,
              status: result.statusCode,
              latency: result.latency
            };
          })
        );
        
        // Determinar el estado general del servidor
        const hasError = servicesStatus.some(s => s.status === 'red');
        const hasWarning = servicesStatus.some(s => s.status === 'yellow');
        
        let overallStatus = 'green';
        if (hasError) overallStatus = 'red';
        else if (hasWarning) overallStatus = 'yellow';
        
        // Calcular latencia promedio
        const validLatencies = servicesStatus.filter(s => s.latency !== null).map(s => s.latency);
        const avgLatency = validLatencies.length > 0 
          ? Math.round(validLatencies.reduce((a, b) => a + b, 0) / validLatencies.length)
          : null;
        
        return {
          id: server.id,
          name: server.name,
          status: overallStatus,
          latency: avgLatency,
          type: 'Servidor',
          services: servicesStatus
        };
      })
    );
    
    res.json(serversStatus);
  } catch (error) {
    res.status(500).json({ error: 'Error al verificar servidores' });
  }
});

// Endpoint para obtener el estado de MPLS nacionales
app.get('/api/mpls/status', async (req, res) => {
  try {
    const mplsStatus = await Promise.all(
      serversConfig.mpls.map(async (mpls) => {
        const result = await checkConnection(mpls.ip, mpls.port);
        return {
          id: mpls.id,
          name: mpls.name,
          status: result.statusCode,
          latency: result.latency,
          location: mpls.location
        };
      })
    );
    
    res.json(mplsStatus);
  } catch (error) {
    res.status(500).json({ error: 'Error al verificar MPLS' });
  }
});

// Endpoint para actualizar configuración de servidores
app.post('/api/config/servers', (req, res) => {
  try {
    serversConfig.servers = req.body;
    res.json({ message: 'Configuración de servidores actualizada' });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar configuración' });
  }
});

// Endpoint para actualizar configuración de MPLS
app.post('/api/config/mpls', (req, res) => {
  try {
    serversConfig.mpls = req.body;
    res.json({ message: 'Configuración de MPLS actualizada' });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar configuración' });
  }
});

// Endpoint para obtener configuración actual
app.get('/api/config', (req, res) => {
  res.json(serversConfig);
});

// Endpoint de salud
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Servidor backend ejecutándose en puerto ${PORT}`);
  console.log(`API disponible en: http://localhost:${PORT}/api`);
});

module.exports = app;
