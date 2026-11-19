import { useState } from 'react';
import { Shield, Skull } from 'lucide-react';

interface PortraitImageProps {
  src: string;
  alt: string;
  variant: 'hero' | 'enemy';
  className?: string;
  draggable?: boolean;
}

export function PortraitImage({
  src,
  alt,
  variant,
  className = '',
  draggable = false,
}: PortraitImageProps) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`flex items-center justify-center ${
          variant === 'hero'
            ? 'bg-gradient-to-br from-amber-950 via-stone-900 to-stone-950 text-amber-400'
            : 'bg-gradient-to-br from-emerald-950 via-stone-900 to-stone-950 text-emerald-400'
        } ${className}`}
      >
        {variant === 'hero' ? (
          <Shield className="w-1/2 h-1/2 opacity-85" />
        ) : (
          <Skull className="w-1/2 h-1/2 opacity-85" />
        )}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      draggable={draggable}
      onError={() => setFailed(true)}
      className={className}
    />
  );
}
