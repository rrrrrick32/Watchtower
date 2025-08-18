import React, { useState, useRef } from 'react';
import { Activity, Rss, AlertCircle, CheckCircle, Clock, TrendingUp, Eye, ThumbsUp, ThumbsDown, Play, Pause, Settings, Database, BarChart, Plus, X, Target, ChevronRight, AlertTriangle } from 'lucide-react';
import { supabase } from '../../supabaseClient';

// Import components (existing)
import Tooltip from './signalbridge/shared/Tooltip';
import QuadCard from './signalbridge/shared/QuadCard';
import EnhancedStatCard from './signalbridge/shared/EnhancedStatCard';
import CollectionStatusQuad from './signalbridge/quads/CollectionStatusQuad';
import SignalReviewQuad from './signalbridge/quads/SignalReviewQuad';
import DataValidationQuad from './signalbridge/quads/DataValidationQuad';
import CollectionControlQuad from './signalbridge/quads/CollectionControlQuad';
import IntelligenceWorkflowModal from './signalbridge/modals/IntelligenceWorkflowModal';
import DataSourcesModal from './signalbridge/modals/DataSourcesModal';
import useSignalBridgeData from './signalbridge/hooks/useSignalBridgeData';
//import useApiStatus from './signalbridge/hooks/useApiStatus';
import useRSSFeedManager from './signalbridge/hooks/useRSSFeedManager';

// TODO: Import these once files are created in correct locations
// import AddRSSFeedForm from './signalbridge/forms/AddRSSFeedForm';
// import { transformSignalsForDisplay, transformFeedsForDisplay, transformDashboardStats } from './signalbridge/utils/dataTransformers';
// import { validateRSSFeedUrl } from './signalbridge/utils/validators';
// import { COLORS, POLLING_INTERVALS } from './signalbridge/utils/constants';

// Temporary inline utilities until files are created
const COLORS = {
  BACKGROUND_PRIMARY: '#1e1e1e',
  TEXT_SECONDARY: '#cccccc'
};

const validateRSSFeedUrl = (url) => {
  if (!url || typeof url !== 'string') {
    return { valid: false, error: 'URL is required' };
  }

  const trimmedUrl = url.trim();
  
  if (!trimmedUrl) {
    return { valid: false, error: 'URL cannot be empty' };
  }

  try {
    const urlObj = new URL(trimmedUrl);
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return { valid: false, error: 'URL must use HTTP or HTTPS protocol' };
    }
    if (!urlObj.hostname || urlObj.hostname.length === 0) {
      return { valid: false, error: 'URL must have a valid hostname' };
    }
    return { valid: true };
  } catch (error) {
    return { valid: false, error: 'Invalid URL format' };
  }
};

const transformSignalsForDisplay = (signals = []) => signals;
const transformFeedsForDisplay = (feeds = []) => feeds;
const transformDashboardStats = (stats = {}) => stats;

// Temporary AddRSSFeedForm component until file is created
const AddRSSFeedForm = ({
  showAddFeed,
  onClose,
  newFeedUrl,
  setNewFeedUrl,
  newFeedName,
  setNewFeedName,
  onSubmit,
  addingFeed,
  feedAddStatus,
  validateFeedUrl
}) => {
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit();
  };

  const urlValidation = newFeedUrl ? validateFeedUrl(newFeedUrl) : { valid: true };

  if (!showAddFeed) return null;

  return (
    <div style={{
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      backgroundColor: '#2a2a2a',
      border: '1px solid #444',
      borderRadius: '8px',
      padding: '20px',
      minWidth: '400px',
      zIndex: 1000,
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px'
      }}>
        <h3 style={{
          margin: 0,
          color: '#ffffff',
          fontSize: '16px',
          fontWeight: '600'
        }}>
          Add RSS Feed
        </h3>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: '#888',
            cursor: 'pointer',
            padding: '4px'
          }}
          disabled={addingFeed}
        >
          <X size={18} />
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '12px' }}>
          <label style={{
            display: 'block',
            color: '#cccccc',
            fontSize: '14px',
            marginBottom: '4px'
          }}>
            Feed URL *
          </label>
          <input
            type="url"
            value={newFeedUrl}
            onChange={(e) => setNewFeedUrl(e.target.value)}
            placeholder="https://example.com/feed.xml"
            disabled={addingFeed}
            style={{
              width: '100%',
              padding: '8px 12px',
              backgroundColor: '#1a1a1a',
              border: `1px solid ${!urlValidation.valid ? '#ef4444' : '#444'}`,
              borderRadius: '4px',
              color: '#ffffff',
              fontSize: '14px',
              outline: 'none'
            }}
            required
          />
          {!urlValidation.valid && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              marginTop: '4px',
              color: '#ef4444',
              fontSize: '12px'
            }}>
              <AlertCircle size={12} />
              {urlValidation.error}
            </div>
          )}
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{
            display: 'block',
            color: '#cccccc',
            fontSize: '14px',
            marginBottom: '4px'
          }}>
            Feed Name (Optional)
          </label>
          <input
            type="text"
            value={newFeedName}
            onChange={(e) => setNewFeedName(e.target.value)}
            placeholder="Custom RSS Feed"
            disabled={addingFeed}
            style={{
              width: '100%',
              padding: '8px 12px',
              backgroundColor: '#1a1a1a',
              border: '1px solid #444',
              borderRadius: '4px',
              color: '#ffffff',
              fontSize: '14px',
              outline: 'none'
            }}
          />
        </div>

        {feedAddStatus && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 12px',
            borderRadius: '4px',
            marginBottom: '16px',
            backgroundColor: feedAddStatus.type === 'success' ? '#10b981' : '#ef4444',
            color: '#ffffff',
            fontSize: '14px'
          }}>
            {feedAddStatus.type === 'success' ? (
              <CheckCircle size={16} />
            ) : (
              <AlertCircle size={16} />
            )}
            {feedAddStatus.message}
          </div>
        )}

        <div style={{
          display: 'flex',
          gap: '8px',
          justifyContent: 'flex-end'
        }}>
          <button
            type="button"
            onClick={onClose}
            disabled={addingFeed}
            style={{
              padding: '8px 16px',
              backgroundColor: 'transparent',
              border: '1px solid #444',
              borderRadius: '4px',
              color: '#cccccc',
              cursor: addingFeed ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              opacity: addingFeed ? 0.5 : 1
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={addingFeed || !newFeedUrl.trim() || !urlValidation.valid}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              backgroundColor: '#10b981',
              border: 'none',
              borderRadius: '4px',
              color: '#ffffff',
              cursor: (addingFeed || !newFeedUrl.trim() || !urlValidation.valid) ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              opacity: (addingFeed || !newFeedUrl.trim() || !urlValidation.valid) ? 0.5 : 1
            }}
          >
            {addingFeed ? (
              <>
                <div style={{ animation: 'spin 1s linear infinite' }}>⟳</div>
                Adding...
              </>
            ) : (
              <>
                <Plus size={16} />
                Add Feed
              </>
            )}
          </button>
        </div>
      </form>

      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: -1
        }}
        onClick={onClose}
      />
    </div>
  );
};

const SignalBridgeTab = ({ styles }) => {
  // ==========================================
  // HOOKS
  // ==========================================
  
  // Main data hook
  const {
    signalsData,
    apiStatus,
    currentStats,
    todaysSignals,
    loading,
    apiError,
    fetchAllData,
    startMonitoring,
    stopMonitoring,
    markSignal
  } = useSignalBridgeData();

  // RSS Feed management hook
  const rssManager = useRSSFeedManager(fetchAllData);

  console.log('DEBUG - signalsData:', signalsData);
  console.log('DEBUG - apiStatus:', apiStatus);
  console.log('DEBUG - currentStats:', currentStats);
  console.log('DEBUG - rssManager:', rssManager);

  // ==========================================
  // LOCAL UI STATE
  // ==========================================
  
  const [hoveredCard, setHoveredCard] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const hideTimeoutRef = useRef(null);

  // Modal state
  const [showWorkflowModal, setShowWorkflowModal] = useState(false);
  const [workflowData, setWorkflowData] = useState(null);
  const [workflowLoading, setWorkflowLoading] = useState(false);
  const [showDataSourcesModal, setShowDataSourcesModal] = useState(false);
  const [dataSourcesData, setDataSourcesData] = useState(null);
  const [dataSourcesLoading, setDataSourcesLoading] = useState(false);

  // ==========================================
  // DATA TRANSFORMATION
  // ==========================================
  
  // Transform data for display using utility functions
  const transformedSignals = transformSignalsForDisplay(signalsData.signals);
  const transformedFeeds = transformFeedsForDisplay(signalsData.feeds);
  const transformedStats = transformDashboardStats(currentStats);
  const transformedTodaysSignals = transformSignalsForDisplay(todaysSignals);

  // ==========================================
  // MODAL FUNCTIONS WITH REAL SUPABASE DATA FETCHING
  // ==========================================
  
  const fetchWorkflowHierarchy = async () => {
    setWorkflowLoading(true);
    try {
      // Get the most recent strategic intent with full hierarchy
      const { data: strategicIntents, error: intentsError } = await supabase
        .from('strategic_intents')
        .select(`
          id,
          intent_text,
          context,
          created_at,
          session_id,
          decisions!decisions_intent_id_fkey (
            decision_id,
            decision_text,
            status,
            created_at,
            pirs!pirs_decision_id_fkey (
              id,
              pir_text,
              priority,
              created_at,
              indicators!indicators_pir_id_fkey (
                id,
                indicator_text,
                confidence_level,
                status,
                source,
                updated_at,
                collection_frequency
              )
            ),
            ffirs!ffirs_decision_id_fkey (
              id,
              ffir_text,
              priority,
              created_at,
              ffir_indicators!ffir_indicators_ffir_id_fkey (
                id,
                indicator_text,
                confidence_level,
                status,
                source,
                updated_at,
                collection_frequency
              )
            )
          )
        `)
        .order('created_at', { ascending: false })
        .limit(1);

      if (intentsError) {
        console.error('Error fetching strategic intents:', intentsError);
        throw intentsError;
      }

      if (!strategicIntents || strategicIntents.length === 0) {
        setWorkflowData(null);
        return;
      }

      const latestIntent = strategicIntents[0];

      // Transform the data into the format expected by the modal
      const workflowData = {
        strategicIntent: {
          text: latestIntent.intent_text,
          context: latestIntent.context,
          created_at: latestIntent.created_at,
          session_id: latestIntent.session_id
        },
        decisions: latestIntent.decisions.map(decision => ({
          id: decision.decision_id,
          title: decision.decision_text,
          status: decision.status || 'active',
          created_at: decision.created_at,
          pirs: decision.pirs.map(pir => ({
            id: pir.id,
            question: pir.pir_text,
            priority: pir.priority || 'medium',
            created_at: pir.created_at,
            indicators: pir.indicators.map(indicator => ({
              id: indicator.id,
              text: indicator.indicator_text,
              type: 'PIR',
              status: indicator.status || 'active',
              lastUpdated: indicator.updated_at || new Date().toISOString(),
              confidence: indicator.confidence_level,
              source: indicator.source,
              collection_frequency: indicator.collection_frequency
            }))
          })),
          ffirs: decision.ffirs.map(ffir => ({
            id: ffir.id,
            question: ffir.ffir_text,
            priority: ffir.priority || 'medium',
            created_at: ffir.created_at,
            indicators: ffir.ffir_indicators.map(indicator => ({
              id: indicator.id,
              text: indicator.indicator_text,
              type: 'FFIR',
              status: indicator.status || 'active',
              lastUpdated: indicator.updated_at || new Date().toISOString(),
              confidence: indicator.confidence_level,
              source: indicator.source,
              collection_frequency: indicator.collection_frequency
            }))
          }))
        }))
      };

      setWorkflowData(workflowData);
    } catch (error) {
      console.error('Error fetching workflow hierarchy:', error);
      setWorkflowData(null);
    } finally {
      setWorkflowLoading(false);
    }
  };

  const fetchDataSourcesDetails = async () => {
    setDataSourcesLoading(true);
    try {
      // Get all signal sources
      const { data: sources, error: sourcesError } = await supabase
        .from('signal_sources')
        .select('*')
        .order('source_name');

      if (sourcesError) {
        console.error('Error fetching signal sources:', sourcesError);
        throw sourcesError;
      }

      // Get signal counts per source for activity metrics
      const { data: signalCounts, error: countsError } = await supabase
        .from('signals')
        .select('source_id')
        .not('source_id', 'is', null);

      if (countsError) {
        console.error('Error fetching signal counts:', countsError);
      }

      // Create a map of source_id to signal count
      const signalCountMap = (signalCounts || []).reduce((acc, item) => {
        acc[item.source_id] = (acc[item.source_id] || 0) + 1;
        return acc;
      }, {});

      // Transform sources data
      const transformedSources = (sources || []).map(source => ({
        id: source.id,
        source_name: source.source_name,
        source_url: source.source_url,
        source_type: source.source_type || 'RSS',
        active: true, // Assume active since we don't have this field
        last_checked: source.last_checked,
        signal_count: signalCountMap[source.id] || 0
      }));

      // Calculate statistics
      const totalSources = transformedSources.length;
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      
      const statusStats = transformedSources.reduce((acc, source) => {
        const lastChecked = source.last_checked ? new Date(source.last_checked) : null;
        const isRecent = lastChecked && lastChecked > oneHourAgo;
        
        if (source.active && isRecent) {
          acc.healthy++;
        } else if (source.active && !isRecent) {
          acc.stale++;
        } else {
          acc.inactive++;
        }
        return acc;
      }, { healthy: 0, stale: 0, inactive: 0 });

      // Group sources by type
      const sourcesByType = transformedSources.reduce((acc, source) => {
        const type = source.source_type || 'Unknown';
        if (!acc[type]) {
          acc[type] = [];
        }
        acc[type].push(source);
        return acc;
      }, {});

      const dataSourcesData = {
        stats: {
          totalSources,
          statusStats
        },
        sourcesByType,
        lastUpdated: new Date().toISOString()
      };
      
      setDataSourcesData(dataSourcesData);
    } catch (error) {
      console.error('Error fetching data sources:', error);
      setDataSourcesData(null);
    } finally {
      setDataSourcesLoading(false);
    }
  };

  // ==========================================
  // ENHANCED MODAL OPEN HANDLERS
  // ==========================================
  
  const handleShowWorkflowModal = async () => {
    setShowWorkflowModal(true);
    await fetchWorkflowHierarchy();
  };

  const handleShowDataSourcesModal = async () => {
    setShowDataSourcesModal(true);
    await fetchDataSourcesDetails();
  };

  // ==========================================
  // COMPONENT PROPS PREPARATION
  // ==========================================

  // Props for CollectionStatusQuad - Updated with new handlers
  const collectionStatusProps = {
    apiStatus,
    currentStats: transformedStats,
    signalsData: { 
      ...signalsData, 
      signals: transformedSignals, 
      feeds: transformedFeeds 
    },
    hoveredCard,
    setHoveredCard,
    setTooltipPosition,
    hideTimeoutRef,
    setShowWorkflowModal: handleShowWorkflowModal,  // Updated
    setShowDataSourcesModal: handleShowDataSourcesModal,  // Updated
    todaysSignals: transformedTodaysSignals
  };

  // Props for SignalReviewQuad
  const signalReviewProps = {
    signalsData: { 
      ...signalsData, 
      signals: transformedSignals 
    },
    apiStatus,
    markSignal
  };

  // Props for CollectionControlQuad
  const collectionControlProps = {
    apiStatus,
    currentStats: transformedStats,
    signalsData: { 
      ...signalsData, 
      feeds: transformedFeeds 
    },
    startMonitoring,
    stopMonitoring,
    fetchAllData,
    // RSS Feed management (from hook)
    ...rssManager
  };

  // Props for DataValidationQuad
  const dataValidationProps = {
    signalsData: { 
      ...signalsData, 
      signals: transformedSignals 
    },
    currentStats: transformedStats,
    apiStatus
  };

  // Props for Tooltip
  const tooltipProps = {
    hoveredCard,
    setHoveredCard,
    tooltipPosition,
    hideTimeoutRef,
    currentStats: transformedStats,
    signalsData: { 
      ...signalsData, 
      signals: transformedSignals 
    },
    apiStatus,
    todaysSignals: transformedTodaysSignals
  };

  // Props for Workflow Modal
  const workflowModalProps = {
    isOpen: showWorkflowModal,
    onClose: () => setShowWorkflowModal(false),
    workflowData,
    loading: workflowLoading
  };

  // Props for Data Sources Modal
  const dataSourcesModalProps = {
    isOpen: showDataSourcesModal,
    onClose: () => setShowDataSourcesModal(false),
    dataSourcesData,
    loading: dataSourcesLoading
  };

  // Props for Add RSS Feed Form
  const addRSSFeedFormProps = {
    showAddFeed: rssManager.showAddFeed,
    onClose: rssManager.cancelAddFeed,
    newFeedUrl: rssManager.newFeedUrl,
    setNewFeedUrl: rssManager.setNewFeedUrl,
    newFeedName: rssManager.newFeedName,
    setNewFeedName: rssManager.setNewFeedName,
    onSubmit: rssManager.addCustomRSSFeed,
    addingFeed: rssManager.addingFeed,
    feedAddStatus: rssManager.feedAddStatus,
    validateFeedUrl: validateRSSFeedUrl
  };

  // ==========================================
  // LOADING STATE
  // ==========================================
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100%',
        color: COLORS.TEXT_SECONDARY
      }}>
        Loading SignalBridge data...
      </div>
    );
  }

  // ==========================================
  // MAIN RENDER - ORCHESTRATOR
  // ==========================================
  return (
    <div style={{ 
      padding: '16px', 
      height: '100%',
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gridTemplateRows: '1fr 1fr',
      gap: '16px',
      backgroundColor: COLORS.BACKGROUND_PRIMARY,
      position: 'relative'
    }}>
      <CollectionStatusQuad {...collectionStatusProps} />
      <SignalReviewQuad {...signalReviewProps} />
      <CollectionControlQuad {...collectionControlProps} />
      <DataValidationQuad {...dataValidationProps} />
      
      <Tooltip {...tooltipProps} />
      
      <IntelligenceWorkflowModal {...workflowModalProps} />
      <DataSourcesModal {...dataSourcesModalProps} />
      <AddRSSFeedForm {...addRSSFeedFormProps} />
    </div>
  );
};

export default SignalBridgeTab;