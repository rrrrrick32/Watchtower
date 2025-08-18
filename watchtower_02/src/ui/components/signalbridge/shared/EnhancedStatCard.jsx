import React from 'react';

const EnhancedStatCard = ({ 
  icon, 
  title, 
  value, 
  subtitle, 
  color = '#2b6cb0',
  hoverData,
  cardKey,
  onClick,
  hoveredCard,
  setHoveredCard,
  setTooltipPosition,
  hideTimeoutRef
}) => {
  const handleMouseEnter = (e) => {
    if (hoverData) {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
      
      setHoveredCard(cardKey);
      setTooltipPosition({ 
        x: e.clientX + 10, 
        y: e.clientY - 10 
      });
    }
  };

  const handleMouseMove = (e) => {
    if (hoveredCard === cardKey) {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
      
      setTooltipPosition({ 
        x: e.clientX + 10, 
        y: e.clientY - 10 
      });
    }
  };

  const handleMouseLeave = () => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }
    hideTimeoutRef.current = setTimeout(() => {
      setHoveredCard(null);
    }, 300);
  };

  return (
    <div 
      style={{
        backgroundColor: '#1e1e1e',
        border: '1px solid #3e3e42',
        borderRadius: '6px',
        padding: '12px',
        marginBottom: '12px',
        cursor: hoverData || onClick ? 'pointer' : 'default',
        transition: 'all 0.2s ease',
        transform: hoveredCard === cardKey ? 'scale(1.02)' : 'scale(1)',
        boxShadow: hoveredCard === cardKey ? '0 4px 12px rgba(0, 0, 0, 0.3)' : 'none'
      }}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
        {React.createElement(icon, { size: 16, style: { color }})}
        <span style={{ color: '#cccccc', fontSize: '12px', fontWeight: '500' }}>{title}</span>
      </div>
      <div style={{ color: 'white', fontSize: '20px', fontWeight: 'bold', marginBottom: '4px' }}>
        {value}
      </div>
      {subtitle && (
        <div style={{ color: '#888888', fontSize: '11px' }}>{subtitle}</div>
      )}
    </div>
  );
};

export default EnhancedStatCard;