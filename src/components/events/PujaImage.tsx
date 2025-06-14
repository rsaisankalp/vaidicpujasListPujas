
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

const PLACEHOLDER_IMAGE_URL = 'https://placehold.co/600x400.png';
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
    const idealLocalSrcAttempted = generateInitialSrc();

    if (currentSrc === idealLocalSrcAttempted) {
      // Ideal local image failed, try the generic placeholder
      setCurrentSrc(PLACEHOLDER_IMAGE_URL);
    } else if (currentSrc === PLACEHOLDER_IMAGE_URL) {
      // Generic placeholder also failed, try the final local default
      // Avoid an infinite loop if DEFAULT_LOCAL_FALLBACK_IMAGE_PATH is somehow also PLACEHOLDER_IMAGE_URL or idealLocalSrcAttempted and failing
      if (DEFAULT_LOCAL_FALLBACK_IMAGE_PATH !== currentSrc) {
         setCurrentSrc(DEFAULT_LOCAL_FALLBACK_IMAGE_PATH);
      }
    }
    // If currentSrc is already DEFAULT_LOCAL_FALLBACK_IMAGE_PATH and it fails,
    // Image component's native alt text will be more prominent.
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
