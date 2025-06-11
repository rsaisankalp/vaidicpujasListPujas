import type { ElementType } from 'react';

export interface PujaEventData {
  Date: string;
  Time: string;
  Seva: string;
  Venue: string;
  Activity: string;
  link: string;
  UniqueID: string; // This was "Event" in sample, using "details" as true ID
  details: string; // This seems to be the unique identifier "13 Jun 2025|..."
}

export interface ProcessedPujaEvent extends PujaEventData {
  id: string; // Derived from 'details'
  parsedDate: Date;
  category?: string;
  tags?: string[];
  icon?: ElementType;
  imageHint?: string;
  formattedDate: string;
  formattedTime: string;
}
