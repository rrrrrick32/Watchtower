import React, { useState } from 'react';
import { Target, ChevronRight, AlertTriangle, Activity, X } from 'lucide-react';

const IntelligenceWorkflowModal = ({ 
  isOpen, 
  onClose, 
  workflowData, 
  loading 
}) => {
  const [expandedSections, setExpandedSections] = useState({
    decisions: true,
    pirs: true,
    indicators: true
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

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
        maxWidth: '1000px',
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
            <Target style={{ width: '24px', height: '24px', color: '#3b82f6' }} />
            <div>
              <h2 style={{ color: 'white', fontSize: '20px', fontWeight: '600', margin: 0 }}>
                Intelligence Workflow
              </h2>
              <p style={{ color: '#888888', fontSize: '14px', margin: '4px 0 0 0' }}>
                Strategic Intent → Decisions → PIRs → Indicators
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
                borderTop: '3px solid #3b82f6',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                marginRight: '12px'
              }}></div>
              Loading workflow data...
            </div>
          ) : workflowData ? (
            <div style={{ color: 'white' }}>
              {/* Strategic Intent */}
              <div style={{
                backgroundColor: '#1e1e1e',
                border: '1px solid #3e3e42',
                borderRadius: '6px',
                padding: '16px',
                marginBottom: '24px'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '8px'
                }}>
                  <Target style={{ width: '20px', height: '20px', color: '#3b82f6' }} />
                  <h3 style={{ color: 'white', fontSize: '16px', fontWeight: '600', margin: 0 }}>
                    Strategic Intent
                  </h3>
                </div>
                <p style={{ color: '#cccccc', margin: '0 0 8px 0', fontSize: '14px' }}>
                  {workflowData.strategicIntent.text}
                </p>
                {workflowData.strategicIntent.context && (
                  <p style={{ color: '#888888', margin: 0, fontSize: '12px' }}>
                    {workflowData.strategicIntent.context}
                  </p>
                )}
              </div>

              {/* Decisions */}
              <div style={{ marginBottom: '16px' }}>
                <button
                  onClick={() => toggleSection('decisions')}
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
                    transform: expandedSections.decisions ? 'rotate(90deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s ease'
                  }} />
                  Decision Points ({workflowData.decisions?.length || 0})
                </button>

                {expandedSections.decisions && workflowData.decisions?.map(decision => (
                  <div key={decision.id} style={{
                    marginLeft: '28px',
                    borderLeft: '2px solid #3e3e42',
                    paddingLeft: '24px',
                    marginBottom: '24px'
                  }}>
                    <div style={{
                      backgroundColor: '#1e1e1e',
                      border: '1px solid #3e3e42',
                      borderRadius: '6px',
                      padding: '16px'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'start',
                        justifyContent: 'space-between',
                        marginBottom: '8px'
                      }}>
                        <h4 style={{ color: 'white', fontSize: '16px', fontWeight: '600', margin: 0 }}>
                          {decision.title}
                        </h4>
                        <span style={{
                          backgroundColor: decision.status === 'active' ? '#065f46' : '#374151',
                          color: decision.status === 'active' ? '#d1fae5' : '#d1d5db',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: '500'
                        }}>
                          {decision.status || 'active'}
                        </span>
                      </div>

                      {/* PIRs for this decision */}
                      <div style={{ marginTop: '16px' }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          marginBottom: '12px'
                        }}>
                          <AlertTriangle style={{ width: '16px', height: '16px', color: '#f59e0b' }} />
                          <span style={{ color: '#cccccc', fontSize: '14px', fontWeight: '500' }}>
                            Priority Intelligence Requirements ({decision.pirs?.length || 0})
                          </span>
                        </div>

                        {decision.pirs?.map(pir => (
                          <div key={pir.id} style={{
                            marginLeft: '24px',
                            borderLeft: '1px solid #444444',
                            paddingLeft: '16px',
                            marginBottom: '16px'
                          }}>
                            <div style={{
                              backgroundColor: '#2a2a2a',
                              border: '1px solid #444444',
                              borderRadius: '4px',
                              padding: '12px'
                            }}>
                              <div style={{
                                display: 'flex',
                                alignItems: 'start',
                                justifyContent: 'space-between',
                                marginBottom: '8px'
                              }}>
                                <p style={{ color: '#e5e5e5', fontSize: '14px', fontWeight: '500', margin: 0 }}>
                                  {pir.question}
                                </p>
                                <span style={{
                                  backgroundColor: pir.priority === 'high' ? '#7f1d1d' : pir.priority === 'medium' ? '#78350f' : '#166534',
                                  color: pir.priority === 'high' ? '#fecaca' : pir.priority === 'medium' ? '#fde68a' : '#bbf7d0',
                                  padding: '2px 6px',
                                  borderRadius: '3px',
                                  fontSize: '11px',
                                  fontWeight: '500'
                                }}>
                                  {pir.priority}
                                </span>
                              </div>

                              {/* Indicators for this PIR */}
                              <div style={{ marginTop: '12px' }}>
                                <div style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '8px',
                                  marginBottom: '8px'
                                }}>
                                  <Activity style={{ width: '14px', height: '14px', color: '#10b981' }} />
                                  <span style={{ color: '#888888', fontSize: '12px' }}>
                                    Active Indicators ({pir.indicators?.length || 0})
                                  </span>
                                </div>

                                {pir.indicators?.map(indicator => (
                                  <div key={indicator.id} style={{
                                    marginLeft: '20px',
                                    backgroundColor: '#1a1a1a',
                                    border: '1px solid #3e3e42',
                                    borderRadius: '4px',
                                    padding: '12px',
                                    marginBottom: '8px'
                                  }}>
                                    <div style={{
                                      display: 'flex',
                                      alignItems: 'start',
                                      justifyContent: 'space-between'
                                    }}>
                                      <div style={{ flex: 1 }}>
                                        <p style={{ color: '#cccccc', fontSize: '13px', margin: '0 0 8px 0' }}>
                                          {indicator.text}
                                        </p>
                                        <div style={{
                                          display: 'flex',
                                          alignItems: 'center',
                                          gap: '16px',
                                          fontSize: '11px',
                                          color: '#666666'
                                        }}>
                                          <span>Type: {indicator.type}</span>
                                          <span>Status: {indicator.status}</span>
                                          <span>Updated: {new Date(indicator.lastUpdated).toLocaleString()}</span>
                                        </div>
                                      </div>
                                      <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px'
                                      }}>
                                        <div style={{
                                          width: '8px',
                                          height: '8px',
                                          backgroundColor: '#10b981',
                                          borderRadius: '50%'
                                        }}></div>
                                        <span style={{ color: '#10b981', fontSize: '11px' }}>Live</span>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary Stats */}
              <div style={{
                backgroundColor: '#1e1e1e',
                border: '1px solid #3e3e42',
                borderRadius: '6px',
                padding: '16px'
              }}>
                <h3 style={{ color: 'white', fontSize: '16px', fontWeight: '600', margin: '0 0 12px 0' }}>
                  Workflow Summary
                </h3>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '16px',
                  textAlign: 'center'
                }}>
                  <div>
                    <div style={{ color: '#3b82f6', fontSize: '24px', fontWeight: 'bold' }}>
                      {workflowData.decisions?.length || 0}
                    </div>
                    <div style={{ color: '#888888', fontSize: '12px' }}>Decision Points</div>
                  </div>
                  <div>
                    <div style={{ color: '#f59e0b', fontSize: '24px', fontWeight: 'bold' }}>
                      {workflowData.decisions?.reduce((total, decision) => 
                        total + (decision.pirs?.length || 0), 0) || 0}
                    </div>
                    <div style={{ color: '#888888', fontSize: '12px' }}>PIRs</div>
                  </div>
                  <div>
                    <div style={{ color: '#10b981', fontSize: '24px', fontWeight: 'bold' }}>
                      {workflowData.decisions?.reduce((total, decision) => 
                        total + (decision.pirs?.reduce((pirTotal, pir) => 
                          pirTotal + (pir.indicators?.length || 0), 0) || 0), 0) || 0}
                    </div>
                    <div style={{ color: '#888888', fontSize: '12px' }}>Active Indicators</div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div style={{
              textAlign: 'center',
              padding: '48px',
              color: '#888888'
            }}>
              No workflow data available
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '12px',
          padding: '24px',
          borderTop: '1px solid #3e3e42',
          backgroundColor: '#1e1e1e'
        }}>
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
            backgroundColor: '#3b82f6',
            border: 'none',
            color: 'white',
            padding: '8px 16px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px'
          }}>
            Export Workflow
          </button>
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

export default IntelligenceWorkflowModal;