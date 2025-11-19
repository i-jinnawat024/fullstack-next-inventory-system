'use client';

import { useState, memo } from 'react';
import Image, { ImageProps } from 'next/image';
import { Skeleton } from './skeleton';

interface OptimizedImageProps extends Omit<ImageProps, 'onLoad' | 'onError'> {
  fallbackSrc?: string;
  showSkeleton?: boolean;
}

export const OptimizedImage = memo(function OptimizedImage({
  src,
  alt,
  fallbackSrc = '/placeholder.png',
  showSkeleton = true,
  className,
  ...props
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setError(true);
    setIsLoading(false);
    if (fallbackSrc && currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
    }
  };

  return (
    <div className={className} style={{ position: 'relative' }}>
      {isLoading && showSkeleton && (
        <div style={{ position: 'absolute', top: 0, left: 0 }}>
          <Skeleton
            variant="rectangular"
            width={props.width}
            height={props.height}
          />
        </div>
      )}
      <Image
        {...props}
        src={currentSrc}
        alt={alt}
        onLoad={handleLoad}
        onError={handleError}
        style={{
          ...props.style,
          opacity: isLoading ? 0 : 1,
          transition: 'opacity 0.3s ease-in-out',
        }}
        loading="lazy"
        quality={85}
      />
    </div>
  );
});
