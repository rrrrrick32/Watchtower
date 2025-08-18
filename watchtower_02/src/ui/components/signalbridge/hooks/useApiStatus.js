import { useState, useEffect, useCallback } from 'react';

const useApiStatus = (apiBase = 'http://localhost:8000/api') => {
  // ==========================================
  // STATE MANAGEMENT
  // ==========================================
  
  const [apiStatus, setApiStatus] = useState({
    connected: false,
    monitoring_active: false,
    active_feeds: 0,
    signals_today: 0,
    active_indicators: 0,
    pir_indicators: 0,
    ffir_indicators: 0,
    last_updated: null,
    indicators: []
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ==========================================
  // API FUNCTIONS
  // ==========================================
  
  const checkApiStatus = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${apiBase}/dashboard/stats`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.status === 'success' && data.dashboard) {
          // Fetch indicators separately
          const indicatorsResponse = await fetch(`${apiBase}/indicators`);
          let apiIndicators = [];

          if (indicatorsResponse.ok) {
            const indicatorsData = await indicatorsResponse.json();
            if (indicatorsData.status === 'success') {
              apiIndicators = indicatorsData.indicators;
            }
          }

          setApiStatus({
            connected: true,
            monitoring_active: data.dashboard.monitoring_active,
            active_feeds: data.dashboard.active_feeds,
            signals_today: data.dashboard.signals_today,
            active_indicators: data.dashboard.active_indicators,
            pir_indicators: data.dashboard.pir_indicators || 0,
            ffir_indicators: data.dashboard.ffir_indicators || 0,
            last_updated: data.dashboard.last_updated,
            indicators: apiIndicators
          });
        }
      } else {
        throw new Error(`API responded with status ${response.status}`);
      }
    } catch (error) {
      setApiStatus(prev => ({ ...prev, connected: false }));
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [apiBase]);

  const startMonitoring = useCallback(async () => {
    try {
      const response = await fetch(`${apiBase}/monitoring/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        await checkApiStatus();
        return { success: true };
      } else {
        throw new Error(`Failed to start monitoring: ${response.status}`);
      }
    } catch (error) {
      console.error('❌ Error starting monitoring:', error);
      setError(error.message);
      return { success: false, error: error.message };
    }
  }, [apiBase, checkApiStatus]);

  const stopMonitoring = useCallback(async () => {
    try {
      const response = await fetch(`${apiBase}/monitoring/stop`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        await checkApiStatus();
        return { success: true };
      } else {
        throw new Error(`Failed to stop monitoring: ${response.status}`);
      }
    } catch (error) {
      console.error('❌ Error stopping monitoring:', error);
      setError(error.message);
      return { success: false, error: error.message };
    }
  }, [apiBase, checkApiStatus]);

  const toggleMonitoring = useCallback(async () => {
    if (apiStatus.monitoring_active) {
      return await stopMonitoring();
    } else {
      return await startMonitoring();
    }
  }, [apiStatus.monitoring_active, startMonitoring, stopMonitoring]);

  // ==========================================
  // COMPUTED VALUES
  // ==========================================
  
  const isHealthy = apiStatus.connected && apiStatus.active_feeds > 0;
  
  const statusColor = apiStatus.connected 
    ? (apiStatus.monitoring_active ? '#10b981' : '#f59e0b')
    : '#ef4444';

  const statusText = apiStatus.connected
    ? (apiStatus.monitoring_active ? 'Active' : 'Connected')
    : 'Disconnected';

  // ==========================================
  // EFFECTS
  // ==========================================
  
  useEffect(() => {
    checkApiStatus();
  }, [checkApiStatus]);

  // ==========================================
  // RETURN HOOK INTERFACE
  // ==========================================
  
  return {
    // Status data
    apiStatus,
    isHealthy,
    statusColor,
    statusText,
    
    // Loading states
    loading,
    error,
    
    // Actions
    checkApiStatus,
    startMonitoring,
    stopMonitoring,
    toggleMonitoring,
    
    // Utils
    refresh: checkApiStatus
  };
};

export default useApiStatus;