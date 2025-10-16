# Azimut Kosher Kravi - IDF Fitness Training App

## Project Overview

**Azimut Kosher Kravi** (translated: "AI Combat Ready") is a comprehensive fitness and tactical training application designed for IDF soldiers and military personnel. The app combines modern fitness tracking, AI-powered coaching, GPS-enabled workouts, and cultural heritage education into a single, cohesive platform.

### Core Mission
To provide soldiers with personalized, effective training programs that improve physical fitness, preserve military heritage, and offer real-time guidance through AI assistance.

---

## Table of Contents

1. [Tech Stack](#tech-stack)
2. [Project Structure](#project-structure)
3. [Core Features](#core-features-implemented)
4. [Architecture](#architecture)
5. [Data Models](#data-models)
6. [Services & Integrations](#services--integrations)
7. [User Flow](#user-flow)
8. [Future Roadmap](#future-roadmap)
9. [Development Guide](#development-guide)
10. [API Reference](#api-reference)

---

## Tech Stack

### Frontend
- **React 18.2** - UI framework
- **TypeScript 5.1** - Type safety
- **Vite 4.3** - Build tool & dev server
- **React Router 6.8** - Client-side routing
- **Tailwind CSS 3.3** - Styling framework
- **Framer Motion 10.12** - Animations
- **Lucide React** - Icon library

### Backend & Services
- **Firebase 12.3** - Authentication, Firestore, Storage
- **OpenAI API** - AI chat assistant
- **Netlify Functions** - Serverless backend
- **Browser Geolocation API** - GPS tracking

### Development Tools
- **Autoprefixer** - CSS compatibility
- **PostCSS** - CSS processing
- **ESLint/TypeScript** - Code quality

---

## Project Structure

```
azimut-kosher-kravi/
├── src/
│   ├── Entities/                    # Data models (7 entities)
│   │   ├── User.tsx                 # User profile & fitness attributes
│   │   ├── WorkoutHistory.tsx       # Completed workout records
│   │   ├── Warmup.tsx              # Warmup exercises
│   │   ├── RunningEndurance.tsx    # Cardio/running workouts
│   │   ├── StrengthExplosive.tsx   # Strength training
│   │   ├── Special.tsx             # Tactical/special exercises
│   │   └── HeritageStory.tsx       # Cultural heritage content
│   │
│   ├── Pages/                       # Main application screens (14 pages)
│   │   ├── Home/                   # Dashboard & navigation hub
│   │   ├── CreateWorkout/          # Main workout player (NEW ARCHITECTURE)
│   │   ├── SelectWorkout/          # Browse & choose workouts
│   │   ├── WorkoutHistory/         # Past workout logs
│   │   ├── WorkoutSetup/           # Initial fitness assessment
│   │   ├── QuickWorkout/           # Fast workout mode
│   │   ├── Settings/               # User preferences
│   │   ├── MilitaryChat/           # AI assistant
│   │   ├── Heritage/               # Cultural stories browser
│   │   ├── HeritageEntry/          # Individual story view
│   │   ├── Onboarding/             # New user setup
│   │   ├── AssessmentWorkout/      # Fitness testing
│   │   └── SpecialWorkouts/        # Tactical exercises (under construction)
│   │
│   ├── components/
│   │   ├── workout/                # NEW: Workout system components
│   │   │   ├── ComponentDisplay.tsx      # Individual exercise UI
│   │   │   ├── WorkoutBriefing.tsx       # Pre-workout overview
│   │   │   └── WorkoutSummary.tsx        # Post-workout feedback
│   │   ├── gps/                    # GPS-related components
│   │   │   ├── GPSPermissionModal.tsx
│   │   │   └── GPSWarningModal.tsx
│   │   ├── ui/                     # Reusable UI components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── input.tsx
│   │   │   └── ...
│   │   └── shared/                 # Shared context providers
│   │       ├── ThemeContext.tsx    # Theme management
│   │       └── LanguageContext.tsx # i18n support
│   │
│   ├── features/                    # Feature modules
│   │   ├── auth/                   # Authentication
│   │   │   └── AuthContext.tsx     # Firebase auth wrapper
│   │   ├── chat/                   # AI Chat system
│   │   │   ├── hooks/useChat.ts
│   │   │   ├── services/openaiService.ts
│   │   │   ├── utils/markdownRenderer.tsx
│   │   │   ├── types.ts
│   │   │   └── constants.ts
│   │   ├── heritage/               # Heritage content
│   │   │   └── components/FormattedContent.tsx
│   │   └── workout/                # Workout utilities
│   │       └── components/WorkoutPersonalizer.tsx
│   │
│   ├── lib/
│   │   ├── services/               # Core services
│   │   │   ├── DataService.ts      # Firebase data operations
│   │   │   ├── gpsService.ts       # GPS tracking & calculations
│   │   │   └── workoutComposition.ts  # NEW: Workout builder
│   │   ├── firebase/
│   │   │   └── config.ts           # Firebase initialization
│   │   ├── integrations/
│   │   │   └── Core.ts             # External integrations
│   │   └── utils/
│   │       ├── index.ts            # Utility functions
│   │       └── csvParser.ts        # CSV data parser
│   │
│   ├── App.tsx                      # Root component & routing
│   ├── Layout.tsx                   # App layout wrapper
│   ├── index.tsx                    # Entry point
│   └── index.css                    # Global styles
│
├── netlify/
│   └── functions/
│       └── chat.ts                  # OpenAI serverless function
│
├── public/                          # Static assets
│   └── data/                        # CSV workout data
│
├── docs/                            # Documentation
│   ├── README.md                    # This file
│   ├── BUGS.md                      # Known issues tracker
│   ├── WORKOUT_ARCHITECTURE.md      # Workout system documentation
│   └── WORKOUT_EXAMPLES.md          # Implementation examples
│
├── package.json                     # Dependencies & scripts
├── tsconfig.json                    # TypeScript configuration
├── tailwind.config.js              # Tailwind CSS configuration
├── vite.config.ts                  # Vite build configuration
└── netlify.toml                    # Netlify deployment config
```

---

## Core Features (Implemented)

### 1. User Management & Authentication
- **Firebase Authentication** (Google, Facebook, Email/Password)
- **User Profiles** with fitness attributes (6 metrics: push strength, pull strength, cardio, running volume, rucking, weight work)
- **Fitness Levels** (Beginner, Intermediate, Advanced, Elite)
- **Measurement Systems** (Metric/Imperial)
- **Bilingual Support** (Hebrew/English)

### 2. Workout System (NEW ARCHITECTURE)

#### Component-Based Workouts
- **3 Workout Types:**
  - **Classic**: Warmup + Cardio + Strength (3 parts)
  - **Special**: Warmup + Special Activity (2 parts)
  - **Short**: Single focused workout (1 part)

- **Part-Based Structure:**
  - Each workout divided into logical parts
  - Each part contains multiple components (exercises)
  - Seamless transitions between parts

- **Component Display:**
  - One exercise at a time (no confusion)
  - Type-specific icons and UI
  - Real-time timer (stopwatch or countdown)
  - Auto-advancing rest periods
  - Progress indicators

#### Personalization Engine
- **Level-Based Scaling (0-10)**
  - Reps: Linear progression
  - Time: Exponential (0.8 power)
  - Distance: Moderate (0.7 power)
  - Weight: Steep (1.2 power)

- **Adaptive Rest Periods**
  - High fitness (8-10): -20% rest
  - Medium fitness (6-7): -10% rest
  - Low fitness (1-3): +20% rest

#### GPS Integration
- Auto-starts for cardio/running components
- Real-time stats (distance, pace)
- Auto-stops when transitioning to non-cardio parts
- Graceful fallback if unavailable
- Supports metric/imperial units

#### Workout Flow
```
Loading → Briefing → Active Workout → Summary → Feedback → Home
```

### 3. AI Military Coach
- **OpenAI-Powered Chat** (GPT-4 Turbo)
- **Military Context** - Understands IDF terminology
- **Bilingual** - Hebrew & English
- **Knowledge Base:**
  - Fitness advice
  - Training techniques
  - Tactical concepts
  - Injury prevention
  - Nutrition guidance
- **Markdown Rendering** for formatted responses
- **Serverless Backend** (Netlify Functions)

### 4. Heritage & Culture
- **Story Browser** - Explore IDF history
- **Formatted Content** - Rich text display
- **Categories:** Units, Operations, Heroes, Traditions
- **Educational Mission** - Connect fitness to values

### 5. Workout History & Tracking
- **Comprehensive Logging:**
  - Workout title
  - Duration
  - Exercises completed
  - Difficulty rating
  - Personal feeling
  - Timestamp
- **Per-User Storage** (max 25 recent)
- **Statistics Dashboard:**
  - Total workouts
  - Total minutes
  - Average rating
  - Most common difficulty

### 6. Settings & Customization
- **Measurement System** toggle (km/mi)
- **Language** selection (Hebrew/English)
- **Theme** preferences
- **Account Management**
- **Profile Updates**

---

## Architecture

### Design Patterns

#### 1. Entity-Service Pattern
All data models follow a consistent pattern:
```typescript
// Entity Interface
export interface User {
  id: string;
  name: string;
  // ... properties
}

// Entity Class (static methods)
export class User {
  static async me(): Promise<User>
  static async update(updates: Partial<User>): Promise<User>
  static async list(): Promise<User[]>
}

// Service Class (utility methods)
export class UserService {
  static createUser(data: Partial<User>): User
  static calculateOverallFitness(attributes: UserAttributes): number
  // ... helpers
}
```

#### 2. Context Providers
Global state management via React Context:
- `AuthContext` - User authentication state
- `ThemeContext` - App theme (light/dark)
- `LanguageContext` - i18n (Hebrew/English)

#### 3. Component Composition
Workout system uses composition over inheritance:
```
ComposedWorkout
  └─ WorkoutPart[]
      └─ WorkoutComponent[]
```

#### 4. Service Layer
Business logic separated into services:
- `DataService` - Firebase CRUD operations
- `gpsService` - Geolocation & tracking
- `WorkoutCompositionService` - Workout assembly
- `openaiService` - AI chat integration

### State Management
- **Local State**: `useState`, `useReducer` for component state
- **Context**: `useContext` for global state (auth, theme, language)
- **URL State**: `useLocation`, `useSearchParams` for routing state
- **Firebase**: Real-time listeners for data sync

### Data Flow
```
User Action → Component → Service Layer → Firebase/API
                ↓                           ↓
         UI Update ← State Update ← Response
```

---

## Data Models

### User
```typescript
interface User {
  id: string;
  name: string;
  email?: string;
  age?: number;
  fitness_level: 'beginner' | 'intermediate' | 'advanced' | 'elite';
  preferred_language: 'hebrew' | 'english';
  measurement_system: 'metric' | 'imperial';
  attributes: {
    push_strength: number;      // 0-10
    pull_strength: number;      // 0-10
    cardio_endurance: number;   // 0-10
    running_volume: number;     // 0-10
    rucking_volume: number;     // 0-10
    weight_work: number;        // 0-10
  };
  created_date: string;
  last_active: string;
  unit?: string;
  rank?: string;
  goals?: string[];
  medical_restrictions?: string[];
}
```

### WorkoutHistory
```typescript
interface WorkoutHistory {
  id: string;
  userId: string;
  workout_title: string;
  duration_completed: number;     // minutes
  difficulty: 'easy' | 'moderate' | 'hard';
  feeling: 'great' | 'good' | 'okay' | 'tired';
  completion_date: string;
  exercises_completed: string[];
  notes?: string;
  rating?: number;                // 1-5 stars
}
```

### ComposedWorkout (NEW)
```typescript
interface ComposedWorkout {
  id: string;
  type: 'classic' | 'special' | 'short';
  title: string;
  description?: string;
  parts: WorkoutPart[];
  estimatedDuration: number;      // minutes
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'elite';
  targetAttributes: string[];
}
```

### WorkoutPart (NEW)
```typescript
interface WorkoutPart {
  id: string;
  type: 'warmup' | 'cardio' | 'strength' | 'special';
  name: string;
  description?: string;
  components: WorkoutComponent[];
  defaultRestBetweenComponents?: number;
  requiresGPS?: boolean;
}
```

### WorkoutComponent (NEW)
```typescript
interface WorkoutComponent {
  id: string;
  type: 'strength_exercise' | 'cardio_exercise' | 'warmup_exercise' | 'special_exercise' | 'rest';
  name: string;
  description?: string;
  reps?: number;
  sets?: number;
  duration?: number;      // seconds
  distance?: number;      // meters
  restAfter?: number;     // seconds
  requiresGPS?: boolean;
  instructions?: string;
  tips?: string;
}
```

### Exercise Entities
Each exercise type (Warmup, RunningEndurance, StrengthExplosive, Special) follows this pattern:
```typescript
interface Exercise {
  id?: string;
  title: string;
  target_attributes: AttributeType[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  instructions: string;
  equipment?: string[];
  category?: string;
  exercises?: Array<{
    name: string;
    type: 'rep_based' | 'time_based' | 'distance_based';
    values: number[] | { [key: string]: number | null };  // Level 0-10
    rest_seconds?: number;
  }>;
  rounds?: number;
}
```

---

## Services & Integrations

### DataService
**Purpose:** Firebase Firestore operations
**Location:** `src/lib/services/DataService.ts`

**Key Methods:**
- `getCurrentUser()` - Get current user profile
- `updateUser(updates)` - Update user data
- `getWorkoutHistory(userId)` - Fetch workout logs
- `addWorkoutHistory(data)` - Save completed workout
- `getWarmups()` - Load warmup exercises (CSV)
- `getRunningEndurance()` - Load cardio workouts (CSV)
- `getStrengthExplosive()` - Load strength workouts (CSV)
- `getSpecial()` - Load special workouts (CSV)
- `getHeritageStories()` - Load heritage content (CSV)

**Data Sources:**
- User data: Firestore (`users` collection)
- Workout history: Firestore (`workoutHistory` collection)
- Exercise data: CSV files in `/public/data/`

### gpsService
**Purpose:** GPS tracking and pace calculation
**Location:** `src/lib/services/gpsService.ts`

**Features:**
- Real-time position tracking
- Distance calculation (Haversine formula)
- Pace calculation (min/km or min/mile)
- Speed tracking
- Metric/Imperial support
- Accuracy monitoring
- Permission handling

**Key Methods:**
- `isSupported()` - Check GPS availability
- `requestPermission()` - Request location access
- `startTracking(callback, system)` - Begin tracking
- `stopTracking()` - End tracking & return final stats
- `formatDistance(meters)` - Format distance for display
- `formatPace(pace)` - Format pace for display

**Returns:**
```typescript
interface GPSStats {
  totalDistance: number;      // meters
  averagePace: number;        // min/km or min/mile
  currentSpeed: number;       // m/s
  accuracy: number;           // meters
  positions: Position[];
}
```

### WorkoutCompositionService (NEW)
**Purpose:** Assemble and personalize workouts
**Location:** `src/lib/services/workoutComposition.ts`

**Key Methods:**
- `generateRandomWorkout()` - Random classic or special
- `createClassicWorkout(warmup?, cardio?, strength?, level?)` - 3-part workout
- `createSpecialWorkout(warmup?, special?, level?)` - 2-part workout
- `createShortWorkout(exercise, level?)` - Single workout

**Personalization:**
- Scales exercise values to user level (0-10)
- Adjusts rest periods based on fitness
- Determines GPS requirements
- Calculates total duration
- Assigns difficulty levels

### OpenAI Service
**Purpose:** AI chat assistant
**Location:** `src/features/chat/services/openaiService.ts`

**Features:**
- GPT-4 Turbo integration
- Military/fitness context
- Bilingual responses
- Quota management
- Error handling

**Backend:** Netlify Function at `netlify/functions/chat.ts`

**System Prompt:**
```
You are an AI fitness coach for IDF soldiers.
You provide advice on training, nutrition, tactics, and motivation.
You speak Hebrew or English based on user preference.
You understand military terminology and culture.
```

---

## User Flow

### New User Journey
```
1. App Launch
   ↓
2. Authentication (Google/Facebook/Email)
   ↓
3. Onboarding
   ↓
4. Initial Fitness Assessment
   ↓
5. Home Dashboard
```

### Workout Flow
```
1. Home → "Start Workout" or "Select Workout"
   ↓
2. Workout Selection (if applicable)
   ↓
3. Workout Briefing (overview of parts)
   ↓
4. Workout Execution
   ├─ Part 1 (e.g., Warmup)
   │   ├─ Component 1 → Rest → Component 2 → ...
   ├─ Part 2 (e.g., Cardio) [GPS starts]
   │   ├─ Component 1 → Rest → Component 2 → ...
   ├─ Part 3 (e.g., Strength) [GPS stops]
   │   ├─ Component 1 → Rest → Component 2 → ...
   ↓
5. Workout Summary (times, exercises)
   ↓
6. Feedback (difficulty, feeling)
   ↓
7. Home (workout logged)
```

### AI Chat Flow
```
1. Home → "Military Chat"
   ↓
2. Chat Interface
   ↓
3. Type Question
   ↓
4. AI Response (GPT-4)
   ↓
5. Continue Conversation
```

### Heritage Flow
```
1. Home → "Heritage"
   ↓
2. Story Browser
   ↓
3. Select Story
   ↓
4. Read Content
   ↓
5. Back to Browser or Home
```

---

## Future Roadmap

### Phase 1: Enhancements (Priority)
- Audio Coaching - Voice guidance during workouts
- Video Demonstrations - Exercise form videos
- Workout Builder - Custom workout creation
- Social Features - Share workouts, compete with friends
- Advanced Analytics - Progress graphs, trends, insights
- Workout Templates - Pre-made programs (e.g., "8-Week Combat Prep")
- Nutrition Tracker - Meal logging and guidance
- Sleep Tracking - Recovery monitoring

### Phase 2: Advanced Features
- Team Workouts - Synchronized group exercises
- Live Coaching - Real-time form correction
- AR Integration - Augmented reality exercises
- Wearable Integration - Apple Watch, Garmin, etc.
- Advanced GPS - Route planning, elevation tracking
- Injury Prevention AI - Predict and prevent overtraining
- Gamification - Achievements, badges, leaderboards
- Unit Challenges - Inter-unit competitions

### Phase 3: Platform Expansion
- Native Mobile Apps (iOS, Android)
- Offline Mode - Download workouts for field use
- Smartwatch App - Standalone workout player
- Web Dashboard - Desktop analytics
- Admin Panel - Content management
- API for Integrations - Third-party apps

### Known Issues
See [BUGS.md](./BUGS.md) for tracked issues.

---

## Development Guide

### Prerequisites
- Node.js 18+
- npm or yarn
- Firebase account
- OpenAI API key (for chat)
- Git

### Setup

1. **Clone Repository**
```bash
git clone [repository-url]
cd azimut-kosher-kravi
```

2. **Install Dependencies**
```bash
npm install
```

3. **Environment Variables**
Create `.env` file:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_OPENAI_API_KEY=your_openai_key
```

4. **Run Development Server**
```bash
npm start
```
App will be available at `http://localhost:5173`

5. **Build for Production**
```bash
npm run build
```
Output in `dist/` folder

### Project Scripts
```json
{
  "start": "vite",              // Dev server
  "build": "vite build",        // Production build
  "serve": "vite preview",      // Preview build locally
  "gen-structure": "node generate-structure.js"  // Generate file structure
}
```

### Code Style
- **TypeScript** strict mode enabled
- **Functional Components** with hooks
- **Tailwind CSS** for styling (no inline styles)
- **Hebrew RTL** support (use `dir="rtl"`)
- **Comments** for complex logic
- **Consistent naming:**
  - Components: PascalCase (`WorkoutPlayer`)
  - Functions: camelCase (`getUserLevel`)
  - Constants: UPPER_SNAKE_CASE (`MAX_REST_TIME`)
  - Files: Match component name or kebab-case

### Adding New Features

#### New Workout Type
1. Add type to `WorkoutType` in `workoutComposition.ts`
2. Create `create[Type]Workout()` method
3. Update `generateRandomWorkout()` logic
4. Add UI in `CreateWorkout` component

#### New Exercise Type
1. Add CSV in `/public/data/`
2. Create Entity interface and class
3. Add DataService method to load data
4. Add to `WorkoutCompositionService`
5. Update component display logic

#### New Page
1. Create component in `/src/Pages/[PageName]/`
2. Add route in `App.tsx`
3. Add navigation in `Layout.tsx` or `Home.tsx`
4. Add translations in `LanguageContext.tsx`

---

## API Reference

### Entities API

#### User
```typescript
// Get current user
const user = await User.me();

// Update user
const updated = await User.update({
  measurement_system: 'imperial'
});

// Update fitness attributes
const updated = await User.updateMyUserData({
  push_strength: 8
});
```

#### WorkoutHistory
```typescript
// Get user's workout history
const history = await WorkoutHistory.filter({
  created_by: userId
});

// Save completed workout
const record = await WorkoutHistory.create({
  userId: user.id,
  workout_title: "Morning Strength",
  duration_completed: 45,
  difficulty: 'moderate',
  feeling: 'good',
  completion_date: new Date().toISOString(),
  exercises_completed: ['Push-ups', 'Squats']
});

// Delete workout record
await WorkoutHistory.delete(recordId);
```

#### Exercise Entities
```typescript
// Load exercises
const warmups = await Warmup.list();
const cardio = await RunningEndurance.list();
const strength = await StrengthExplosive.list();
const special = await Special.list();

// Filter exercises
const beginnerWarmups = warmups.filter(w => w.difficulty === 'beginner');
```

### Workout Composition API

```typescript
// Generate random workout
const workout = await WorkoutCompositionService.generateRandomWorkout();

// Create classic workout (3 parts)
const classic = await WorkoutCompositionService.createClassicWorkout(
  warmup,      // Optional
  cardio,      // Optional
  strength,    // Optional
  userLevel    // Optional (0-10)
);

// Create special workout (2 parts)
const special = await WorkoutCompositionService.createSpecialWorkout(
  warmup,      // Optional
  special,     // Optional
  userLevel    // Optional
);

// Create short workout (1 part)
const short = await WorkoutCompositionService.createShortWorkout(
  exercise,    // Required: any exercise type
  userLevel    // Optional
);
```

### GPS API

```typescript
// Check GPS support
const supported = gpsService.isSupported();

// Request permission
const granted = await gpsService.requestPermission();

// Start tracking
gpsService.startTracking((stats) => {
  console.log('Distance:', stats.totalDistance);
  console.log('Pace:', stats.averagePace);
}, 'metric');  // or 'imperial'

// Stop tracking
const finalStats = gpsService.stopTracking();

// Format values
const distanceStr = gpsService.formatDistance(1500);  // "1.50 km"
const paceStr = gpsService.formatPace(6.5);           // "6:30/km"
```

### Chat API

```typescript
// Send message
const response = await generateResponse([
  { role: 'user', content: 'What is a good warmup?' }
], 'hebrew');
```

---

## UI Components

### Component Library
Located in `src/components/ui/`:
- `Button` - Primary action buttons
- `Card` - Content containers
- `Badge` - Status labels
- `Input` - Form inputs
- `Textarea` - Multi-line inputs
- `Dropdown` - Select menus
- `ScrollArea` - Scrollable containers

### Workout Components (NEW)
Located in `src/components/workout/`:
- `ComponentDisplay` - Individual exercise UI
- `WorkoutBriefing` - Pre-workout overview
- `WorkoutSummary` - Post-workout summary
- `WorkoutFeedback` - User feedback collection

### GPS Components
Located in `src/components/gps/`:
- `GPSPermissionModal` - Request location access
- `GPSWarningModal` - Handle GPS errors

---

## Internationalization (i18n)

### Supported Languages
- **Hebrew** (primary) - RTL layout
- **English** (secondary) - LTR layout

### Language Context
```typescript
const { language, setLanguage, allTexts } = useContext(LanguageContext);

// Get translations
const t = allTexts[language];

// Render with RTL
<div dir={language === 'hebrew' ? 'rtl' : 'ltr'}>
  <h1>{t.title}</h1>
</div>
```

### Adding Translations
Edit `src/components/shared/LanguageContext.tsx`:
```typescript
hebrew: {
  myKey: "הטקסט שלי",
  // ...
},
english: {
  myKey: "My Text",
  // ...
}
```

---

## Authentication

### Firebase Auth
Supported methods:
- Google Sign-In
- Facebook Sign-In
- Email/Password

### Auth Context
```typescript
const { user, loading, signIn, signOut } = useContext(AuthContext);

// Check auth state
if (loading) return <Spinner />;
if (!user) return <Login />;

// Sign out
await signOut();
```

### Protected Routes
All pages except `/login` require authentication.

---

## Data Storage

### Firebase Firestore
**Collections:**
- `users` - User profiles
- `workoutHistory` - Completed workouts

### Local CSV Files
**Location:** `/public/data/`
- `warmups.csv` - Warmup exercises
- `running.csv` - Cardio workouts
- `strength.csv` - Strength exercises
- `special.csv` - Tactical drills
- `heritage.csv` - Cultural stories

**CSV Format:**
```csv
id,title,difficulty,category,instructions,exercises
1,"Dynamic Warmup",beginner,Warmup,"Prepare your body...","{...}"
```

Exercises column contains JSON array:
```json
[
  {
    "name": "Jumping Jacks",
    "type": "time_based",
    "values": [20, 30, 45, 60],
    "rest_seconds": 30
  }
]
```

---

## Testing

### Manual Testing Checklist

**Workout Flow:**
- Create random workout
- Select specific workout
- Complete full workout
- Check workout history
- Test GPS tracking
- Verify rest periods
- Test skip rest
- Verify feedback submission

**User Management:**
- Sign up new user
- Sign in existing user
- Update profile
- Change measurement system
- Switch language
- Sign out

**AI Chat:**
- Send Hebrew message
- Send English message
- Test quota limit
- Verify markdown rendering

**Navigation:**
- Test all page transitions
- Test back button
- Test deep links

---

## Deployment

### Netlify Deployment
1. Connect repository to Netlify
2. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
3. Set environment variables in Netlify dashboard
4. Deploy

### Environment Variables (Netlify)
- `OPENAI_API_KEY` - For serverless function
- `VITE_*` variables - For frontend

---

## Documentation Files

- **[README.md](./README.md)** (this file) - Complete project documentation
- **[BUGS.md](./BUGS.md)** - Known issues and bug tracking
- **[WORKOUT_ARCHITECTURE.md](./WORKOUT_ARCHITECTURE.md)** - Workout system technical details
- **[WORKOUT_EXAMPLES.md](./WORKOUT_EXAMPLES.md)** - Implementation examples and patterns

---

## Contributing

### For AI Agents
When implementing new features:
1. Read relevant documentation files
2. Follow existing patterns and conventions
3. Maintain type safety with TypeScript
4. Add comments for complex logic
5. Update documentation when adding features
6. Test thoroughly before committing

### Code Review Checklist
- TypeScript types defined
- RTL support for Hebrew
- Responsive design (mobile-first)
- Error handling implemented
- Loading states added
- Comments for complex logic
- No console errors
- Build succeeds

---

## Support & Resources

### Key Concepts to Understand
1. **Component-Based Architecture** - Workouts are compositions of smaller parts
2. **Personalization** - Everything scales to user level (0-10)
3. **Progressive Enhancement** - GPS, offline support, etc.
4. **Bilingual First** - Hebrew primary, English secondary
5. **Mobile-First** - Responsive design for all screen sizes

### External Documentation
- [React Docs](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Firebase Docs](https://firebase.google.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Framer Motion](https://www.framer.com/motion/)

---

## Project Stats

- **Total Files:** ~54 TypeScript/React files
- **Pages:** 14 screens
- **Entities:** 7 data models
- **Components:** 20+ reusable UI components
- **Services:** 3 core services
- **Languages:** 2 (Hebrew, English)
- **Build Size:** ~571 KB (minified)

---

## Quick Start for AI Agents

**Understanding the codebase:**
1. Start with this README
2. Review `src/App.tsx` for routing
3. Check `src/Pages/` for page implementations
4. Study `src/lib/services/workoutComposition.ts` for workout logic
5. Review `WORKOUT_ARCHITECTURE.md` for detailed system design

**Making changes:**
1. Identify which layer (Entity, Service, Component, Page)
2. Follow existing patterns
3. Maintain TypeScript types
4. Test in both languages
5. Ensure responsive design

**Common tasks:**
- Add exercise: Update CSV + Entity
- Add page: Create in Pages/ + Add route
- Modify workout logic: Edit WorkoutCompositionService
- UI changes: Edit component + Tailwind classes
- API changes: Edit DataService or other services

---

**Version:** 1.0.0
**Last Updated:** October 2025
**Status:** Production Ready

---

*Built with dedication for IDF soldiers and military fitness excellence.*
