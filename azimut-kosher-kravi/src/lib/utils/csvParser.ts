// CSV Parser utility for reading and parsing CSV data

export interface CSVRow {
  [key: string]: string;
}

/**
 * Simple CSV parser that handles quoted fields and JSON values
 */
export function parseCSV(csvText: string): CSVRow[] {
  const lines = csvText.split('\n').filter(line => line.trim());
  if (lines.length === 0) return [];

  const headers = parseCSVLine(lines[0]);
  const rows: CSVRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length === headers.length) {
      const row: CSVRow = {};
      headers.forEach((header, index) => {
        row[header] = values[index];
      });
      rows.push(row);
    }
  }

  return rows;
}

/**
 * Parse a single CSV line handling quoted fields
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  let i = 0;

  while (i < line.length) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        current += '"';
        i += 2;
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
        i++;
      }
    } else if (char === ',' && !inQuotes) {
      // Field separator
      result.push(current);
      current = '';
      i++;
    } else {
      current += char;
      i++;
    }
  }

  // Add the last field
  result.push(current);

  return result;
}

/**
 * Parse JSON field safely
 */
export function parseJSONField(value: string): any {
  if (!value || value === '""' || value === '') {
    return null;
  }

  try {
    // Remove outer quotes if they exist
    const cleaned = value.startsWith('"') && value.endsWith('"')
      ? value.slice(1, -1)
      : value;

    // Replace escaped quotes
    const unescaped = cleaned.replace(/""/g, '"');

    return JSON.parse(unescaped);
  } catch (error) {
    console.warn('Failed to parse JSON field:', value, error);
    return value; // Return original value if parsing fails
  }
}

/**
 * Fetch and parse CSV from public folder
 */
export async function fetchCSV(filename: string): Promise<CSVRow[]> {
  try {
    const response = await fetch(`/data/${filename}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${filename}: ${response.statusText}`);
    }
    const csvText = await response.text();
    return parseCSV(csvText);
  } catch (error) {
    console.error(`Error fetching CSV file ${filename}:`, error);
    return [];
  }
}