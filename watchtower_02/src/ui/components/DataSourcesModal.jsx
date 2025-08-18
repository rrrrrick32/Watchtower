// DataSourcesModal.jsx - Create this as a separate file
import React, { useState, useEffect } from 'react';
import { Database, ChevronRight, Plus } from 'lucide-react';

const DataSourcesModal = ({ isOpen, onClose, dataSourcesData, loading }) => {
  const [expandedTypes, setExpandedTypes] = useState({});
  const [selectedSource, setSelectedSource] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Initialize expanded state when data loads
  useEffect(() => {
    if (dataSourcesData?.sourcesByType) {
      const initialExpanded = {};
      Object.keys(dataSourcesData.sourcesByType).forEach(type => {
        initialExpanded[type] = true;
      });
      setExpandedTypes(initialExpanded);
    }
  }, [dataSourcesData]);

  const toggleType = (type) => {
    setExpandedTypes(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  const getSourceStatus = (source) => {
    const isActive = source.active !== false;
    const lastChecked = source.last_checked ? new Date(source.last_checked) : null;
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const isRecent = lastChecked && lastChecked > oneHourAgo;
    
    if (!isActive) return { status: 'Inactive', color: '#d1d5db', bgColor: '#374151' };
    if (isRecent) return { status: 'Healthy', color: '#d1fae5', bgColor: '#065f46' };
    return { status: 'Stale', color: '#fde68a', bgColor: '#78350f' };
  };

  const formatUrl = (url, maxLength = 60) => {
    if (!url) return 'No URL';
    return url.length > maxLength ? url.substring(0, maxLength) + '...' : url;
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'Never';
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  // Filter sources based on search term
  const filteredSourcesByType = {};
  if (dataSourcesData?.sourcesByType) {
    Object.entries(dataSourcesData.sourcesByType).forEach(([type, sources]) => {
      const filtered = sources.filter(source => 
        source.source_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        source.source_url?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      if (filtered.length > 0) {
        filteredSourcesByType[type] = filtered;
      }
    });
  }

  if (!isOpen) return null;

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
        maxWidth: '1200px',
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
                Data Sources Management
              </h2>
              <p style={{ color: '#888888', fontSize: '14px', margin: '4px 0 0 0' }}>
                RSS Feeds and External Data Sources
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <input
              type="text"
              placeholder="Search sources..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                backgroundColor: '#2a2a2a',
                border: '1px solid #444444',
                borderRadius: '4px',
                padding: '8px 12px',
                color: '#cccccc',
                fontSize: '14px',
                width: '200px'
              }}
            />
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
        </div>

        {/* Content */}
        <div style={{
          display: 'flex',
          height: 'calc(90vh - 140px)'
        }}>
          {/* Left Panel - Stats & Overview */}
          <div style={{
            width: '300px',
            padding: '24px',
            borderRight: '1px solid #3e3e42',
            backgroundColor: '#1e1e1e',
            overflowY: 'auto'
          }}>
            {loading ? (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '48px 0',
                color: '#888888'
              }}>
                <div style={{
                  width: '24px',
                  height: '24px',
                  border: '2px solid #3e3e42',
                  borderTop: '2px solid #f59e0b',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                  marginRight: '8px'
                }}></div>
                Loading...
              </div>
            ) : dataSourcesData ? (
              <>
                {/* Overview Stats */}
                <div style={{
                  backgroundColor: '#2a2a2a',
                  border: '1px solid #3e3e42',
                  borderRadius: '6px',
                  padding: '16px',
                  marginBottom: '20px'
                }}>
                  <h3 style={{ color: 'white', fontSize: '16px', fontWeight: '600', margin: '0 0 16px 0' }}>
                    Overview
                  </h3>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '12px'
                  }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ color: '#f59e0b', fontSize: '24px', fontWeight: 'bold' }}>
                        {dataSourcesData.stats.totalSources}
                      </div>
                      <div style={{ color: '#888888', fontSize: '12px' }}>Total Sources</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ color: '#10b981', fontSize: '24px', fontWeight: 'bold' }}>
                        {dataSourcesData.stats.activeSources}
                      </div>
                      <div style={{ color: '#888888', fontSize: '12px' }}>Active</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ color: '#3b82f6', fontSize: '24px', fontWeight: 'bold' }}>
                        {dataSourcesData.stats.recentlyChecked}
                      </div>
                      <div style={{ color: '#888888', fontSize: '12px' }}>Recent</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ color: '#8b5cf6', fontSize: '24px', fontWeight: 'bold' }}>
                        {dataSourcesData.stats.sourceTypes}
                      </div>
                      <div style={{ color: '#888888', fontSize: '12px' }}>Types</div>
                    </div>
                  </div>
                </div>

                {/* Health Status */}
                <div style={{
                  backgroundColor: '#2a2a2a',
                  border: '1px solid #3e3e42',
                  borderRadius: '6px',
                  padding: '16px',
                  marginBottom: '20px'
                }}>
                  <h3 style={{ color: 'white', fontSize: '16px', fontWeight: '600', margin: '0 0 16px 0' }}>
                    Health Status
                  </h3>
                  <div style={{ space: '8px' }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '8px 0',
                      borderBottom: '1px solid #444444'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '8px', height: '8px', backgroundColor: '#10b981', borderRadius: '50%' }}></div>
                        <span style={{ color: '#cccccc', fontSize: '14px' }}>Healthy</span>
                      </div>
                      <span style={{ color: '#10b981', fontWeight: '600' }}>
                        {dataSourcesData.stats.statusStats.healthy}
                      </span>
                    </div>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '8px 0',
                      borderBottom: '1px solid #444444'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '8px', height: '8px', backgroundColor: '#f59e0b', borderRadius: '50%' }}></div>
                        <span style={{ color: '#cccccc', fontSize: '14px' }}>Stale</span>
                      </div>
                      <span style={{ color: '#f59e0b', fontWeight: '600' }}>
                        {dataSourcesData.stats.statusStats.stale}
                      </span>
                    </div>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '8px 0'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '8px', height: '8px', backgroundColor: '#6b7280', borderRadius: '50%' }}></div>
                        <span style={{ color: '#cccccc', fontSize: '14px' }}>Inactive</span>
                      </div>
                      <span style={{ color: '#6b7280', fontWeight: '600' }}>
                        {dataSourcesData.stats.statusStats.inactive}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Source Types */}
                <div style={{
                  backgroundColor: '#2a2a2a',
                  border: '1px solid #3e3e42',
                  borderRadius: '6px',
                  padding: '16px'
                }}>
                  <h3 style={{ color: 'white', fontSize: '16px', fontWeight: '600', margin: '0 0 16px 0' }}>
                    Source Types
                  </h3>
                  {Object.entries(dataSourcesData.sourcesByType).map(([type, sources]) => (
                    <div key={type} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '8px 0',
                      borderBottom: '1px solid #444444'
                    }}>
                      <span style={{ color: '#cccccc', fontSize: '14px' }}>{type}</span>
                      <span style={{ color: '#3b82f6', fontWeight: '600' }}>{sources.length}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div style={{ color: '#888888', textAlign: 'center', padding: '48px 0' }}>
                No data available
              </div>
            )}
          </div>

          {/* Right Panel - Sources List */}
          <div style={{
            flex: 1,
            padding: '24px',
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
            ) : Object.keys(filteredSourcesByType).length > 0 ? (
              <div style={{ color: 'white' }}>
                {Object.entries(filteredSourcesByType).map(([type, sources]) => (
                  <div key={type} style={{ marginBottom: '32px' }}>
                    <button
                      onClick={() => toggleType(type)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        backgroundColor: 'transparent',
                        border: 'none',
                        color: 'white',
                        fontSize: '18px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        padding: 0,
                        marginBottom: '16px'
                      }}
                    >
                      <ChevronRight style={{
                        width: '20px',
                        height: '20px',
                        transform: expandedTypes[type] ? 'rotate(90deg)' : 'rotate(0deg)',
                        transition: 'transform 0.2s ease'
                      }} />
                      {type} Sources ({sources.length})
                    </button>

                    {expandedTypes[type] && (
                      <div style={{
                        marginLeft: '28px',
                        borderLeft: '2px solid #3e3e42',
                        paddingLeft: '24px'
                      }}>
                        {sources.map(source => {
                          const sourceStatus = getSourceStatus(source);
                          return (
                            <div 
                              key={source.id} 
                              style={{
                                backgroundColor: selectedSource?.id === source.id ? '#2a2a2a' : '#1e1e1e',
                                border: '1px solid #3e3e42',
                                borderRadius: '6px',
                                padding: '16px',
                                marginBottom: '12px',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease'
                              }}
                              onClick={() => setSelectedSource(selectedSource?.id === source.id ? null : source)}
                            >
                              <div style={{
                                display: 'flex',
                                alignItems: 'start',
                                justifyContent: 'space-between',
                                marginBottom: '8px'
                              }}>
                                <div style={{ flex: 1 }}>
                                  <h4 style={{ 
                                    color: 'white', 
                                    fontSize: '16px', 
                                    fontWeight: '600', 
                                    margin: '0 0 4px 0' 
                                  }}>
                                    {source.source_name || 'Unnamed Source'}
                                  </h4>
                                  <div style={{ color: '#888888', fontSize: '12px', marginBottom: '4px' }}>
                                    {formatUrl(source.source_url)}
                                  </div>
                                  <div style={{ color: '#666666', fontSize: '11px' }}>
                                    Last checked: {formatTimestamp(source.last_checked)}
                                  </div>
                                </div>
                                <div style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '8px'
                                }}>
                                  <span style={{
                                    backgroundColor: sourceStatus.bgColor,
                                    color: sourceStatus.color,
                                    padding: '4px 8px',
                                    borderRadius: '4px',
                                    fontSize: '12px',
                                    fontWeight: '500'
                                  }}>
                                    {sourceStatus.status}
                                  </span>
                                  {source.source_url && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        window.open(source.source_url, '_blank');
                                      }}
                                      style={{
                                        backgroundColor: 'transparent',
                                        border: '1px solid #6b7280',
                                        color: '#cccccc',
                                        padding: '4px 8px',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        fontSize: '11px'
                                      }}
                                    >
                                      Visit
                                    </button>
                                  )}
                                </div>
                              </div>

                              {selectedSource?.id === source.id && (
                                <div style={{
                                  marginTop: '16px',
                                  paddingTop: '16px',
                                  borderTop: '1px solid #444444'
                                }}>
                                  <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: '1fr 1fr',
                                    gap: '16px',
                                    fontSize: '13px'
                                  }}>
                                    <div>
                                      <div style={{ color: '#888888', marginBottom: '4px' }}>Source Type:</div>
                                      <div style={{ color: '#cccccc' }}>{source.source_type || 'RSS'}</div>
                                    </div>
                                    <div>
                                      <div style={{ color: '#888888', marginBottom: '4px' }}>Active:</div>
                                      <div style={{ color: source.active !== false ? '#10b981' : '#dc2626' }}>
                                        {source.active !== false ? 'Yes' : 'No'}
                                      </div>
                                    </div>
                                    <div>
                                      <div style={{ color: '#888888', marginBottom: '4px' }}>Created:</div>
                                      <div style={{ color: '#cccccc' }}>
                                        {source.created_at ? new Date(source.created_at).toLocaleDateString() : 'Unknown'}
                                      </div>
                                    </div>
                                    <div>
                                      <div style={{ color: '#888888', marginBottom: '4px' }}>Source ID:</div>
                                      <div style={{ color: '#cccccc', fontFamily: 'monospace', fontSize: '11px' }}>
                                        {source.id}
                                      </div>
                                    </div>
                                  </div>
                                  
                                  {source.source_url && (
                                    <div style={{ marginTop: '12px' }}>
                                      <div style={{ color: '#888888', marginBottom: '4px' }}>Full URL:</div>
                                      <div style={{ 
                                        color: '#cccccc', 
                                        backgroundColor: '#2a2a2a',
                                        padding: '8px',
                                        borderRadius: '4px',
                                        fontSize: '11px',
                                        fontFamily: 'monospace',
                                        wordBreak: 'break-all'
                                      }}>
                                        {source.source_url}
                                      </div>
                                    </div>
                                  )}

                                  <div style={{
                                    display: 'flex',
                                    gap: '8px',
                                    marginTop: '16px'
                                  }}>
                                    <button style={{
                                      backgroundColor: '#3b82f6',
                                      color: 'white',
                                      border: 'none',
                                      padding: '6px 12px',
                                      borderRadius: '4px',
                                      cursor: 'pointer',
                                      fontSize: '12px'
                                    }}>
                                      Test Connection
                                    </button>
                                    <button style={{
                                      backgroundColor: source.active !== false ? '#dc2626' : '#10b981',
                                      color: 'white',
                                      border: 'none',
                                      padding: '6px 12px',
                                      borderRadius: '4px',
                                      cursor: 'pointer',
                                      fontSize: '12px'
                                    }}>
                                      {source.active !== false ? 'Disable' : 'Enable'}
                                    </button>
                                    <button style={{
                                      backgroundColor: 'transparent',
                                      border: '1px solid #dc2626',
                                      color: '#dc2626',
                                      padding: '6px 12px',
                                      borderRadius: '4px',
                                      cursor: 'pointer',
                                      fontSize: '12px'
                                    }}>
                                      Remove
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div style={{
                textAlign: 'center',
                padding: '48px',
                color: '#888888'
              }}>
                {searchTerm ? 'No sources match your search' : 'No data sources available'}
              </div>
            )}
          </div>
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
          <div style={{ display: 'flex', gap: '12px' }}>
            <button style={{
              backgroundColor: '#10b981',
              border: 'none',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <Plus size={16} />
              Add Source
            </button>
            <button style={{
              backgroundColor: '#3b82f6',
              border: 'none',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}>
              Refresh All
            </button>
          </div>
          
          <div style={{ display: 'flex', gap: '12px' }}>
            <button style={{
              backgroundColor: '#6b7280',
              border: 'none',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}>
              Export List
            </button>
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