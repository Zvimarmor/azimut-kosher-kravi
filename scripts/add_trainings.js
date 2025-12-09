const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DB_DIR = path.join(__dirname, '../DB');

// Helper to generate UUID
function generateId() {
    return crypto.randomUUID();
}

// Helper to get ISO date
function getDate() {
    return new Date().toISOString();
}

// Helper to escape CSV field
function escapeCsv(field) {
    if (field === null || field === undefined) return '';
    const stringField = String(field);
    if (stringField.includes(',') || stringField.includes('"') || stringField.includes('\n')) {
        return `"${stringField.replace(/"/g, '""')}"`;
    }
    return stringField;
}

// Helper to create a row string based on header
function createRow(header, data) {
    const columns = header.split(',');
    return columns.map(col => {
        // Handle special mapping or defaults
        if (col === 'id') return data.id || generateId();
        if (col === 'created_date' || col === 'updated_date') return getDate();
        if (col === 'created_by') return 'system';
        if (col === 'is_sample') return 'true';

        // Return provided data or empty
        return escapeCsv(data[col]);
    }).join(',');
}

// Data definitions
const newWorkouts = {
    'StrengthExplosive.csv': [
        {
            title: "Leg Blaster",
            target_attributes: JSON.stringify(["push_strength", "cardio_endurance"]),
            required_level: 1,
            max_level: 10,
            equipment: JSON.stringify([]),
            environment: JSON.stringify(["comfortable"]),
            rounds: 4,
            category: "Strength",
            difficulty: "Advanced",
            instructions: "Complete 4 rounds of intense leg work.",
            exercises: JSON.stringify([
                {
                    name: "Air Squats",
                    type: "rep_based",
                    values: { 0: 10, 5: 20, 10: 40 },
                    rest_seconds: 10
                },
                {
                    name: "Lunges (each leg)",
                    type: "rep_based",
                    values: { 0: 5, 5: 10, 10: 20 },
                    rest_seconds: 10
                },
                {
                    name: "Jump Squats",
                    type: "rep_based",
                    values: { 0: 5, 5: 10, 10: 15 },
                    rest_seconds: 30
                }
            ])
        },
        {
            title: "Upper Body Power",
            target_attributes: JSON.stringify(["push_strength", "pull_strength"]),
            required_level: 1,
            max_level: 10,
            equipment: JSON.stringify(["pullup_bar", "dips"]),
            environment: JSON.stringify(["comfortable"]),
            rounds: 3,
            category: "Strength",
            difficulty: "Intermediate",
            instructions: "Focus on explosive power in push and pull movements.",
            exercises: JSON.stringify([
                {
                    name: "Explosive Push-ups",
                    type: "rep_based",
                    values: { 0: 5, 5: 10, 10: 20 },
                    rest_seconds: 45
                },
                {
                    name: "Pull-ups",
                    type: "rep_based",
                    values: { 0: 2, 5: 6, 10: 12 },
                    rest_seconds: 45
                },
                {
                    name: "Dips",
                    type: "rep_based",
                    values: { 0: 3, 5: 8, 10: 15 },
                    rest_seconds: 60
                }
            ])
        },
        {
            title: "Core Crusher",
            target_attributes: JSON.stringify(["push_strength"]), // Core often grouped here or needs new attr
            required_level: 1,
            max_level: 10,
            equipment: JSON.stringify([]),
            environment: JSON.stringify(["comfortable"]),
            rounds: 3,
            category: "Strength",
            difficulty: "Beginner",
            instructions: "Strengthen your core stability.",
            exercises: JSON.stringify([
                {
                    name: "Plank (seconds)",
                    type: "time_based",
                    values: { 0: 20, 5: 60, 10: 120 },
                    rest_seconds: 15
                },
                {
                    name: "Leg Raises",
                    type: "rep_based",
                    values: { 0: 5, 5: 12, 10: 20 },
                    rest_seconds: 15
                },
                {
                    name: "Sit-ups",
                    type: "rep_based",
                    values: { 0: 10, 5: 20, 10: 40 },
                    rest_seconds: 30
                }
            ])
        }
    ],
    'RunningEndurance.csv': [
        {
            title: "2km Time Trial",
            target_attributes: JSON.stringify(["cardio_endurance", "running_volume"]),
            required_level: 1,
            max_level: 10,
            equipment: JSON.stringify([]),
            environment: JSON.stringify(["outdoor"]),
            rounds: 1,
            category: "Cardio",
            difficulty: "Advanced",
            instructions: "Run 2km as fast as possible. Record your time.",
            exercises: JSON.stringify([
                {
                    name: "2km Run",
                    type: "distance_based",
                    values: { 0: 2000, 10: 2000 },
                    rest_seconds: 0
                }
            ])
        },
        {
            title: "Hill Repeats",
            target_attributes: JSON.stringify(["cardio_endurance", "push_strength"]),
            required_level: 3,
            max_level: 10,
            equipment: JSON.stringify([]),
            environment: JSON.stringify(["hill"]),
            rounds: 6,
            category: "Cardio",
            difficulty: "Hard",
            instructions: "Sprint up the hill, walk down for recovery.",
            exercises: JSON.stringify([
                {
                    name: "Hill Sprint (approx 100m)",
                    type: "time_based", // Using time as proxy or distance
                    values: { 0: 20, 5: 30, 10: 40 }, // seconds of sprinting
                    rest_seconds: 60
                }
            ])
        }
    ],
    'Special.csv': [
        {
            title: "Deck of Cards (Simulated)",
            target_attributes: JSON.stringify(["push_strength", "pull_strength", "cardio_endurance"]),
            required_level: 1,
            max_level: 10,
            equipment: JSON.stringify([]),
            environment: JSON.stringify(["comfortable"]),
            rounds: 1,
            category: "Tactical",
            difficulty: "Intermediate",
            instructions: "Complete the deck. Hearts=Pushups, Diamonds=Situps, Clubs=Lunges, Spades=Burpees.",
            exercises: JSON.stringify([
                {
                    name: "Push-ups (Hearts)",
                    type: "rep_based",
                    values: { 0: 20, 5: 50, 10: 100 }, // Total volume
                    rest_seconds: 30
                },
                {
                    name: "Sit-ups (Diamonds)",
                    type: "rep_based",
                    values: { 0: 20, 5: 50, 10: 100 },
                    rest_seconds: 30
                },
                {
                    name: "Lunges (Clubs)",
                    type: "rep_based",
                    values: { 0: 20, 5: 50, 10: 100 },
                    rest_seconds: 30
                },
                {
                    name: "Burpees (Spades)",
                    type: "rep_based",
                    values: { 0: 10, 5: 25, 10: 50 },
                    rest_seconds: 60
                }
            ])
        }
    ],
    'Warmup.csv': [
        {
            title: "Mobility Flow",
            target_attributes: JSON.stringify([]),
            required_level: 1,
            max_level: 10,
            equipment: JSON.stringify([]),
            environment: JSON.stringify(["comfortable"]),
            rounds: 1,
            category: "Warmup",
            difficulty: "Beginner",
            instructions: "Focus on joint range of motion.",
            exercises: JSON.stringify([
                {
                    name: "Neck Rotations",
                    type: "time_based",
                    values: { 0: 30, 10: 30 },
                    rest_seconds: 0
                },
                {
                    name: "Arm Circles",
                    type: "time_based",
                    values: { 0: 30, 10: 30 },
                    rest_seconds: 0
                },
                {
                    name: "Hip Rotations",
                    type: "time_based",
                    values: { 0: 30, 10: 30 },
                    rest_seconds: 0
                }
            ])
        },
        {
            title: "Tactical Warmup",
            target_attributes: JSON.stringify(["cardio_endurance"]),
            required_level: 1,
            max_level: 10,
            equipment: JSON.stringify([]),
            environment: JSON.stringify(["comfortable"]),
            rounds: 2,
            category: "Warmup",
            difficulty: "Intermediate",
            instructions: "Get heart rate up and joints ready.",
            exercises: JSON.stringify([
                {
                    name: "Jumping Jacks",
                    type: "rep_based",
                    values: { 0: 20, 5: 40, 10: 60 },
                    rest_seconds: 10
                },
                {
                    name: "High Knees",
                    type: "time_based",
                    values: { 0: 20, 5: 30, 10: 45 },
                    rest_seconds: 10
                },
                {
                    name: "Mountain Climbers",
                    type: "rep_based",
                    values: { 0: 10, 5: 20, 10: 30 },
                    rest_seconds: 20
                }
            ])
        }
    ]
};

// Main execution
Object.entries(newWorkouts).forEach(([filename, workouts]) => {
    const filePath = path.join(DB_DIR, filename);
    if (!fs.existsSync(filePath)) {
        console.log(`Skipping ${filename} (not found)`);
        return;
    }

    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    const header = lines[0].trim();

    // Filter out empty lines
    const existingLines = lines.filter(l => l.trim().length > 0);

    const newRows = workouts.map(w => createRow(header, w));

    // Append new rows
    const updatedContent = existingLines.join('\n') + '\n' + newRows.join('\n') + '\n';

    fs.writeFileSync(filePath, updatedContent);
    console.log(`Added ${workouts.length} workouts to ${filename}`);
});
