// src/lib/google-sheet-service.ts
import type { PujaEventData } from '@/types';

const GOOGLE_SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/14lwC-hEqGyAEGfKD6_zjQDCqkKcKLt0i6sHYoNRXfWc/export?format=csv&gid=652206804';

// Helper function for robust CSV line parsing
// Handles fields enclosed in double quotes, including commas and escaped double quotes ("") within them.
function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let currentField = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && i + 1 < line.length && line[i+1] === '"') {
        // Escaped double quote: "" inside a quoted field
        currentField += '"';
        i++; // Skip the second quote of the pair
      } else {
        // Start or end of a quoted field
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // Comma delimiter outside of quotes
      result.push(currentField);
      currentField = '';
    } else {
      // Regular character
      currentField += char;
    }
  }
  result.push(currentField); // Add the last field
  return result;
}

function csvToPujaEventData(csv: string): PujaEventData[] {
  const lines = csv.trim().split(/\r\n|\n/); // Split by new line, handling \r\n and \n
  if (lines.length < 2) {
    console.warn("CSV data has less than 2 lines (header + data).");
    return [];
  }

  const headers = parseCsvLine(lines[0]).map(header => header.trim());
  const result: PujaEventData[] = [];

  for (let i = 1; i < lines.length; i++) {
    const currentLine = lines[i];
    if (!currentLine.trim()) { // Skip empty lines
      continue;
    }

    const values = parseCsvLine(currentLine);
    
    if (values.length !== headers.length) {
      console.warn(`Skipping line ${i + 1} (data row ${i}) due to mismatched column count. Expected ${headers.length}, got ${values.length}. Line: "${currentLine}" Headers:`, headers, "Parsed values:", values);
      continue;
    }

    const obj: any = {};
    headers.forEach((header, index) => {
      // parseCsvLine handles quote unescaping. We just trim the final field value.
      obj[header] = values[index].trim();
    });
    
    // Basic validation for required fields
    if (obj.Date && obj.Time && obj.Seva && obj.Venue && obj.Activity && obj.link && obj.UniqueID && obj.details) {
      result.push(obj as PujaEventData);
    } else {
      console.warn(`Skipping line ${i + 1} (data row ${i}) due to missing required fields after processing. Data:`, obj, `Original line: "${currentLine}"`);
    }
  }
  return result;
}

export async function fetchEvents(): Promise<PujaEventData[]> {
  try {
    // Fetch data and revalidate every hour (3600 seconds)
    const response = await fetch(GOOGLE_SHEET_CSV_URL, { next: { revalidate: 3600 } });
    
    if (!response.ok) {
      console.error(`Failed to fetch CSV from Google Sheets: ${response.status} ${response.statusText}`);
      return [];
    }
    
    let csvData = await response.text();
    // Handle UTF-8 BOM (Byte Order Mark) if present at the start of the CSV file
    if (csvData.startsWith('\uFEFF')) {
      csvData = csvData.substring(1);
    }
    
    const jsonData = csvToPujaEventData(csvData);
    return jsonData;
  } catch (error) {
    console.error("Error fetching or parsing Google Sheet CSV:", error);
    return [];
  }
}
