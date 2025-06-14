
// src/lib/google-sheet-service.ts
import type { PujaEventData, GurudevEventDataCsv, ProcessedGurudevEvent } from '@/types';
import { parse as parseDateFns, isValid as isValidDateFns } from 'date-fns';

const GOOGLE_SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/14lwC-hEqGyAEGfKD6_zjQDCqkKcKLt0i6sHYoNRXfWc/export?format=csv&gid=652206804';
const GURUDEV_EVENTS_CSV_URL = 'https://docs.google.com/spreadsheets/d/14lwC-hEqGyAEGfKD6_zjQDCqkKcKLt0i6sHYoNRXfWc/export?format=csv&gid=1613600999';

// Helper function for robust CSV line parsing
function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let currentField = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && i + 1 < line.length && line[i+1] === '"') {
        currentField += '"';
        i++; 
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(currentField.trim());
      currentField = '';
    } else {
      currentField += char;
    }
  }
  result.push(currentField.trim()); 
  return result;
}

function csvToPujaEventData(csv: string): PujaEventData[] {
  const lines = csv.trim().split(/\r\n|\n/);
  if (lines.length < 2) {
    // console.warn("Puja Events CSV data has less than 2 lines.");
    return [];
  }
  const headers = parseCsvLine(lines[0]);
  const result: PujaEventData[] = [];

  for (let i = 1; i < lines.length; i++) {
    const currentLine = lines[i];
    if (!currentLine.trim()) continue;
    const values = parseCsvLine(currentLine);
    if (values.length !== headers.length) {
      // console.warn(`Puja Events: Skipping line ${i + 1} due to mismatched column count. Expected ${headers.length}, got ${values.length}. Line: "${currentLine}"`);
      continue;
    }
    const obj: any = {};
    headers.forEach((header, index) => {
      obj[header] = values[index];
    });
    if (obj.Date && obj.Time && obj.Seva && obj.Venue && obj.Activity && obj.link && obj.UniqueID && obj.details) {
      result.push(obj as PujaEventData);
    } else {
      // console.warn(`Puja Events: Skipping line ${i + 1} due to missing required fields. Data:`, obj);
    }
  }
  return result;
}

function parseGurudevEventDate(dateStr: string): Date {
  const parsed = parseDateFns(dateStr, 'yyyy-MM-dd', new Date());
  return isValidDateFns(parsed) ? parsed : new Date(0); // Return epoch if invalid
}

function csvToGurudevEventData(csv: string): ProcessedGurudevEvent[] {
  const lines = csv.trim().split(/\r\n|\n/);
  if (lines.length < 2) {
    // console.warn("Gurudev Events CSV data has less than 2 lines.");
    return [];
  }
  const headers = parseCsvLine(lines[0]);
  const result: ProcessedGurudevEvent[] = [];

  const eventNameHeader = headers.find(h => h.toLowerCase() === "event name".toLowerCase()) || "Event Name";
  const locationHeader = headers.find(h => h.toLowerCase() === "location".toLowerCase()) || "Location";
  const startDateHeader = headers.find(h => h.toLowerCase() === "start date".toLowerCase()) || "Start Date";
  const endDateHeader = headers.find(h => h.toLowerCase() === "end date".toLowerCase()) || "End Date";


  for (let i = 1; i < lines.length; i++) {
    const currentLine = lines[i];
    if (!currentLine.trim()) continue;
    const values = parseCsvLine(currentLine);
    
    if (values.length !== headers.length) {
      // console.warn(`Gurudev Events: Skipping line ${i + 1} due to mismatched column count. Expected ${headers.length}, got ${values.length}. Line: "${currentLine}"`);
      continue;
    }
    const rawObj: any = {};
    headers.forEach((header, index) => {
      rawObj[header] = values[index];
    });

    const startDate = parseGurudevEventDate(rawObj[startDateHeader]);
    const endDate = parseGurudevEventDate(rawObj[endDateHeader]);

    if (rawObj[eventNameHeader] && rawObj[locationHeader] && isValidDateFns(startDate) && startDate.getTime() !== new Date(0).getTime() && isValidDateFns(endDate) && endDate.getTime() !== new Date(0).getTime()) {
      result.push({
        eventName: rawObj[eventNameHeader],
        location: rawObj[locationHeader],
        startDate: startDate,
        endDate: endDate,
      });
    } else {
      // console.warn(`Gurudev Events: Skipping line ${i + 1} due to missing or invalid required fields. Data:`, rawObj);
    }
  }
  return result;
}


export async function fetchEvents(): Promise<PujaEventData[]> {
  try {
    const response = await fetch(GOOGLE_SHEET_CSV_URL, { next: { revalidate: 3600 } }); // Revalidate Puja events hourly
    if (!response.ok) {
      // console.error(`Failed to fetch Puja Events CSV: ${response.status} ${response.statusText}`);
      return [];
    }
    let csvData = await response.text();
    // Remove BOM if present
    if (csvData.charCodeAt(0) === 0xFEFF) {
      csvData = csvData.substring(1);
    }
    return csvToPujaEventData(csvData);
  } catch (error) {
    // console.error("Error fetching or parsing Puja Events CSV:", error);
    return [];
  }
}

export async function fetchGurudevEvents(): Promise<ProcessedGurudevEvent[]> {
  try {
    const response = await fetch(GURUDEV_EVENTS_CSV_URL, { next: { revalidate: 43200 } }); // Revalidate Gurudev events every 12 hours
    if (!response.ok) {
      // console.error(`Failed to fetch Gurudev Events CSV: ${response.status} ${response.statusText}`);
      return [];
    }
    let csvData = await response.text();
    // Remove BOM if present
    if (csvData.charCodeAt(0) === 0xFEFF) {
      csvData = csvData.substring(1);
    }
    return csvToGurudevEventData(csvData);
  } catch (error) {
    // console.error("Error fetching or parsing Gurudev Events CSV:", error);
    return [];
  }
}

