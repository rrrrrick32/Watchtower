import React from 'react';
import QuadCard from '../shared/QuadCard';

const DataValidationQuad = ({
  signalsData,
  currentStats,
  apiStatus
}) => {
  // Calculate validation metrics
  const relevantSignals = (signalsData.signals || []).filter(s => s.status === 'relevant').length;
  const falsePositives = (signalsData.signals || []).filter(s => s.status === 'false_positive').length;
  const hitRate = (signalsData.signals || []).length > 0 ? 
    (relevantSignals / signalsData.signals.length * 100).toFixed(1) : 0;

  return (
    <QuadCard 
      title="Data Validation Views"
      apiConnected={apiStatus?.connected}
    >
      <div style={{ marginBottom: '16px' }}>
        <h4 style={{ color: '#cccccc', fontSize: '12px', marginBottom: '8px', fontWeight: '600' }}>
          Today's Collection Summary
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <div style={{ 
            backgroundColor: '#1e1e1e', 
            padding: '8px', 
            borderRadius: '4px',
            border: '1px solid #3e3e42'
          }}>
            <div style={{ color: '#10b981', fontSize: '16px', fontWeight: 'bold' }}>
              {currentStats.signalsToday}
            </div>
            <div style={{ color: '#888888', fontSize: '10px' }}>
              {apiStatus?.connected ? 'Live Count' : 'Cached'}
            </div>
          </div>
          <div style={{ 
            backgroundColor: '#1e1e1e', 
            padding: '8px', 
            borderRadius: '4px',
            border: '1px solid #3e3e42'
          }}>
            <div style={{ color: '#3b82f6', fontSize: '16px', fontWeight: 'bold' }}>
              {hitRate}%
            </div>
            <div style={{ color: '#888888', fontSize: '10px' }}>Hit Rate</div>
          </div>
        </div>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <h4 style={{ color: '#cccccc', fontSize: '12px', marginBottom: '8px', fontWeight: '600' }}>
          Signal Quality Metrics
        </h4>
        <div style={{ fontSize: '11px' }}>
          <div style={{ 
            display: 'flex',
            justifyContent: 'space-between', 
            padding: '4px 0',
            borderBottom: '1px solid #3e3e42'
          }}>
            <span style={{ color: '#cccccc' }}>Relevant Signals:</span>
            <span style={{ color: '#10b981' }}>{relevantSignals}</span>
          </div>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            padding: '4px 0',
            borderBottom: '1px solid #3e3e42'
          }}>
            <span style={{ color: '#cccccc' }}>False Positives:</span>
            <span style={{ color: '#dc2626' }}>{falsePositives}</span>
          </div>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            padding: '4px 0',
            borderBottom: '1px solid #3e3e42'
          }}>
            <span style={{ color: '#cccccc' }}>Avg Confidence:</span>
            <span style={{ color: '#f59e0b' }}>
              {(signalsData.stats?.avgConfidence * 100 || 0).toFixed(1)}%
            </span>
          </div>
        </div>
      </div>

      <div>
        <h4 style={{ color: '#cccccc', fontSize: '12px', marginBottom: '8px', fontWeight: '600' }}>
          System Status
        </h4>
        <div style={{ fontSize: '11px' }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            padding: '4px 0',
            borderBottom: '1px solid #3e3e42'
          }}>
            <span style={{ color: '#cccccc' }}>SignalBridge API:</span>
            <span style={{ color: apiStatus?.connected ? '#10b981' : '#dc2626' }}>
              {apiStatus?.connected ? 'Connected' : 'Offline'}
            </span>
          </div>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            padding: '4px 0',
            borderBottom: '1px solid #3e3e42'
          }}>
            <span style={{ color: '#cccccc' }}>Database:</span>
            <span style={{ color: '#10b981' }}>Connected</span>
          </div>
          {apiStatus?.last_updated && (
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              padding: '4px 0'
            }}>
              <span style={{ color: '#cccccc' }}>Last Updated:</span>
              <span style={{ color: '#888888', fontSize: '10px' }}>
                {new Date(apiStatus.last_updated).toLocaleTimeString()}
              </span>
            </div>
          )}
        </div>
      </div>
    </QuadCard>
  );
};

export default DataValidationQuad;