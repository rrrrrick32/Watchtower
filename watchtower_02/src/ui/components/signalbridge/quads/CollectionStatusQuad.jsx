import React from 'react';
import { Activity, Database, TrendingUp, CheckCircle } from 'lucide-react';
import QuadCard from '../shared/QuadCard';
import EnhancedStatCard from '../shared/EnhancedStatCard';

const CollectionStatusQuad = ({
  apiStatus,
  currentStats,
  signalsData,
  hoveredCard,
  setHoveredCard,
  setTooltipPosition,
  hideTimeoutRef,
  setShowWorkflowModal,
  setShowDataSourcesModal,
  todaysSignals
}) => (
  <QuadCard 
    title="Collection Status Dashboard"
    apiConnected={apiStatus.connected}
  >
    {!apiStatus.connected && (
      <div style={{
        backgroundColor: '#f59e0b',
        color: '#000',
        padding: '8px',
        borderRadius: '4px',
        fontSize: '11px',
        marginBottom: '12px',
        fontWeight: '500'
      }}>
        ⚠️ SignalBridge API disconnected - showing Supabase data only
      </div>
    )}
    
    <EnhancedStatCard
      icon={Activity}
      title="Active Indicators"
      value={currentStats.totalIndicators}
      subtitle={`PIR: ${currentStats.pirIndicators || 0} • FFIR: ${currentStats.ffirIndicators || 0}`}
      color="#10b981"
      cardKey="indicators"
      hoverData={true}
      onClick={setShowWorkflowModal ? () => setShowWorkflowModal(true) : undefined}
      hoveredCard={hoveredCard}
      setHoveredCard={setHoveredCard}
      setTooltipPosition={setTooltipPosition}
      hideTimeoutRef={hideTimeoutRef}
    />
    
    <EnhancedStatCard
      icon={Database}
      title="Data Sources"
      value={currentStats.activeFeeds}
      subtitle={apiStatus.connected ? "Live from SignalBridge" : "From database"}
      color="#f59e0b"
      cardKey="dataSources"
      hoverData={true}
      onClick={setShowDataSourcesModal ? () => setShowDataSourcesModal(true) : undefined}
      hoveredCard={hoveredCard}
      setHoveredCard={setHoveredCard}
      setTooltipPosition={setTooltipPosition}
      hideTimeoutRef={hideTimeoutRef}
    />

    <EnhancedStatCard
      icon={TrendingUp}
      title="Signals Today"
      value={todaysSignals?.length || 0}
      subtitle={apiStatus.connected ? "Real-time count" : "Database count"}
      color="#3b82f6"
      cardKey="signalsToday"
      hoverData={true}
      hoveredCard={hoveredCard}
      setHoveredCard={setHoveredCard}
      setTooltipPosition={setTooltipPosition}
      hideTimeoutRef={hideTimeoutRef}
    />
    
    <EnhancedStatCard
      icon={CheckCircle}
      title="Monitoring Status"
      value={currentStats.monitoringActive ? "ACTIVE" : "STOPPED"}
      subtitle={apiStatus.connected ? "Live status" : "Unknown - API offline"}
      color={currentStats.monitoringActive ? "#10b981" : "#dc2626"}
      hoveredCard={hoveredCard}
      setHoveredCard={setHoveredCard}
      setTooltipPosition={setTooltipPosition}
      hideTimeoutRef={hideTimeoutRef}
    />

    <div style={{ marginTop: '16px' }}>
      <h4 style={{ color: '#cccccc', fontSize: '12px', marginBottom: '8px', fontWeight: '600' }}>
        Recent Activity
      </h4>
      <div style={{ fontSize: '11px', color: '#888888' }}>
        {(signalsData.indicators || []).slice(0, 3).map((ind, i) => (
          <div key={i} style={{ 
            padding: '4px 0', 
            display: 'flex', 
            justifyContent: 'space-between',
            borderBottom: '1px solid #3e3e42'
          }}>
            <span>{ind.indicator_text?.substring(0, 30)}...</span>
            <span style={{ color: apiStatus.connected ? '#10b981' : '#f59e0b' }}>
              {apiStatus.connected ? 'Live' : 'Cached'}
            </span>
          </div>
        ))}
      </div>
    </div>
  </QuadCard>
);

export default CollectionStatusQuad;