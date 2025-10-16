# Deployment Strategy Guide - Azimut Kosher Kravi

## Current Deployment Status ✅

**Production URL:** https://azimut.zvimarmor.com
**Platform:** Netlify
**Status:** Live and fully operational

### Stack:
- React web application with Vite
- Firebase (Authentication with Google/Facebook OAuth)
- Netlify Functions (OpenAI API integration)
- Netlify CDN and hosting
- Custom domain with SSL/HTTPS

## Netlify Deployment

### Automatic Deployments
- **Main branch:** Automatically deploys to production on push
- **Feature branches:** Can create deploy previews
- **Build command:** `npm install && npm run build`
- **Publish directory:** `dist`

### Environment Variables (Already Configured)
All environment variables are set in Netlify dashboard:
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_FIREBASE_MEASUREMENT_ID`
- `VITE_OPENAI_API_KEY`
- `VITE_ENV`
- `NODE_VERSION`

### Manual Deployment
```bash
# Using Netlify CLI
netlify deploy --build --prod

# Or push to main branch (auto-deploys)
git push origin main
```

## OAuth Configuration

### Google OAuth
**Status:** ✅ Configured
- Authorized JavaScript origins: `https://azimut.zvimarmor.com`
- Authorized redirect URIs configured for Firebase Auth

### Facebook OAuth
**Status:** ✅ Configured
- App Domains: `azimut.zvimarmor.com`
- Valid OAuth Redirect URIs configured
- Privacy Policy: `https://azimut.zvimarmor.com/privacy.html`
- Data Deletion: `https://azimut.zvimarmor.com/deletion.html`

## Future Enhancements

### Phase 1: Current Web App (Complete ✅)
- ✅ Deploy to custom domain
- ✅ Firebase authentication
- ✅ OAuth integration
- ✅ OpenAI chat integration
- ✅ Security hardening
- ✅ Environment variables
- ✅ CDN and SSL

### Phase 2: Progressive Web App (PWA)
- [ ] Add service worker for offline support
- [ ] Implement app manifest for installability
- [ ] Add push notifications
- [ ] Cache workout data locally
- [ ] Enable offline workout tracking

### Phase 3: Mobile App (Future)
**Technology Options:**

**Option A: React Native**
- Reuse most React code
- True native performance
- Large community

**Option B: Capacitor**
- Wrap existing web app
- Faster conversion
- Access to native APIs

**Timeline:** Consider after PWA implementation and user base growth

## Deployment Checklist

### For New Features:
- [ ] Test locally with `npm run dev`
- [ ] Run build with `npm run build`
- [ ] Test production build locally with `npm run preview`
- [ ] Commit changes to feature branch
- [ ] Create pull request
- [ ] Review and merge to main
- [ ] Monitor Netlify deployment logs
- [ ] Test on production URL
- [ ] Verify on mobile devices

### For Environment Changes:
- [ ] Update environment variables in Netlify dashboard
- [ ] Trigger new deployment (Settings → Build & deploy → Trigger deploy)
- [ ] Clear cache if needed
- [ ] Verify changes on production

## Monitoring & Maintenance

### Netlify Dashboard Access:
**Admin URL:** https://app.netlify.com/projects/azimut-kosher-kravi

Monitor:
- Build logs
- Function logs
- Deploy history
- Bandwidth usage
- Form submissions
- Analytics

### Firebase Console:
Monitor:
- Authentication users
- Auth errors
- Usage statistics
- Security rules

### Performance Monitoring:
- Netlify Analytics (if enabled)
- Firebase Performance Monitoring
- Browser DevTools Lighthouse scores

## Cost Analysis

### Current Costs (Web Deployment):
- **Netlify:** Free tier (sufficient for current traffic)
- **Firebase:** Free tier
- **OpenAI API:** Pay per use (~$0.002 per chat)
- **Domain:** Already owned
- **Total:** ~$0-10/month

### Future Costs (if scaling):
- Netlify Pro: $19/month (100GB bandwidth, faster builds)
- Firebase Blaze: Pay as you go
- Mobile app stores: Google Play $25 one-time, Apple $99/year

## Troubleshooting

### Deployment Fails:
1. Check Netlify build logs
2. Verify environment variables are set
3. Test build locally
4. Check for secrets in code (Netlify scans for exposed keys)

### Authentication Issues:
1. Verify OAuth redirect URIs in Firebase Console
2. Check Firebase Auth authorized domains
3. Verify environment variables are correct
4. Clear browser cache and cookies

### Function Errors:
1. Check Netlify Function logs
2. Verify `VITE_OPENAI_API_KEY` is set
3. Check OpenAI API quota
4. Review function code for errors

## Quick Commands

```bash
# Check deployment status
netlify status

# View recent deployments
netlify deploy list

# View function logs
netlify functions:log chat

# Open Netlify dashboard
netlify open

# Open production site
netlify open:site
```

---

**Last Updated:** 2025-10-15
**Deployment:** Production on Netlify
