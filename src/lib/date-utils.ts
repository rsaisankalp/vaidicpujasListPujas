
// src/lib/date-utils.ts
import { 
  parse, 
  isSameDay, 
  addDays, 
  startOfWeek, 
  endOfWeek, 
  format as formatDateStr, 
  isValid, 
  isWithinInterval,
  startOfDay,
  endOfDay,
  differenceInDays
} from 'date-fns';
import type { ProcessedPujaEvent, ProcessedGurudevEvent } from '@/types';

export const LONG_RUNNING_EVENT_THRESHOLD_DAYS = 120; // Approx 4 months

export function isValidDate(date: Date | undefined | null): date is Date {
  return !!date && isValid(date) && date.getTime() !== new Date(0).getTime();
}

interface ParsedDateResult {
  startDate: Date;
  endDate?: Date;
}

export function parsePujaDates(dateStr: string, timeStr: string): ParsedDateResult {
  if (!dateStr || !timeStr || typeof dateStr !== 'string' || typeof timeStr !== 'string') {
    return { startDate: new Date(0) };
  }

  const dateInputStr = dateStr.trim();
  const timeInputStr = timeStr.trim();
  let startDate = new Date(0);
  let endDate: Date | undefined = undefined;

  const parseSingleDateTime = (singleDateStr: string, formatPattern: string): Date => {
    const parsed = parse(`${singleDateStr} ${timeInputStr}`, formatPattern, new Date());
    if (!isValid(parsed)) {
      const alternativeFormat = formatPattern.startsWith('d MMM yyyy') ? 'dd/MM/yyyy HH:mm' : 'd MMM yyyy HH:mm';
      const parsedAlt = parse(`${singleDateStr} ${timeInputStr}`, alternativeFormat, new Date());
      return isValid(parsedAlt) ? parsedAlt : new Date(0);
    }
    return parsed;
  };
  
  let primaryDateFormat = 'dd/MM/yyyy';
   if (/\d{1,2} [A-Za-z]{3} \d{4}/.test(dateInputStr.split(' to ')[0])) {
      primaryDateFormat = 'd MMM yyyy';
  }

  if (dateInputStr.toLowerCase().includes(' to ')) {
    const parts = dateInputStr.split(/ to /i); // Case-insensitive split
    const startDateString = parts[0].trim();
    const endDateString = parts[1].trim();

    let startFormatPattern = primaryDateFormat === 'd MMM yyyy' ? 'd MMM yyyy HH:mm' : 'dd/MM/yyyy HH:mm';
    if (/\d{1,2}\/\d{1,2}\/\d{4}/.test(startDateString)) startFormatPattern = 'dd/MM/yyyy HH:mm';
    else if (/\d{1,2} [A-Za-z]{3} \d{4}/.test(startDateString)) startFormatPattern = 'd MMM yyyy HH:mm';
    
    let endFormatPattern = primaryDateFormat === 'd MMM yyyy' ? 'd MMM yyyy HH:mm' : 'dd/MM/yyyy HH:mm';
    if (/\d{1,2}\/\d{1,2}\/\d{4}/.test(endDateString)) endFormatPattern = 'dd/MM/yyyy HH:mm';
    else if (/\d{1,2} [A-Za-z]{3} \d{4}/.test(endDateString)) endFormatPattern = 'd MMM yyyy HH:mm';
    
    startDate = parseSingleDateTime(startDateString, startFormatPattern);
    const parsedEnd = parseSingleDateTime(endDateString, endFormatPattern);

    if(isValidDate(parsedEnd)) {
      endDate = parsedEnd; 
    }

  } else {
    startDate = parseSingleDateTime(dateInputStr, `${primaryDateFormat} HH:mm`);
  }

  return { startDate, endDate };
}

export function isEventTomorrow(event: ProcessedPujaEvent, referenceDate: Date = new Date()): boolean {
  if (!isValidDate(event.parsedStartDate)) return false;

  const refStartOfDay = startOfDay(referenceDate);
  const tomorrowStartOfDay = startOfDay(addDays(refStartOfDay, 1));
  const tomorrowEndOfDay = endOfDay(tomorrowStartOfDay);
  
  const eventStartOfDay = startOfDay(event.parsedStartDate);

  if (event.parsedEndDate && isValidDate(event.parsedEndDate)) {
    const eventEndOfDay = endOfDay(event.parsedEndDate);
    return eventStartOfDay <= tomorrowEndOfDay && eventEndOfDay >= tomorrowStartOfDay;
  } else {
    return isSameDay(eventStartOfDay, tomorrowStartOfDay);
  }
}

export function isEventThisWeek(event: ProcessedPujaEvent, referenceDate: Date = new Date()): boolean {
  if (!isValidDate(event.parsedStartDate)) return false;
  
  const refStartOfDay = startOfDay(referenceDate);
  const weekStartBoundary = startOfWeek(refStartOfDay, { weekStartsOn: 1 }); // Monday
  const weekEndBoundary = endOfWeek(refStartOfDay, { weekStartsOn: 1 }); // Sunday

  const eventStartOfDay = startOfDay(event.parsedStartDate);

  if (event.parsedEndDate && isValidDate(event.parsedEndDate)) {
    const eventEndOfDay = endOfDay(event.parsedEndDate);
    return eventStartOfDay <= weekEndBoundary && eventEndOfDay >= weekStartBoundary;
  } else {
    return eventStartOfDay >= weekStartBoundary && eventStartOfDay <= weekEndBoundary;
  }
}

export function formatPujaDate(date: Date): string {
  if (!isValidDate(date)) return "Invalid Date";
  return formatDateStr(date, 'EEE, MMM d, yyyy');
}

export function formatPujaTime(date: Date): string {
  if (!isValidDate(date)) return "Invalid Time";
  return formatDateStr(date, 'h:mm a');
}

const REPEATABLE_EVENT_DURATION_THRESHOLD_DAYS = 60; // Events longer than this are "repeatable"

export function doesEventOverlapWithGurudevPresence(
  pujaEvent: ProcessedPujaEvent,
  gurudevEvents: ProcessedGurudevEvent[]
): boolean {
  if (!isValidDate(pujaEvent.parsedStartDate) || !gurudevEvents || gurudevEvents.length === 0) {
    return false;
  }

  // Check if the puja event is a long-running "repeatable" event (using a general threshold for this check)
  if (pujaEvent.parsedEndDate && isValidDate(pujaEvent.parsedEndDate) && isValidDate(pujaEvent.parsedStartDate)) {
    // Use the specific LONG_RUNNING_EVENT_THRESHOLD_DAYS for Gurudev presence exclusion if it's a very long event.
    // Or, use a separate threshold like REPEATABLE_EVENT_DURATION_THRESHOLD_DAYS if they serve different purposes.
    // For now, let's assume if it's marked as isLongRunning (for display), it also doesn't get Gurudev presence.
    // Or more consistently, check duration against REPEATABLE_EVENT_DURATION_THRESHOLD_DAYS for this specific Gurudev check.
    const durationInDays = differenceInDays(pujaEvent.parsedEndDate, pujaEvent.parsedStartDate);
    if (durationInDays > REPEATABLE_EVENT_DURATION_THRESHOLD_DAYS) {
      return false; // Exclude long-running events from Gurudev presence marking
    }
  }


  const pujaEventStart = startOfDay(pujaEvent.parsedStartDate);
  const pujaEventEnd = pujaEvent.parsedEndDate && isValidDate(pujaEvent.parsedEndDate)
                      ? endOfDay(pujaEvent.parsedEndDate)
                      : endOfDay(pujaEvent.parsedStartDate); 

  for (const ge of gurudevEvents) {
    if (!isValidDate(ge.startDate) || !isValidDate(ge.endDate)) {
      continue;
    }
    const gurudevPresenceStart = startOfDay(ge.startDate);
    const gurudevPresenceEnd = endOfDay(ge.endDate);

    if (pujaEventStart <= gurudevPresenceEnd && pujaEventEnd >= gurudevPresenceStart) {
      return true;
    }
  }
  return false;
}
