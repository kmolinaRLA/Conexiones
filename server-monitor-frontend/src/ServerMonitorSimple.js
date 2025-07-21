import React, { useState, useEffect } from 'react';
import { Server, Activity, Wifi, AlertCircle } from 'lucide-react';

const ServerMonitorSimple = () => {
  const [servers, setServers] = useState([]);
  const [mplsConnections, setMplsConnections] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const fetchServerStatus = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/servers/status');
      const data = await response.json();
      setServers(data);
    } catch (error) {
      console.error('Error fetching server status:', error);
    }
  };

  const fetchMplsStatus = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/mpls/status');
      const data = await response.json();
      setMplsConnections(data);
    } catch (error) {
      console.error('Error fetching MPLS status:', error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'green': return '#10b981';
      case 'yellow': return '#f59e0b';
      case 'red': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'green': return 'Operativo';
      case 'yellow': return 'Latencia Alta';
      case 'red': return 'Sin conexión';
      default: return 'Verificando...';
    }
  };

  const StatusIndicator = ({ status }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <div style={{
        width: '12px',
        height: '12px',
        borderRadius: '50%',
        backgroundColor: getStatusColor(status)
      }}></div>
      <span style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>
        {getStatusText(status)}
      </span>
    </div>
  );

  const ServerCard = ({ server }) => (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '8px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      padding: '24px',
      border: '1px solid #e5e7eb',
      transition: 'box-shadow 0.3s ease',
      marginBottom: '16px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            padding: '8px',
            backgroundColor: '#dbeafe',
            borderRadius: '8px'
          }}>
            <Server size={24} color="#2563eb" />
          </div>
          <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', margin: 0 }}>
            {server.name}
          </h3>
        </div>
        <StatusIndicator status={server.status} />
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#6b7280' }}>
          <Activity size={16} />
          <span style={{ fontSize: '14px' }}>
            {server.latency ? `${server.latency}ms` : 'Midiendo...'}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#6b7280' }}>
          <Wifi size={16} />
          <span style={{ fontSize: '14px' }}>{server.type}</span>
        </div>
      </div>
    </div>
  );

  const MplsCard = ({ mpls }) => (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '8px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      padding: '24px',
      border: '1px solid #e5e7eb',
      transition: 'box-shadow 0.3s ease',
      marginBottom: '16px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            padding: '8px',
            backgroundColor: '#f3e8ff',
            borderRadius: '8px'
          }}>
            <Wifi size={24} color="#7c3aed" />
          </div>
          <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', margin: 0 }}>
            {mpls.name}
          </h3>
        </div>
        <StatusIndicator status={mpls.status} />
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#6b7280' }}>
          <Activity size={16} />
          <span style={{ fontSize: '14px' }}>
            {mpls.latency ? `${mpls.latency}ms` : 'Midiendo...'}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#6b7280' }}>
          <AlertCircle size={16} />
          <span style={{ fontSize: '14px' }}>{mpls.location}</span>
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#f9fafb',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '2px solid #2563eb',
            borderTopColor: 'transparent',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto'
          }}></div>
          <p style={{ marginTop: '16px', color: '#6b7280' }}>Cargando estado de servidores...</p>
        </div>
        <style>
          {`
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}
        </style>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 16px' }}>
        {/* Header */}
        <div style={{ marginBottom: '32px', textAlign: 'center' }}>
          <h1 style={{ fontSize: '30px', fontWeight: 'bold', color: '#1f2937', marginBottom: '8px' }}>
            Monitor de Servidores Corporativo
          </h1>
          <p style={{ color: '#6b7280' }}>
            Última actualización: {lastUpdate.toLocaleTimeString()}
          </p>
        </div>

        {/* Servidores y Servicios */}
        <div style={{ marginBottom: '48px' }}>
          <h2 style={{
            fontSize: '24px',
            fontWeight: '600',
            color: '#1f2937',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Server size={24} color="#2563eb" />
            Servidores y Servicios
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '24px'
          }}>
            {servers.map((server, index) => (
              <ServerCard key={index} server={server} />
            ))}
          </div>
        </div>

        {/* MPLS Nacionales */}
        <div>
          <h2 style={{
            fontSize: '24px',
            fontWeight: '600',
            color: '#1f2937',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Wifi size={24} color="#7c3aed" />
            MPLS Nacionales
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '24px'
          }}>
            {mplsConnections.map((mpls, index) => (
              <MplsCard key={index} mpls={mpls} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServerMonitorSimple;
