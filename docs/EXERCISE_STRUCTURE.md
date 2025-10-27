# Exercise Structure Documentation

## Overview

Your workout system has **two types of exercise structures**:

1. **Workout Exercises** - Embedded inside workouts (Warmup, Strength, Running, Special)
2. **Exercise Library** - Standalone detailed exercise information

---

## 1. WORKOUT EXERCISES (Used in Trainings)

These are exercises **embedded inside each workout** in the CSV files.

### Structure in TypeScript

```typescript
{
  name: string;                    // Exercise name (Hebrew)
  type: string;                    // "time_based" | "rep_based" | "distance_based"
  values: number[] | object;       // Values for 10 difficulty levels (0-10)
  rest_seconds?: number;           // Rest time after exercise
}
```

### Exercise Types

#### 1. **Time-Based Exercise** (תרגיל לפי זמן)
Exercise measured in **seconds** or **minutes**

**Example:**
```json
{
  "name": "ריצה קלה",
  "type": "time_based",
  "values": {
    "0": null,
    "1": 30,
    "2": 45,
    "3": 60,
    "4": 90,
    "5": 120,
    "6": 150,
    "7": 180,
    "8": 210,
    "9": 240,
    "10": 300
  },
  "rest_seconds": 0
}
```

**Meaning:**
- Level 0: Not applicable
- Level 1: 30 seconds
- Level 5: 120 seconds (2 minutes)
- Level 10: 300 seconds (5 minutes)

---

#### 2. **Rep-Based Exercise** (תרגיל לפי חזרות)
Exercise measured in **repetitions**

**Example:**
```json
{
  "name": "שכיבות סמיכה",
  "type": "rep_based",
  "values": {
    "0": 3,
    "1": 5,
    "2": 8,
    "3": 10,
    "4": 12,
    "5": 15,
    "6": 18,
    "7": 20,
    "8": 25,
    "9": 30,
    "10": 40
  },
  "rest_seconds": 60
}
```

**Meaning:**
- Level 0: 3 reps (absolute beginner)
- Level 5: 15 reps (intermediate)
- Level 10: 40 reps (advanced)
- Rest 60 seconds after completing

---

#### 3. **Distance-Based Exercise** (תרגיל לפי מרחק)
Exercise measured in **meters**

**Example:**
```json
{
  "name": "ספרינט עם שק חול",
  "type": "distance_based",
  "values": {
    "0": 20,
    "1": 30,
    "2": 40,
    "3": 50,
    "4": 60,
    "5": 80,
    "6": 100,
    "7": 120,
    "8": 150,
    "9": 200,
    "10": 250
  },
  "rest_seconds": 90
}
```

**Meaning:**
- Level 0: 20 meters
- Level 5: 80 meters
- Level 10: 250 meters

---

### How It's Stored in CSV

In the CSV, exercises are stored as a **JSON array** in the `exercises` column:

```csv
title,exercises
"אימון כוח","[{""name"":""שכיבות סמיכה"",""type"":""rep_based"",""values"":{""0"":5,""5"":15,""10"":30},""rest_seconds"":60}]"
```

**Important Notes:**
- The entire exercises array is in ONE CSV cell
- Quotes are escaped with double quotes (`""`)
- JSON structure must be valid

---

## 2. EXERCISE LIBRARY (Standalone Exercise Information)

These are **detailed exercise descriptions** stored separately for reference.

### Structure in TypeScript

```typescript
{
  id: string;                      // Unique ID (e.g., "ex_001")
  name: string;                    // Hebrew name
  nameEnglish: string;             // English name
  category: string;                // "warmup" | "strength" | "cardio" | "special"
  difficulty: string;              // "beginner" | "intermediate" | "advanced"

  // Descriptions
  description: string;             // Hebrew description
  descriptionEnglish: string;      // English description
  formTips: string[];              // Array of form tips (Hebrew)
  formTipsEnglish: string[];       // English form tips
  commonMistakes: string[];        // Common mistakes to avoid

  // Media
  thumbnailUrl: string;            // Image path
  images: string[];                // Multiple images
  videoUrl?: string;               // YouTube or local video
  videoType?: string;              // "youtube" | "local"

  // Metadata
  targetMuscles: string[];         // Muscles worked
  equipment: string[];             // Equipment needed
  targetAttributes: string[];      // Fitness attributes

  // Related
  relatedExercises?: string[];     // Related exercise IDs
  progressions?: string[];         // Easier/harder variations
}
```

### Example Exercise

```json
{
  "id": "ex_001",
  "name": "שכיבות סמיכה",
  "nameEnglish": "Push-ups",
  "category": "strength",
  "difficulty": "beginner",
  "description": "תרגיל בסיסי לחיזוק חזה, כתפיים וטריצפס",
  "descriptionEnglish": "Basic exercise for chest, shoulders and triceps",
  "formTips": [
    "שמור על גב ישר",
    "ירד עד 90 מעלות",
    "נשוף בעלייה"
  ],
  "formTipsEnglish": [
    "Keep back straight",
    "Lower to 90 degrees",
    "Exhale on the way up"
  ],
  "commonMistakes": [
    "גב קעור",
    "טווח תנועה חלקי"
  ],
  "thumbnailUrl": "/exercises/pushup_thumb.jpg",
  "images": ["/exercises/pushup_1.jpg", "/exercises/pushup_2.jpg"],
  "videoUrl": "https://www.youtube.com/watch?v=IODxDxX7oi4",
  "videoType": "youtube",
  "targetMuscles": ["חזה", "טריצפס", "כתפיים"],
  "equipment": ["משקל גוף"],
  "targetAttributes": ["push_strength"]
}
```

---

## 3. HOW TO FIT EXERCISES INTO WORKOUTS

### Step-by-Step Process

#### Step 1: Create the Exercise Object

```json
{
  "name": "מתח",
  "type": "rep_based",
  "values": {
    "0": 1,
    "1": 2,
    "2": 3,
    "3": 5,
    "4": 7,
    "5": 10,
    "6": 12,
    "7": 15,
    "8": 18,
    "9": 20,
    "10": 25
  },
  "rest_seconds": 60
}
```

#### Step 2: Add to Exercises Array

```json
[
  {
    "name": "מתח",
    "type": "rep_based",
    "values": {"0":1,"1":2,"2":3,"3":5,"4":7,"5":10,"6":12,"7":15,"8":18,"9":20,"10":25},
    "rest_seconds": 60
  },
  {
    "name": "שכיבות סמיכה",
    "type": "rep_based",
    "values": {"0":3,"1":5,"2":8,"3":10,"4":12,"5":15,"6":18,"7":20,"8":25,"9":30,"10":40},
    "rest_seconds": 60
  }
]
```

#### Step 3: Escape for CSV

```
"[{""name"":""מתח"",""type"":""rep_based"",""values"":{""0"":1,""1"":2,""2"":3,""3"":5,""4"":7,""5"":10,""6"":12,""7"":15,""8"":18,""9"":20,""10"":25},""rest_seconds"":60}]"
```

#### Step 4: Use the Admin Panel (EASY WAY!)

**Instead of manually editing CSV:**

1. Go to `/admin`
2. Enter password
3. Select workout type (Warmup, Strength, etc.)
4. Click "Edit" on the workout
5. Find the `exercises` field
6. Edit the JSON directly in the textarea
7. Click "Save"

The admin panel will:
- ✅ Automatically escape quotes
- ✅ Validate JSON structure
- ✅ Save to all 3 CSV locations
- ✅ Much easier than manual CSV editing!

---

## 4. EXERCISE VALUES EXPLAINED

### The 11 Difficulty Levels (0-10)

```
Level 0:  Absolute beginner / recovery mode
Level 1:  Very beginner
Level 2:  Beginner
Level 3:  Beginner+
Level 4:  Intermediate-
Level 5:  Intermediate (DEFAULT)
Level 6:  Intermediate+
Level 7:  Advanced-
Level 8:  Advanced
Level 9:  Advanced+
Level 10: Elite / Maximum
```

### User Attributes (How levels are determined)

Your app tracks 6 fitness attributes per user:

```typescript
{
  push_strength: 0-10,      // Push exercises (push-ups, dips)
  pull_strength: 0-10,      // Pull exercises (pull-ups, rows)
  cardio_endurance: 0-10,   // Cardio exercises
  running_volume: 0-10,     // Running distance
  rucking_volume: 0-10,     // Weighted marching
  weight_work: 0-10         // Weight training
}
```

**How it works:**
1. User has `push_strength: 7`
2. Workout has exercise type `rep_based` targeting push
3. System uses `values["7"]` from the exercise
4. User does that many reps!

---

## 5. REAL EXAMPLES FROM YOUR CSV

### Example 1: Warmup with Multiple Exercises

```json
{
  "title": "חימום דינאמי",
  "rounds": 1,
  "exercises": [
    {
      "name": "סיבובי מרפקים",
      "type": "time_based",
      "values": {"0":30,"1":30,"2":30,"3":30,"4":30,"5":40,"6":40,"7":60,"8":60,"9":60,"10":60},
      "rest_seconds": 30
    },
    {
      "name": "קפיצות חבל דמיוני",
      "type": "rep_based",
      "values": {"0":10,"1":15,"2":20,"3":25,"4":30,"5":35,"6":40,"7":45,"8":50,"9":55,"10":60},
      "rest_seconds": 30
    },
    {
      "name": "ברך לחזה בעמידה",
      "type": "rep_based",
      "values": {"0":3,"1":5,"2":5,"3":5,"4":7,"5":7,"6":10,"7":12,"8":15,"9":20,"10":25},
      "rest_seconds": 30
    }
  ]
}
```

**What happens:**
1. User does "סיבובי מרפקים" for X seconds (based on their level)
2. Rests 30 seconds
3. Does "קפיצות חבל דמיוני" for X reps
4. Rests 30 seconds
5. Does "ברך לחזה בעמידה" for X reps
6. Rests 30 seconds

### Example 2: Strength Workout

```json
{
  "title": "סט מתח-מקבילים-בטן",
  "rounds": 5,
  "exercises": [
    {
      "name": "מתח",
      "type": "rep_based",
      "values": {"0":3,"5":7,"10":12},
      "rest_seconds": 45
    },
    {
      "name": "מקבילים",
      "type": "rep_based",
      "values": {"0":5,"5":10,"10":15},
      "rest_seconds": 45
    },
    {
      "name": "בטן סטטית",
      "type": "time_based",
      "values": {"0":20,"5":40,"10":60},
      "rest_seconds": 60
    }
  ]
}
```

**What happens:**
- User does all 3 exercises
- Then repeats 5 times (5 rounds total!)
- Values adjust based on user's fitness level

---

## 6. QUICK REFERENCE

### Exercise Types
| Type | Measures | Example Values | Use For |
|------|----------|----------------|---------|
| `time_based` | Seconds | 30, 60, 120, 180 | Running, planks, holds |
| `rep_based` | Repetitions | 5, 10, 15, 20 | Push-ups, pull-ups, sit-ups |
| `distance_based` | Meters | 50, 100, 200, 500 | Sprints, running |

### Null Values
```json
"values": {"0": null, "1": null, ...}
```
- `null` means "not applicable for this level"
- Use when exercise shouldn't be done at that level

### Rest Time
```json
"rest_seconds": 60
```
- Time to rest AFTER completing the exercise
- `0` or `null` = no rest

---

## 7. TIPS FOR CREATING EXERCISES

### ✅ Good Practices

1. **Progressive Values** - Increase gradually
   ```json
   {"0":5, "1":7, "2":10, "3":12, "4":15, "5":18, "6":20, "7":25, "8":30, "9":35, "10":40}
   ```

2. **Realistic Progression** - Don't jump too much
   ```json
   // ❌ Bad: 5 → 50 (too big jump)
   // ✅ Good: 5 → 7 → 10 → 12 → 15
   ```

3. **Appropriate Rest** - Harder exercises = more rest
   ```json
   {"name": "מתח", "rest_seconds": 60}      // Hard exercise
   {"name": "ריצה במקום", "rest_seconds": 30}  // Easier
   ```

4. **Use Null for Beginners** - Skip hard exercises at low levels
   ```json
   {"0": null, "1": null, "2": null, "3": 3, "4": 5, ...}
   ```

---

## 8. USING THE ADMIN PANEL TO EDIT

**Easiest Way:**

1. Navigate to `https://your-site.com/admin`
2. Enter password (default: `admin123`)
3. Select workout type (Warmup, Strength, Running, Special)
4. Click "Edit" on any workout
5. Scroll to `exercises` field
6. Edit the JSON:

```json
[
  {
    "name": "Your Exercise Name",
    "type": "rep_based",
    "values": {
      "0": 5,
      "5": 15,
      "10": 30
    },
    "rest_seconds": 60
  }
]
```

7. Click "Save"
8. Done! ✅

---

## Summary

**Two Systems:**
1. **Workout Exercises** - Simple, embedded in workouts, level-based values
2. **Exercise Library** - Detailed, standalone, with descriptions and media

**To Add Exercises to Workouts:**
- Use the admin panel at `/admin`
- Edit the `exercises` field as JSON
- Use `time_based`, `rep_based`, or `distance_based`
- Set values for levels 0-10
- Set rest time in seconds

**Key Concept:**
- User fitness level (0-10) → System picks value from exercises array → User does that amount

---

Need help creating specific exercises? Let me know what workout you want to build!
