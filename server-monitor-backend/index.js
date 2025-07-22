const express = require('express');
const cors = require('cors');
const net = require('net');
const fs = require('fs');
const path = require('path');
const { performance } = require('perf_hooks');
const { exec } = require('child_process');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Cargar configuración
let config;
try {
  const configPath = path.join(__dirname, '../config.json');
  config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  console.log('✅ Configuración cargada:', config.servers.length, 'servidores,', config.mpls.length, 'MPLS');
} catch (error) {
  console.error('❌ Error cargando configuración:', error.message);
  process.exit(1);
}

// Almacenamiento en memoria para métricas históricas
const metricsStorage = {
  servers: {},
  mpls: {}
};

// Inicializar almacenamiento para cada elemento
config.servers.forEach(server => {
  metricsStorage.servers[server.id] = [];
});

config.mpls.forEach(mpls => {
  metricsStorage.mpls[mpls.id] = [];
});

// Función para almacenar métricas
const storeMetrics = (type, id, data) => {
  const storage = metricsStorage[type][id];
  if (!storage) return;

  const metric = {
    timestamp: new Date().toISOString(),
    status: data.status,
    latency: data.latency,
    error: data.error,
    monitoringType: data.monitoringType || 'unknown'
  };

  if (type === 'servers' && data.services) {
    metric.operationalServices = data.services.filter(s => s.status === 'green').length;
    metric.servicesCount = data.services.length;
  }

  storage.push(metric);

  if (storage.length > 1000) {
    storage.splice(0, storage.length - 1000);
  }
};

// Función para hacer ping real
const pingServer = (ip, timeout = 3000) => {
  return new Promise((resolve) => {
    const startTime = performance.now();
    const pingCommand = `ping -n 1 -w ${timeout} ${ip}`;
    
    exec(pingCommand, (error, stdout, stderr) => {
      const latency = Math.round(performance.now() - startTime);
      
      if (error) {
        resolve({
          status: 'red',
          latency: null,
          error: 'Ping failed',
          method: 'ping'
        });
        return;
      }

      const match = stdout.match(/tiempo[<=](\d+)ms/i) || stdout.match(/time[<=](\d+)ms/i);
      const pingLatency = match ? parseInt(match[1]) : latency;

      let status = 'green';
      if (pingLatency > config.monitoring.latencyThresholds.warning) {
        status = 'yellow';
      } else if (pingLatency > config.monitoring.latencyThresholds.good) {
        status = 'yellow';
      }

      resolve({
        status,
        latency: pingLatency,
        error: null,
        method: 'ping'
      });
    });
  });
};

// Función para verificar conexión TCP
const checkConnection = (ip, port, timeout = 3000) => {
  return new Promise((resolve) => {
    const startTime = performance.now();
    const socket = new net.Socket();
    
    const onError = () => {
      socket.destroy();
      resolve({
        status: 'red',
        latency: null,
        error: 'Connection failed',
        method: 'tcp'
      });
    };

    const onTimeout = () => {
      socket.destroy();
      resolve({
        status: 'red',
        latency: null,
        error: 'Timeout',
        method: 'tcp'
      });
    };

    socket.setTimeout(timeout);
    socket.on('timeout', onTimeout);
    socket.on('error', onError);

    socket.connect(port, ip, () => {
      const latency = Math.round(performance.now() - startTime);
      socket.destroy();
      
      let status = 'green';
      if (latency > config.monitoring.latencyThresholds.warning) {
        status = 'yellow';
      } else if (latency > config.monitoring.latencyThresholds.good) {
        status = 'yellow';
      }
      
      resolve({
        status,
        latency,
        error: null,
        method: 'tcp'
      });
    });
  });
};

// Función para verificar estado de un servidor
const checkServerStatus = async (server) => {
  const serverStatus = {
    id: server.id,
    name: server.name,
    ip: server.ip,
    type: 'Servidor',
    services: [],
    status: 'green',
    latency: 0,
    timestamp: new Date().toISOString(),
    monitoringType: 'unknown'
  };

  if (!server.services || server.services.length === 0) {
    const result = await pingServer(server.ip, config.monitoring.connectionTimeout);
    
    serverStatus.status = result.status;
    serverStatus.latency = result.latency;
    serverStatus.monitoringType = 'ping';
    serverStatus.error = result.error;
    
    storeMetrics('servers', server.id, serverStatus);
    return serverStatus;
  }

  const serviceResults = await Promise.all(
    server.services.map(async (service) => {
      const result = await checkConnection(server.ip, service.port, config.monitoring.connectionTimeout);
      return {
        name: service.name,
        port: service.port,
        type: service.type,
        status: result.status,
        latency: result.latency,
        error: result.error
      };
    })
  );

  serverStatus.services = serviceResults;
  serverStatus.monitoringType = 'services';

  const operationalServices = serviceResults.filter(s => s.status === 'green').length;
  const warningServices = serviceResults.filter(s => s.status === 'yellow').length;
  const errorServices = serviceResults.filter(s => s.status === 'red').length;

  if (errorServices > 0) {
    serverStatus.status = 'red';
  } else if (warningServices > 0) {
    serverStatus.status = 'yellow';
  } else {
    serverStatus.status = 'green';
  }

  const validLatencies = serviceResults.filter(s => s.latency !== null).map(s => s.latency);
  serverStatus.latency = validLatencies.length > 0 
    ? Math.round(validLatencies.reduce((a, b) => a + b, 0) / validLatencies.length)
    : null;

  storeMetrics('servers', server.id, serverStatus);
  return serverStatus;
};

// Función para verificar estado de MPLS
const checkMplsStatus = async (mpls) => {
  const result = await checkConnection(mpls.ip, mpls.port, config.monitoring.connectionTimeout);
  
  const mplsStatus = {
    id: mpls.id,
    name: mpls.name,
    ip: mpls.ip,
    port: mpls.port,
    location: mpls.location,
    status: result.status,
    latency: result.latency,
    error: result.error,
    timestamp: new Date().toISOString(),
    monitoringType: 'tcp'
  };

  storeMetrics('mpls', mpls.id, mplsStatus);
  return mplsStatus;
};

// Rutas API principales
app.get('/api/servers/status', async (req, res) => {
  try {
    const results = await Promise.all(
      config.servers.map(server => checkServerStatus(server))
    );
    res.json(results);
  } catch (error) {
    console.error('❌ Error verificando servidores:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/mpls/status', async (req, res) => {
  try {
    const results = await Promise.all(
      config.mpls.map(mpls => checkMplsStatus(mpls))
    );
    res.json(results);
  } catch (error) {
    console.error('❌ Error verificando MPLS:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Rutas para métricas
app.get('/api/metrics/:type/:id', (req, res) => {
  try {
    const { type, id } = req.params;
    const { timeRange = '1h' } = req.query;

    if (!metricsStorage[type] || !metricsStorage[type][id]) {
      return res.status(404).json({ error: 'Elemento no encontrado' });
    }

    const now = new Date();
    let startTime;

    switch (timeRange) {
      case '15m':
        startTime = new Date(now.getTime() - 15 * 60 * 1000);
        break;
      case '1h':
        startTime = new Date(now.getTime() - 60 * 60 * 1000);
        break;
      case '6h':
        startTime = new Date(now.getTime() - 6 * 60 * 60 * 1000);
        break;
      case '24h':
        startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      default:
        startTime = new Date(now.getTime() - 60 * 60 * 1000);
    }

    const metrics = metricsStorage[type][id].filter(metric => 
      new Date(metric.timestamp) >= startTime
    );

    const validLatencies = metrics.filter(m => m.latency !== null).map(m => m.latency);
    const uptime = metrics.length > 0 ? 
      Math.round((metrics.filter(m => m.status === 'green').length / metrics.length) * 100) : 0;

    const summary = {
      avgLatency: validLatencies.length > 0 ? 
        Math.round(validLatencies.reduce((a, b) => a + b, 0) / validLatencies.length) : 0,
      maxLatency: validLatencies.length > 0 ? Math.max(...validLatencies) : 0,
      minLatency: validLatencies.length > 0 ? Math.min(...validLatencies) : 0,
      uptime: uptime,
      totalPoints: metrics.length,
      timeRange: timeRange
    };

    res.json({
      summary,
      data: metrics.map(metric => ({
        timestamp: metric.timestamp,
        latency: metric.latency,
        status: metric.status,
        operationalServices: metric.operationalServices,
        servicesCount: metric.servicesCount
      }))
    });

  } catch (error) {
    console.error('❌ Error obteniendo métricas:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/metrics/summary', (req, res) => {
  try {
    const summary = {
      servers: {},
      mpls: {},
      totalDataPoints: 0
    };

    Object.keys(metricsStorage.servers).forEach(serverId => {
      const metrics = metricsStorage.servers[serverId];
      const recentMetrics = metrics.slice(-10);
      
      summary.servers[serverId] = {
        totalPoints: metrics.length,
        recentAvgLatency: recentMetrics.length > 0 ? 
          Math.round(recentMetrics.filter(m => m.latency).reduce((a, b) => a + (b.latency || 0), 0) / recentMetrics.filter(m => m.latency).length) || 0 : 0,
        currentStatus: recentMetrics.length > 0 ? recentMetrics[recentMetrics.length - 1].status : 'unknown'
      };
      summary.totalDataPoints += metrics.length;
    });

    Object.keys(metricsStorage.mpls).forEach(mplsId => {
      const metrics = metricsStorage.mpls[mplsId];
      const recentMetrics = metrics.slice(-10);
      
      summary.mpls[mplsId] = {
        totalPoints: metrics.length,
        recentAvgLatency: recentMetrics.length > 0 ? 
          Math.round(recentMetrics.filter(m => m.latency).reduce((a, b) => a + (b.latency || 0), 0) / recentMetrics.filter(m => m.latency).length) || 0 : 0,
        currentStatus: recentMetrics.length > 0 ? recentMetrics[recentMetrics.length - 1].status : 'unknown'
      };
      summary.totalDataPoints += metrics.length;
    });

    res.json(summary);
  } catch (error) {
    console.error('❌ Error obteniendo resumen:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/health', (req, res) => {
  const totalMetrics = Object.values(metricsStorage.servers).reduce((sum, arr) => sum + arr.length, 0) +
                      Object.values(metricsStorage.mpls).reduce((sum, arr) => sum + arr.length, 0);

  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    config: {
      servers: config.servers.length,
      mpls: config.mpls.length,
      updateInterval: config.monitoring.updateInterval,
      connectionTimeout: config.monitoring.connectionTimeout
    },
    metrics: {
      totalStored: totalMetrics,
      serversWithMetrics: Object.keys(metricsStorage.servers).length,
      mplsWithMetrics: Object.keys(metricsStorage.mpls).length
    }
  });
});

app.get('/api/config', (req, res) => {
  res.json({
    monitoring: config.monitoring,
    serverCount: config.servers.length,
    mplsCount: config.mpls.length
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Monitor ejecutándose en puerto ${PORT}`);
  console.log(`📊 Métricas: http://localhost:${PORT}/api/health`);
});
