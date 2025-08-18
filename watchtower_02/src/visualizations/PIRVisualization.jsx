import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

const PIRVisualization = ({ decisionPoints, workflowData, styles }) => {
  const [expandedDecisions, setExpandedDecisions] = useState({});
  const [expandedPIRs, setExpandedPIRs] = useState({});

  if (!workflowData) return null;
  const { pirs, indicators } = workflowData;

  const toggleDecision = (decisionId) => {
    setExpandedDecisions(prev => ({
      ...prev,
      [decisionId]: !prev[decisionId]
    }));
  };

  const togglePIR = (pirId) => {
    setExpandedPIRs(prev => ({
      ...prev,
      [pirId]: !prev[pirId]
    }));
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#f8f9fa', height: '100%', overflow: 'auto' }}>
      <h3 style={{ marginBottom: '20px', color: '#2d3748' }}>
        Priority Intelligence Requirements & Indicators
      </h3>

      {decisionPoints.map(decision => (
        <div key={decision.id} style={{ marginBottom: '15px' }}>
          {/* Collapsible Decision Header */}
          <div 
            onClick={() => toggleDecision(decision.id)}
            style={{
              backgroundColor: '#4299e1',
              color: 'white',
              padding: '12px',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              transition: 'background-color 0.2s ease'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#3182ce'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#4299e1'}
          >
            <span>Decision: {decision.title}</span>
            {expandedDecisions[decision.id] ? 
              <ChevronDown size={20} /> : 
              <ChevronRight size={20} />
            }
          </div>

          {/* Collapsible Decision Content */}
          {expandedDecisions[decision.id] && (
            <div style={{ 
              marginTop: '10px',
              animation: 'fadeIn 0.2s ease-in'
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {pirs[decision.id] && pirs[decision.id].map(pir => (
                  <div key={pir.id} style={{
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '6px',
                    overflow: 'hidden'
                  }}>
                    {/* Collapsible PIR Header */}
                    <div 
                      onClick={() => togglePIR(pir.id)}
                      style={{
                        backgroundColor: '#48bb78',
                        color: 'white',
                        padding: '10px 15px',
                        fontSize: '14px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        transition: 'background-color 0.2s ease'
                      }}
                      onMouseEnter={(e) => e.target.closest('div').style.backgroundColor = '#38a169'}
                      onMouseLeave={(e) => e.target.closest('div').style.backgroundColor = '#48bb78'}
                    >
                      <span>PIR: {pir.question}</span>
                      {expandedPIRs[pir.id] ? 
                        <ChevronDown size={16} /> : 
                        <ChevronRight size={16} />
                      }
                    </div>

                    {/* Collapsible PIR Content */}
                    {expandedPIRs[pir.id] && (
                      <div style={{ 
                        padding: '15px',
                        animation: 'fadeIn 0.2s ease-in'
                      }}>
                        <div style={{ marginBottom: '12px', fontSize: '12px', color: '#000' }}>
                          Priority: {pir.priority} | Timeframe: {pir.timeframe}
                        </div>

                        <div style={{ fontSize: '14px', fontWeight: '500', marginBottom: '10px', color: '#000' }}>
                          Indicators:
                        </div>

                        {indicators[pir.id] && indicators[pir.id].map(indicator => (
                          <div key={indicator.id} style={{
                            backgroundColor: '#fffaf0',
                            border: '1px solid #ed8936',
                            padding: '10px',
                            borderRadius: '4px',
                            marginBottom: '8px',
                            fontSize: '12px'
                          }}>
                            <div style={{ fontWeight: '500', marginBottom: '4px', color: '#000' }}>
                              {indicator.description}
                            </div>
                            <div style={{ color: '#333' }}>
                              Source: {indicator.source} | {indicator.frequency}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-5px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default PIRVisualization;