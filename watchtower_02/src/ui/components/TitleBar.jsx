import React from 'react';
import { Settings, Minimize2, Maximize2, X } from 'lucide-react';

export const TitleBar = () => (
  <div style={{
    backgroundColor: '#1a202c',
    color: 'white',
    padding: '8px 12px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '14px',
    fontWeight: '500',
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <div style={{ display: 'flex', gap: '6px' }}>
        <div style={{ width: '12px', height: '12px', backgroundColor: '#f56565', borderRadius: '50%' }}></div>
        <div style={{ width: '12px', height: '12px', backgroundColor: '#ecc94b', borderRadius: '50%' }}></div>
        <div style={{ width: '12px', height: '12px', backgroundColor: '#48bb78', borderRadius: '50%' }}></div>
      </div>
      <span>Aletheia Watchtower</span>
    </div>
    <div style={{ display: 'flex', gap: '8px', color: '#cbd5e0' }}>
      <Settings size={16} />
      <Minimize2 size={16} />
      <Maximize2 size={16} />
      <X size={16} />
    </div>
  </div>
);
