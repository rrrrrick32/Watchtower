import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

const FFIRVisualization = ({ decisionPoints, workflowData, styles }) => {
  const [expandedDecisions, setExpandedDecisions] = useState({});
  const [expandedFFIRs, setExpandedFFIRs] = useState({});

  if (!workflowData) return null;
  const { ffirs, companyIndicators } = workflowData;

  const toggleDecision = (decisionId) => {
    setExpandedDecisions(prev => ({
      ...prev,
      [decisionId]: !prev[decisionId]
    }));
  };

  const toggleFFIR = (ffirId) => {
    setExpandedFFIRs(prev => ({
      ...prev,
      [ffirId]: !prev[ffirId]
    }));
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#f8f9fa', height: '100%', overflow: 'auto' }}>
      <h3 style={{ marginBottom: '20px', color: '#2d3748' }}>
        Friendly Force Information Requirements & Company Status Indicators
      </h3>

      {decisionPoints.map(decision => (
        <div key={decision.id} style={{ marginBottom: '15px' }}>
          {/* Collapsible Decision Header */}
          <div 
            onClick={() => toggleDecision(decision.id)}
            style={{
              backgroundColor: '#805ad5',
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
            onMouseEnter={(e) => e.target.style.backgroundColor = '#7c3aed'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#805ad5'}
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
                {ffirs[decision.id] && ffirs[decision.id].map(ffir => (
                  <div key={ffir.id} style={{
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '6px',
                    overflow: 'hidden'
                  }}>
                    {/* Collapsible FFIR Header */}
                    <div 
                      onClick={() => toggleFFIR(ffir.id)}
                      style={{
                        backgroundColor: '#9f7aea',
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
                      onMouseEnter={(e) => e.target.closest('div').style.backgroundColor = '#8b5cf6'}
                      onMouseLeave={(e) => e.target.closest('div').style.backgroundColor = '#9f7aea'}
                    >
                      <span>FFIR: {ffir.question}</span>
                      {expandedFFIRs[ffir.id] ? 
                        <ChevronDown size={16} /> : 
                        <ChevronRight size={16} />
                      }
                    </div>

                    {/* Collapsible FFIR Content */}
                    {expandedFFIRs[ffir.id] && (
                      <div style={{ 
                        padding: '15px',
                        animation: 'fadeIn 0.2s ease-in'
                      }}>
                        <div style={{ marginBottom: '12px', fontSize: '12px', color: '#000' }}>
                          Priority: {ffir.priority} | Timeframe: {ffir.timeframe} | Category: {ffir.category}
                        </div>

                        <div style={{ fontSize: '14px', fontWeight: '500', marginBottom: '10px', color: '#000' }}>
                          Company Status Indicators:
                        </div>

                        {companyIndicators[ffir.id] && companyIndicators[ffir.id].map(indicator => (
                          <div key={indicator.id} style={{
                            backgroundColor: '#e6fffa',
                            border: '1px solid #4fd1c7',
                            padding: '10px',
                            borderRadius: '4px',
                            marginBottom: '8px',
                            fontSize: '12px'
                          }}>
                            <div style={{ fontWeight: '500', marginBottom: '4px', color: '#000' }}>
                              {indicator.description}
                            </div>
                            <div style={{ color: '#000' }}>
                              <div>Source: {indicator.source}</div>
                              <div>Frequency: {indicator.frequency}</div>
                              <div>Measurement: {indicator.measurement}</div>
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

export default FFIRVisualization;