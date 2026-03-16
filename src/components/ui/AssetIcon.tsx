// components/ui/AssetIcon.tsx
import React, { useState } from 'react';
import Image from 'next/image';

interface AssetIconProps {
  logo?: string | null; // URL completa fornecida pelo backend
  ticker: string;
  size?: number;
}

export function AssetIcon({ logo, ticker, size = 28 }: AssetIconProps) {
  const [imageError, setImageError] = useState(false);

  if (logo && !imageError) {
    return (
      <Image
        src={logo}
        alt={ticker}
        width={size}
        height={size}
        className="rounded-full"
        onError={() => setImageError(true)}
      />
    );
  }

  // Fallback: primeira letra do ticker
  return (
    <div
      className="bg-gray-200 rounded-full flex items-center justify-center text-xs font-bold text-gray-600"
      style={{ width: size, height: size }}
    >
      {ticker[0]?.toUpperCase() || '?'}
    </div>
  );
}