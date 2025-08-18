import React from 'react';
import { Play, Pause, Plus, X } from 'lucide-react';
import QuadCard from '../shared/QuadCard';

const CollectionControlQuad = ({
  apiStatus,
  currentStats,
  signalsData,
  startMonitoring,
  stopMonitoring,
  fetchAllData,
  showAddFeed,
  setShowAddFeed,
  newFeedUrl,
  setNewFeedUrl,
  newFeedName,
  setNewFeedName,
  addingFeed,
  feedAddStatus,
  addCustomRSSFeed,
  cancelAddFeed
}) => (
  <QuadCard 
    title="Collection Control Panel"
    apiConnected={apiStatus?.connected}
  >
    <div style={{ marginBottom: '16px' }}>
      {apiStatus?.connected ? (
        <button
          onClick={currentStats.monitoringActive ? stopMonitoring : startMonitoring}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: currentStats.monitoringActive ? '#dc2626' : '#10b981',
            color: 'white',
            border: 'none',
            padding: '8px 12px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px',
            width: '100%',
            marginBottom: '8px'
          }}
        >
          {currentStats.monitoringActive ? <Pause size={14} /> : <Play size={14} />}
          {currentStats.monitoringActive ? 'Stop Monitoring' : 'Start Monitoring'}
        </button>
      ) : (
        <div style={{
          backgroundColor: '#374151',
          color: '#9ca3af',
          padding: '8px 12px',
          borderRadius: '4px',
          fontSize: '12px',
          textAlign: 'center',
          marginBottom: '8px'
        }}>
          API Offline - Controls Unavailable
        </div>
      )}
      
      <button
        onClick={fetchAllData}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          backgroundColor: '#374151',
          color: '#cccccc',
          border: '1px solid #4b5563',
          padding: '8px 12px',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '12px',
          width: '100%'
        }}
      >
        Refresh Data
      </button>
    </div>

    {/* Add Custom RSS Feed Section */}
    <div style={{ marginBottom: '16px' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '8px' 
      }}>
        <h4 style={{ color: '#cccccc', fontSize: '12px', fontWeight: '600' }}>
          Add Custom RSS Feed
        </h4>
        {!showAddFeed && (
          <button
            onClick={() => setShowAddFeed(true)}
            style={{
              backgroundColor: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '3px',
              padding: '4px 8px',
              cursor: 'pointer',
              fontSize: '10px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <Plus size={10} />
            Add Feed
          </button>
        )}
      </div>

      {showAddFeed && (
        <div style={{
          backgroundColor: '#1e1e1e',
          border: '1px solid #3e3e42',
          borderRadius: '4px',
          padding: '8px',
          marginBottom: '8px'
        }}>
          <input
            type="text"
            placeholder="RSS Feed URL (required)"
            value={newFeedUrl}
            onChange={(e) => setNewFeedUrl(e.target.value)}
            style={{
              width: '100%',
              backgroundColor: '#2a2a2a',
              border: '1px solid #444',
              borderRadius: '3px',
              padding: '6px 8px',
              color: '#cccccc',
              fontSize: '11px',
              marginBottom: '6px'
            }}
          />
          <input
            type="text"
            placeholder="Feed Name (optional)"
            value={newFeedName}
            onChange={(e) => setNewFeedName(e.target.value)}
            style={{
              width: '100%',
              backgroundColor: '#2a2a2a',
              border: '1px solid #444',
              borderRadius: '3px',
              padding: '6px 8px',
              color: '#cccccc',
              fontSize: '11px',
              marginBottom: '8px'
            }}
          />
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              onClick={addCustomRSSFeed}
              disabled={addingFeed}
              style={{
                flex: 1,
                backgroundColor: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '3px',
                padding: '6px 8px',
                cursor: addingFeed ? 'not-allowed' : 'pointer',
                fontSize: '10px',
                opacity: addingFeed ? 0.6 : 1
              }}
            >
              {addingFeed ? 'Adding...' : 'Add Feed'}
            </button>
            <button
              onClick={cancelAddFeed}
              style={{
                backgroundColor: '#6b7280',
                color: 'white',
                border: 'none',
                borderRadius: '3px',
                padding: '6px 8px',
                cursor: 'pointer',
                fontSize: '10px'
              }}
            >
              <X size={10} />
            </button>
          </div>
        </div>
      )}

      {feedAddStatus && (
        <div style={{
          backgroundColor: feedAddStatus.type === 'success' ? '#065f46' : '#7f1d1d',
          color: feedAddStatus.type === 'success' ? '#d1fae5' : '#fecaca',
          padding: '6px 8px',
          borderRadius: '3px',
          fontSize: '10px',
          marginBottom: '8px'
        }}>
          {feedAddStatus.message}
        </div>
      )}
    </div>

    {/* Active indicators display */}
    <div style={{ marginBottom: '16px' }}>
      <h4 style={{ color: '#cccccc', fontSize: '12px', marginBottom: '8px', fontWeight: '600' }}>
        Active Indicators ({(signalsData.indicators || []).length})
      </h4>
      <div style={{ maxHeight: '120px', overflowY: 'auto' }}>
        {(signalsData.indicators || []).slice(0, 5).map((indicator, index) => (
          <div
            key={indicator.id}
            style={{
              padding: '6px 8px',
              marginBottom: '4px',
              backgroundColor: '#1e1e1e',
              border: '1px solid #3e3e42',
              borderRadius: '4px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <div style={{ flex: 1 }}>
              <div style={{ color: 'white', fontSize: '11px', fontWeight: '500' }}>
                {indicator.indicator_text?.substring(0, 35)}...
              </div>
              <div style={{ color: '#888888', fontSize: '9px' }}>
                {indicator.pir_id ? 'PIR' : 'FFIR'} • {indicator.collection_frequency || 'daily'}
              </div>
            </div>
            <div style={{
              backgroundColor: apiStatus?.connected ? '#10b981' : '#f59e0b',
              color: 'white',
              padding: '2px 6px',
              borderRadius: '3px',
              fontSize: '9px',
              fontWeight: '500'
            }}>
              {apiStatus?.connected ? 'LIVE' : 'CACHED'}
            </div>
          </div>
        ))}
        {signalsData.indicators.length > 5 && (
          <div style={{ color: '#888888', fontSize: '10px', textAlign: 'center', fontStyle: 'italic' }}>
            ...and {signalsData.indicators.length - 5} more
          </div>
        )}
      </div>
    </div>

    {/* RSS feed display */}
    <div>
      <h4 style={{ color: '#cccccc', fontSize: '12px', marginBottom: '8px', fontWeight: '600' }}>
        RSS Sources ({(signalsData.feeds || []).length})
      </h4>
      <div style={{ maxHeight: '100px', overflowY: 'auto' }}>
        {(signalsData.feeds  || []).slice(0, 4).map((feed, index) => (
          <div
            key={feed.id}
            style={{
              padding: '4px 6px',
              marginBottom: '3px',
              backgroundColor: '#1e1e1e',
              border: '1px solid #3e3e42',
              borderRadius: '3px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <div style={{ color: 'white', fontSize: '10px' }}>
              {feed.source_name?.substring(0, 25)}...
            </div>
            <div style={{
              backgroundColor: (feed.active !== false) ? '#10b981' : '#6b7280',
              color: 'white',
              padding: '1px 4px',
              borderRadius: '2px',
              fontSize: '8px'
            }}>
              {(feed.active !== false) ? 'ON' : 'OFF'}
            </div>
          </div>
        ))}
        {signalsData.feeds.length > 4 && (
          <div style={{ color: '#888888', fontSize: '9px', textAlign: 'center', fontStyle: 'italic' }}>
            ...and {signalsData.feeds.length - 4} more sources
          </div>
        )}
      </div>
    </div>
  </QuadCard>
);

export default CollectionControlQuad;