import React from 'react';
import { Database, CheckCircle, AlertCircle, Clock, X } from 'lucide-react';

const DataSourcesModal = ({ 
  isOpen, 
  onClose, 
  dataSourcesData, 
  loading 
}) => {
  if (!isOpen) return null;

  const getStatusIcon = (source) => {
    const isActive = source.active !== false;
    const lastChecked = source.last_checked ? new Date(source.last_checked) : null;
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const isRecent = lastChecked && lastChecked > oneHourAgo;
    
    if (isActive && isRecent) {
      return <CheckCircle size={14} style={{ color: '#10b981' }} />;
    } else if (isActive && !isRecent) {
      return <Clock size={14} style={{ color: '#f59e0b' }} />;
    } else {
      return <AlertCircle size={14} style={{ color: '#dc2626' }} />;
    }
  };

  const getStatusText = (source) => {
    const isActive = source.active !== false;
    const lastChecked = source.last_checked ? new Date(source.last_checked) : null;
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const isRecent = lastChecked && lastChecked > oneHourAgo;
    
    if (isActive && isRecent) return 'Healthy';
    if (isActive && !isRecent) return 'Stale';
    return 'Inactive';
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(4px)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px'
    }}>
      <div style={{
        backgroundColor: '#2d2d30',
        border: '1px solid #3e3e42',
        borderRadius: '8px',
        width: '100%',
        maxWidth: '800px',
        maxHeight: '90vh',
        overflow: 'hidden',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '24px',
          borderBottom: '1px solid #3e3e42',
          backgroundColor: '#1e1e1e'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Database style={{ width: '24px', height: '24px', color: '#f59e0b' }} />
            <div>
              <h2 style={{ color: 'white', fontSize: '20px', fontWeight: '600', margin: 0 }}>
                Data Sources Overview
              </h2>
              <p style={{ color: '#888888', fontSize: '14px', margin: '4px 0 0 0' }}>
                RSS feeds, APIs, and intelligence sources
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              color: '#888888',
              fontSize: '24px',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '4px'
            }}
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div style={{
          padding: '24px',
          maxHeight: 'calc(90vh - 140px)',
          overflowY: 'auto'
        }}>
          {loading ? (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '48px',
              color: '#888888'
            }}>
              <div style={{
                width: '32px',
                height: '32px',
                border: '3px solid #3e3e42',
                borderTop: '3px solid #f59e0b',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                marginRight: '12px'
              }}></div>
              Loading data sources...
            </div>
          ) : dataSourcesData ? (
            <div style={{ color: 'white' }}>
              {/* Summary Stats */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '16px',
                marginBottom: '24px'
              }}>
                <div style={{
                  backgroundColor: '#1e1e1e',
                  border: '1px solid #3e3e42',
                  borderRadius: '6px',
                  padding: '16px',
                  textAlign: 'center'
                }}>
                  <div style={{ color: '#3b82f6', fontSize: '24px', fontWeight: 'bold' }}>
                    {dataSourcesData.stats.totalSources}
                  </div>
                  <div style={{ color: '#888888', fontSize: '12px' }}>Total Sources</div>
                </div>
                <div style={{
                  backgroundColor: '#1e1e1e',
                  border: '1px solid #3e3e42',
                  borderRadius: '6px',
                  padding: '16px',
                  textAlign: 'center'
                }}>
                  <div style={{ color: '#10b981', fontSize: '24px', fontWeight: 'bold' }}>
                    {dataSourcesData.stats.statusStats.healthy}
                  </div>
                  <div style={{ color: '#888888', fontSize: '12px' }}>Healthy</div>
                </div>
                <div style={{
                  backgroundColor: '#1e1e1e',
                  border: '1px solid #3e3e42',
                  borderRadius: '6px',
                  padding: '16px',
                  textAlign: 'center'
                }}>
                  <div style={{ color: '#f59e0b', fontSize: '24px', fontWeight: 'bold' }}>
                    {dataSourcesData.stats.statusStats.stale}
                  </div>
                  <div style={{ color: '#888888', fontSize: '12px' }}>Stale</div>
                </div>
                <div style={{
                  backgroundColor: '#1e1e1e',
                  border: '1px solid #3e3e42',
                  borderRadius: '6px',
                  padding: '16px',
                  textAlign: 'center'
                }}>
                  <div style={{ color: '#dc2626', fontSize: '24px', fontWeight: 'bold' }}>
                    {dataSourcesData.stats.statusStats.inactive}
                  </div>
                  <div style={{ color: '#888888', fontSize: '12px' }}>Inactive</div>
                </div>
              </div>

              {/* Sources by Type */}
              {Object.entries(dataSourcesData.sourcesByType).map(([type, sources]) => (
                <div key={type} style={{ marginBottom: '24px' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '12px',
                    paddingBottom: '8px',
                    borderBottom: '1px solid #3e3e42'
                  }}>
                    <Database style={{ width: '18px', height: '18px', color: '#f59e0b' }} />
                    <h3 style={{ color: 'white', fontSize: '16px', fontWeight: '600', margin: 0 }}>
                      {type} Sources ({sources.length})
                    </h3>
                  </div>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                    gap: '12px'
                  }}>
                    {sources.map((source, index) => (
                      <div key={source.id || index} style={{
                        backgroundColor: '#1e1e1e',
                        border: '1px solid #3e3e42',
                        borderRadius: '6px',
                        padding: '12px'
                      }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'start',
                          justifyContent: 'space-between',
                          marginBottom: '8px'
                        }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ color: 'white', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
                              {source.source_name || 'Unnamed Source'}
                            </div>
                            <div style={{ color: '#888888', fontSize: '12px', marginBottom: '8px' }}>
                              {source.source_url && (
                                <a 
                                  href={source.source_url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  style={{ 
                                    color: '#3b82f6', 
                                    textDecoration: 'none',
                                    fontSize: '11px'
                                  }}
                                >
                                  {source.source_url.length > 40 ? 
                                    `${source.source_url.substring(0, 40)}...` : 
                                    source.source_url
                                  }
                                </a>
                              )}
                            </div>
                          </div>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}>
                            {getStatusIcon(source)}
                            <span style={{
                              color: getStatusText(source) === 'Healthy' ? '#10b981' : 
                                     getStatusText(source) === 'Stale' ? '#f59e0b' : '#dc2626',
                              fontSize: '11px',
                              fontWeight: '500'
                            }}>
                              {getStatusText(source)}
                            </span>
                          </div>
                        </div>
                        
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          fontSize: '10px',
                          color: '#666666'
                        }}>
                          <span>Type: {source.source_type || 'Unknown'}</span>
                          {source.last_checked && (
                            <span>
                              Last: {new Date(source.last_checked).toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {Object.keys(dataSourcesData.sourcesByType).length === 0 && (
                <div style={{
                  textAlign: 'center',
                  padding: '48px',
                  color: '#888888'
                }}>
                  No data sources found
                </div>
              )}
            </div>
          ) : (
            <div style={{
              textAlign: 'center',
              padding: '48px',
              color: '#888888'
            }}>
              No data sources data available
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '24px',
          borderTop: '1px solid #3e3e42',
          backgroundColor: '#1e1e1e'
        }}>
          <div style={{ color: '#888888', fontSize: '12px' }}>
            {dataSourcesData && (
              <>Last updated: {new Date().toLocaleString()}</>
            )}
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={onClose}
              style={{
                backgroundColor: 'transparent',
                border: '1px solid #6b7280',
                color: '#cccccc',
                padding: '8px 16px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Close
            </button>
            <button style={{
              backgroundColor: '#f59e0b',
              border: 'none',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}>
              Refresh Sources
            </button>
          </div>
        </div>
      </div>
      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default DataSourcesModal;