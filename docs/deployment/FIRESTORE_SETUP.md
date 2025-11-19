# Firestore Setup Guide

This guide will help you set up Firestore security rules to enable group training sessions.

## Problem

When creating a group session, you get error: "שגיאה ביצירת אימון משותף"

**Cause:** Firestore security rules are not configured, so write operations are blocked.

## Solution: Deploy Firestore Security Rules

### Option 1: Using Firebase Console (Easiest)

1. **Go to Firebase Console:**
   - Open https://console.firebase.google.com
   - Select your project

2. **Navigate to Firestore Database:**
   - Click "Firestore Database" in the left sidebar
   - If you haven't created a database yet:
     - Click "Create database"
     - Choose "Start in test mode" (we'll update rules right after)
     - Select a location (closest to your users, e.g., `europe-west1` or `us-central1`)
     - Click "Enable"

3. **Update Security Rules:**
   - Click on the "Rules" tab
   - Copy the contents from the file: `firestore.rules` in the project root
   - Paste into the editor
   - Click "Publish"

### Option 2: Using Firebase CLI (Advanced)

1. **Install Firebase CLI** (if not already installed):
   ```bash
   npm install -g firebase-tools
   ```

2. **Login to Firebase:**
   ```bash
   firebase login
   ```

3. **Initialize Firebase in your project:**
   ```bash
   firebase init firestore
   ```
   - Select your Firebase project
   - Keep the default `firestore.rules` file location
   - Keep the default `firestore.indexes.json` file location

4. **Deploy the rules:**
   ```bash
   firebase deploy --only firestore:rules
   ```

## Firestore Security Rules Explanation

The rules file (`firestore.rules`) defines who can read/write data:

### Users Collection (`/users/{userId}`)
- ✅ Any authenticated user can read any user profile
- ✅ Users can create their own profile
- ✅ Users can only update/delete their own profile

### Group Training Sessions (`/group_training_sessions/{sessionId}`)
- ✅ Any authenticated user can read sessions (needed to join by code)
- ✅ Any authenticated user can create sessions
- ✅ Only participants can update the session
- ✅ Only the creator can delete the session

### Workout History (`/workout_history/{workoutId}`)
- ✅ Users can only read/write their own workout history

### All Other Collections
- ❌ Denied by default (security best practice)

## Verifying the Setup

1. **Check Rules are Active:**
   - Go to Firebase Console → Firestore Database → Rules tab
   - You should see the rules with a "Published" timestamp

2. **Test Group Session Creation:**
   - Open your app: https://azimut.zvimarmor.com
   - Login with any account
   - Go to "התחל אימון" (Start Workout)
   - Click "צור מפגש" (Create Session)
   - You should see an 8-character code appear

3. **Check Firebase Console Data:**
   - Go to Firestore Database → Data tab
   - You should see a new collection: `group_training_sessions`
   - Click to view the session document

## Troubleshooting

### Error: "Missing or insufficient permissions"
**Solution:** Security rules not deployed. Follow Option 1 or Option 2 above.

### Error: "PERMISSION_DENIED"
**Cause:** User is not authenticated, or rules don't allow the operation.
**Solution:**
1. Make sure user is logged in
2. Check Firebase Console → Authentication → Users to verify the user exists
3. Review the security rules match the documentation above

### Sessions Don't Appear on Other Devices
**Cause:** Rules deployed successfully, but data isn't syncing.
**Solution:**
1. Check browser console for errors
2. Verify both devices are using the same Firebase project
3. Check network connectivity

### Old Sessions Not Cleaning Up
**Cause:** Cleanup function needs to run.
**Solution:** The app automatically cleans up old sessions (>24hr) on load. You can manually delete old sessions from Firebase Console if needed.

## Indexes (Optional Performance Optimization)

If you get errors about missing indexes when querying sessions, Firebase will provide a link to auto-create them. Alternatively, add this to `firestore.indexes.json`:

```json
{
  "indexes": [
    {
      "collectionGroup": "group_training_sessions",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "group_training_sessions",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "code", "order": "ASCENDING" }
      ]
    }
  ],
  "fieldOverrides": []
}
```

Then deploy:
```bash
firebase deploy --only firestore:indexes
```

## Security Best Practices

1. **Never use "Test Mode" in production** - Always use proper security rules
2. **Limit data access** - Users should only access their own data (except public data like sessions)
3. **Validate data** - Rules include basic validation (e.g., required fields)
4. **Use short TTLs** - Group sessions expire in 24 hours and auto-clean
5. **Monitor usage** - Check Firebase Console → Usage tab regularly

## Next Steps

After deploying the rules:
1. ✅ Test session creation on one device
2. ✅ Test joining session from another device
3. ✅ Verify real-time sync works
4. ✅ Check session cleanup after 24 hours

---

**For more information:**
- Firebase Security Rules docs: https://firebase.google.com/docs/firestore/security/get-started
- Firestore data model: [../architecture/EXTERNAL_SERVICES.md](../architecture/EXTERNAL_SERVICES.md)
