import React, { useState } from 'react';
import { ShieldAlert, Trophy } from 'lucide-react';

export default function ProductImage({ src, alt, className = '' }) {
  const [hasError, setHasError] = useState(false);

  if (hasError || !src) {
    return (
      <div className={`product-image-fallback ${className}`}>
        <Trophy size={36} color="#721C32" />
        <span className="fallback-badge">RETRO STORE</span>
        <span style={{ fontSize: '0.65rem', color: '#7A7268', marginTop: '2px' }}>ARCHIVE ITEM</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt || 'RETRO STORE Football Gear'}
      loading="lazy"
      className={className}
      onError={() => setHasError(true)}
    />
  );
}
