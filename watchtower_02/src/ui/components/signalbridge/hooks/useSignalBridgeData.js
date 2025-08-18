import { useState, useEffect } from 'react';
import { supabase } from '../../../../supabaseClient';

const useSignalBridgeData = () => {
  // ==========================================
  // STATE MANAGEMENT
  // ==========================================
  
  // Core data state
  const [signalsData, setSignalsData] = useState({
    indicators: [],
    feeds: [],
    signals: [],
    stats: null
  });
  
  const [apiStatus, setApiStatus] = useState({
    connected: false,
    monitoring_active: false,
    active_feeds: 0,
    signals_today: 0,
    active_indicators: 0
  });

  // Loading and error state
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(null);

  // ==========================================
  // CONFIGURATION
  // ==========================================
  const API_BASE = 'http://localhost:8000/api';

  // ==========================================
  // API FUNCTIONS
  // ==========================================
  
  const fetchSignalBridgeAPI = async () => {
    try {
      const response = await fetch(`${API_BASE}/dashboard/stats`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.status === 'success' && data.dashboard) {
          const indicatorsResponse = await fetch(`${API_BASE}/indicators`);
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
            pir_indicators: data.dashboard.pir_indicators,
            ffir_indicators: data.dashboard.ffir_indicators,
            last_updated: data.dashboard.last_updated,
            indicators: apiIndicators
          });
          setApiError(null);
        }
      } else {
        throw new Error(`API responded with status ${response.status}`);
      }
    } catch (error) {
      setApiStatus(prev => ({ ...prev, connected: false }));
      setApiError(error.message);
    }
  };

  const fetchSupabaseData = async () => {
    try {
      const { data: indicators, error: indicatorsError } = await supabase
        .from('indicators')
        .select('*');
      
      const { data: ffirIndicators } = await supabase
        .from('ffir_indicators')
        .select('*');

      const { data: signals, error: signalsError } = await supabase
        .from('signals')
        .select('*')
        .order('observed_at', { ascending: false })
        .limit(50);

      const { data: feeds } = await supabase
        .from('signal_sources')
        .select('*')
        .order('last_checked', { ascending: false });

      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const thisWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

      const safeSignals = signals || [];
      const weekSignals = safeSignals.filter(s => s && s.observed_at && new Date(s.observed_at) >= thisWeek);

      setSignalsData({
        indicators: [...(indicators || []), ...(ffirIndicators || [])],
        feeds: feeds || [],
        signals: safeSignals,
        stats: {
          totalIndicators: (indicators || []).length + (ffirIndicators || []).length,
          activeFeeds: (feeds || []).filter(f => f && f.active !== false).length,
          signalsThisWeek: weekSignals.length,
          avgConfidence: safeSignals.length ? 
            safeSignals.reduce((sum, s) => sum + (s.match_score || s.confidence_score || 0), 0) / safeSignals.length : 0
        }
      });
    } catch (error) {
      console.error('❌ Error fetching Supabase data:', error);
      setSignalsData({
        indicators: [],
        feeds: [],
        signals: [],
        stats: { totalIndicators: 0, activeFeeds: 0, signalsThisWeek: 0, avgConfidence: 0 }
      });
    }
  };

  const fetchAllData = async () => {
    setLoading(true);
    await Promise.all([
      fetchSignalBridgeAPI(),
      fetchSupabaseData()
    ]);
    setLoading(false);
  };

  // ==========================================
  // MONITORING CONTROLS
  // ==========================================
  
  const startMonitoring = async () => {
    try {
      const response = await fetch(`${API_BASE}/monitoring/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        await fetchSignalBridgeAPI();
      }
    } catch (error) {
      console.error('❌ Error starting monitoring:', error);
    }
  };

  const stopMonitoring = async () => {
    try {
      const response = await fetch(`${API_BASE}/monitoring/stop`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        await fetchSignalBridgeAPI();
      }
    } catch (error) {
      console.error('❌ Error stopping monitoring:', error);
    }
  };

  const markSignal = async (signalId, relevant) => {
    try {
      await supabase
        .from('signals')
        .update({ 
          status: relevant ? 'relevant' : 'false_positive',
          reviewed_at: new Date().toISOString()
        })
        .eq('id', signalId);
      
      await fetchSupabaseData();
    } catch (error) {
      console.error('Error marking signal:', error);
    }
  };

  // ==========================================
  // COMPUTED VALUES
  // ==========================================
  
  const getCurrentStats = () => {
    if (apiStatus.connected) {
      return {
        totalIndicators: apiStatus.active_indicators,
        activeFeeds: apiStatus.active_feeds,
        signalsToday: apiStatus.signals_today,
        monitoringActive: apiStatus.monitoring_active,
        pirIndicators: apiStatus.pir_indicators,
        ffirIndicators: apiStatus.ffir_indicators
      };
    }
    
    return {
      totalIndicators: signalsData.stats?.totalIndicators || 0,
      activeFeeds: signalsData.stats?.activeFeeds || 0,
      signalsToday: signalsData.stats?.signalsToday || 0,
      monitoringActive: false,
      pirIndicators: signalsData.indicators.filter(i => i.pir_id).length,
      ffirIndicators: signalsData.indicators.filter(i => i.ffir_id).length
    };
  };

  const todaysSignals = signalsData.signals.filter(signal => {
    const signalDate = new Date(signal.observed_at);
    const today = new Date();
    return signalDate.toDateString() === today.toDateString();
  });

  // ==========================================
  // EFFECTS
  // ==========================================
  
  useEffect(() => {
    fetchAllData();
    const interval = setInterval(fetchAllData, 30000);
    return () => clearInterval(interval);
  }, []);

  // ==========================================
  // RETURN HOOK INTERFACE
  // ==========================================
  
  return {
    // Data
    signalsData,
    apiStatus,
    currentStats: getCurrentStats(),
    todaysSignals,
    
    // Loading states
    loading,
    apiError,
    
    // Actions
    fetchAllData,
    startMonitoring,
    stopMonitoring,
    markSignal,
    
    // Internal functions (for component use)
    fetchSignalBridgeAPI,
    fetchSupabaseData
  };
};

export default useSignalBridgeData;