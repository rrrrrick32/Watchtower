import React from 'react';
import { ChevronRight } from 'lucide-react';

export const TabBar = ({ tabs, activeTab, setActiveTab, sidebarCollapsed, setSidebarCollapsed }) => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#2d2d30',
    padding: '6px 8px',
    borderBottom: '1px solid #3e3e42',
  }}>
    <button
      onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
      style={{
        background: 'none',
        border: 'none',
        padding: '0 8px',
        cursor: 'pointer',
        color: '#cccccc',
      }}
    >
      <ChevronRight
        style={{
          transform: !sidebarCollapsed ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 0.2s ease',
        }}
        size={16}
      />
    </button>
    {tabs.map(({ id, label, icon: Icon }) => (
      <button
        key={id}
        onClick={() => setActiveTab(id)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          backgroundColor: activeTab === id ? '#2b6cb0' : 'transparent',
          color: activeTab === id ? 'white' : '#cccccc',
          border: 'none',
          padding: '6px 10px',
          marginRight: '6px',
          cursor: 'pointer',
          borderRadius: '4px',
        }}
      >
        <Icon size={14} />
        {label}
      </button>
    ))}
  </div>
);