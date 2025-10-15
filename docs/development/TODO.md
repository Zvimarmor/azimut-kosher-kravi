# AI Kosher Kravi - TODO List

This document tracks all pending tasks, features, and bugs for the AI Kosher Kravi fitness application.

**Instructions:** When a task is completed, DELETE it from this document.

---

## 🚀 **FEATURE 1: Exercise Explanation Page - REMAINING TASKS**

- [ ] Create CSV file with exercise data (public/data/Exercises.csv)
- [ ] Add exercise images to public/exercises/ folder
- [ ] Test exercise library functionality end-to-end
- [ ] Add more exercises to the database (at least 20-30 exercises)
- [ ] **Debug and test new Exercise components:**
  - [ ] Test ExerciseLibrary page: search, filters, card clicks
  - [ ] Test ExerciseDetail page: image gallery, video player, navigation
  - [ ] Test ExerciseCard component: thumbnail loading, error states
  - [ ] Test ExerciseMediaGallery: image navigation, video toggle
  - [ ] Verify all exercise data loads correctly from DataService
  - [ ] Test Hebrew/English language switching
  - [ ] Test on mobile devices

---

## 🤖 **FEATURE 2: RAG Integration Preparation**

- [ ] **Test RAG Service:**
  - [ ] Test `ragQuery()` function with various queries
  - [ ] Test filtering by type, category, tags
  - [ ] Test `generateAnswerWithRAG()` mock function
  - [ ] Verify RAGDocument creation from exercises
  - [ ] Test prepareForEmbedding() method
  - [ ] Check all mock RAG documents are properly structured

---

## 👥 **FEATURE 3: Group Training Mode (Multi-Device Workout Sessions)**

### Completed Backend:
- ✅ GroupSession entity created
- ✅ groupTrainingService created
- ✅ Session creation with unique codes
- ✅ Session joining/leaving
- ✅ Polling-based sync (SessionSyncManager)
- ✅ LocalStorage persistence

### Remaining Tasks:
- [ ] Add "Invite Others to Join (up to 4)" button to CreateWorkout page
- [ ] Create session code display modal with copy functionality
- [ ] Add "Join Workout" button to CreateWorkout page
- [ ] Create session code input modal
- [ ] Show participant list during workout
- [ ] Add synchronization UI (waiting for others to complete exercise)
- [ ] Integrate with existing CreateWorkout workout flow
- [ ] Handle participant disconnect/leave in UI
- [ ] Test group training with multiple devices/browsers
- [ ] **Debug and test Group Training backend:**
  - [ ] Test session creation and code generation
  - [ ] Test joining session with valid/invalid codes
  - [ ] Test participant limit (max 4)
  - [ ] Test completion tracking
  - [ ] Test SessionSyncManager polling
  - [ ] Test session expiration and cleanup
  - [ ] Test leaving/canceling sessions

---

## ✏️ **FEATURE 4: Manual Workout Editing**

### Purpose:
Allow users to manually create and edit workouts with custom exercises, sets, reps, and rest periods.

### Tasks:
- [ ] Create Manual Workout Editor page (`src/Pages/ManualWorkoutEditor/index.tsx`)
- [ ] Add "Create Custom Workout" button to home page
- [ ] Create exercise selector/search component
- [ ] Add/remove exercise buttons
- [ ] Drag-and-drop exercise reordering (optional, can use up/down buttons)
- [ ] Sets/reps/rest time inputs for each exercise
- [ ] Workout name and description fields
- [ ] Save custom workouts to storage (localStorage or Firebase)
- [ ] Load custom workouts in SelectWorkout page
- [ ] Allow editing existing custom workouts
- [ ] Allow deleting custom workouts
- [ ] Add "Custom" category filter in SelectWorkout
- [ ] Ensure custom workouts work with CreateWorkout page
- [ ] Ensure custom workouts appear in workout history
- [ ] Test manual workout creation flow end-to-end

---

## 🐛 **BUG FIXES**

### Priority: HIGH
- [ ] **Fix Google and Facebook Authentication**
  - Issue: Authentication with Google/Facebook may not be working correctly
  - Files to check: `src/lib/firebase/config.ts`, `src/features/auth/AuthContext.tsx`
  - Steps: Check Firebase console OAuth config, verify authorized domains, test auth flow
  - Verify redirect URIs in Firebase console

### Priority: MEDIUM
- [ ] **Improve Military Chat Agent (MilitaryChat page)**
  - Task: Improve AI responses without using external RAG or vector databases
  - Approach: Use prompt engineering to enhance the existing chat
  - Files: `src/Pages/MilitaryChat/index.tsx`
  - Ideas:
    - Add more detailed system prompt with IDF context, training principles, Hebrew military terms
    - Include few-shot examples in the prompt
    - Add context about the app (fitness, Krav Maga, Israeli military focus)
    - Structure prompts with better instructions for formatting and tone
    - Add conversation memory/context window management
    - Test different prompt templates and measure quality
  - Goal: Better answers without changing OpenAI integration or adding databases

---

## 📚 **DOCUMENTATION & CODE REVIEW**

- [ ] Read `docs/BUGS.md`
- [ ] Read `docs/WORKOUT_ARCHITECTURE.md`
- [ ] Read any other docs in `/docs` folder
- [ ] Understand all recent changes applied to the codebase
- [ ] Review Exercise feature implementation
- [ ] Test all new functionality

---

## 📋 **BACKLOG (Future Enhancements)**

- [ ] Add workout templates library
- [ ] Add progress tracking and charts
- [ ] Add achievement/badge system
- [ ] Add workout reminders/notifications
- [ ] Add social sharing features
- [ ] Add nutrition tracking
- [ ] Add body measurements tracking
- [ ] Improve GPS tracking accuracy
- [ ] Add offline mode support
- [ ] Add workout export (PDF, CSV)

---

## 🔧 **TECHNICAL DEBT**

- [ ] Replace deprecated `.substr()` in `src/lib/utils/index.ts` (line 62)
- [ ] Add unit tests for services
- [ ] Add E2E tests for critical flows
- [ ] Improve error handling across the app
- [ ] Add loading states consistently

---

## 🎯 **CURRENT PRIORITY**

**Immediate (This PR):**
1. ✅ Exercise Explanation feature (backend complete)
2. ✅ RAG service preparation (complete)
3. ✅ Group Training backend (complete)
4. ✅ Documentation updated

**Next Steps (After PR Review):**
1. Debug and test all new features
2. Add Group Training UI to CreateWorkout
3. Improve Military Chat with better prompts
4. Fix authentication bugs
5. Add exercise CSV data and images

**This Week:**
1. Test and debug new Exercise, RAG, and Group Training code
2. Implement Group Training UI
3. Create exercise database
4. Improve chat agent with prompt engineering

**Next Week:**
1. Complete Group Training Mode testing with multiple devices
2. Create manual workout editing feature
3. Fix any bugs found during testing

---

**Last Updated:** 2025-10-13
**PR Branch:** feature/exercise-library-rag-group-training
