const fs = require('fs');
const path = require('path');

const DB_DIR = path.join(__dirname, '../DB');
const FILES = [
    'Warmup.csv',
    'StrengthExplosive.csv',
    'Special.csv',
    'RunningEndurance.csv'
];

// Helper to parse CSV line respecting quotes
function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
            if (inQuotes && line[i + 1] === '"') {
                current += '"';
                i++;
            } else {
                inQuotes = !inQuotes;
            }
        } else if (char === ',' && !inQuotes) {
            result.push(current);
            current = '';
        } else {
            current += char;
        }
    }
    result.push(current);
    return result;
}

// Helper to stringify CSV line
function toCSVLine(fields) {
    return fields.map(field => {
        if (field === null || field === undefined) return '';
        const stringField = String(field);
        if (stringField.includes(',') || stringField.includes('"') || stringField.includes('\n')) {
            return `"${stringField.replace(/"/g, '""')}"`;
        }
        return stringField;
    }).join(',');
}

function interpolateValues(values) {
    // Convert to map of level -> value
    const numValues = {};
    for (let i = 0; i <= 10; i++) {
        numValues[i] = values[String(i)] !== null && values[String(i)] !== undefined ? Number(values[String(i)]) : null;
    }

    // Find known points
    const knownLevels = Object.keys(numValues).map(Number).filter(l => numValues[l] !== null).sort((a, b) => a - b);

    if (knownLevels.length === 0) return numValues; // Can't interpolate without data

    // Fill gaps
    for (let i = 0; i <= 10; i++) {
        if (numValues[i] === null) {
            if (i < knownLevels[0]) {
                // Extrapolate downwards (or just clamp to first known)
                // For safety, let's just use the first known value, maybe slightly reduced if it's > 0
                numValues[i] = Math.max(1, Math.floor(numValues[knownLevels[0]] * (0.5 + 0.5 * (i / knownLevels[0]))));
                if (knownLevels[0] === 0) numValues[i] = numValues[0]; // Should not happen if i < knownLevels[0]
            } else if (i > knownLevels[knownLevels.length - 1]) {
                // Extrapolate upwards
                numValues[i] = numValues[knownLevels[knownLevels.length - 1]];
            } else {
                // Interpolate
                const lower = knownLevels.filter(l => l < i).pop();
                const upper = knownLevels.filter(l => l > i).shift();
                const range = upper - lower;
                const progress = (i - lower) / range;
                const valRange = numValues[upper] - numValues[lower];
                numValues[i] = Math.round(numValues[lower] + (progress * valRange));
            }
        }
    }
    return numValues;
}

function generateDefaults(type) {
    const values = {};
    if (type === 'time_based') {
        // 30s to 60s
        for (let i = 0; i <= 10; i++) values[i] = 30 + (i * 3);
    } else if (type === 'rep_based') {
        // 10 to 20
        for (let i = 0; i <= 10; i++) values[i] = 10 + i;
    } else if (type === 'distance_based') {
        // 100m to 200m
        for (let i = 0; i <= 10; i++) values[i] = 100 + (i * 10);
    } else {
        // Default fallback
        for (let i = 0; i <= 10; i++) values[i] = 10 + i;
    }
    return values;
}

function processFile(filename) {
    const filePath = path.join(DB_DIR, filename);
    if (!fs.existsSync(filePath)) {
        console.log(`File not found: ${filename}`);
        return;
    }

    console.log(`Processing ${filename}...`);
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    const header = parseCSVLine(lines[0]);
    const exercisesIdx = header.indexOf('exercises');

    if (exercisesIdx === -1) {
        console.log(`No 'exercises' column in ${filename}`);
        return;
    }

    const newLines = [lines[0]];

    for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        
        const fields = parseCSVLine(lines[i]);
        if (fields.length <= exercisesIdx) {
            newLines.push(lines[i]);
            continue;
        }

        try {
            let exercisesStr = fields[exercisesIdx];
            // Fix double quotes escaping for JSON parse
            // CSV parser handles the outer quotes and double-double quotes, so fields[exercisesIdx] is the raw string
            // But wait, my parseCSVLine handles the CSV unescaping.
            // So fields[exercisesIdx] should be a valid JSON string.
            
            if (!exercisesStr || exercisesStr === '[]') {
                // Empty exercises, maybe populate? For now leave as is unless it's Warmup which we know is broken
                if (filename === 'Warmup.csv') {
                     // Actually Warmup.csv has exercises but values are null
                }
            }

            const exercises = JSON.parse(exercisesStr);
            let modified = false;

            const newExercises = exercises.map(ex => {
                let values = ex.values;
                let hasNulls = false;
                let allNulls = true;

                // Check for nulls
                for (let k = 0; k <= 10; k++) {
                    if (values[String(k)] === null || values[String(k)] === undefined) hasNulls = true;
                    else allNulls = false;
                }

                if (allNulls) {
                    console.log(`  Fixing all-null values for ${ex.name} in ${fields[0]}`);
                    values = generateDefaults(ex.type);
                    modified = true;
                } else if (hasNulls) {
                    console.log(`  Interpolating values for ${ex.name} in ${fields[0]}`);
                    values = interpolateValues(values);
                    modified = true;
                }

                // Fix rest_seconds if null
                if (ex.rest_seconds === null || ex.rest_seconds === undefined) {
                    ex.rest_seconds = 30;
                    modified = true;
                }

                return { ...ex, values };
            });

            if (modified) {
                fields[exercisesIdx] = JSON.stringify(newExercises);
            }

        } catch (e) {
            console.error(`Error parsing JSON in row ${i}:`, e.message);
        }

        newLines.push(toCSVLine(fields));
    }

    fs.writeFileSync(filePath, newLines.join('\n'));
    console.log(`Updated ${filename}`);
}

FILES.forEach(processFile);
