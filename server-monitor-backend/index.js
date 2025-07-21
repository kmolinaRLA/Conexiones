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

// Almacenamiento en memoria para métricas históricas
const metricsHistory = {
  servers: new Map(),
  mpls: new Map()
};

// Función para agregar métrica histórica
const addMetricToHistory = (type, id, metric) => {
  const key = `${type}-${id}`;
  if (!metricsHistory[type].has(key)) {
    metricsHistory[type].set(key, []);
  }
  
  const history = metricsHistory[type].get(key);
  history.push({
    timestamp: new Date(),
    ...metric
  });
  
  // Mantener solo las últimas 100 entradas (aprox. 50 minutos)
  if (history.length > 100) {
    history.shift();
  }
};

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
        id: 'servidor-sap-hanna',
        name: 'Servidor de conexión aplicaciones SAP',
        ip: '10.238.83.84',
        services: [
          { name: 'Conexión SAP', port: 30015, type: 'SAP' },
        ]
      },
      {
        id: 'servidor-rlabogs-db02',
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
        id: 'servidor-rlabogs-app',
        name: 'Servidor RLABOGS-APP',
        ip: '10.238.83.86',
        services: [
          { name: 'Portal Empleados', port: 8081, type: 'HTTP' },
          { name: 'Synergy', port: 443, type: 'HTTPS' },
        ]
      },
      {
        id: 'servidor-impresion',
        name: 'Servidor de Impresión',
        ip: '10.10.0.30',
        services: [
          { name: 'Servicio de Impresión', port: 631, type: 'TCP' },
        ]
      }
    ],
    mpls: [
      {
        id: 'bogota',
        name: 'Bogotá Principal',
        ip: '10.10.40.1',
        port: 443,
        location: 'Bogotá'
      },
      {
        id: 'san-felipe',
        name: 'San Felipe',
        ip: '10.10.41.1',
        port: 443,
        location: 'Bogotá Sede 2'
      },
      {
        id: 'santander',
        name: 'Santander',
        ip: '10.10.103.1',
        port: 443,
        location: 'Bucaramanga'
      },
      {
        id: 'valle-del-cauca',
        name: 'Valle del Cauca',
        ip: '10.10.104.1',
        port: 443,
        location: 'Cali'
      },
      {
        id: 'antioquia',
        name: 'Antioquia',
        ip: '10.10.105.1',
        port: 443,
        location: 'Medellín'
      },
      {
        id: 'narino',
        name: 'Nariño',
        ip: '10.10.106.1',
        port: 443,
        location: 'Pasto'
      },
      {
        id: 'risaralda',
        name: 'Risaralda',
        ip: '10.10.107.1',
        port: 443,
        location: 'Pereira'
      },
      {
        id: 'bolivar',
        name: 'Bolívar',
        ip: '10.10.109.1',
        port: 443,
        location: 'Cartagena'
      },
      {
        id: 'caqueta',
        name: 'Caquetá',
        ip: '10.10.110.1',
        port: 443,
        location: 'Florencia'
      },
      {
        id: 'tolima',
        name: 'Tolima',
        ip: '10.10.220.1',
        port: 443,
        location: 'Ibagué'
      },
      {
        id: 'putumayo',
        name: 'Putumayo',
        ip: '10.10.112.1',
        port: 443,
        location: 'Mocoa'
      },
      {
        id: 'huila',
        name: 'Huila',
        ip: '10.10.113.1',
        port: 443,
        location: 'Neiva'
      },
      {
        id: 'meta',
        name: 'Meta',
        ip: '10.10.119.1',
        port: 443,
        location: 'Villavicencio'
      },
      {
        id: 'atlantico',
        name: 'Atlántico',
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
}

// Función para verificar conectividad y latencia
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
  if (latency < thresholds.good) return 'green';
  if (latency < thresholds.warning) return 'yellow';
  return 'red';
};

// Endpoint para obtener el estado de todos los servidores
app.get('/api/servers/status', async (req, res) => {
  try {
    const serversStatus = await Promise.all(
      serversConfig.servers.map(async (server) => {
        const servicesStatus = await Promise.all(
          server.services.map(async (service) => {
            const result = await checkConnection(server.ip, service.port);
            
            // Agregar métrica histórica para el servicio
            addMetricToHistory('servers', `${server.id}-${service.name}`, {
              latency: result.latency,
              status: result.statusCode,
              service: service.name
            });
            
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
        
        // Agregar métrica histórica para el servidor
        addMetricToHistory('servers', server.id, {
          latency: avgLatency,
          status: overallStatus,
          servicesCount: servicesStatus.length,
          operationalServices: servicesStatus.filter(s => s.status === 'green').length
        });
        
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
    console.error('Error al verificar servidores:', error);
    res.status(500).json({ error: 'Error al verificar servidores' });
  }
});

// Endpoint para obtener el estado de MPLS nacionales
app.get('/api/mpls/status', async (req, res) => {
  try {
    const mplsStatus = await Promise.all(
      serversConfig.mpls.map(async (mpls) => {
        const result = await checkConnection(mpls.ip, mpls.port);
        
        // Agregar métrica histórica para MPLS
        addMetricToHistory('mpls', mpls.id, {
          latency: result.latency,
          status: result.statusCode,
          location: mpls.location
        });
        
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
    console.error('Error al verificar MPLS:', error);
    res.status(500).json({ error: 'Error al verificar MPLS' });
  }
});

// Endpoint para obtener métricas históricas
app.get('/api/metrics/:type/:id', (req, res) => {
  try {
    const { type, id } = req.params;
    const { timeRange = '1h' } = req.query;
    
    if (!['servers', 'mpls'].includes(type)) {
      return res.status(400).json({ error: 'Tipo inválido' });
    }
    
    const key = `${type}-${id}`;
    const history = metricsHistory[type].get(key) || [];
    
    // Filtrar por rango de tiempo
    let filteredHistory = history;
    const now = new Date();
    
    switch (timeRange) {
      case '15m':
        filteredHistory = history.filter(h => now - h.timestamp <= 15 * 60 * 1000);
        break;
      case '1h':
        filteredHistory = history.filter(h => now - h.timestamp <= 60 * 60 * 1000);
        break;
      case '6h':
        filteredHistory = history.filter(h => now - h.timestamp <= 6 * 60 * 60 * 1000);
        break;
      case '24h':
        filteredHistory = history.filter(h => now - h.timestamp <= 24 * 60 * 60 * 1000);
        break;
    }
    
    res.json({
      id,
      type,
      timeRange,
      data: filteredHistory,
      summary: {
        totalPoints: filteredHistory.length,
        avgLatency: filteredHistory.length > 0 
          ? Math.round(filteredHistory.reduce((acc, curr) => acc + (curr.latency || 0), 0) / filteredHistory.length)
          : 0,
        maxLatency: filteredHistory.length > 0 
          ? Math.max(...filteredHistory.map(h => h.latency || 0))
          : 0,
        minLatency: filteredHistory.length > 0 
          ? Math.min(...filteredHistory.filter(h => h.latency !== null).map(h => h.latency))
          : 0,
        uptime: filteredHistory.length > 0 
          ? Math.round((filteredHistory.filter(h => h.status === 'green').length / filteredHistory.length) * 100)
          : 0
      }
    });
  } catch (error) {
    console.error('Error al obtener métricas:', error);
    res.status(500).json({ error: 'Error al obtener métricas' });
  }
});

// Endpoint para obtener resumen de métricas de todos los elementos
app.get('/api/metrics/summary', (req, res) => {
  try {
    const summary = {
      servers: [],
      mpls: []
    };
    
    // Resumen de servidores
    serversConfig.servers.forEach(server => {
      const key = `servers-${server.id}`;
      const history = metricsHistory.servers.get(key) || [];
      const recent = history.slice(-10); // Últimos 10 puntos
      
      summary.servers.push({
        id: server.id,
        name: server.name,
        currentStatus: recent.length > 0 ? recent[recent.length - 1].status : 'unknown',
        avgLatency: recent.length > 0 
          ? Math.round(recent.reduce((acc, curr) => acc + (curr.latency || 0), 0) / recent.length)
          : 0,
        uptime: recent.length > 0 
          ? Math.round((recent.filter(h => h.status === 'green').length / recent.length) * 100)
          : 0
      });
    });
    
    // Resumen de MPLS
    serversConfig.mpls.forEach(mpls => {
      const key = `mpls-${mpls.id}`;
      const history = metricsHistory.mpls.get(key) || [];
      const recent = history.slice(-10);
      
      summary.mpls.push({
        id: mpls.id,
        name: mpls.name,
        location: mpls.location,
        currentStatus: recent.length > 0 ? recent[recent.length - 1].status : 'unknown',
        avgLatency: recent.length > 0 
          ? Math.round(recent.reduce((acc, curr) => acc + (curr.latency || 0), 0) / recent.length)
          : 0,
        uptime: recent.length > 0 
          ? Math.round((recent.filter(h => h.status === 'green').length / recent.length) * 100)
          : 0
      });
    });
    
    res.json(summary);
  } catch (error) {
    console.error('Error al obtener resumen de métricas:', error);
    res.status(500).json({ error: 'Error al obtener resumen de métricas' });
  }
});

// Resto de endpoints...
app.post('/api/config/servers', (req, res) => {
  try {
    serversConfig.servers = req.body;
    res.json({ message: 'Configuración de servidores actualizada' });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar configuración' });
  }
});

app.post('/api/config/mpls', (req, res) => {
  try {
    serversConfig.mpls = req.body;
    res.json({ message: 'Configuración de MPLS actualizada' });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar configuración' });
  }
});

app.get('/api/config', (req, res) => {
  res.json(serversConfig);
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Servidor backend ejecutándose en puerto ${PORT}`);
  console.log(`API disponible en: http://localhost:${PORT}/api`);
  console.log(`Servidores configurados: ${serversConfig.servers.length}`);
  console.log(`MPLS configurados: ${serversConfig.mpls.length}`);
});

module.exports = app;
