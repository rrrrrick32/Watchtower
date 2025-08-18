import React from 'react';
import { 
  ChevronRight, 
  ChevronDown, 
  Target, 
  Brain, 
  GitBranch, 
  FileText, 
  Settings,
  X,
  Maximize2,
  Minimize2,
  Zap
} from 'lucide-react';

// UI Component: File Explorer Sidebar
export const FileExplorer = ({ sidebarCollapsed, styles }) => (
  <div style={{
    width: sidebarCollapsed ? '0' : '250px',
    backgroundColor: '#252526',
    borderRight: '1px solid #3e3e42',
    transition: 'width 0.2s ease',
    overflow: 'hidden'
  }}>
    <div style={styles.sidebarHeader}>
      <FileText size={16} />
      STRATEGIC ANALYSIS
    </div>
    
    <div style={styles.sidebarContent}>
      <div style={{...styles.sidebarItem, ...styles.sidebarItemHover}}>
        <ChevronDown size={14} />
        <Target size={14} />
        <span>Active Objectives</span>
      </div>
      
      <div style={styles.activeObjective}>
        <div style={{width: '8px', height: '8px', backgroundColor: '#0e639c', borderRadius: '50%'}}></div>
        Market Expansion
      </div>
      
      <div style={styles.sidebarItem}>
        <ChevronRight size={14} />
        <Brain size={14} />
        <span>Decision Models</span>
      </div>
      
      <div style={styles.sidebarItem}>
        <ChevronRight size={14} />
        <GitBranch size={14} />
        <span>Scenario Plans</span>
      </div>
    </div>
  </div>
);

// UI Component: Flowchart Visualization
export const FlowchartVisualization = ({ formData, analysisComplete, isAnalyzing, styles, mockAnalysis }) => (
  <div style={styles.flowchartContainer}>
    <div style={styles.flowchartContent}>
      <h3 style={styles.flowchartTitle}>
        <GitBranch color="#6cb6ff" size={20} />
        Strategic Decision Flow
      </h3>
      
      {analysisComplete && (
        <div>
          <div style={styles.objectiveNode}>
            <Target style={{margin: '0 auto 8px'}} size={24} />
            <div style={{fontWeight: '600'}}>Strategic Objective</div>
            <div style={{fontSize: '14px', marginTop: '4px', opacity: 0.9}}>
              {formData.objective || mockAnalysis.objective}
            </div>
          </div>

          <div style={styles.connectionLine}></div>

          <div style={styles.analysisNode}>
            <Brain style={{margin: '0 auto 8px'}} size={24} />
            <div style={{fontWeight: '600'}}>Analysis Engine</div>
            <div style={{fontSize: '14px', marginTop: '4px', opacity: 0.9}}>
              Processing key factors & constraints
            </div>
          </div>

          <div style={styles.connectionLine}></div>

          <div style={styles.decisionGrid}>
            {mockAnalysis.decisionPoints.map((point) => (
              <div 
                key={point.id} 
                style={{
                  ...styles.decisionCard,
                  ...(point.urgency === 'High' ? styles.decisionCardHigh : styles.decisionCardMedium)
                }}
              >
                <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px'}}>
                  <GitBranch size={16} />
                  <span style={{fontWeight: '600', fontSize: '14px'}}>{point.title}</span>
                </div>
                
                <div style={{fontSize: '12px', color: '#cccccc', marginBottom: '12px'}}>
                  {point.description}
                </div>
                
                <div style={{display: 'flex', gap: '8px', marginBottom: '12px'}}>
                  <span style={{
                    ...styles.urgencyBadge,
                    ...(point.impact === 'High' ? styles.urgencyHigh : styles.urgencyMedium)
                  }}>
                    Impact: {point.impact}
                  </span>
                  <span style={{
                    ...styles.urgencyBadge,
                    ...(point.urgency === 'High' ? styles.urgencyHigh : styles.urgencyMedium)
                  }}>
                    Urgency: {point.urgency}
                  </span>
                </div>
                
                <div>
                  {point.options.map((option, idx) => (
                    <div key={idx} style={{
                      fontSize: '12px',
                      padding: '6px 8px',
                      backgroundColor: '#3c3c3c',
                      borderRadius: '3px',
                      color: '#cccccc',
                      marginBottom: '4px',
                      cursor: 'pointer'
                    }}>
                      {option}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {!analysisComplete && !isAnalyzing && (
        <div style={styles.emptyState}>
          <GitBranch size={48} style={{opacity: 0.5}} />
          <div>Enter a strategic objective to generate decision flow</div>
        </div>
      )}
      
      {isAnalyzing && (
        <div style={styles.emptyState}>
          <div style={{...styles.loadingSpinner, width: '48px', height: '48px'}}></div>
          <div style={{fontSize: '18px', fontWeight: '600'}}>Analyzing Strategic Context</div>
          <div style={{color: '#969696', fontSize: '14px'}}>Processing decision variables...</div>
        </div>
      )}
    </div>
  </div>
);

// UI Component: Analysis Panel
export const AnalysisPanel = ({ formData, handleInputChange, handleAnalyze, isAnalyzing, analysisComplete, styles, mockAnalysis }) => (
  <div style={styles.mainPanel}>
    <div style={styles.inputSection}>
      <div style={styles.objectiveGroup}>
        <div style={styles.inputLabel}>
          <Target color="#6cb6ff" size={20} />
          Strategic Objective
        </div>
        <input
          style={styles.input}
          type="text"
          value={formData.objective}
          onChange={(e) => handleInputChange('objective', e.target.value)}
          placeholder="Enter your strategic objective or business goal..."
          onFocus={(e) => e.target.style.borderColor = '#007acc'}
          onBlur={(e) => e.target.style.borderColor = '#5a5a5a'}
        />
      </div>
      
      <div style={styles.inputGroup}>
        <div style={styles.inputLabel}>
          📝 Strategic Context
        </div>
        <textarea
          style={{...styles.input, height: '80px', resize: 'vertical'}}
          value={formData.context}
          onChange={(e) => handleInputChange('context', e.target.value)}
          placeholder="Add any relevant context, constraints, or background information..."
          onFocus={(e) => e.target.style.borderColor = '#007acc'}
          onBlur={(e) => e.target.style.borderColor = '#5a5a5a'}
        />
      </div>
      
      <div style={styles.inputGroup}>
        <div style={styles.inputLabel}>
          🔗 Reference Links
        </div>
        <input
          style={styles.input}
          type="text"
          value={formData.links}
          onChange={(e) => handleInputChange('links', e.target.value)}
          placeholder="Add relevant links for context (optional)"
          onFocus={(e) => e.target.style.borderColor = '#007acc'}
          onBlur={(e) => e.target.style.borderColor = '#5a5a5a'}
        />
      </div>
      
      <div style={styles.buttonRow}>
        <button
          onClick={handleAnalyze}
          disabled={!formData.objective.trim() || isAnalyzing}
          style={{
            ...styles.analyzeButton,
            ...((!formData.objective.trim() || isAnalyzing) ? styles.analyzeButtonDisabled : {})
          }}
        >
          {isAnalyzing ? (
            <>
              <div style={styles.loadingSpinner}></div>
              Analyzing Strategic Context...
            </>
          ) : (
            <>
              <Zap size={16} />
              Analyze
            </>
          )}
        </button>
      </div>
    </div>

    <div style={styles.resultsSection}>
      {analysisComplete && (
        <div>
          <div style={styles.resultCard}>
            <h3 style={styles.cardHeader}>
              <Brain color="#b180d7" size={18} />
              Key Analysis Factors
            </h3>
            <div style={styles.factorGrid}>
              {mockAnalysis.keyFactors.map((factor, index) => (
                <div key={index} style={styles.factorItem}>
                  {factor}
                </div>
              ))}
            </div>
          </div>

          <div style={styles.resultCard}>
            <h3 style={styles.cardHeader}>
              <GitBranch color="#4ec9b0" size={18} />
              Critical Decision Points
            </h3>
            <div>
              {mockAnalysis.decisionPoints.map((point) => (
                <div key={point.id} style={styles.decisionPoint}>
                  <div style={styles.decisionHeader}>
                    <h4 style={styles.decisionTitle}>{point.title}</h4>
                    <span style={{
                      ...styles.urgencyBadge,
                      ...(point.urgency === 'High' ? styles.urgencyHigh : styles.urgencyMedium)
                    }}>
                      {point.urgency}
                    </span>
                  </div>
                  <p style={styles.decisionDescription}>{point.description}</p>
                  <div style={styles.optionsList}>
                    Options: {point.options.join(' • ')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {!analysisComplete && !isAnalyzing && (
        <div style={styles.emptyState}>
          <Brain size={48} style={{opacity: 0.5}} />
          <div>Ready to analyze your strategic objective</div>
          <div style={{fontSize: '14px', marginTop: '8px'}}>Enter your goal and context above, then click Analyze</div>
        </div>
      )}
    </div>
  </div>
);

// UI Styles Object
export const getStyles = () => ({
  container: {
    height: '100vh',
    backgroundColor: '#1e1e1e',
    color: 'white',
    display: 'flex',
    flexDirection: 'column',
    fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif'
  },
  titleBar: {
    backgroundColor: '#2d2d30',
    borderBottom: '1px solid #3e3e42',
    padding: '8px 16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  windowControls: {
    display: 'flex',
    gap: '4px'
  },
  windowButton: {
    width: '12px',
    height: '12px',
    borderRadius: '50%'
  },
  redButton: {
    backgroundColor: '#ff5f56'
  },
  yellowButton: {
    backgroundColor: '#ffbd2e'
  },
  greenButton: {
    backgroundColor: '#27ca3f'
  },
  mainContent: {
    display: 'flex',
    flex: 1
  },
  sidebarHeader: {
    padding: '12px',
    borderBottom: '1px solid #3e3e42',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '13px',
    fontWeight: '600',
    color: '#cccccc'
  },
  sidebarContent: {
    padding: '8px'
  },
  sidebarItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 8px',
    color: '#cccccc',
    cursor: 'pointer',
    borderRadius: '3px',
    fontSize: '13px'
  },
  sidebarItemHover: {
    backgroundColor: '#2a2d2e'
  },
  activeObjective: {
    marginLeft: '16px',
    padding: '4px 8px',
    color: '#9cdcfe',
    fontSize: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  },
  contentArea: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column'
  },
  tabBar: {
    backgroundColor: '#2d2d30',
    borderBottom: '1px solid #3e3e42',
    display: 'flex',
    alignItems: 'center'
  },
  sidebarToggle: {
    padding: '8px',
    backgroundColor: 'transparent',
    border: 'none',
    color: '#cccccc',
    cursor: 'pointer',
    borderRight: '1px solid #3e3e42'
  },
  tab: {
    padding: '8px 16px',
    borderRight: '1px solid #3e3e42',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '13px',
    cursor: 'pointer',
    backgroundColor: 'transparent',
    border: 'none',
    color: '#969696'
  },
  activeTab: {
    backgroundColor: '#1e1e1e',
    color: 'white'
  },
  mainPanel: {
    flex: 1,
    backgroundColor: '#1e1e1e',
    display: 'flex',
    flexDirection: 'column'
  },
  inputSection: {
    padding: '24px',
    borderBottom: '1px solid #3e3e42'
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    marginBottom: '16px'
  },
  objectiveGroup: {
    marginBottom: '16px'
  },
  inputLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontWeight: '600',
    color: 'white',
    fontSize: '14px',
    marginBottom: '6px'
  },
  input: {
    backgroundColor: '#3c3c3c',
    border: '1px solid #5a5a5a',
    borderRadius: '3px',
    padding: '10px 12px',
    color: 'white',
    fontSize: '14px',
    width: '100%',
    boxSizing: 'border-box'
  },
  buttonRow: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginTop: '16px'
  },
  analyzeButton: {
    backgroundColor: '#0e639c',
    border: 'none',
    color: 'white',
    padding: '12px 24px',
    borderRadius: '3px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    fontWeight: '600'
  },
  analyzeButtonDisabled: {
    backgroundColor: '#5a5a5a',
    cursor: 'not-allowed'
  },
  resultsSection: {
    flex: 1,
    padding: '24px',
    overflow: 'auto'
  },
  resultCard: {
    backgroundColor: '#252526',
    border: '1px solid #3e3e42',
    borderRadius: '4px',
    padding: '16px',
    marginBottom: '16px'
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '12px',
    fontWeight: '600',
    color: 'white'
  },
  factorGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '8px'
  },
  factorItem: {
    backgroundColor: '#3c3c3c',
    padding: '8px',
    borderRadius: '3px',
    fontSize: '13px',
    color: '#cccccc'
  },
  decisionPoint: {
    backgroundColor: '#3c3c3c',
    padding: '12px',
    borderRadius: '4px',
    borderLeft: '4px solid #0e639c',
    marginBottom: '12px'
  },
  decisionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '8px'
  },
  decisionTitle: {
    fontWeight: '600',
    color: 'white'
  },
  urgencyBadge: {
    padding: '2px 8px',
    borderRadius: '12px',
    fontSize: '11px',
    fontWeight: '600'
  },
  urgencyHigh: {
    backgroundColor: '#a74a44',
    color: '#ffa8a8'
  },
  urgencyMedium: {
    backgroundColor: '#8b6914',
    color: '#ffd93d'
  },
  decisionDescription: {
    color: '#cccccc',
    fontSize: '13px',
    marginBottom: '8px'
  },
  optionsList: {
    fontSize: '12px',
    color: '#969696'
  },
  statusBar: {
    backgroundColor: '#007acc',
    padding: '4px 16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    fontSize: '12px'
  },
  statusLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  },
  statusIndicator: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px'
  },
  statusDot: {
    width: '8px',
    height: '8px',
    backgroundColor: '#4ec9b0',
    borderRadius: '50%'
  },
  emptyState: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    color: '#969696',
    flexDirection: 'column',
    gap: '16px'
  },
  loadingSpinner: {
    width: '20px',
    height: '20px',
    border: '2px solid #3c3c3c',
    borderTop: '2px solid #0e639c',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  // Flowchart specific styles
  flowchartContainer: {
    padding: '24px',
    overflow: 'auto',
    height: '100%'
  },
  flowchartContent: {
    maxWidth: '1200px',
    margin: '0 auto'
  },
  flowchartTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '18px',
    fontWeight: '600',
    marginBottom: '24px',
    color: 'white'
  },
  objectiveNode: {
    backgroundColor: '#0e639c',
    color: 'white',
    padding: '16px',
    borderRadius: '8px',
    textAlign: 'center',
    maxWidth: '300px',
    margin: '0 auto',
    marginBottom: '32px'
  },
  analysisNode: {
    backgroundColor: '#68217a',
    color: 'white',
    padding: '16px',
    borderRadius: '8px',
    textAlign: 'center',
    maxWidth: '300px',
    margin: '0 auto',
    marginBottom: '32px'
  },
  decisionGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '24px'
  },
  decisionCard: {
    padding: '16px',
    borderRadius: '8px',
    border: '1px solid #3e3e42'
  },
  decisionCardHigh: {
    backgroundColor: '#4a2626',
    borderColor: '#a74a44'
  },
  decisionCardMedium: {
    backgroundColor: '#4a3c1a',
    borderColor: '#8b6914'
  },
  connectionLine: {
    width: '2px',
    height: '32px',
    backgroundColor: '#5a5a5a',
    margin: '0 auto'
  }
});