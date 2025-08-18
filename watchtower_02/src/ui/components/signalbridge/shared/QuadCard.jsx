import React from 'react';

const QuadCard = ({ 
  title, 
  children, 
  height = '45vh',
  apiConnected = false 
}) => (
  <div style={{
    backgroundColor: '#2d2d30',
    border: '1px solid #3e3e42',
    borderRadius: '8px',
    padding: '16px',
    height,
    display: 'flex',
    flexDirection: 'column'
  }}>
    <h3 style={{ 
      color: 'white', 
      fontSize: '16px', 
      fontWeight: '600',
      marginBottom: '16px',
      borderBottom: '1px solid #3e3e42',
      paddingBottom: '8px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    }}>
      {title}
      <div style={{
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        backgroundColor: apiConnected ? '#10b981' : '#f59e0b',
        title: apiConnected ? 'SignalBridge API Connected' : 'API Disconnected - Using Supabase Only'
      }} />
    </h3>
    <div style={{ flex: 1, overflow: 'auto' }}>
      {children}
    </div>
  </div>
);

export default QuadCard;