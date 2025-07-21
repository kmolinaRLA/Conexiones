import React, { useState, useEffect } from 'react';
import { Server, Activity, Wifi, AlertCircle, ChevronDown, ChevronRight } from 'lucide-react';

const StatusIndicator = ({ status }) => {
  const getStatusConfig = () => {
    switch(status) {
      case 'green':
        return { color: 'bg-green-500', text: 'Operativo' };
      case 'yellow':
        return { color: 'bg-yellow-500', text: 'Latencia Alta' };
      case 'red':
        return { color: 'bg-red-500', text: 'Sin conexión' };
      default:
        return { color: 'bg-gray-400', text: 'Verificando...' };
    }
  };

  const { color, text } = getStatusConfig();

  return (
    <div className="flex items-center gap-2">
      <div className={`w-3 h-3 rounded-full ${color}`}></div>
      <span className="text-sm font-medium text-gray-700">{text}</span>
    </div>
  );
};

const ServiceItem = ({ service }) => {
  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-800">{service.name}</span>
        </div>
        <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">
          {service.type}
        </span>
      </div>
      
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-gray-600">
          <span className="text-sm">
            {service.latency ? `${service.latency}ms` : 'Midiendo...'}
          </span>
        </div>
        <StatusIndicator status={service.status} />
      </div>
    </div>
  );
};

const ServerCard = ({ server }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
      {/* Header del servidor - clickeable */}
      <div 
        className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={toggleExpanded}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Server className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800">{server.name}</h3>
            <div className="flex items-center">
              {isExpanded ? (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronRight className="w-5 h-5 text-gray-400" />
              )}
            </div>
          </div>
          <StatusIndicator status={server.status} />
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-gray-600">
            <Activity className="w-4 h-4" />
            <span className="text-sm">
              {server.latency ? `${server.latency}ms promedio` : 'Midiendo...'}
            </span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Wifi className="w-4 h-4" />
            <span className="text-sm">{server.type}</span>
          </div>
          {server.services && (
            <div className="flex items-center gap-2 text-gray-600">
              <span className="text-sm">
                {server.services.length} servicio{server.services.length !== 1 ? 's' : ''} monitoreado{server.services.length !== 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Lista de servicios expandible */}
      {isExpanded && server.services && (
        <div className="px-6 pb-6 border-t border-gray-100">
          <div className="pt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Servicios Activos
            </h4>
            <div className="space-y-2">
              {server.services.map((service, index) => (
                <ServiceItem key={index} service={service} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const MplsCard = ({ mpls }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-50 rounded-lg">
            <Wifi className="w-6 h-6 text-purple-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800">{mpls.name}</h3>
        </div>
        <StatusIndicator status={mpls.status} />
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-gray-600">
          <Activity className="w-4 h-4" />
          <span className="text-sm">
            {mpls.latency ? `${mpls.latency}ms` : 'Midiendo...'}
          </span>
        </div>
        <div className="flex items-center gap-2 text-gray-600">
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm">{mpls.location}</span>
        </div>
      </div>
    </div>
  );
};

const ServerMonitor = () => {
  const [servers, setServers] = useState([]);
  const [mplsConnections, setMplsConnections] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const fetchServerStatus = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/servers/status');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setServers(data);
      setError(null);
    } catch (error) {
      console.error('Error fetching server status:', error);
      setError('No se pudo conectar con el servidor backend');
    }
  };

  const fetchMplsStatus = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/mpls/status');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setMplsConnections(data);
      setError(null);
    } catch (error) {
      console.error('Error fetching MPLS status:', error);
      setError('No se pudo conectar con el servidor backend');
    }
  };

  const refreshData = async () => {
    setIsLoading(true);
    setError(null);
    await Promise.all([fetchServerStatus(), fetchMplsStatus()]);
    setIsLoading(false);
    setLastUpdate(new Date());
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      await Promise.all([fetchServerStatus(), fetchMplsStatus()]);
      setIsLoading(false);
      setLastUpdate(new Date());
    };

    // Fetch data immediately
    fetchData();

    // Set up interval to fetch data every 30 seconds
    const interval = setInterval(fetchData, 30000);

    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando estado de servidores...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-red-800 mb-2">Error de Conexión</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <button 
              onClick={refreshData}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Monitor de Servidores Corporativo
          </h1>
          <div className="flex items-center justify-center gap-4">
            <p className="text-gray-600">
              Última actualización: {lastUpdate.toLocaleTimeString()}
            </p>
            <button 
              onClick={refreshData}
              className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              disabled={isLoading}
            >
              Actualizar
            </button>
          </div>
        </div>

        {/* Servidores y Servicios */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
            <Server className="w-6 h-6 text-blue-600" />
            Servidores y Servicios
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {servers.map((server, index) => (
              <ServerCard key={index} server={server} />
            ))}
          </div>
        </div>

        {/* MPLS Nacionales */}
        <div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
            <Wifi className="w-6 h-6 text-purple-600" />
            MPLS Nacionales
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mplsConnections.map((mpls, index) => (
              <MplsCard key={index} mpls={mpls} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServerMonitor;
