# Known Bugs and Issues

## Authentication

### Facebook/Google Account Conflict
- **Issue**: `auth/account-exists-with-different-credential` error when trying to sign in with Facebook after previously signing in with Google (or vice versa) using the same email address.
- **Root Cause**: Firebase "one account per email address" restriction is enabled by default.
- **Possible Solutions**:
  1. Enable multiple accounts per email in Firebase Console → Authentication → Settings → Advanced
  2. Implement account linking to allow users to connect both Google and Facebook to the same account
  3. Show a better error message to users explaining they should use the same provider they originally signed up with
- **Priority**: Medium
- **Status**: Open

---

## Future Issues
<!-- Add new bugs below this line -->
