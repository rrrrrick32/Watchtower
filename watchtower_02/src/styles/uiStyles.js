// /styles/uiStyles.js

export const getStyles = () => ({
  textarea: {
    backgroundColor: '#3c3c3c',
    border: '1px solid #5a5a5a',
    borderRadius: '3px',
    padding: '10px 12px',
    color: 'white',
    fontSize: '14px',
    width: '100%',
    boxSizing: 'border-box',
    minHeight: '120px',
    resize: 'vertical',
    fontFamily: 'inherit'
  },
  // Styles for expandable decision points
  section: {
    marginBottom: '24px'
  },
  sectionTitle: {
    color: '#e0e0e0',
    fontSize: '16px',
    fontWeight: '600',
    marginBottom: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  decisionPoint: {
    marginBottom: '8px'
  },
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
  // Workflow and intelligence-related styles
  workflowCard: {
    backgroundColor: '#2a2a2a',
    border: '1px solid #444',
    borderRadius: '6px',
    padding: '16px',
    marginBottom: '12px'
  },
  requirementsLabel: {
    color: '#888',
    fontSize: '12px',
    fontWeight: '600',
    textTransform: 'uppercase'
  },
  requirementsList: {
    marginTop: '8px',
    paddingLeft: '16px',
    color: '#c0c0c0'
  },
  requirementItem: {
    marginBottom: '4px',
    fontSize: '13px'
  },
  description: {
    color: '#888',
    fontSize: '13px',
    marginBottom: '16px',
    fontStyle: 'italic'
  },
  summaryText: {
    color: '#c0c0c0',
    fontSize: '14px',
    lineHeight: '1.5'
  },
  riskCard: {
    backgroundColor: '#3a2a2a',
    border: '1px solid #664444',
    borderRadius: '6px',
    padding: '12px',
    marginBottom: '8px'
  },
  recommendationCard: {
    backgroundColor: '#2a3a2a',
    border: '1px solid #446644',
    borderRadius: '6px',
    padding: '12px',
    marginBottom: '8px'
  },
  noAnalysis: {
    color: '#888',
    textAlign: 'center',
    padding: '40px',
    fontSize: '14px'
  },
  analyzingState: {
    color: '#888',
    textAlign: 'center',
    padding: '40px',
    fontSize: '14px'
  }
});