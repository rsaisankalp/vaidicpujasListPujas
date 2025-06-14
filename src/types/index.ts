
import type { ElementType } from 'react';

export interface PujaEventData {
  Date: string;
  Time: string;
  Seva: string;
  Venue: string;
  Activity: string;
  link: string;
  UniqueID: string;
  details: string;
}

export interface ProcessedPujaEvent extends PujaEventData {
  id: string;
  parsedStartDate: Date;
  parsedEndDate?: Date; // For date ranges
  category?: string;
  tags?: string[];
  icon?: ElementType;
  imageHint?: string;
  formattedDate: string; // Will show full range if applicable, or formatted single date
  formattedTime: string; // Based on parsedStartDate
  isGurudevPresence?: boolean;
  isLongRunning?: boolean; // Added for long-running events
}

export interface GurudevEventDataCsv {
  "Event Name": string;
  "Location": string;
  "Start Date": string;
  "End Date": string;
}

export interface ProcessedGurudevEvent {
  eventName: string;
  location: string;
  startDate: Date;
  endDate: Date;
}
