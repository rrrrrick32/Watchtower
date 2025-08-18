import React from 'react';

const Tooltip = ({
  hoveredCard,
  setHoveredCard,
  tooltipPosition,
  hideTimeoutRef,
  currentStats,
  signalsData,
  apiStatus,
  todaysSignals
}) => {
  if (!hoveredCard) return null;

  const handleTooltipMouseEnter = () => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }
  };

  let tooltipContent = null;

  switch (hoveredCard) {
    case 'indicators':
      const safeApiStatus = apiStatus || {};
      const safeSignalsData = signalsData || {};
      const safeIndicators = safeSignalsData.indicators || [];
      const safeApiIndicators = safeApiStatus.indicators || [];
      
      const indicatorsToShow = (safeApiStatus.connected && safeApiIndicators.length > 0) ? 
        safeApiIndicators : 
        safeIndicators.filter(indicator => indicator && indicator.pir_id);
      
      tooltipContent = (
        <div>
          <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#10b981' }}>
            Active Indicators ({currentStats.totalIndicators || 0})
          </div>
          {indicatorsToShow.length > 0 ? (
            <>
              {indicatorsToShow.slice(0, 8).map((indicator, i) => {
                if (!indicator) return null;
                
                return (
                  <div key={i} style={{ marginBottom: '6px', fontSize: '11px' }}>
                    <div style={{ color: '#ffffff', fontWeight: '500' }}>
                      {indicator.text || indicator.indicator_text || 'No text available'}
                    </div>
                    <div style={{ color: '#888888', fontSize: '10px' }}>
                      PIR Indicator • Priority: {indicator.priority || 'Unknown'}
                    </div>
                  </div>
                );
              })}
              {indicatorsToShow.length > 8 && (
                <div style={{ color: '#888888', fontSize: '10px', fontStyle: 'italic' }}>
                  ...and {indicatorsToShow.length - 8} more
                </div>
              )}
            </>
          ) : (
            <div style={{ color: '#888888', fontSize: '11px', fontStyle: 'italic' }}>
              {currentStats.totalIndicators > 0 ? 
                `${currentStats.totalIndicators} PIR indicators active (loading details...)` : 
                'No active PIR indicators'
              }
            </div>
          )}
          <div style={{ marginTop: '8px', paddingTop: '6px', borderTop: '1px solid #444', fontSize: '10px', color: '#10b981' }}>
            Click to view full workflow →
          </div>
        </div>
      );
      break;

    case 'dataSources':
      const feedsByType = signalsData.feeds.reduce((acc, feed) => {
        const type = feed.source_type || 'RSS';
        if (!acc[type]) acc[type] = [];
        acc[type].push(feed);
        return acc;
      }, {});

      tooltipContent = (
        <div>
          <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#f59e0b' }}>
            Data Sources ({signalsData.feeds.length})
          </div>
          {Object.entries(feedsByType).map(([type, feeds]) => (
            <div key={type} style={{ marginBottom: '8px' }}>
              <div style={{ color: '#cccccc', fontWeight: '500', fontSize: '11px', marginBottom: '4px' }}>
                {type} Feeds ({feeds.length})
              </div>
              {feeds.slice(0, 5).map((feed, i) => (
                <div key={i} style={{ marginBottom: '3px', fontSize: '10px', paddingLeft: '8px' }}>
                  <div style={{ color: '#ffffff' }}>
                    {feed.source_name?.substring(0, 50)}...
                  </div>
                  <div style={{ color: '#888888', fontSize: '9px' }}>
                    {feed.source_url?.substring(0, 60)}...
                  </div>
                </div>
              ))}
              {feeds.length > 5 && (
                <div style={{ color: '#888888', fontSize: '9px', paddingLeft: '8px', fontStyle: 'italic' }}>
                  ...and {feeds.length - 5} more {type} sources
                </div>
              )}
            </div>
          ))}
        </div>
      );
      break;

    case 'signalsToday':
      tooltipContent = (
        <div>
          <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#3b82f6' }}>
            Today's Signals ({todaysSignals.length})
          </div>
          {todaysSignals.slice(0, 6).map((signal, i) => (
            <div key={i} style={{ marginBottom: '6px', fontSize: '11px' }}>
              <div style={{ color: '#ffffff', fontWeight: '500' }}>
                {(signal.source_title || signal.raw_signal_text)?.substring(0, 50)}...
              </div>
              <div style={{ color: '#888888', fontSize: '10px' }}>
                Confidence: {((signal.match_score || signal.confidence_score || 0) * 100).toFixed(1)}% • 
                {new Date(signal.observed_at).toLocaleTimeString()}
              </div>
            </div>
          ))}
          {todaysSignals.length > 6 && (
            <div style={{ color: '#888888', fontSize: '10px', fontStyle: 'italic' }}>
              ...and {todaysSignals.length - 6} more signals today
            </div>
          )}
          {todaysSignals.length === 0 && (
            <div style={{ color: '#888888', fontSize: '11px', fontStyle: 'italic' }}>
              No signals collected yet today
            </div>
          )}
        </div>
      );
      break;

    default:
      return null;
  }

  return (
    <div
      style={{
        position: 'fixed',
        left: tooltipPosition.x,
        top: tooltipPosition.y,
        backgroundColor: '#1a1a1a',
        border: '1px solid #3e3e42',
        borderRadius: '6px',
        padding: '12px',
        maxWidth: '400px',
        maxHeight: '300px',
        overflowY: 'auto',
        zIndex: 1000,
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
        pointerEvents: 'auto',
      }}
      onMouseEnter={handleTooltipMouseEnter}
    >
      {tooltipContent}
    </div>
  );
};

export default Tooltip;