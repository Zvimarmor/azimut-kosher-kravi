# Firebase Configuration Guide

## Current Status ✅

Firebase Authentication is fully configured and operational.

**Firebase Project:** azimut-kosher-kravi
**Enabled Providers:** Google, Facebook
**Configuration:** Environment variables (secure)

## Configuration Overview

### Environment Variables
Firebase credentials are stored securely as environment variables:

```bash
VITE_FIREBASE_API_KEY=<configured>
VITE_FIREBASE_AUTH_DOMAIN=azimut-kosher-kravi.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=azimut-kosher-kravi
VITE_FIREBASE_STORAGE_BUCKET=azimut-kosher-kravi.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=<configured>
VITE_FIREBASE_APP_ID=<configured>
VITE_FIREBASE_MEASUREMENT_ID=<configured>
```

### Authorized Domains
Configured in Firebase Console → Authentication → Settings:
- `azimut.zvimarmor.com` (production)
- `localhost` (development)

## OAuth Providers

### Google Sign-In ✅
**Status:** Active
- OAuth client configured
- Authorized JavaScript origins set
- Redirect URIs configured
- Works on desktop and mobile

### Facebook Login ✅
**Status:** Active
- Facebook App ID configured
- App secret configured in Firebase
- Valid OAuth redirect URIs set
- Privacy policy and data deletion URLs configured

## Features Implemented

- ✅ Google & Facebook OAuth login
- ✅ User profile with photo, name, email
- ✅ Persistent sessions across browser restarts
- ✅ Auth persistence with local storage
- ✅ Mobile-friendly redirect flow
- ✅ Desktop popup flow
- ✅ Proper error handling
- ✅ Hebrew/English multilingual support

## File Structure

```
src/
├── lib/
│   ├── firebase/
│   │   └── config.ts          # Firebase initialization with env vars
│   └── utils/
│       └── logger.ts           # Secure logging utility
└── features/
    └── auth/
        └── AuthContext.tsx     # Auth provider and hooks
```

## Accessing Firebase Console

### Authentication Dashboard
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select "azimut-kosher-kravi" project
3. Navigate to **Authentication** → **Users** to see registered users

### Monitoring
- **Users:** View all authenticated users
- **Sign-in methods:** Manage OAuth providers
- **Settings:** Configure authorized domains, quotas
- **Usage:** Monitor authentication activity

## Security Configuration

### Auth Persistence
- **Mode:** `browserLocalPersistence`
- **Behavior:** Users remain logged in across browser sessions
- **Storage:** Local storage (encrypted by browser)

### Content Security Policy
OAuth-compatible CSP headers configured in `public/_headers`:
- Allows Firebase Auth domains
- Allows Google and Facebook OAuth domains
- Restricts other external scripts

## Troubleshooting

### Users Can't Log In
1. Check authorized domains in Firebase Console
2. Verify environment variables in Netlify
3. Check browser console for CSP errors
4. Clear browser cache and cookies

### OAuth Redirect Issues
1. Verify redirect URIs match in OAuth provider console
2. Check that HTTPS is enabled
3. Ensure authorized domains include production URL

### Environment Variable Issues
1. Verify all `VITE_FIREBASE_*` variables are set in Netlify
2. Trigger a new deployment after changing variables
3. Check build logs for configuration errors

## Firebase Console Access

**Project Console:** https://console.firebase.google.com/project/azimut-kosher-kravi

**Quick Links:**
- **Authentication Users:** /authentication/users
- **Sign-in Methods:** /authentication/providers
- **Settings:** /authentication/settings
- **Usage & Billing:** /usage

## Future Enhancements

### Firestore Integration
- [ ] User profiles collection
- [ ] Workout data storage
- [ ] Cross-device sync
- [ ] Social features

### Firebase Features
- [ ] Firebase Analytics
- [ ] Firebase Performance Monitoring
- [ ] Firebase Cloud Messaging (push notifications)
- [ ] Firebase Remote Config (feature flags)

### Security
- [ ] Implement Firebase App Check
- [ ] Add custom claims for user roles
- [ ] Set up security rules for Firestore
- [ ] Enable MFA (multi-factor authentication)

## Maintenance

### Regular Tasks
- Monitor authentication usage
- Review user activity logs
- Update OAuth secrets if compromised
- Check for Firebase SDK updates
- Monitor quota usage

### Rotating Credentials
If you need to rotate Firebase credentials:
1. Generate new config in Firebase Console
2. Update environment variables in Netlify
3. Trigger new deployment
4. Test authentication flow

---

**Last Updated:** 2025-10-15
**Status:** Production Ready ✅
