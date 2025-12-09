# Project Review & Suggestions

## 1. Architecture & Code Organization

### Cleanup Duplicate Components
- **Issue**: Found `ComponentDisplay.tsx` and `ComponentDisplay.new.tsx` in `src/components/workout`.
- **Analysis**: `ComponentDisplay.new.tsx` contains performance optimizations (`React.memo`, `useCallback`) and better state handling (`isLoading`, `children` prop).
- **Suggestion**: Rename `ComponentDisplay.new.tsx` to `ComponentDisplay.tsx` (replacing the old one) to consolidate improvements and remove confusion.

### Entity-Service Pattern Refinement
- **Issue**: Logic is split between Entity classes (e.g., `User`) and Service classes (e.g., `UserService`). `User.create` and `UserService.createUser` seem redundant.
- **Suggestion**: Consolidate business logic. Keep Entities as pure data definitions (interfaces) and move all logic to Services, OR use the Active Record pattern fully (logic on Entity classes). The current mix is confusing.

### Feature Organization
- **Observation**: `src/features` is a good start.
- **Suggestion**: Move related components from `src/components` into their respective feature folders (e.g., `src/features/workout/components`). Keep `src/components` for truly shared UI elements (buttons, inputs).

## 2. Data Persistence & State

### Real Backend Integration
- **Issue**: `DataService` currently relies on `localStorage` for history and in-memory mock data for other entities. `User.me()` returns a fresh in-memory user if not found.
- **Suggestion**: Implement real Firebase integration as suggested by the `firebase` dependency.
    -   Persist User profile to Firestore.
    -   Persist Workout History to Firestore.
    -   Use `localStorage` only for caching or offline support.

### Caching Strategy
- **Issue**: CSV data is cached in memory in `DataService`.
- **Suggestion**: Implement a more robust caching layer (e.g., React Query or SWR) to handle data fetching, caching, and revalidation, especially when moving to a real backend.

## 3. Type Safety & Code Quality

### Strict Typing
- **Issue**: Some `any` casting or loose typing in `DataService`.
- **Suggestion**: Enable `noImplicitAny` in `tsconfig.json` if not already on. Ensure all API responses and CSV parses are strictly typed using Zod or similar validation libraries at the boundary.

### Testing
- **Issue**: No tests found.
- **Suggestion**:
    -   Add **Unit Tests** for core logic: `workoutComposition.ts`, `gpsService.ts`.
    -   Add **Component Tests** for complex UI: `CreateWorkout`, `ComponentDisplay`.
    -   Use `Vitest` (since using Vite) and `React Testing Library`.

## 4. Performance

### CSV Parsing
- **Issue**: `DataService` fetches and parses entire CSV files on demand.
- **Suggestion**: Pre-parse CSVs to JSON during build time if the data is static, or use a proper backend API to fetch only needed data.

## 5. UI/UX

### Accessibility
- **Suggestion**: Ensure all interactive elements have `aria-labels`, especially for icon-only buttons. Verify color contrast for the "Olive" theme.

### Internationalization
- **Observation**: `LanguageContext` is used.
- **Suggestion**: Ensure all hardcoded strings in components (e.g., "Generating workout...") are moved to a translation file/dictionary to support the bilingual requirement fully.
