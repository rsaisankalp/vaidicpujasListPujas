// src/lib/date-utils.ts
import { parse, isSameDay, addDays, startOfWeek, endOfWeek, format as formatDateStr } from 'date-fns';

/**
 * Parses a date and time string into a Date object.
 * Date format: DD/MM/YYYY
 * Time format: HH:MM
 */
export function parsePujaDate(dateStr: string, timeStr: string): Date {
  try {
    // The 'parse' function from date-fns is robust.
    // Example dateStr: "13/06/2025", timeStr: "17:30"
    // Combined: "13/06/2025 17:30"
    // Format string: "dd/MM/yyyy HH:mm"
    return parse(`${dateStr} ${timeStr}`, 'dd/MM/yyyy HH:mm', new Date());
  } catch (error) {
    console.error("Failed to parse date:", dateStr, timeStr, error);
    // Return a very past date or handle error as appropriate
    return new Date(0); 
  }
}

/**
 * Checks if a given date is tomorrow relative to the current date.
 */
export function isTomorrow(date: Date): boolean {
  const tomorrow = addDays(new Date(), 1);
  return isSameDay(date, tomorrow);
}

/**
 * Checks if a given date falls within the current week (typically Monday to Sunday, locale-dependent).
 */
export function isThisWeek(date: Date): boolean {
  const now = new Date();
  // For 'America/New_York' (EST/EDT), week starts on Sunday.
  // For many other locales, week starts on Monday.
  // date-fns startOfWeek and endOfWeek are locale-aware if date-fns/locale is imported.
  // Default is usually Sunday or Monday based on system/browser locale.
  // For consistency, we can specify locale if needed, e.g. { weekStartsOn: 1 } for Monday.
  const weekStart = startOfWeek(now, { weekStartsOn: 1 }); // Monday as start of the week
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 }); // Sunday as end of the week
  
  return date >= weekStart && date <= weekEnd;
}

/**
 * Formats a Date object into a readable string.
 * e.g., "Mon, Jun 13, 2025"
 */
export function formatPujaDate(date: Date): string {
  return formatDateStr(date, 'EEE, MMM d, yyyy');
}

/**
 * Formats a Date object's time into a readable string.
 * e.g., "5:30 PM"
 */
export function formatPujaTime(date: Date): string {
  return formatDateStr(date, 'h:mm a');
}
