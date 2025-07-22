import React, { useState, useEffect } from 'react';
import { 
  Server, Activity, Wifi, AlertCircle, ChevronDown, ChevronRight, 
  RefreshCw, BarChart3, TrendingUp, Clock, Zap 
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, BarChart, Bar
} from 'recharts';
import Modal from 'react-modal';

Modal.setAppElement('#root');

const StatusIndicator = ({ status, isUpdating = false, compact = false }) => {
  const getStatusConfig = () => {
    switch(status) {
      case 'green':
        return { 
          color: 'bg-green-500', 
          text: 'Operativo', 
          pulse: '',
          textColor: 'text-green-700'
        };
      case 'yellow':
        return { 
          color: 'bg-yellow-500', 
          text: 'Latencia Alta', 
          pulse: '',
          textColor: 'text-yellow-700'
        };
      case 'red':
        return { 
          color: 'bg-red-500', 
          text: 'Sin conexión', 
          pulse: 'animate-pulse',
          textColor: 'text-red-700'
        };
      default:
        return { 
          color: 'bg-gray-400', 
          text: 'Verificando...', 
          pulse: 'animate-pulse',
          textColor: 'text-gray-700'
        };
    }
  };

  const { color, text, pulse, textColor } = getStatusConfig();

  if (compact) {
    return (
      <div className="flex items-center justify-center">
        <div className={`w-16 h-12 ${color} ${pulse} rounded-md border shadow-sm flex items-center justify-center ${isUpdating ? 'ring-2 ring-blue-300 ring-opacity-75' : ''} transition-all duration-300`}>
          <span className="text-white text-xs font-semibold">{text}</span>
          {isUpdating && (
            <div className="absolute -top-1 -right-1 w-3 h-3 border border-blue-500 border-t-transparent rounded-full animate-spin bg-white"></div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div className={`w-3 h-3 rounded-full ${color} ${pulse} ${isUpdating ? 'ring-2 ring-blue-300 ring-opacity-75' : ''} transition-all duration-300`}></div>
      <span className={`text-sm font-medium ${textColor}`}>{text}</span>
      {isUpdating && <div className="w-3 h-3 border border-blue-500 border-t-transparent rounded-full animate-spin"></div>}
    </div>
  );
};

const MetricsChart = ({ data, type = 'latency', title }) => {
  const formatXAxis = (tickItem) => {
    const date = new Date(tickItem);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getColor = () => {
    switch(type) {
      case 'latency': return '#3b82f6';
      case 'uptime': return '#10b981';
      case 'status': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  return (
    <div className="h-64">
      <h4 className="text-sm font-medium text-gray-700 mb-2">{title}</h4>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="timestamp" tickFormatter={formatXAxis} />
          <YAxis />
          <Tooltip 
            labelFormatter={(value) => new Date(value).toLocaleString()}
            formatter={(value, name) => [
              type === 'uptime' ? `${value}%` : `${value}ms`,
              name
            ]}
          />
          <Area
            type="monotone"
            dataKey={type}
            stroke={getColor()}
            fill={getColor()}
            fillOpacity={0.3}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

const MetricsModal = ({ isOpen, onClose, elementId, elementType, elementName }) => {
  const [metrics, setMetrics] = useState(null);
  const [timeRange, setTimeRange] = useState('1h');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && elementId) {
      fetchMetrics();
      const interval = setInterval(fetchMetrics, 10000);
      return () => clearInterval(interval);
    }
  }, [isOpen, elementId, timeRange]);

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:3001/api/metrics/${elementType}/${elementId}?timeRange=${timeRange}`);
      const data = await response.json();
      setMetrics(data);
    } catch (error) {
      console.error('Error obteniendo métricas:', error.message);
    }
    setLoading(false);
  };

  const timeRangeOptions = [
    { value: '15m', label: '15 minutos' },
    { value: '1h', label: '1 hora' },
    { value: '6h', label: '6 horas' },
    { value: '24h', label: '24 horas' }
  ];

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      className="max-w-6xl mx-auto mt-10 bg-white rounded-lg shadow-xl p-6 max-h-[90vh] overflow-y-auto"
      overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center p-4"
    >
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">📊 Métricas Avanzadas</h2>
          <p className="text-gray-600">{elementName}</p>
        </div>
        <div className="flex items-center gap-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-lg"
          >
            {timeRangeOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <button
            onClick={fetchMetrics}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
          >
            Cerrar
          </button>
        </div>
      </div>

      {loading && !metrics ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : metrics ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg border">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-gray-700">Latencia Promedio</span>
              </div>
              <div className="text-2xl font-bold text-blue-600">{metrics.summary.avgLatency}ms</div>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg border">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-gray-700">Disponibilidad</span>
              </div>
              <div className="text-2xl font-bold text-green-600">{metrics.summary.uptime}%</div>
            </div>
            
            <div className="bg-yellow-50 p-4 rounded-lg border">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
                <span className="text-sm font-medium text-gray-700">Latencia Máxima</span>
              </div>
              <div className="text-2xl font-bold text-yellow-600">{metrics.summary.maxLatency}ms</div>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg border">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-medium text-gray-700">Puntos de Datos</span>
              </div>
              <div className="text-2xl font-bold text-purple-600">{metrics.summary.totalPoints}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-4 border rounded-lg">
              <MetricsChart 
                data={metrics.data} 
                type="latency" 
                title="📈 Latencia en el Tiempo"
              />
            </div>
            
            <div className="bg-white p-4 border rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 mb-2">🔄 Estado de Conexión</h4>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={metrics.data.slice(-20)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="timestamp" 
                    tickFormatter={(value) => new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  />
                  <YAxis />
                  <Tooltip 
                    labelFormatter={(value) => new Date(value).toLocaleString()}
                    formatter={(value) => [value === 'green' ? 'Operativo' : value === 'yellow' ? 'Advertencia' : 'Error', 'Estado']}
                  />
                  <Bar 
                    dataKey="status" 
                    fill={(entry) => entry === 'green' ? '#10b981' : entry === 'yellow' ? '#f59e0b' : '#ef4444'}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white border rounded-lg overflow-hidden">
            <h4 className="text-lg font-medium text-gray-800 p-4 border-b bg-gray-50">
              📋 Datos Recientes
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-gray-700">Timestamp</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-700">Estado</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-700">Latencia</th>
                    {elementType === 'servers' && (
                      <th className="px-4 py-3 text-left font-medium text-gray-700">Servicios</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {metrics.data.slice(-10).reverse().map((point, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3">{new Date(point.timestamp).toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <StatusIndicator status={point.status} />
                      </td>
                      <td className="px-4 py-3">{point.latency ? `${point.latency}ms` : 'N/A'}</td>
                      {elementType === 'servers' && (
                        <td className="px-4 py-3">
                          {point.operationalServices !== undefined ? 
                            `${point.operationalServices}/${point.servicesCount} operativos` : 
                            'Ping directo'}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center text-gray-500 py-8">
          No hay datos de métricas disponibles
        </div>
      )}
    </Modal>
  );
};

const ServiceItem = ({ service, isUpdating = false }) => {
  return (
    <div className={`flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-all duration-300 ${isUpdating ? 'ring-1 ring-blue-300' : ''} shadow-sm`}>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-800">{service.name}</span>
        </div>
        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
          {service.type}
        </span>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-gray-600">
          <span className="text-sm font-medium">
            {service.latency ? `${service.latency}ms` : 'Midiendo...'}
          </span>
        </div>
        <StatusIndicator status={service.status} isUpdating={isUpdating} compact={true} />
      </div>
    </div>
  );
};

const ServerCard = ({ server, isUpdating = false }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showMetrics, setShowMetrics] = useState(false);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const getMonitoringInfo = () => {
    if (server.monitoringType === 'ping') {
      return {
        type: 'Ping del Servidor',
        icon: '🏓',
        description: 'Latencia medida por ping ICMP'
      };
    } else if (server.monitoringType === 'services') {
      return {
        type: 'Servicios TCP',
        icon: '🔌',
        description: 'Latencia medida por conexiones TCP'
      };
    } else {
      return {
        type: 'Verificando...',
        icon: '⏳',
        description: 'Determinando método de monitoreo'
      };
    }
  };

  const monitoringInfo = getMonitoringInfo();

  return (
    <div className={`bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-all duration-300 ${isUpdating ? 'ring-2 ring-blue-300 ring-opacity-50' : ''} overflow-hidden`}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <Server className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">{server.name}</h3>
              <p className="text-sm text-gray-500">ID: {server.id}</p>
            </div>
          </div>
          <StatusIndicator status={server.status} isUpdating={isUpdating} compact={true} />
        </div>
        
        <div className="space-y-3 mb-4">
          <div className="flex items-center gap-2 text-gray-600">
            <Activity className="w-4 h-4" />
            <span className="text-sm">
              {server.latency ? `${server.latency}ms` : 'Midiendo latencia...'}
            </span>
          </div>
          
          <div className="flex items-center gap-2 text-gray-600">
            <span className="text-sm">{monitoringInfo.icon}</span>
            <span className="text-sm font-medium">{monitoringInfo.type}</span>
          </div>
          
          <div className="flex items-center gap-2 text-gray-500">
            <span className="text-xs">{monitoringInfo.description}</span>
          </div>
          
          {server.services && server.services.length > 0 && (
            <div className="flex items-center gap-2 text-gray-600">
              <span className="text-sm font-medium">
                {server.services.length} servicio{server.services.length !== 1 ? 's' : ''} monitoreado{server.services.length !== 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          {server.services && server.services.length > 0 && (
            <button
              onClick={toggleExpanded}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium border border-gray-300"
            >
              {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              {isExpanded ? 'Ocultar' : 'Ver'} Servicios
            </button>
          )}
          
          <button
            onClick={() => setShowMetrics(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium border border-blue-300"
          >
            <BarChart3 className="w-4 h-4" />
            Métricas
          </button>
          
          {server.monitoringType === 'ping' && (
            <div className="flex items-center gap-2 px-3 py-2 bg-green-50 text-green-700 rounded-lg text-sm border border-green-200">
              <span>🏓</span>
              <span>Solo Ping</span>
            </div>
          )}
        </div>
      </div>

      {isExpanded && server.services && server.services.length > 0 && (
        <div className="px-6 pb-6 border-t border-gray-100 bg-gray-50">
          <div className="pt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Servicios Activos
            </h4>
            <div className="space-y-3">
              {server.services.map((service, index) => (
                <ServiceItem key={index} service={service} isUpdating={isUpdating} />
              ))}
            </div>
          </div>
        </div>
      )}

      <MetricsModal
        isOpen={showMetrics}
        onClose={() => setShowMetrics(false)}
        elementId={server.id}
        elementType="servers"
        elementName={server.name}
      />
    </div>
  );
};

const MplsCard = ({ mpls, isUpdating = false }) => {
  const [showMetrics, setShowMetrics] = useState(false);

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-all duration-300 ${isUpdating ? 'ring-2 ring-blue-300 ring-opacity-50' : ''} overflow-hidden`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
            <Wifi className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">{mpls.name}</h3>
            <p className="text-sm text-gray-500">Región: {mpls.location}</p>
          </div>
        </div>
        <StatusIndicator status={mpls.status} isUpdating={isUpdating} compact={true} />
      </div>
      
      <div className="space-y-3 mb-4">
        <div className="flex items-center gap-2 text-gray-600">
          <Activity className="w-4 h-4" />
          <span className="text-sm">
            {mpls.latency ? `${mpls.latency}ms` : 'Midiendo latencia...'}
          </span>
        </div>
        <div className="flex items-center gap-2 text-gray-600">
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm">Conexión MPLS</span>
        </div>
      </div>

      <button
        onClick={() => setShowMetrics(true)}
        className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm font-medium border border-purple-300"
      >
        <BarChart3 className="w-4 h-4" />
        Ver Métricas
      </button>

      <MetricsModal
        isOpen={showMetrics}
        onClose={() => setShowMetrics(false)}
        elementId={mpls.id}
        elementType="mpls"
        elementName={mpls.name}
      />
    </div>
  );
};

const TabButton = ({ active, onClick, children, icon: Icon }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
      active
        ? 'bg-blue-600 text-white shadow-md'
        : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-300'
    }`}
  >
    <Icon className="w-5 h-5" />
    {children}
  </button>
);

const StatusSummaryCard = ({ title, value, color, isUpdating }) => {
  const getColorClasses = () => {
    switch(color) {
      case 'green':
        return {
          text: 'text-green-600',
          ring: 'ring-green-300'
        };
      case 'yellow':
        return {
          text: 'text-yellow-600',
          ring: 'ring-yellow-300'
        };
      case 'red':
        return {
          text: 'text-red-600',
          ring: 'ring-red-300'
        };
      default:
        return {
          text: 'text-gray-600',
          ring: 'ring-gray-300'
        };
    }
  };

  const colors = getColorClasses();

  return (
    <div className={`bg-white p-4 rounded-lg shadow border border-gray-200 transition-all duration-300 ${isUpdating ? `ring-1 ${colors.ring}` : ''}`}>
      <div className={`text-2xl font-bold ${colors.text}`}>{value}</div>
      <div className="text-sm text-gray-600">{title}</div>
    </div>
  );
};

const ServerMonitor = () => {
  const [servers, setServers] = useState([]);
  const [mplsConnections, setMplsConnections] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [activeTab, setActiveTab] = useState('servers');
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchServerStatus = async (silent = false) => {
    try {
      if (!silent) setIsUpdating(true);
      
      const response = await fetch('http://localhost:3001/api/servers/status');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      
      setServers(data);
      setError(null);
    } catch (error) {
      if (!silent) {
        setError('No se pudo conectar con el servidor backend: ' + error.message);
      }
    } finally {
      if (!silent) setIsUpdating(false);
    }
  };

  const fetchMplsStatus = async (silent = false) => {
    try {
      const response = await fetch('http://localhost:3001/api/mpls/status');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      
      setMplsConnections(data);
      setError(null);
    } catch (error) {
      if (!silent) {
        setError('No se pudo conectar con el servidor backend: ' + error.message);
      }
    }
  };

  const refreshData = async (silent = false) => {
    if (!silent) setIsUpdating(true);
    setError(null);
    
    await Promise.all([
      fetchServerStatus(silent), 
      fetchMplsStatus(silent)
    ]);
    
    setLastUpdate(new Date());
    if (!silent) setIsUpdating(false);
  };

  const handleManualRefresh = () => {
    refreshData(false);
  };

  useEffect(() => {
    const initialLoad = async () => {
      setIsLoading(true);
      await refreshData(false);
      setIsLoading(false);
    };

    initialLoad();

    const interval = setInterval(() => {
      refreshData(true);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-xl shadow-lg border border-gray-200">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Cargando monitor de infraestructura...</p>
        </div>
      </div>
    );
  }

  if (error && servers.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="p-6 bg-white border border-red-200 rounded-xl shadow-lg">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-red-800 mb-2">Error de Conexión</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <button 
              onClick={handleManualRefresh}
              disabled={isUpdating}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 font-medium"
            >
              {isUpdating ? 'Reintentando...' : 'Reintentar'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const getStatusSummary = (data) => {
    const total = data.length;
    const operational = data.filter(item => item.status === 'green').length;
    const warning = data.filter(item => item.status === 'yellow').length;
    const error = data.filter(item => item.status === 'red').length;
    
    return { total, operational, warning, error };
  };

  const serverStats = getStatusSummary(servers);
  const mplsStats = getStatusSummary(mplsConnections);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-3">
            📊 Monitor de Infraestructura Corporativa
          </h1>
          <div className="flex items-center justify-center gap-6 flex-wrap">
            <p className="text-gray-600 bg-white px-3 py-1 rounded-lg border border-gray-300 shadow-sm">
              Última actualización: {lastUpdate.toLocaleTimeString()}
            </p>
            <button 
              onClick={handleManualRefresh}
              disabled={isUpdating}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 text-sm disabled:opacity-50 font-medium shadow-md hover:shadow-lg"
            >
              <RefreshCw className={`w-4 h-4 ${isUpdating ? 'animate-spin' : ''}`} />
              {isUpdating ? 'Actualizando...' : 'Actualizar Ahora'}
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg shadow-sm">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
              <span className="text-yellow-800 font-medium">Advertencia: {error}</span>
            </div>
          </div>
        )}

        <div className="mb-8">
          <div className="flex justify-center gap-4">
            <TabButton
              active={activeTab === 'servers'}
              onClick={() => setActiveTab('servers')}
              icon={Server}
            >
              Servidores ({serverStats.total})
            </TabButton>
            <TabButton
              active={activeTab === 'mpls'}
              onClick={() => setActiveTab('mpls')}
              icon={Wifi}
            >
              MPLS Nacionales ({mplsStats.total})
            </TabButton>
          </div>
        </div>

        <div className="mb-8">
          {activeTab === 'servers' && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <StatusSummaryCard title="Total Servidores" value={serverStats.total} color="gray" isUpdating={isUpdating} />
              <StatusSummaryCard title="Operativos" value={serverStats.operational} color="green" isUpdating={isUpdating} />
              <StatusSummaryCard title="Con Advertencias" value={serverStats.warning} color="yellow" isUpdating={isUpdating} />
              <StatusSummaryCard title="Con Errores" value={serverStats.error} color="red" isUpdating={isUpdating} />
            </div>
          )}
          
          {activeTab === 'mpls' && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <StatusSummaryCard title="Total Conexiones" value={mplsStats.total} color="gray" isUpdating={isUpdating} />
              <StatusSummaryCard title="Operativas" value={mplsStats.operational} color="green" isUpdating={isUpdating} />
              <StatusSummaryCard title="Con Advertencias" value={mplsStats.warning} color="yellow" isUpdating={isUpdating} />
              <StatusSummaryCard title="Con Errores" value={mplsStats.error} color="red" isUpdating={isUpdating} />
            </div>
          )}
        </div>

        {activeTab === 'servers' && (
          <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <Server className="w-6 h-6 text-blue-600" />
              Servidores y Servicios
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {servers.map((server, index) => (
                <ServerCard 
                  key={server.id || index} 
                  server={server} 
                  isUpdating={isUpdating}
                />
              ))}
            </div>
          </div>
        )}

        {activeTab === 'mpls' && (
          <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <Wifi className="w-6 h-6 text-purple-600" />
              Conexiones MPLS Nacionales
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mplsConnections.map((mpls, index) => (
                <MplsCard 
                  key={mpls.id || index} 
                  mpls={mpls} 
                  isUpdating={isUpdating}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ServerMonitor;
