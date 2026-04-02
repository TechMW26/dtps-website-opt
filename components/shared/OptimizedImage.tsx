'use client';

import Image, { ImageProps } from 'next/image';
import { useState, useCallback } from 'react';

interface OptimizedImageProps extends Omit<ImageProps, 'onLoad' | 'onError'> {
    fallbackSrc?: string;
    lowQualityPlaceholder?: boolean;
}

/**
 * Optimized Image component with:
 * - Lazy loading by default (except when priority is set)
 * - Error handling with fallback
 * - Blur placeholder support
 * - Automatic format optimization via ImageKit
 */
export default function OptimizedImage({
    src,
    alt,
    fallbackSrc = '/images/placeholder.png',
    lowQualityPlaceholder = false,
    className = '',
    ...props
}: OptimizedImageProps) {
    const [imageSrc, setImageSrc] = useState(src);
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);

    const handleLoad = useCallback(() => {
        setIsLoading(false);
    }, []);

    const handleError = useCallback(() => {
        if (!hasError && fallbackSrc) {
            setImageSrc(fallbackSrc);
            setHasError(true);
        }
        setIsLoading(false);
    }, [fallbackSrc, hasError]);

    return (
        <Image
            src={imageSrc}
            alt={alt}
            className={`${className} ${isLoading ? 'animate-pulse bg-gray-200' : ''}`}
            onLoad={handleLoad}
            onError={handleError}
            loading={props.priority ? undefined : 'lazy'}
            decoding="async"
            {...props}
        />
    );
}
