# Azimut Kosher Kravi - TODO List

**Last Updated:** 2025-01-18
**Project Status:** ~85% Complete (Code done, needs content)
**Timeline:** Part-time (2 hours/day)

**Instructions:** When a task is completed, DELETE it from this document.

---

## 🎯 CURRENT PRIORITY: Content First, Then Native Apps

**Strategy:** Fill the web app with content → Test with users → Convert to native apps

**Why this order?**
- Code is 85% complete; main gap is content (exercises, images, About Us)
- Native apps require content to be good, or reviews will hurt launch
- Web app can be PWA (installable) while we prepare content
- Faster iteration on web before committing to app store review cycles

---

## 📅 PHASE 1: Content Creation (2-3 weeks)

### 🔴 WEEK 1: Exercise Library Content (CRITICAL)

**Status:** Exercise Library UI is 100% functional, but only has 4 mock exercises

- [ ] **Create DB/Exercises.csv** (20-30 exercises minimum)
  - Format: id, name, nameEnglish, category, difficulty, description, descriptionEnglish, formTips (JSON), formTipsEnglish (JSON), commonMistakes (JSON), thumbnailUrl, images (JSON), videoUrl, videoType, targetMuscles (JSON), equipment (JSON), targetAttributes (JSON)
  - Categories: warmup, strength, cardio, special
  - Difficulty levels: beginner, intermediate, advanced
  - Reference: See mock exercises in `src/lib/services/DataService.ts` lines 382-517
  - Hebrew + English content for all fields
  - Goal: Start with 20, expand to 30+

- [ ] **Create /public/exercises/ directory**
  - Add exercise images (thumbnails + demo images)
  - Naming format: `{exercise-id}_thumb.jpg`, `{exercise-id}_1.jpg`, etc.
  - Sources: Free stock photos (Pexels, Unsplash) or AI-generated
  - Optimize for web (compress to <200KB per image)
  - Need ~60-90 images total (3 images × 30 exercises)

- [ ] **Test Exercise Library end-to-end**
  - Search functionality
  - Category filters (all, warmup, strength, cardio, special)
  - Click exercise card → detail page loads
  - Image gallery navigation works
  - Video player works (if you add video URLs)
  - Hebrew/English switching
  - Test on mobile devices

---

### 🟡 WEEK 2: Group Training Testing & About Us

**Status:** Group Training is 95% implemented (UI + backend done, needs multi-device testing)

- [ ] **Test Group Training with multiple devices/browsers**
  - Open app on 2+ devices (or use Chrome + Firefox on same machine)
  - Device 1: Click "צור מפגש" (Create Session) in Workout Setup
  - Verify: 8-character code displays, can copy to clipboard
  - Device 2: Click "הצטרף לאימון" (Join Workout), enter code
  - Verify: Both devices see participant list updating (1/4, 2/4)
  - Click "המשך לאימון" (Continue) on Device 1
  - Complete exercises, verify synchronization
  - Test "waiting for others" behavior
  - Test participant leaving mid-workout
  - Document any bugs found

- [ ] **Verify CreateWorkout group training integration**
  - Check if CreateWorkout actually uses `groupTrainingService`
  - Search for: `groupTrainingService` in `src/Pages/CreateWorkout/index.tsx`
  - If missing: Add participant list UI during workout
  - If missing: Add "waiting for others to complete" UI
  - If missing: Handle participant disconnect/leave

- [ ] **Write About Us page content**
  - Location: `src/Pages/AboutUs/index.tsx`
  - Replace placeholder text on lines 60, 67, 74
  - Section 1: "הסיפור שלנו" (Our Story) - Why you created this app
  - Section 2: "המשימה והחזון" (Mission & Vision) - Goals for IDF fitness
  - Section 3: "הצוות" (The Team) - About you/team members
  - Add team photos if available (create `/public/team/` directory)
  - Translate all content to English
  - Keep memorial dedication to Ofek Becher and Shilo Har-Even

---

### 🟢 WEEK 3: Polish & User Testing

- [ ] **Conduct user testing with 3-5 people**
  - Friends, beta testers, or IDF trainees
  - Have them complete full workout
  - Have them use Military Chat
  - Have them browse Exercise Library
  - Collect feedback on usability, Hebrew translations, missing features
  - Document bugs and feature requests

- [ ] **Fix bugs found during user testing**
  - Prioritize critical issues first
  - Fix UI/UX issues
  - Improve Hebrew text if needed

- [ ] **Verify Hebrew translations are complete**
  - Check all pages for English fallback text
  - Ensure all buttons, labels, messages are in Hebrew
  - Test language switching works everywhere

- [ ] **Add more workout programs** (if time allows)
  - Create CSV files for more workout types
  - Add variations (beginner, intermediate, advanced)
  - Consider weekly training plans

---

## 📱 PHASE 2: PWA Enhancement (1 week)

**Goal:** Make web app installable like a native app while preparing content

- [ ] **Review and update PWA manifest**
  - Location: `public/manifest.json` or `vite.config.ts`
  - Verify app name, icons, theme colors
  - Test "Add to Home Screen" on iOS Safari
  - Test "Install App" on Android Chrome

- [ ] **Add install prompts for mobile users**
  - Detect if user is on mobile
  - Show banner/modal suggesting to "Install App"
  - Guide users through iOS "Add to Home Screen" process
  - Guide users through Android "Install" process

- [ ] **Test offline functionality**
  - Implement service worker caching if not done
  - Test app works offline after first load
  - Cache workout data, exercise library
  - Show appropriate "offline" messages for features requiring internet (chat)

- [ ] **Optimize mobile performance**
  - Test on real iOS device
  - Test on real Android device
  - Optimize image loading (lazy load)
  - Minimize bundle size
  - Test on slow 3G connection

---

## 📱 PHASE 3: Native App Conversion (3-4 weeks)

**Prerequisites:** Complete Phase 1 & 2, have real users, content is solid

### Week 1: Setup & Preparation

- [ ] **Choose and install Capacitor**
  - Why Capacitor: Easiest for React/Vite apps, wraps existing web app
  - Install: `npm install @capacitor/core @capacitor/cli`
  - Install: `npm install @capacitor/ios @capacitor/android`
  - Initialize: `npx cap init`

- [ ] **Set up development accounts**
  - Apple Developer account ($99/year): https://developer.apple.com
  - Google Play Console ($25 one-time): https://play.google.com/console
  - Wait for account approval (can take 24-48 hours)

- [ ] **Install native development tools**
  - **For iOS:** Xcode (Mac only, 12+ GB download)
  - **For Android:** Android Studio (Windows/Mac/Linux)
  - Configure emulators/simulators

### Week 2: iOS Build

- [ ] **Configure Capacitor for iOS**
  - Run: `npx cap add ios`
  - Update `capacitor.config.ts` with app ID, name
  - Configure Firebase for iOS (update GoogleService-Info.plist)
  - Handle iOS permissions (location, notifications)

- [ ] **Build and test iOS app**
  - Run: `npx cap open ios` (opens Xcode)
  - Test on iOS simulator
  - Fix any iOS-specific issues (navigation, styling)
  - Test on real iPhone device

- [ ] **Prepare iOS for App Store**
  - Create app icons (1024×1024 and all sizes)
  - Create launch screen
  - Configure app settings in App Store Connect
  - Write app description (Hebrew + English)
  - Take screenshots (5.5", 6.5", 12.9" screens)
  - Set up TestFlight for beta testing (optional)

### Week 3: Android Build

- [ ] **Configure Capacitor for Android**
  - Run: `npx cap add android`
  - Update `capacitor.config.ts`
  - Configure Firebase for Android (google-services.json)
  - Handle Android permissions (location, notifications)

- [ ] **Build and test Android app**
  - Run: `npx cap open android` (opens Android Studio)
  - Test on Android emulator
  - Fix any Android-specific issues
  - Test on real Android device

- [ ] **Prepare Android for Google Play**
  - Create app icons (512×512 and adaptive icons)
  - Create feature graphic (1024×500)
  - Configure app settings in Play Console
  - Write app description (Hebrew + English)
  - Take screenshots (phone, tablet)
  - Create internal testing track (optional)

### Week 4: Submission & Launch

- [ ] **Build release versions**
  - iOS: Archive and upload to App Store Connect
  - Android: Generate signed APK/AAB, upload to Play Console
  - Fill out all required metadata
  - Set app privacy policy URL (required for both stores)
  - Set age rating (likely 4+ or 12+ for fitness)

- [ ] **Submit for review**
  - **iOS:** Submit for review (1-3 days review time)
  - **Android:** Submit for review (few hours to 1 day)
  - Monitor review status
  - Respond to any rejection reasons

- [ ] **Launch and monitor**
  - Once approved, release to public
  - Monitor crash reports (Firebase Crashlytics)
  - Monitor user reviews and ratings
  - Respond to reviews
  - Plan first update based on feedback

---

## 🤖 OPTIONAL ENHANCEMENTS (After Phase 3)

### Military Chat Improvements (Optional - Already Good!)

**Current Status:** Chat prompt is already excellent (IDF trainer persona, specific domains, good limitations)

**Optional Enhancements:**
- [ ] Add more IDF context examples to system prompt
- [ ] Add Hebrew military terminology glossary
- [ ] Add few-shot examples for consistency
- [ ] Test and measure response quality improvements

**OR: RAG Integration (More Advanced)**
- [ ] Choose vector database (Pinecone, Weaviate, FAISS)
- [ ] Choose embedding model (OpenAI text-embedding-3, Cohere)
- [ ] Generate embeddings for all exercises and military content
- [ ] Replace mock RAG with real vector search
- [ ] Integrate RAG context into Military Chat queries
- [ ] Note: RAGService mock is already complete, ready for this upgrade

---

## 📋 BACKLOG (Future Features)

- [ ] Workout templates library (weekly/monthly plans)
- [ ] Progress tracking charts (Firebase Analytics or custom)
- [ ] Achievement/badge system
- [ ] Workout reminders/notifications (push notifications in native app)
- [ ] Social sharing features
- [ ] Nutrition tracking module
- [ ] Body measurements tracking
- [ ] Improve GPS accuracy (native GPS in app version)
- [ ] Workout export (PDF, CSV)
- [ ] Upgrade Group Training to Firebase Realtime Database (multi-device sync)
- [ ] Add video exercises (YouTube or hosted)

---

## 🔧 TECHNICAL DEBT (Low Priority)

- [ ] Replace deprecated `.substr()` in `src/lib/utils/index.ts` line 62 (use `.substring()`)
- [ ] Add unit tests for services (DataService, GroupTrainingService, etc.)
- [ ] Add E2E tests for critical flows (Playwright or Cypress)
- [ ] Improve error handling across the app (standardize error messages)
- [ ] Add loading states consistently (skeleton screens)
- [ ] Code splitting for faster initial load
- [ ] Bundle size optimization

---

## ✅ COMPLETED FEATURES (Already Implemented)

### ✅ Exercise Library (UI Complete, Needs Content Only)
- ✅ ExerciseLibrary page exists and is functional
- ✅ ExerciseDetail page exists with image gallery and video player
- ✅ ExerciseCard component with thumbnails and badges
- ✅ ExerciseMediaGallery with navigation and video toggle
- ✅ DataService has all exercise methods (getExercises, getById, getByCategory)
- ✅ 4 mock exercises exist (pushups, pull-ups, sit-ups, running)
- ✅ Hebrew/English language support
- ✅ Search and filtering implemented

### ✅ RAG Service (Mock Complete, Ready for Vector DB)
- ✅ RAGService created with full mock implementation
- ✅ ragQuery() function with filtering (type, category, tags, level)
- ✅ generateAnswerWithRAG() mock function
- ✅ RAGDocument entity with prepareForEmbedding()
- ✅ 5 mock RAG documents (exercises + military content)
- ✅ Full documentation for vector DB integration
- ✅ Ready for Pinecone/Weaviate/FAISS when needed

### ✅ Group Training (Backend + UI Complete, Needs Testing)
- ✅ GroupTrainingService with all methods (create, join, leave, sync)
- ✅ SessionSyncManager for polling updates
- ✅ GroupSession entity with participant tracking
- ✅ "Create Session" button in WorkoutSetup
- ✅ "Join Workout" button in WorkoutSetup
- ✅ Create Session modal with code display and participant list
- ✅ Join Session modal with code input
- ✅ 8-character session codes
- ✅ 4-participant limit
- ✅ Session expiration (24 hours)
- ✅ Copy code to clipboard
- ✅ LocalStorage persistence

### ✅ Military Chat (Fully Functional)
- ✅ Full chat UI with message history
- ✅ Session management (multiple sessions)
- ✅ Edit/delete session functionality
- ✅ Daily quota tracking
- ✅ Login required gate
- ✅ OpenAI GPT-4o-mini integration
- ✅ Excellent system prompt (IDF trainer persona, tough but motivating)
- ✅ Error handling (quota, API key)
- ✅ Hebrew/English support
- ✅ Markdown rendering

### ✅ Core App Features
- ✅ User authentication (Firebase + Google OAuth + Email)
- ✅ Workout execution engine
- ✅ Workout history tracking
- ✅ GPS tracking service
- ✅ Firebase Firestore integration
- ✅ User profiles with subscription structure (ready for Stripe)
- ✅ Hebrew/English language system
- ✅ Theme system
- ✅ All 15 pages implemented and routed

---

## 📊 PROJECT STATUS SUMMARY

| Feature | Code | Content | Overall |
|---------|------|---------|---------|
| Exercise Library | 100% ✅ | 15% ⚠️ | 85% |
| Group Training | 95% ✅ | N/A | 95% |
| Military Chat | 100% ✅ | 100% ✅ | 100% |
| About Us | 100% ✅ | 0% ❌ | 50% |
| Workout System | 100% ✅ | 80% ⚠️ | 90% |
| User Auth | 100% ✅ | N/A | 100% |
| **OVERALL** | **~95%** | **~60%** | **~85%** |

---

## 🎯 THIS WEEK'S FOCUS (Start Here!)

**Priority 1:** Create Exercises.csv with 20-30 exercises
**Priority 2:** Create /public/exercises/ directory and add images
**Priority 3:** Test exercise library end-to-end

**Goal:** By end of week, have functional exercise library with real content

---

## 📞 NEXT SESSION CHECKLIST

When you start working:
1. Delete completed tasks from this file
2. Pick 1-2 tasks from "This Week's Focus"
3. Set a timer for 2 hours
4. Focus on content creation (exercises, images, text)
5. Test what you create
6. Update this file before ending session

**Remember:** Content first, native apps later. You're closer than you think! 🚀
