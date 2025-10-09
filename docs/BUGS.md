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

## Workout Management

### Incorrect Workout Duration
- **Issue**: Workout history shows incorrect duration for interrupted sessions
- **Root Cause**: Duration calculation doesn't account for pauses/interruptions
- **Steps to Reproduce**:
  1. Start a workout
  2. Put computer to sleep mid-workout
  3. Resume and complete
- **Solution**: Implement proper session time tracking with pause detection
- **Priority**: High
- **Status**: Open

## Performance Issues

### Component Re-rendering
- **Issue**: Unnecessary re-renders in workout component display
- **Root Cause**: Missing memoization and GPS updates trigger full re-renders
- **Solution**: Implement proper useMemo and useCallback optimizations
- **Priority**: Medium
- **Status**: Open

### Large Dataset Performance
- **Issue**: Slowdown with 1000+ workout history items
- **Root Cause**: No pagination or virtualization implemented
- **Solution**: Add virtualization and proper data pagination
- **Priority**: Medium
- **Status**: Open

## UI/UX Issues

### Hebrew Text Alignment
- **Issue**: Some elements don't properly respect RTL layout
- **Root Cause**: Missing RTL classes and inconsistent text alignment
- **Solution**: Add proper RTL classes and alignment rules
- **Priority**: Medium
- **Status**: Open

### Missing Loading States
- **Issue**: Some button actions lack visual feedback
- **Root Cause**: Loading states not implemented consistently
- **Solution**: Add loading spinners and disabled states
- **Priority**: Medium
- **Status**: Open

### AI Chat Response Feedback
- **Issue**: No indication of AI processing state
- **Root Cause**: Missing visual feedback for chat processing
- **Solution**: Add typing indicator and response streaming
- **Priority**: Low
- **Status**: Open

### Color Contrast
- **Issue**: Some text elements don't meet WCAG standards in light theme
- **Root Cause**: Insufficient color contrast ratios
- **Solution**: Adjust color palette for better contrast
- **Priority**: Low
- **Status**: Open

## Future Issues
<!-- Add new bugs below this line -->