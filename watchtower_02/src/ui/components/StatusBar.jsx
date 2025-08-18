import React from 'react';

export const StatusBar = ({
  isAnalyzing,
  analysisComplete,
  pirProcessing,
  ffirProcessing,
  pirWorkflowData,
  ffirWorkflowData
}) => {
  const renderMessage = () => {
    if (ffirProcessing) return 'Generating FFIR Analysis...';
    if (pirProcessing) return 'Generating PIR Analysis...';
    if (analysisComplete) return 'Analysis Complete';
    if (isAnalyzing) return 'Processing...';
    return 'Ready for Analysis';
  };

  return (
    <div style={{
      backgroundColor: '#edf2f7',
      padding: '6px 12px',
      fontSize: '13px',
      color: '#4a5568',
      borderTop: '1px solid #e2e8f0',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    }}>
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: '#38a169',
          }} />
          <span>System Online</span>
        </div>
        <div>{renderMessage()}</div>
      </div>
      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
        <span>Strategic Intelligence v2.1</span>
        <span>Claude AI Engine</span>
        {pirWorkflowData && (
          <span style={{ color: '#2c7a7b' }}>
            PIR: {pirWorkflowData.summary.totalPIRs} | EXT: {pirWorkflowData.summary.totalIndicators}
          </span>
        )}
        {ffirWorkflowData && (
          <span style={{ color: '#553c9a' }}>
            FFIR: {ffirWorkflowData.summary.totalFFIRs} | COMP: {ffirWorkflowData.summary.totalCompanyIndicators}
          </span>
        )}
      </div>
    </div>
  );
};
