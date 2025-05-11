import React from 'react';

interface LoadingOverlayProps {
  active: boolean;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ active }) => (
  active ? (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 10,
        background: 'rgba(255,255,255,0.2)',
        pointerEvents: 'all',
      }}
    />
  ) : null
); 