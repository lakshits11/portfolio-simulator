import React from 'react';

export const LoadingSpinner: React.FC = () => {
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh' 
    }}>
      Loading...
    </div>
  );
}; 