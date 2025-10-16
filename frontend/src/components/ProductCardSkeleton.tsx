import React from 'react';

const ProductCardSkeleton: React.FC = () => {
  return (
    <div
      style={{
        backgroundColor: 'var(--surface)',
        borderRadius: '12px',
        overflow: 'hidden',
        animation: 'pulse 1.5s ease-in-out infinite'
      }}
    >
      {/* Image skeleton */}
      <div
        style={{
          width: '100%',
          paddingTop: '125%', // 4:5 aspect ratio
          backgroundColor: '#e5e7eb',
          position: 'relative'
        }}
      />

      {/* Content skeleton */}
      <div style={{ padding: '12px' }}>
        {/* Brand skeleton */}
        <div
          style={{
            height: '14px',
            backgroundColor: '#e5e7eb',
            borderRadius: '4px',
            width: '40%',
            marginBottom: '8px'
          }}
        />

        {/* Title skeleton */}
        <div
          style={{
            height: '16px',
            backgroundColor: '#e5e7eb',
            borderRadius: '4px',
            width: '80%',
            marginBottom: '12px'
          }}
        />

        {/* Price skeleton */}
        <div
          style={{
            height: '18px',
            backgroundColor: '#e5e7eb',
            borderRadius: '4px',
            width: '50%'
          }}
        />
      </div>

      <style>
        {`
          @keyframes pulse {
            0%, 100% {
              opacity: 1;
            }
            50% {
              opacity: 0.5;
            }
          }
        `}
      </style>
    </div>
  );
};

export default ProductCardSkeleton;
