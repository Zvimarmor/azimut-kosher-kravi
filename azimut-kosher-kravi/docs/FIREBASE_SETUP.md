# Firebase Authentication Setup Instructions

Firebase Authentication with Google and Facebook login has been integrated into your app! Here's what you need to do to complete the setup:

## 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or "Create a project"
3. Give your project a name (e.g., "azimut-kosher-kravi")
4. Follow the setup wizard

## 2. Enable Authentication

1. In your Firebase project, go to **Authentication** in the sidebar
2. Click on the **Sign-in method** tab
3. Enable **Google** and **Facebook** providers:

### For Google:
- Click on Google
- Toggle "Enable"
- Click "Save"

### For Facebook:
- Click on Facebook
- Toggle "Enable"
- You'll need to provide:
  - **App ID** (from Facebook Developer Console)
  - **App secret** (from Facebook Developer Console)
- To get these, go to [Facebook for Developers](https://developers.facebook.com/)
- Create a new app and get the App ID and Secret

## 3. Add Web App to Firebase

1. In Firebase Console, go to **Project settings** (gear icon)
2. In the "General" tab, scroll down to "Your apps"
3. Click the web icon (`</>`) to add a web app
4. Give it a nickname (e.g., "azimut-kosher-kravi-web")
5. Copy the configuration object

## 4. Update Firebase Configuration

1. Open `src/firebase/config.ts`
2. Replace the placeholder values with your actual Firebase config:

```typescript
const firebaseConfig = {
  apiKey: "your-actual-api-key",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};
```

## 5. Configure OAuth Redirect Domains

1. In Firebase Console > Authentication > Settings
2. In "Authorized domains" add your domains:
   - `localhost` (for development)
   - Your production domain when you deploy

## 6. Test the Authentication

1. Run your app with `npm start`
2. Go to Settings page
3. Try logging in with Google or Facebook
4. Check that user info appears in the hamburger menu

## Features Implemented

✅ **Google & Facebook Login**: Complete OAuth integration
✅ **User Profile Display**: Shows name, photo, and email
✅ **Persistent Sessions**: Users stay logged in across browser sessions
✅ **Multilingual Support**: All login UI supports Hebrew/English
✅ **Layout Integration**: User info appears in hamburger menu
✅ **Settings Page**: Comprehensive login/logout interface

## Files Modified

- `src/firebase/config.ts` - Firebase configuration
- `src/components/AuthContext.tsx` - Authentication context and hooks
- `src/Pages/Settings/index.tsx` - Login/logout UI
- `src/Layout.tsx` - User display in hamburger menu
- `src/App.tsx` - AuthProvider wrapper

## Next Steps

After completing the Firebase setup, you might want to:
- Add user data persistence (save workouts to user accounts)
- Implement premium features for logged-in users
- Add social features (sharing workouts, etc.)
- Set up Firebase Analytics for user insights

The authentication foundation is now ready! 🔥

4580550700334471