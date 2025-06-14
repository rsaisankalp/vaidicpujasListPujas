
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
 * Date format: DD/MM/YYYY
 * Time format: HH:MM
 */
export function parsePujaDate(dateStr: string, timeStr: string): Date {
  if (!dateStr || !timeStr || typeof dateStr !== 'string' || typeof timeStr !== 'string') {
    // console.error("Invalid or non-string date/time provided to parsePujaDate:", dateStr, timeStr);
    return new Date(0); // Fallback for clearly invalid input
  }
  try {
    // Example dateStr: "13/06/2025", timeStr: "17:30" -> "13/06/2025 17:30"
    const parsed = parse(`${dateStr.trim()} ${timeStr.trim()}`, 'dd/MM/yyyy HH:mm', new Date());
    
    if (!isValid(parsed)) { 
        // console.error("Failed to parse date (resulted in Invalid Date object):", dateStr, timeStr, "Attempted parse with:", `${dateStr.trim()} ${timeStr.trim()}`);
        return new Date(0); // Return a known valid fallback
    }
    return parsed;
  } catch (error) { 
    // console.error("Exception during date parsing:", dateStr, timeStr, error);
    return new Date(0); // Return a known valid fallback on exception
  }
}

/**
 * Checks if a given date is tomorrow relative to the current date.
 */
export function isTomorrow(date: Date): boolean {
  if (!isValidDate(date)) {
    // console.warn("isTomorrow received an invalid date:", date);
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
    // console.warn("isThisWeek received an invalid date:", date);
    return false;
  }
  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 }); // Monday as start of the week
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 });   // Sunday as end of the week
  
  return date >= weekStart && date <= weekEnd;
}

/**
 * Formats a Date object into a readable string.
 * e.g., "Mon, Jun 13, 2025"
 */
export function formatPujaDate(date: Date): string {
  if (!isValidDate(date)) {
    // console.warn("formatPujaDate received an invalid date:", date);
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
    // console.warn("formatPujaTime received an invalid date:", date);
    return "Invalid Time";
  }
  return formatDateStr(date, 'h:mm a');
}
