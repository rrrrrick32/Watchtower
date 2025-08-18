import React from 'react';
import { GitBranch, Target, Brain } from 'lucide-react';

export const FlowchartVisualization = ({ formData, analysisComplete, isAnalyzing, mockAnalysis }) => {
  return (
    <div style={{ padding: '24px', backgroundColor: '#f8f9fa', height: '100%' }}>
      <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
        <GitBranch size={20} />
        Strategic Decision Flow
      </h3>

      {isAnalyzing && (
        <div>Analyzing strategic context...</div>
      )}

      {analysisComplete && mockAnalysis && (
        <>
          <div style={{
            backgroundColor: '#3182ce',
            color: 'white',
            padding: '16px',
            borderRadius: '8px',
            marginBottom: '24px',
            maxWidth: '300px'
          }}>
            <Target size={20} />
            <div style={{ fontWeight: '600' }}>Objective:</div>
            <div>{mockAnalysis.objective}</div>
          </div>

          <div style={{
            backgroundColor: '#805ad5',
            color: 'white',
            padding: '16px',
            borderRadius: '8px',
            marginBottom: '24px',
            maxWidth: '300px'
          }}>
            <Brain size={20} />
            <div style={{ fontWeight: '600' }}>Analysis Engine</div>
            <div>Processing factors and context</div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
            {mockAnalysis.decisionPoints.map((dp) => (
              <div key={dp.id} style={{
                backgroundColor: '#e2e8f0',
                border: '1px solid #cbd5e0',
                borderRadius: '6px',
                padding: '12px'
              }}>
                <strong>{dp.title}</strong>
                <p style={{ fontSize: '13px', marginTop: '6px' }}>{dp.description}</p>
                <ul style={{ paddingLeft: '20px', marginTop: '6px' }}>
                  {dp.options.map((opt, i) => <li key={i}>{opt}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
