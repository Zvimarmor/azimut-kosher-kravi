# External Services & Infrastructure

**Last Updated:** 2025-01-19
**Status:** Production Ready ✅

This document describes all external services, APIs, and infrastructure used by Azimut Kosher Kravi.

---

## 1. Firebase Services

### 1.1 Firebase Authentication
**Purpose:** User authentication and account management
**Config:** [src/lib/firebase/auth.ts](../../src/lib/firebase/auth.ts)

**Authentication Methods:**
- ✅ Email/Password
- ✅ Google OAuth (popup-based, works on all devices)
- ✅ Facebook OAuth (configured, not in UI yet)

**Features:**
- Persistent sessions (browserLocalPersistence)
- Password reset via email
- Profile management (display name, photo)
- Bilingual error messages (Hebrew/English)

**Authorized Domains:**
- `azimut.zvimarmor.com` (production)
- `localhost` (development)

---

### 1.2 Cloud Firestore (Database)
**Purpose:** User profiles, workout data, and real-time group training sessions
**Config:** [src/lib/firebase/firestore.ts](../../src/lib/firebase/firestore.ts)

**Collections:**

#### `users`
- User profiles and preferences
- Subscription management (ready for Stripe)
- Feature access flags
- Usage tracking (workouts, chat messages)
- Daily chat quota with automatic reset

#### `group_training_sessions`
- Real-time group workout coordination
- Session state and participant tracking (up to 4 per session)
- Workout progress synchronization
- Automatic cleanup of expired sessions (24hr)

**Key Features:**
- Server-side timestamps for consistency
- Real-time sync with `onSnapshot` listeners
- Session expiration management

---

### 1.3 Firebase Configuration
**File:** [src/lib/firebase/config.ts](../../src/lib/firebase/config.ts)

**Environment Variables:**
```
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
VITE_FIREBASE_MEASUREMENT_ID
```

**Security:** API key is public-safe, protected by Firebase Security Rules

---

## 2. OpenAI API

### 2.1 Military Chat Assistant
**Purpose:** IDF special forces training coach powered by GPT-4o-mini
**Config:** [netlify/functions/chat.ts](../../netlify/functions/chat.ts)

**Model:** GPT-4o-mini
**Endpoint:** `/.netlify/functions/chat` (POST)

**System Prompt Features:**
- IDF special forces trainer persona
- Direct, demanding, motivating coaching style
- Topics: recruitment, training programs, nutrition, unit info
- Bilingual support (Hebrew/English)

**Security:**
- API key stored in Netlify environment
- Daily quota tracking per user (free tier: 10 messages/day)
- Error handling for quota exceeded, API key errors

**Client Integration:** [src/features/chat/services/openaiService.ts](../../src/features/chat/services/openaiService.ts)

**Environment Variable:** `VITE_OPENAI_API_KEY`

---

## 3. Netlify Services

### 3.1 Hosting & CDN
**Purpose:** Application hosting, build, and deployment
**Config:** [netlify.toml](../../netlify.toml)

**Build Configuration:**
- Build Command: `npm install && npm run build`
- Publish Directory: `dist`
- Node Version: 20
- Production URL: https://azimut.zvimarmor.com

**Features:**
- Automatic deployments on `main` branch push
- Deploy previews for feature branches
- SPA fallback routing (404 → index.html)
- Firebase Auth proxy (`/__/auth/*` redirects)
- Custom domain with free SSL (Let's Encrypt)

---

### 3.2 Netlify Functions (Serverless)
**Location:** [netlify/functions/](../../netlify/functions/)

#### Chat Function
- **File:** `chat.ts`
- **Endpoint:** `/.netlify/functions/chat`
- **Purpose:** OpenAI API gateway
- **Method:** POST only
- **Dependencies:** OpenAI SDK

#### CSV Update Function
- **File:** `update-csv.ts`
- **Endpoint:** `/.netlify/functions/update-csv`
- **Purpose:** Admin-only workout data management
- **Authentication:** Password-protected (`VITE_ADMIN_PASSWORD`)
- **Supported Files:** Warmup.csv, StrengthExplosive.csv, RunningEndurance.csv, Special.csv, HeritageStory.csv

**Environment Variables:**
- `VITE_OPENAI_API_KEY` - OpenAI authentication
- `VITE_ADMIN_PASSWORD` - Admin function protection (default: 'admin123')

---

## 4. Google Services

### Google OAuth / Sign-In
**Purpose:** Social authentication for quick registration/login
**Integration:** Via Firebase Authentication

**Configuration:**
- Provider: `GoogleAuthProvider`
- Prompt: `select_account`
- Method: Popup-based (mobile-friendly)

**Features:**
- Auto-captures display name and photo
- Account linking support
- Configured in Google Cloud Console

**Authorized Origins:** https://azimut.zvimarmor.com

---

## 5. Browser APIs

### 5.1 Geolocation API
**Purpose:** GPS tracking for running workouts
**Config:** [src/lib/services/gpsService.ts](../../src/lib/services/gpsService.ts)

**Features:**
- High-accuracy positioning (`enableHighAccuracy: true`)
- Real-time pace and speed calculation
- Distance measurement (Haversine formula)
- Accuracy filtering (rejects > 50m error)
- Mobile-optimized timeout (15-30s)

**Permissions:**
- Requires user permission grant
- Graceful degradation on denial

**Data Persistence:**
- Saves to localStorage during app transitions
- Storage key: `gps_buffer`

---

### 5.2 Local Storage
**Purpose:** Client-side data persistence
**Used For:**
- GPS tracking buffer (`gps_buffer`)
- Workout history (`workout_history`)
- Chat conversation history
- User preferences (language, theme)

**Security:** Non-sensitive data only (credentials in Firebase)

---

## 6. Data Services (Internal)

### CSV Data Service
**Purpose:** Load and manage workout/exercise data from CSV files
**Config:** [src/lib/services/DataService.ts](../../src/lib/services/DataService.ts)

**CSV Files:**
- `/public/data/Warmup.csv` - Warm-up exercises
- `/public/data/StrengthExplosive.csv` - Strength workouts
- `/public/data/RunningEndurance.csv` - Cardio workouts
- `/public/data/Special.csv` - Tactical/special ops workouts
- `/public/data/Exercises.csv` - Exercise library (planned)

**Features:**
- In-memory caching
- JSON field parsing in CSV
- Mock data fallback
- Admin-updatable via Netlify function

---

## 7. Future Services (Planned)

### RAG (Retrieval-Augmented Generation)
**Purpose:** Enhanced AI responses with IDF-specific knowledge base
**Config:** [src/lib/services/ragService.ts](../../src/lib/services/ragService.ts)
**Status:** 🔄 Mock implementation ready for integration

**Planned Vector Database:**
- Primary: Pinecone (recommended)
- Alternative: Weaviate (self-hosted option)
- Development: FAISS (local testing)

**Embedding Model:**
- OpenAI `text-embedding-ada-002` (1536 dimensions)
- Alternative: Cohere (Hebrew support)

**Implementation Steps:**
1. Generate embeddings for training documents
2. Upload to vector database
3. Replace mock `ragQuery()` with real search
4. Integrate with Military Chat

---

## Summary Table

| Service | Type | Purpose | Status | Monthly Cost |
|---------|------|---------|--------|--------------|
| Firebase Auth | OAuth | User authentication | ✅ Active | Free tier |
| Cloud Firestore | Database | User data, sessions | ✅ Active | Free tier |
| OpenAI API | LLM | Military chat | ✅ Active | ~$5-20 |
| Google OAuth | OAuth | Social login | ✅ Active | Free |
| Netlify Hosting | CDN | Web hosting | ✅ Active | Free tier |
| Netlify Functions | Serverless | API gateway | ✅ Active | Free tier |
| Browser Geolocation | Device API | GPS tracking | ✅ Active | Free |
| Local Storage | Client Storage | Preferences | ✅ Active | Free |
| Domain (zvimarmor.com) | DNS | Custom domain | ✅ Active | ~$12/year |
| **Total** | | | | **$5-20/month** |

---

## Security Notes

1. **API Keys:** All external API keys stored in Netlify environment (never in code)
2. **Firebase API Key:** Public-safe, protected by Security Rules and authorized domains
3. **HTTPS:** All connections encrypted with SSL/TLS (Let's Encrypt)
4. **CORS:** Netlify functions act as secure API gateway
5. **Admin Functions:** Password-protected with `VITE_ADMIN_PASSWORD`
6. **Authentication:** Firebase Auth handles all credentials securely
7. **Content Security Policy:** Configured for Firebase and OAuth domains

---

## Environment Variables Reference

**Required for Production:**
```bash
# Firebase
VITE_FIREBASE_API_KEY=<your-api-key>
VITE_FIREBASE_AUTH_DOMAIN=<your-project>.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=<your-project-id>
VITE_FIREBASE_STORAGE_BUCKET=<your-project>.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=<sender-id>
VITE_FIREBASE_APP_ID=<app-id>
VITE_FIREBASE_MEASUREMENT_ID=<measurement-id>

# OpenAI
VITE_OPENAI_API_KEY=sk-...

# Admin
VITE_ADMIN_PASSWORD=<secure-password>

# Environment
VITE_ENV=production
NODE_VERSION=20
```

**Configuration Location:** Netlify Dashboard → Site settings → Environment variables

---

## Scaling Considerations

**Current Limits (Free Tier):**
- Netlify: 100GB bandwidth/month, 300 build minutes
- Firebase: 50K reads/day, 20K writes/day, 1GB storage
- OpenAI: Pay per use (~$0.002 per chat message)

**If Scaling Needed:**
- Netlify Pro: $19/month (unlimited bandwidth)
- Firebase Blaze: Pay as you go (~$0.06 per 100K reads)
- RAG System (Pinecone): $0.10-1.00/month

---

**For questions or service configuration issues, see:**
- [README.md](../README.md) - General documentation
- [DEPLOYMENT.md](../deployment/DEPLOYMENT.md) - Deployment guide
- [SECURITY.md](../security/SECURITY.md) - Security documentation
