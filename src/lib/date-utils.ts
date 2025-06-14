
// src/lib/date-utils.ts
import { parse, isSameDay, addDays, startOfWeek, endOfWeek, format as formatDateStr, isValid } from 'date-fns';

/**
 * Checks if a date object is valid and not the epoch date (new Date(0)).
 */
export function isValidDate(date: Date): boolean {
  return isValid(date) && date.getTime() !== new Date(0).getTime();
}


/**
 * Parses a date and time string into a Date object.
 * Handles single dates (DD/MM/YYYY) and date ranges ("DD MMM YYYY to DD MMM YYYY").
 * For ranges, it parses the start date.
 * Date format: DD/MM/YYYY or DD MMM YYYY
 * Time format: HH:MM
 */
export function parsePujaDate(dateStr: string, timeStr: string): Date {
  if (!dateStr || !timeStr || typeof dateStr !== 'string' || typeof timeStr !== 'string') {
    return new Date(0); 
  }

  let dateToParse = dateStr.trim();
  let formatString = 'dd/MM/yyyy HH:mm'; // Default format

  // Check for date ranges like "1 Apr 2025 to 31 Mar 2026"
  if (dateToParse.includes(' to ')) {
    const parts = dateToParse.split(' to ');
    dateToParse = parts[0].trim(); // Use the start date of the range
    // Attempt to determine if the format is "d MMM yyyy" or "dd/MM/yyyy"
    if (/\d{1,2} [A-Za-z]{3} \d{4}/.test(dateToParse)) {
      formatString = 'd MMM yyyy HH:mm';
    }
    // If not "d MMM yyyy", assume "dd/MM/yyyy" (already default)
  } else {
     // For single dates, also check if it's "d MMM yyyy" format
    if (/\d{1,2} [A-Za-z]{3} \d{4}/.test(dateToParse)) {
      formatString = 'd MMM yyyy HH:mm';
    }
    // Otherwise, stick to 'dd/MM/yyyy HH:mm'
  }

  try {
    const parsed = parse(`${dateToParse} ${timeStr.trim()}`, formatString, new Date());
    
    if (!isValid(parsed)) { 
        // Fallback to trying the other common format if primary fails
        const alternativeFormat = formatString === 'dd/MM/yyyy HH:mm' ? 'd MMM yyyy HH:mm' : 'dd/MM/yyyy HH:mm';
        const parsedAlt = parse(`${dateToParse} ${timeStr.trim()}`, alternativeFormat, new Date());
        if (!isValid(parsedAlt)) {
          return new Date(0);
        }
        return parsedAlt;
    }
    return parsed;
  } catch (error) { 
    return new Date(0); 
  }
}

/**
 * Checks if a given date is tomorrow relative to the current date.
 */
export function isTomorrow(date: Date): boolean {
  if (!isValidDate(date)) {
    return false;
  }
  const tomorrow = addDays(new Date(), 1);
  return isSameDay(date, tomorrow);
}

/**
 * Checks if a given date falls within the current week (Monday to Sunday).
 */
export function isThisWeek(date: Date): boolean {
  if (!isValidDate(date)) {
    return false;
  }
  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 }); 
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 });   
  
  return date >= weekStart && date <= weekEnd;
}

/**
 * Formats a Date object into a readable string.
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
