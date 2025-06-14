'use client';

import Image from 'next/image';
import { useState } from 'react';

interface PujaImageProps {
  seva: string;
  alt: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
  dataAiHint?: string;
}

export default function PujaImage({
  seva,
  alt,
  className,
  priority,
  sizes,
  dataAiHint
}: PujaImageProps) {
  const [src, setSrc] = useState(`/images/pujas/${seva.toLowerCase().replace(/\s+/g, '-')}.png`);

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      className={className}
      data-ai-hint={dataAiHint}
      priority={priority}
      onError={() => setSrc('/images/pujas/default.png')}
    />
  );
}
