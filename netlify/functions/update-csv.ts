import { Handler } from '@netlify/functions';
import * as fs from 'fs';
import * as path from 'path';

interface UpdateCSVRequest {
  filename: string;
  data: Record<string, string | number | boolean>[];
  password: string;
}

// Admin password - should match the one in Admin component
const ADMIN_PASSWORD = process.env.VITE_ADMIN_PASSWORD || 'admin123';

// Convert JSON data to CSV format
function jsonToCSV(data: Record<string, any>[]): string {
  if (data.length === 0) return '';

  const headers = Object.keys(data[0]);
  const csvRows: string[] = [];

  // Add header row
  csvRows.push(headers.join(','));

  // Add data rows
  for (const row of data) {
    const values = headers.map(header => {
      const value = row[header];

      // Handle different value types
      if (value === null || value === undefined) {
        return '';
      }

      // If it's an object or array, stringify it and escape quotes
      if (typeof value === 'object') {
        const jsonStr = JSON.stringify(value);
        return `"${jsonStr.replace(/"/g, '""')}"`;
      }

      // If it's a string with commas, quotes, or newlines, wrap in quotes
      const strValue = String(value);
      if (strValue.includes(',') || strValue.includes('"') || strValue.includes('\n')) {
        return `"${strValue.replace(/"/g, '""')}"`;
      }

      return strValue;
    });

    csvRows.push(values.join(','));
  }

  return csvRows.join('\n');
}

export const handler: Handler = async (event) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const body: UpdateCSVRequest = JSON.parse(event.body || '{}');
    const { filename, data, password } = body;

    // Verify password
    if (password !== ADMIN_PASSWORD) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'Unauthorized: Invalid password' })
      };
    }

    // Validate filename to prevent directory traversal
    const allowedFiles = [
      'Warmup.csv',
      'StrengthExplosive.csv',
      'RunningEndurance.csv',
      'Special.csv',
      'HeritageStory.csv'
    ];

    if (!allowedFiles.includes(filename)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid filename' })
      };
    }

    // Convert data to CSV
    const csvContent = jsonToCSV(data);

    // Write to all three locations
    const locations = [
      path.join(process.cwd(), 'public', 'data', filename),
      path.join(process.cwd(), 'DB', filename),
      path.join(process.cwd(), 'dist', 'data', filename)
    ];

    for (const location of locations) {
      const dir = path.dirname(location);

      // Ensure directory exists
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      // Write file
      fs.writeFileSync(location, csvContent, 'utf8');
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: `Successfully updated ${filename}`,
        rowsUpdated: data.length
      })
    };

  } catch (error) {
    console.error('Error updating CSV:', error);

    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    };
  }
};
