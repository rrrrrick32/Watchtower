import React from 'react';
import { FileExplorer } from './FileExplorer';
import { TabBar } from './TabBar';
import AnalysisPanel from './AnalysisPanel';
import { FlowchartVisualization } from './FlowchartVisualization';
import PIRVisualization from '../../visualizations/PIRVisualization';
import FFIRVisualization from '../../visualizations/FFIRVisualization';
import SignalBridgeTab from './SignalBridgeTab'; // Add this import

export const MainLayout = ({
  activeTab,
  sidebarCollapsed,
  formData,
  handleInputChange,
  handleAnalyze,
  isAnalyzing,
  analysisComplete,
  currentAnalysis,
  setCurrentAnalysis,
  pirWorkflowData,
  ffirWorkflowData,
  styles,
  tabs,
  setActiveTab,
  setSidebarCollapsed
}) => (
  <div style={{ display: 'flex', flex: 1, height: '100vh' }}>
    {/* Sidebar on the left - only render when not collapsed */}
    {!sidebarCollapsed && (
      <div style={{
        width: '240px',
        borderRight: '1px solid #3e3e42',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh'
      }}>
        <FileExplorer sidebarCollapsed={sidebarCollapsed} styles={styles} />
      </div>
    )}

    {/* Main content area on the right */}
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <TabBar
        tabs={tabs}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        sidebarCollapsed={sidebarCollapsed}
        setSidebarCollapsed={setSidebarCollapsed}
      />

      {activeTab === 'analysis' && (
        <AnalysisPanel
          formData={formData}
          handleInputChange={handleInputChange}
          handleAnalyze={handleAnalyze}
          isAnalyzing={isAnalyzing}
          analysisComplete={analysisComplete}
          currentAnalysis={currentAnalysis}
          setCurrentAnalysis={setCurrentAnalysis}
          styles={styles}
        />
      )}

      {activeTab === 'pir' && pirWorkflowData &&(
        <PIRVisualization
          decisionPoints={currentAnalysis?.decisionPoints || []}
          workflowData={pirWorkflowData}
          styles={styles}
        />
      )}

      {activeTab === 'ffir' && ffirWorkflowData && (
        <FFIRVisualization
          decisionPoints={currentAnalysis?.decisionPoints || []}
          workflowData={ffirWorkflowData}
          styles={styles}
        />
      )}

      {activeTab === 'signalbridge' && (
        <SignalBridgeTab styles={styles} />
      )}
    </div>
  </div>
);