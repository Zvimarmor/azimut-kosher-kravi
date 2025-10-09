# Workout System Examples

## Real-World Examples

### Example 1: Classic Full Workout

**Structure:**
```
אימון מלא מורכב
├─ Part 1: חימום דינמי (5 דק')
│   ├─ Component 1: ריצה קלה (120 שניות)
│   ├─ Rest (30 שניות)
│   ├─ Component 2: קפיצות ג'ק (30 שניות)
│   ├─ Rest (30 שניות)
│   └─ Component 3: סיבובי זרועות (20 שניות)
├─ Part 2: ריצת פארטלק
│   ├─ Component 1: ריצה מהירה (60 שניות) [GPS]
│   ├─ Rest (90 שניות)
│   ├─ Component 2: ריצה מהירה (60 שניות) [GPS]
│   ├─ Rest (90 שניות)
│   └─ Component 3: ריצה מהירה (60 שניות) [GPS]
└─ Part 3: אימון כוח
    ├─ Component 1: לחיצות (15 חזרות)
    ├─ Rest (60 שניות)
    ├─ Component 2: סקוואטים (20 חזרות)
    ├─ Rest (60 שניות)
    └─ Component 3: פלאנק (45 שניות)
```

**User Experience:**
1. Sees briefing with 3 parts overview
2. Starts workout → GPS not needed yet
3. Completes warmup components one by one
4. Transitions to Part 2 → GPS starts automatically
5. Runs intervals with GPS tracking distance/pace
6. Transitions to Part 3 → GPS stops automatically
7. Completes strength components
8. Reviews summary with all times
9. Provides feedback

**Personalization (User Level 5):**
- Warmup: 120s light run (vs 90s for level 3)
- Cardio: 60s sprints (vs 45s for level 3)
- Rest: 60s between strength (vs 75s for level 3)
- Strength: 15 pushups (vs 10 for level 3)

---

### Example 2: Special Tactical Workout

**Structure:**
```
אימון טקטי - מסלול לחימה
├─ Part 1: חימום קרבי
│   ├─ Component 1: צעידה מהירה (2 דק')
│   ├─ Rest (20 שניות)
│   ├─ Component 2: שחרור מפרקים (60 שניות)
│   └─ Rest (20 שניות)
└─ Part 2: מסלול לחימה
    ├─ Component 1: זחילה (30 מטר)
    ├─ Rest (90 שניות)
    ├─ Component 2: קפיצות מכשול (10 חזרות)
    ├─ Rest (90 שניות)
    ├─ Component 3: נשיאת משקל (50 מטר)
    ├─ Rest (120 שניות)
    └─ Component 4: ירי מדויק (סימולציה)
```

**User Experience:**
1. Briefing shows 2 parts (warmup + special)
2. Quick warmup prep
3. Intensive tactical drills
4. Each drill has appropriate rest
5. Summary shows drill completion times
6. Feedback on difficulty

---

### Example 3: Short Strength Circuit

**Structure:**
```
מעגל כוח מהיר
└─ Part 1: מעגל עליון
    ├─ Component 1: לחיצות (סט 1/3 - 12 חזרות)
    ├─ Rest (45 שניות)
    ├─ Component 2: משיכות (סט 1/3 - 8 חזרות)
    ├─ Rest (45 שניות)
    ├─ Component 3: לחיצות (סט 2/3 - 12 חזרות)
    ├─ Rest (45 שניות)
    ├─ Component 4: משיכות (סט 2/3 - 8 חזרות)
    ├─ Rest (45 שניות)
    ├─ Component 5: לחיצות (סט 3/3 - 12 חזרות)
    ├─ Rest (45 שניות)
    └─ Component 6: משיכות (סט 3/3 - 8 חזרות)
```

**User Experience:**
1. Briefing shows single focused part
2. Alternating exercises with consistent rest
3. Progress indicator: "3/6" exercises
4. Quick workout (~15 minutes)
5. Summary and feedback

---

## Component Type Examples

### Strength Exercise Component
```typescript
{
  id: "strength-pushups",
  type: "strength_exercise",
  name: "לחיצות",
  description: "15 חזרות",
  reps: 15,
  restAfter: 60,
  instructions: "שמור על גוף ישר, ירד עד 90 מעלות במרפק"
}
```

**Display:**
- 💪 Dumbbell icon
- Large stopwatch timer
- "Finished" button
- Instructions at bottom

---

### Cardio Exercise Component
```typescript
{
  id: "cardio-sprint",
  type: "cardio_exercise",
  name: "ריצה מהירה",
  description: "60 שניות",
  duration: 60,
  requiresGPS: true,
  restAfter: 90,
  instructions: "ריצה בקצב של 85-90% מהמקסימום"
}
```

**Display:**
- ❤️ Heart icon
- Countdown timer (60 → 0)
- GPS stats: Distance, Pace
- "Finished" button (can skip countdown)

---

### Warmup Exercise Component
```typescript
{
  id: "warmup-jacks",
  type: "warmup_exercise",
  name: "קפיצות ג'ק",
  description: "30 שניות",
  duration: 30,
  restAfter: 20,
  instructions: "קפוץ עם פתיחת רגליים וזרועות"
}
```

**Display:**
- ⚡ Zap icon
- Countdown timer
- Minimal rest after
- Simple instructions

---

### Rest Component
```typescript
{
  id: "rest-001",
  type: "rest",
  name: "מנוחה",
  duration: 60
}
```

**Display:**
- 🕐 Clock icon
- Large countdown timer
- "Skip" option
- Auto-advances when complete

---

## Personalization Examples

### Low Fitness User (Level 2)

**Before:**
```
Exercise: Push-ups
Base: 10 reps
Rest: 60 seconds
```

**After Personalization:**
```
Exercise: Push-ups
Personalized: 11 reps (scaled up slightly)
Rest: 72 seconds (+20% for recovery)
```

---

### High Fitness User (Level 9)

**Before:**
```
Exercise: Push-ups
Base: 10 reps
Max: 40 reps
Rest: 60 seconds
```

**After Personalization:**
```
Exercise: Push-ups
Personalized: 37 reps (scaled to max)
Rest: 48 seconds (-20% for efficiency)
```

---

### Progressive Example (User Level 1 → 10)

**Running Exercise:**
```
Level 1:  Distance: 1.0 km,  Rest: 120s
Level 3:  Distance: 1.5 km,  Rest: 100s
Level 5:  Distance: 2.2 km,  Rest: 90s
Level 7:  Distance: 3.1 km,  Rest: 80s
Level 10: Distance: 5.0 km,  Rest: 60s
```

**Strength Exercise:**
```
Level 1:  Reps: 10,  Sets: 2,  Rest: 90s
Level 3:  Reps: 13,  Sets: 2,  Rest: 80s
Level 5:  Reps: 16,  Sets: 3,  Rest: 70s
Level 7:  Reps: 19,  Sets: 3,  Rest: 60s
Level 10: Reps: 25,  Sets: 4,  Rest: 50s
```

---

## Screen Flow Examples

### Classic Workout Flow

```
Screen 1: Loading
┌─────────────────────┐
│   [Spinner]         │
│  יוצר אימון...      │
└─────────────────────┘

Screen 2: Briefing
┌─────────────────────┐
│ תדריך משימה         │
│                     │
│ [Target Icon]       │
│ אימון מלא כוח+קרדיו │
│                     │
│ Parts:              │
│ 1. חימום (5 דק')    │
│ 2. קרדיו (15 דק')   │
│ 3. כוח (20 דק')     │
│                     │
│ [התחל משימה]        │
└─────────────────────┘

Screen 3: Component (Active)
┌─────────────────────┐
│ חימום דינמי (1/3)   │
│                     │
│ [Zap Icon]          │
│ קפיצות ג'ק          │
│ 30 שניות            │
│                     │
│    00:15             │
│                     │
│ [סיימתי]            │
└─────────────────────┘

Screen 4: Rest
┌─────────────────────┐
│     מנוחה            │
│                     │
│ [Clock Icon]        │
│                     │
│    00:30             │
│                     │
│ [דלג]               │
└─────────────────────┘

Screen 5: Component (GPS)
┌─────────────────────┐
│ קרדיו (2/3)         │
│                     │
│ [Heart Icon]        │
│ ריצה מהירה          │
│ 60 שניות            │
│                     │
│    00:45             │
│                     │
│ ┌─────┬─────┐       │
│ │2.1km│6:30/│       │
│ │     │ km  │       │
│ └─────┴─────┘       │
│                     │
│ [סיימתי]            │
└─────────────────────┘

Screen 6: Summary
┌─────────────────────┐
│ סיכום האימון        │
│                     │
│ אימון מלא           │
│ זמן כולל: 42 דקות   │
│                     │
│ Tasks:              │
│ • קפיצות ג'ק  0:30  │
│ • מנוחה       0:20  │
│ • ריצה מהירה  1:05  │
│ ...                 │
│                     │
│ [אישור]             │
└─────────────────────┘

Screen 7: Feedback
┌─────────────────────┐
│ משוב על האימון      │
│                     │
│ איך היה האימון?     │
│ [קל] [בינוני] [קשה] │
│                     │
│ איך אתה מרגיש?      │
│ [מצוין][טוב][עייף]  │
│                     │
│ [שלח]               │
└─────────────────────┘
```

---

## Best Practices

### For Workout Design

1. **Start with warmup**: Always include proper warm-up
2. **Progressive intensity**: Build up difficulty gradually
3. **Balanced rest**: More rest for beginners, less for advanced
4. **Clear instructions**: Every component should have guidance
5. **GPS for cardio**: Enable GPS for running/distance exercises

### For Component Creation

1. **Single focus**: Each component = one exercise
2. **Clear metrics**: Use reps, time, or distance (not multiple)
3. **Appropriate rest**: Consider recovery needs
4. **User level scaling**: Define min and max values
5. **Instructions**: Include form cues and safety notes

### For User Experience

1. **Briefing matters**: Give clear overview before starting
2. **Progress indicators**: Show current/total progress
3. **Allow skipping rest**: Users know their bodies
4. **GPS handling**: Graceful fallback if unavailable
5. **Celebration**: Acknowledge completion!

---

## Tips for Creating New Workouts

### Adding a New Classic Workout

```typescript
// 1. Create warmup in CSV or define inline
const customWarmup = {
  title: "חימום חורף",
  exercises: [
    { name: "ריצה קלה", type: "time_based", values: [90, 120, 150] },
    { name: "מתיחות", type: "time_based", values: [30, 45, 60] }
  ]
};

// 2. Use composition service
const workout = await WorkoutCompositionService.createClassicWorkout(
  customWarmup,
  undefined,  // Random cardio
  undefined,  // Random strength
  userLevel
);
```

### Adding a New Component Type

If you need a new component type (e.g., `flexibility_exercise`):

1. Add to `ComponentType` enum
2. Add icon in `getComponentIcon()`
3. Update `ComponentDisplay` rendering logic
4. Add to composition service helpers

### Extending GPS Features

Current GPS shows: distance, pace
To add heart rate or elevation:

1. Update `GPSStats` interface
2. Modify `gpsService` to track data
3. Update `GPSStatsDisplay` component
4. Add to summary/history

---

## Common Patterns

### Pattern 1: Circuit Training
```typescript
// Create multiple rounds of the same exercises
const circuit = {
  rounds: 3,
  exercises: [
    { name: "Push-ups", values: [10, 15, 20] },
    { name: "Squats", values: [15, 20, 25] },
    { name: "Plank", values: [30, 45, 60] }
  ]
};
// Results in: Push-ups (1/3), Squats (1/3), Plank (1/3),
//             Push-ups (2/3), Squats (2/3), Plank (2/3), etc.
```

### Pattern 2: Pyramid Sets
```typescript
// Increasing then decreasing reps
const pyramid = {
  exercises: [
    { name: "Pull-ups", values: [5, 8, 10] },  // Round 1
    { name: "Pull-ups", values: [8, 12, 15] }, // Round 2 (peak)
    { name: "Pull-ups", values: [5, 8, 10] }   // Round 3 (back down)
  ]
};
```

### Pattern 3: HIIT Intervals
```typescript
// High intensity with active recovery
const hiit = {
  exercises: [
    { name: "Sprint", type: "time_based", values: [20, 30, 40] },
    { name: "Walk", type: "time_based", values: [40, 60, 80] },
    // Repeat...
  ]
};
```

---

Ready to create amazing, personalized workouts! 💪
