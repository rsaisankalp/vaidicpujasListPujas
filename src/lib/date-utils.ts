
// src/lib/date-utils.ts
import { parse, isSameDay, addDays, startOfWeek, endOfWeek, format as formatDateStr, isValid, isWithinInterval } from 'date-fns';
import type { ProcessedPujaEvent } from '@/types';

/**
 * Checks if a date object is valid and not the epoch date (new Date(0)).
 */
export function isValidDate(date: Date | undefined | null): date is Date {
  return !!date && isValid(date) && date.getTime() !== new Date(0).getTime();
}

interface ParsedDateResult {
  startDate: Date;
  endDate?: Date;
}

/**
 * Parses a date and time string into a start Date object and an optional end Date object for ranges.
 * Handles single dates (DD/MM/YYYY or D MMM YYYY) and date ranges ("D MMM YYYY to D MMM YYYY").
 * Time format: HH:MM
 */
export function parsePujaDates(dateStr: string, timeStr: string): ParsedDateResult {
  if (!dateStr || !timeStr || typeof dateStr !== 'string' || typeof timeStr !== 'string') {
    return { startDate: new Date(0) };
  }

  const dateInputStr = dateStr.trim();
  const timeInputStr = timeStr.trim();
  let startDate = new Date(0);
  let endDate: Date | undefined = undefined;

  const parseSingleDate = (singleDateStr: string, formatPattern: string): Date => {
    const parsed = parse(`${singleDateStr} ${timeInputStr}`, formatPattern, new Date());
    if (!isValid(parsed)) {
      // Fallback to trying the other common format if primary fails
      const alternativeFormat = formatPattern === 'dd/MM/yyyy HH:mm' ? 'd MMM yyyy HH:mm' : 'dd/MM/yyyy HH:mm';
      const parsedAlt = parse(`${singleDateStr} ${timeInputStr}`, alternativeFormat, new Date());
      return isValid(parsedAlt) ? parsedAlt : new Date(0);
    }
    return parsed;
  };
  
  let primaryFormat = 'dd/MM/yyyy HH:mm';
  if (/\d{1,2} [A-Za-z]{3} \d{4}/.test(dateInputStr.split(' to ')[0])) {
      primaryFormat = 'd MMM yyyy HH:mm';
  }


  if (dateInputStr.includes(' to ')) {
    const parts = dateInputStr.split(' to ');
    const startDateString = parts[0].trim();
    const endDateString = parts[1].trim();

    // Determine format for start and end dates (could be different if sheet inconsistent)
    let startFormat = 'dd/MM/yyyy HH:mm';
    if (/\d{1,2} [A-Za-z]{3} \d{4}/.test(startDateString)) {
        startFormat = 'd MMM yyyy HH:mm';
    }
    let endFormat = 'dd/MM/yyyy HH:mm';
     if (/\d{1,2} [A-Za-z]{3} \d{4}/.test(endDateString)) {
        endFormat = 'd MMM yyyy HH:mm';
    }
    
    startDate = parseSingleDate(startDateString, startFormat);
    // For end date of a range, we typically want the end of that day for inclusive checks.
    // However, the time is given, so we parse it as is.
    const parsedEnd = parseSingleDate(endDateString, endFormat);
    if(isValidDate(parsedEnd)) {
        endDate = parsedEnd;
    }

  } else {
    startDate = parseSingleDate(dateInputStr, primaryFormat);
  }

  return { startDate, endDate };
}


/**
 * Checks if an event is scheduled for tomorrow.
 * For ranged events, checks if tomorrow falls within the event's duration.
 */
export function isEventTomorrow(event: ProcessedPujaEvent, referenceDate: Date = new Date()): boolean {
  if (!isValidDate(event.parsedStartDate)) {
    return false;
  }
  const tomorrow = addDays(referenceDate, 1);

  if (event.parsedEndDate && isValidDate(event.parsedEndDate)) {
    // Ranged event: Check if tomorrow is within the event's range (inclusive of start and end day)
    // Adjust start date to beginning of day, end date to end of day for proper interval check
    const rangeStart = startOfWeek(event.parsedStartDate, {weekStartsOn: 1}); // Start of the event's start day
    const rangeEnd = endOfWeek(event.parsedEndDate, {weekStartsOn: 1}); // End of the event's end day
    return isWithinInterval(tomorrow, { start: rangeStart, end: rangeEnd }) || isSameDay(tomorrow, event.parsedStartDate);
  } else {
    // Single day event
    return isSameDay(event.parsedStartDate, tomorrow);
  }
}

/**
 * Checks if an event occurs this week.
 * For ranged events, checks if any part of the event's duration overlaps with the current week.
 */
export function isEventThisWeek(event: ProcessedPujaEvent, referenceDate: Date = new Date()): boolean {
  if (!isValidDate(event.parsedStartDate)) {
    return false;
  }
  const weekStartBoundary = startOfWeek(referenceDate, { weekStartsOn: 1 });
  const weekEndBoundary = endOfWeek(referenceDate, { weekStartsOn: 1 });

  if (event.parsedEndDate && isValidDate(event.parsedEndDate)) {
    // Ranged event: Check for overlap
    const eventStart = event.parsedStartDate;
    const eventEnd = event.parsedEndDate;
    // Overlap if event starts before/during week AND event ends during/after week
    return eventStart <= weekEndBoundary && eventEnd >= weekStartBoundary;
  } else {
    // Single day event
    return event.parsedStartDate >= weekStartBoundary && event.parsedStartDate <= weekEndBoundary;
  }
}


/**
 * Formats a Date object into a readable string for single dates.
 * e.g., "Mon, Jun 13, 2025"
 */
export function formatPujaDate(date: Date): string {
  if (!isValidDate(date)) {
    return "Invalid Date";
  }
  return formatDateStr(date, 'EEE, MMM d, yyyy');
}

/**
 * Formats a Date object's time into a readable string.
 * e.g., "5:30 PM"
 */
export function formatPujaTime(date: Date): string {
  if (!isValidDate(date)) {
    return "Invalid Time";
  }
  return formatDateStr(date, 'h:mm a');
}
