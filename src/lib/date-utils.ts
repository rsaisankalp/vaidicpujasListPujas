
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
  endOfDay
} from 'date-fns';
import type { ProcessedPujaEvent, ProcessedGurudevEvent } from '@/types';

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
      const alternativeFormat = formatPattern === 'dd/MM/yyyy HH:mm' ? 'd MMM yyyy HH:mm' : 'dd/MM/yyyy HH:mm';
      const parsedAlt = parse(`${singleDateStr} ${timeInputStr}`, alternativeFormat, new Date());
      return isValid(parsedAlt) ? parsedAlt : new Date(0);
    }
    return parsed;
  };
  
  let primaryDateFormat = 'dd/MM/yyyy';
   if (/\d{1,2} [A-Za-z]{3} \d{4}/.test(dateInputStr.split(' to ')[0])) {
      primaryDateFormat = 'd MMM yyyy';
  }

  if (dateInputStr.includes(' to ')) {
    const parts = dateInputStr.split(' to ');
    const startDateString = parts[0].trim();
    const endDateString = parts[1].trim();

    let startFormatPattern = 'dd/MM/yyyy HH:mm';
    if (/\d{1,2} [A-Za-z]{3} \d{4}/.test(startDateString)) {
        startFormatPattern = 'd MMM yyyy HH:mm';
    }
    let endFormatPattern = 'dd/MM/yyyy HH:mm';
     if (/\d{1,2} [A-Za-z]{3} \d{4}/.test(endDateString)) {
        endFormatPattern = 'd MMM yyyy HH:mm';
    }
    
    startDate = parseSingleDateTime(startDateString, startFormatPattern);
    const parsedEnd = parseSingleDateTime(endDateString, endFormatPattern);
    if(isValidDate(parsedEnd)) {
      // For ranges, ensure end date's time component is also considered, or set to end of day if time isn't specific for end.
      // Given timeStr applies to start, for end, we might take it as start of that day if time is ambiguous for range end.
      // However, since parseSingleDateTime already includes timeStr, we use it as is.
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
  
  const eventStartOfDay = startOfDay(event.parsedStartDate);

  if (event.parsedEndDate && isValidDate(event.parsedEndDate)) {
    const eventEndOfDay = endOfDay(event.parsedEndDate);
    // Ranged event: true if tomorrow is within [eventStart, eventEnd] (inclusive)
    return tomorrowStartOfDay >= eventStartOfDay && tomorrowStartOfDay <= eventEndOfDay;
  } else {
    // Single day event: true if event's start day is tomorrow
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
    // Ranged event: true if event's range [start, end] overlaps with [weekStart, weekEnd]
    return eventStartOfDay <= weekEndBoundary && eventEndOfDay >= weekStartBoundary;
  } else {
    // Single day event: true if event's start day is within this week
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

export function doesEventOverlapWithGurudevPresence(
  pujaEvent: ProcessedPujaEvent,
  gurudevEvents: ProcessedGurudevEvent[]
): boolean {
  if (!isValidDate(pujaEvent.parsedStartDate) || !gurudevEvents || gurudevEvents.length === 0) {
    return false;
  }

  const pujaEventStart = startOfDay(pujaEvent.parsedStartDate);
  const pujaEventEnd = pujaEvent.parsedEndDate && isValidDate(pujaEvent.parsedEndDate)
                      ? endOfDay(pujaEvent.parsedEndDate)
                      : pujaEventStart; // Single day event, end is same as start

  for (const ge of gurudevEvents) {
    if (!isValidDate(ge.startDate) || !isValidDate(ge.endDate)) {
      continue;
    }
    const gurudevPresenceStart = startOfDay(ge.startDate);
    const gurudevPresenceEnd = endOfDay(ge.endDate);

    // Check for overlap:
    // Puja event starts before or at the same time Gurudev presence ends
    // AND Puja event ends after or at the same time Gurudev presence starts
    if (pujaEventStart <= gurudevPresenceEnd && pujaEventEnd >= gurudevPresenceStart) {
      return true;
    }
  }
  return false;
}
