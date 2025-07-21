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
        id: 'localhost',
        name: 'Servidor Local (Demo)',
        ip: '127.0.0.1',
        services: [
          { name: 'Backend API', port: 3001, type: 'HTTP' },
          { name: 'SSH', port: 22, type: 'SSH' }
        ]
      },
      {
        id: 'server1',
        name: 'Servidor Principal',
        ip: '192.168.1.100',
        services: [
          { name: 'Web Server', port: 80, type: 'HTTP' },
          { name: 'Database', port: 3306, type: 'MySQL' },
          { name: 'SSH', port: 22, type: 'SSH' },
          { name: 'FTP', port: 21, type: 'FTP' }
        ]
      },
      {
        id: 'server2',
        name: 'Servidor Backup',
        ip: '192.168.1.101',
        services: [
          { name: 'Web Server', port: 80, type: 'HTTP' },
          { name: 'Email Server', port: 25, type: 'SMTP' },
          { name: 'DNS', port: 53, type: 'DNS' }
        ]
      },
      {
        id: 'server3',
        name: 'Servidor Aplicaciones',
        ip: '192.168.1.102',
        services: [
          { name: 'API Gateway', port: 8080, type: 'HTTP' },
          { name: 'Redis Cache', port: 6379, type: 'Redis' },
          { name: 'MongoDB', port: 27017, type: 'MongoDB' }
        ]
      }
    ],
    mpls: [
      {
        id: 'antioquia',
        name: 'Antioquia',
        ip: '10.1.1.1',
        port: 443,
        location: 'Medellín'
      },
      {
        id: 'cundinamarca',
        name: 'Cundinamarca',
        ip: '10.1.2.1',
        port: 443,
        location: 'Bogotá'
      },
      {
        id: 'valle',
        name: 'Valle del Cauca',
        ip: '10.1.3.1',
        port: 443,
        location: 'Cali'
      },
      {
        id: 'atlantico',
        name: 'Atlántico',
        ip: '10.1.4.1',
        port: 443,
        location: 'Barranquilla'
      },
      {
        id: 'santander',
        name: 'Santander',
        ip: '10.1.5.1',
        port: 443,
        location: 'Bucaramanga'
      },
      {
        id: 'bolivar',
        name: 'Bolívar',
        ip: '10.1.6.1',
        port: 443,
        location: 'Cartagena'
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
