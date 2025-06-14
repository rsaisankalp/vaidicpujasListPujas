
'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';

interface PujaImageProps {
  activity?: string; 
  altText?: string;  
  className?: string;
  priority?: boolean;
  sizes?: string;
  imageHint?: string; // This will be used for data-ai-hint
}

// This constant remains for potential future use or if data-ai-hint generation needs a generic placeholder URL logic,
// but it's not used as a direct visual fallback for the main image anymore.
// const PLACEHOLDER_IMAGE_URL = 'https://placehold.co/600x400.png'; 
const DEFAULT_LOCAL_FALLBACK_IMAGE_PATH = '/images/pujas/default.png';

export default function PujaImage({
  activity,
  altText = "Puja image", 
  className,
  priority,
  sizes,
  imageHint 
}: PujaImageProps) {
  
  const generateInitialSrc = () => {
    return activity 
      ? `/images/pujas/${activity.toLowerCase().replace(/\s+/g, '-')}.png` 
      : DEFAULT_LOCAL_FALLBACK_IMAGE_PATH;
  };

  const [currentSrc, setCurrentSrc] = useState(generateInitialSrc());

  useEffect(() => {
    // This effect ensures that if the activity prop changes,
    // we reset the currentSrc to attempt loading the new ideal image.
    setCurrentSrc(generateInitialSrc());
  }, [activity]); 

  const handleError = () => {
    // If the current source is not already the default fallback, set it to the default fallback.
    // This prevents an infinite loop if default.png itself is missing and somehow onError is triggered for it.
    if (currentSrc !== DEFAULT_LOCAL_FALLBACK_IMAGE_PATH) {
      setCurrentSrc(DEFAULT_LOCAL_FALLBACK_IMAGE_PATH);
    }
  };

  return (
    <Image
      src={currentSrc}
      alt={altText || "Spiritual event image"}
      fill
      sizes={sizes || "100vw"}
      className={className}
      data-ai-hint={imageHint || (activity ? activity.toLowerCase().split('-').pop()?.trim() || "spiritual event" : "spiritual event")}
      priority={priority}
      onError={handleError}
    />
  );
}

