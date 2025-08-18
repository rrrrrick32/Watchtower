// Updated AnalysisPanel.jsx - Strategic Intelligence Focus with Decision Points Control
import React, { useState } from 'react';

const AnalysisPanel = ({ 
  currentAnalysis, 
  formData, 
  setCurrentAnalysis, 
  handleAnalyze, 
  handleInputChange,
  isAnalyzing,
  analysisComplete,
  styles 
}) => {
  
  // State for expandable decision points
  const [expandedPoints, setExpandedPoints] = useState({});
  
  // State for decision points dropdown
  const [decisionPoints, setDecisionPoints] = useState('auto');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleExpanded = (index) => {
    setExpandedPoints(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  // Decision points options
  const decisionOptions = [
    { value: 'auto', label: 'Auto (3-5 based on complexity)' },
    { value: '3', label: '3 Decision Points' },
    { value: '4', label: '4 Decision Points' },
    { value: '5', label: '5 Decision Points' }
  ];

  // Modified analyze handler to include decision points
  const handleAnalyzeWithDecisionPoints = () => {
    const requestedDecisions = decisionPoints === 'auto' ? null : parseInt(decisionPoints);
    handleAnalyze(requestedDecisions);
  };

  // DEBUG LOGS
  console.log('Strategic Analysis Data:', currentAnalysis);
  console.log('PIR Workflows:', currentAnalysis?.pirWorkflows);
  console.log('FFIR Workflows:', currentAnalysis?.ffirWorkflows);

  return (
    <div className="analysis-panel" style={styles?.analysisPanel}>
      
      {/* Strategic Objective Section */}
      <div className="strategic-objective">
        <h3>Strategic Objective</h3>
        <input
          type="text"
          placeholder="Enter your strategic objective or business goal..."
          value={formData.objective}
          onChange={(e) => handleInputChange('objective', e.target.value)}
          className="objective-input"
          style={styles?.input}
        />
      </div>

      {/* Strategic Context Section */}
      <div className="strategic-context">
        <h3>Strategic Context</h3>
        <textarea
          type='text'
          placeholder="Add any relevant context, constraints, or background information..."
          value={formData.context}
          onChange={(e) => handleInputChange('context', e.target.value)}
          className="context-textarea"
          style={{
            ...styles?.textarea,
          verticalAlign: 'top',
          textAlign: 'left'
          }}
          rows={2}
        />
      </div>

      {/* Reference Links Section */}
      <div className="reference-links">
        <h3>Reference Links</h3>
        <input
          type="text"
          placeholder="Add relevant links for context (optional)"
          value={formData.links}
          onChange={(e) => handleInputChange('links', e.target.value)}
          className="links-input"
          style={styles?.input}
        />
      </div>

      {/* Decision Points Dropdown and Analyze Button Row */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'end', 
        gap: '16px', 
        marginTop: '16px' 
      }}>
        {/* Decision Points Dropdown */}
        <div style={{ flex: 1 }}>
          <h3 style={{ marginBottom: '8px' }}>Decision Points</h3>
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              style={{
                width: '100%',
                padding: '12px 16px',
                backgroundColor: '#2a2a2a',
                border: '1px solid #444',
                borderRadius: '6px',
                color: '#e0e0e0',
                fontSize: '14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                transition: 'background-color 0.2s ease'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#333'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#2a2a2a'}
            >
              <span style={{ display: 'flex', alignItems: 'center' }}>
                📊 {decisionOptions.find(opt => opt.value === decisionPoints)?.label}
              </span>
              <span style={{ 
                color: '#888',
                fontSize: '12px',
                transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s ease'
              }}>
                ▼
              </span>
            </button>
            
            {isDropdownOpen && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                marginTop: '4px',
                backgroundColor: '#2a2a2a',
                border: '1px solid #444',
                borderRadius: '6px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                zIndex: 10
              }}>
                {decisionOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setDecisionPoints(option.value);
                      setIsDropdownOpen(false);
                    }}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      backgroundColor: decisionPoints === option.value ? '#007bff' : 'transparent',
                      color: decisionPoints === option.value ? 'white' : '#e0e0e0',
                      border: 'none',
                      textAlign: 'left',
                      cursor: 'pointer',
                      fontSize: '14px',
                      transition: 'background-color 0.2s ease',
                      borderRadius: option === decisionOptions[0] ? '6px 6px 0 0' : 
                                   option === decisionOptions[decisionOptions.length - 1] ? '0 0 6px 6px' : '0'
                    }}
                    onMouseEnter={(e) => {
                      if (decisionPoints !== option.value) {
                        e.target.style.backgroundColor = '#333';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (decisionPoints !== option.value) {
                        e.target.style.backgroundColor = 'transparent';
                      }
                    }}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Analyze Button */}
        <button 
          onClick={handleAnalyzeWithDecisionPoints} 
          className="analyze-button"
          style={{
            ...styles?.button,
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '6px',
            fontSize: '16px',
            fontWeight: '500',
            cursor: isAnalyzing || !formData.objective.trim() ? 'not-allowed' : 'pointer',
            opacity: isAnalyzing || !formData.objective.trim() ? 0.6 : 1,
            minWidth: '140px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
          disabled={isAnalyzing || !formData.objective.trim()}
        >
          <span>▶</span>
          {isAnalyzing ? 'Analyzing...' : 'Analyze'}
        </button>
      </div>

      {/* Strategic Intelligence Results */}
      {analysisComplete && currentAnalysis && (
        <div className="strategic-intelligence-results" style={{
          maxHeight: 'none',
          overflowY: 'auto',
          border: '1px solid #444',
          borderRadius: '6px',
          padding: '16px',
          marginTop: '16px',
          paddingBottom: '24px'
        }}>
          
          {/* Executive Summary */}
          {currentAnalysis.executiveSummary && (
            <div className="executive-summary" style={styles?.section}>
              <h3>Executive Summary</h3>
              <p style={styles?.summaryText}>{currentAnalysis.executiveSummary}</p>
            </div>
          )}

          {/* Anticipated Decision Points - EXPANDABLE FORMAT */}
          {currentAnalysis.decisionPoints && currentAnalysis.decisionPoints.length > 0 && (
            <div className="anticipated-decisions" style={styles?.section}>
              <h3 style={styles?.sectionTitle}>
                🔍 Critical Decision Points
              </h3>
              
              {currentAnalysis.decisionPoints.map((decision, index) => (
                <div key={decision.id || index} style={styles?.decisionPoint}>
                  <div 
                    style={{
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 16px',
                      backgroundColor: '#2a2a2a',
                      border: '1px solid #444',
                      borderRadius: '6px',
                      marginBottom: expandedPoints[index] ? '0' : '8px'
                    }}
                    onClick={() => toggleExpanded(index)}
                  >
                    <span style={{ 
                      color: '#e0e0e0', 
                      fontWeight: '500',
                      fontSize: '14px'
                    }}>
                      {decision.title || decision.question || `Decision Point ${index + 1}`}
                    </span>
                    <span style={{ 
                      color: '#888',
                      fontSize: '12px',
                      transform: expandedPoints[index] ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.2s ease'
                    }}>
                      ▼
                    </span>
                  </div>
                  
                  {expandedPoints[index] && (
                    <div style={{
                      backgroundColor: '#1e1e1e',
                      border: '1px solid #444',
                      borderTop: 'none',
                      borderRadius: '0 0 6px 6px',
                      padding: '16px',
                      marginBottom: '8px'
                    }}>
                      <div style={{
                        color: '#c0c0c0',
                        fontSize: '13px',
                        lineHeight: '1.5'
                      }}>
                        {decision.description || decision.content || decision}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* PIR Workflows (External Intelligence) */}
          {currentAnalysis.pirWorkflows && currentAnalysis.pirWorkflows.length > 0 && (
            <div className="pir-workflows" style={styles?.section}>
              <h3>Priority Intelligence Requirements (PIR)</h3>
              <p className="section-description" style={styles?.description}>
                External intelligence needed to support your strategic decisions:
              </p>
              <div className="workflows-list">
                {currentAnalysis.pirWorkflows.map((pir, index) => (
                  <div key={pir.id || index} className="workflow-card" style={styles?.workflowCard}>
                    <h4 className="workflow-title">{pir.title}</h4>
                    <p className="workflow-description">{pir.description}</p>
                    {pir.requirements && pir.requirements.length > 0 && (
                      <div className="requirements-list">
                        <span className="requirements-label" style={styles?.requirementsLabel}>
                          Intelligence Requirements:
                        </span>
                        <ul style={styles?.requirementsList}>
                          {pir.requirements.map((req, reqIndex) => (
                            <li key={reqIndex} style={styles?.requirementItem}>{req}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* FFIR Workflows (Internal Intelligence) */}
          {currentAnalysis.ffirWorkflows && currentAnalysis.ffirWorkflows.length > 0 && (
            <div className="ffir-workflows" style={styles?.section}>
              <h3>Friendly Force Information Requirements (FFIR)</h3>
              <p className="section-description" style={styles?.description}>
                Internal intelligence and data collection needed:
              </p>
              <div className="workflows-list">
                {currentAnalysis.ffirWorkflows.map((ffir, index) => (
                  <div key={ffir.id || index} className="workflow-card" style={styles?.workflowCard}>
                    <h4 className="workflow-title">{ffir.title}</h4>
                    <p className="workflow-description">{ffir.description}</p>
                    {ffir.requirements && ffir.requirements.length > 0 && (
                      <div className="requirements-list">
                        <span className="requirements-label" style={styles?.requirementsLabel}>
                          Data Requirements:
                        </span>
                        <ul style={styles?.requirementsList}>
                          {ffir.requirements.map((req, reqIndex) => (
                            <li key={reqIndex} style={styles?.requirementItem}>{req}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Risk Assessment */}
          {currentAnalysis.risks && currentAnalysis.risks.length > 0 && (
            <div className="risk-assessment" style={styles?.section}>
              <h3>Risk Assessment</h3>
              <div className="risks-list">
                {currentAnalysis.risks.map((risk, index) => (
                  <div key={index} className="risk-card" style={styles?.riskCard}>
                    <div className="risk-text">{risk}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          {currentAnalysis.recommendations && currentAnalysis.recommendations.length > 0 && (
            <div className="recommendations" style={styles?.section}>
              <h3>Strategic Recommendations</h3>
              <div className="recommendations-list">
                {currentAnalysis.recommendations.map((rec, index) => (
                  <div key={index} className="recommendation-card" style={styles?.recommendationCard}>
                    <div className="recommendation-text">{rec}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

      {/* No Analysis State */}
      {analysisComplete && !currentAnalysis && (
        <div className="no-analysis" style={styles?.noAnalysis}>
          <p>No strategic intelligence generated. Please check your inputs and try again.</p>
        </div>
      )}

      {/* Loading State */}
      {isAnalyzing && (
        <div className="analyzing-state" style={styles?.analyzingState}>
          <div className="loading-indicator">
            <p>🔍 Generating strategic intelligence...</p>
            <p>This may take a few moments as we analyze your context.</p>
          </div>
        </div>
      )}

    </div>
  );
};

export default AnalysisPanel;