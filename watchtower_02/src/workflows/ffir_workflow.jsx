// ffir_workflow.jsx - Simplified for Backend Workflow (Visualization Only)
import React from 'react';

/**
 * FFIR Visualization Component - Displays backend-generated intelligence
 * No workflow logic needed - backend handles all intelligence generation
 */

/**
 * React component for FFIR visualization
 */
const FFIRVisualization = ({ decisionPoints, workflowData, styles }) => {
  if (!workflowData) {
    return (
      <div style={{ padding: '20px', backgroundColor: '#f8f9fa' }}>
        <h3 style={{ marginBottom: '20px', color: '#2d3748' }}>
          Friendly Force Information Requirements & Company Status Indicators
        </h3>
        <p>Loading AI-generated internal readiness requirements...</p>
      </div>
    );
  }

  const { ffirs, companyIndicators } = workflowData;

  // Filter decision points to show only FFIRs
  const ffirDecisions = decisionPoints?.filter(d => d.type === 'FFIR') || [];

  return (
    <div style={{ padding: '20px', backgroundColor: '#f8f9fa' }}>
      <h3 style={{ marginBottom: '20px', color: '#2d3748' }}>
        Friendly Force Information Requirements & Company Status Indicators
      </h3>
      
      {ffirDecisions.length === 0 ? (
        <div style={{ 
          padding: '20px', 
          backgroundColor: 'white', 
          borderRadius: '8px',
          border: '1px solid #e2e8f0',
          textAlign: 'center',
          color: '#666'
        }}>
          No internal readiness requirements identified for this objective.
        </div>
      ) : (
        ffirDecisions.map(decision => (
          <div key={decision.id} style={{ marginBottom: '30px' }}>
            <div style={{
              backgroundColor: '#805ad5',
              color: 'white',
              padding: '12px',
              borderRadius: '8px',
              marginBottom: '15px',
              fontWeight: '600'
            }}>
              Decision: {decision.title}
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {ffirs[decision.id] && ffirs[decision.id].map(ffir => (
                <div key={ffir.id} style={{
                  backgroundColor: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  padding: '15px'
                }}>
                  <div style={{
                    backgroundColor: '#9f7aea',
                    color: 'white',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    marginBottom: '10px',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}>
                    FFIR: {ffir.question}
                  </div>
                  
                  <div style={{ paddingLeft: '20px' }}>
                    <div style={{ marginBottom: '8px', fontSize: '12px', color: '#666' }}>
                      Priority: {ffir.priority} | Timeframe: {ffir.timeframe}
                      {ffir.category && ` | Category: ${ffir.category}`}
                    </div>
                    
                    <div style={{ fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                      Internal Assessment Methods:
                    </div>
                    
                    {companyIndicators[ffir.id] && companyIndicators[ffir.id].map(indicator => (
                      <div key={indicator.id} style={{
                        backgroundColor: '#e6fffa',
                        border: '1px solid #4fd1c7',
                        padding: '8px',
                        borderRadius: '4px',
                        marginBottom: '5px',
                        fontSize: '12px'
                      }}>
                        <div style={{ fontWeight: '500' }}>{indicator.description}</div>
                        <div style={{ color: '#666', marginTop: '2px' }}>
                          <div>Source: {indicator.source}</div>
                          <div>Frequency: {indicator.frequency}</div>
                          {indicator.measurement && <div>Measurement: {indicator.measurement}</div>}
                        </div>
                      </div>
                    ))}
                    
                    {(!companyIndicators[ffir.id] || companyIndicators[ffir.id].length === 0) && (
                      <div style={{
                        backgroundColor: '#f7fafc',
                        padding: '8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        color: '#666',
                        fontStyle: 'italic'
                      }}>
                        Assessment methods will be defined by the internal teams
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {(!ffirs[decision.id] || ffirs[decision.id].length === 0) && (
                <div style={{
                  backgroundColor: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  padding: '15px',
                  textAlign: 'center',
                  color: '#666',
                  fontStyle: 'italic'
                }}>
                  Internal readiness requirements are being processed for this decision
                </div>
              )}
            </div>
          </div>
        ))
      )}
      
      {workflowData.summary && (
        <div style={{
          marginTop: '30px',
          padding: '15px',
          backgroundColor: '#edf2f7',
          borderRadius: '8px',
          fontSize: '14px'
        }}>
          <strong>Summary:</strong> {workflowData.summary.totalFFIRs} internal requirements 
          across {workflowData.summary.totalDecisions} readiness decisions
        </div>
      )}
    </div>
  );
};

// Export only the visualization component - no workflow logic needed
export { FFIRVisualization };
export default FFIRVisualization;