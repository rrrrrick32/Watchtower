import React from 'react';
import { FileText, Target, Brain, GitBranch } from 'lucide-react';

export const FileExplorer = ({ sidebarCollapsed, styles }) => {
  if (sidebarCollapsed) return null;

  return (
    <div style={{
      flex: 1,
      backgroundColor: '#2d2d30',
      color: '#cccccc',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative'
    }}>
      <div style={{
        padding: '12px',
        borderBottom: '1px solid #3e3e42',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '13px',
        fontWeight: '600',
        color: '#cccccc'
      }}>
        <FileText size={16} />
        STRATEGIC ANALYSIS
      </div>

      <div style={{ padding: '8px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 8px',
          color: '#cccccc',
          cursor: 'pointer',
          borderRadius: '3px',
          fontSize: '13px'
        }}>
          <Target size={12} />
          Active Objectives
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 8px',
          color: '#cccccc',
          cursor: 'pointer',
          borderRadius: '3px',
          fontSize: '13px'
        }}>
          <Brain size={12} />
          Decision Models
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 8px',
          color: '#cccccc',
          cursor: 'pointer',
          borderRadius: '3px',
          fontSize: '13px'
        }}>
          <GitBranch size={12} />
          Scenario Plans
        </div>
      </div>
    </div>
  );
};