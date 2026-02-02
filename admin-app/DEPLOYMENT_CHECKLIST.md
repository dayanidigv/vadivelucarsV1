# Cloudflare Pages Deployment Checklist - Admin App

## Pre-Deployment Checklist

### ✅ Code Preparation
- [ ] All TypeScript errors resolved
- [ ] ESLint warnings fixed
- [ ] Build runs successfully (`npm run build`)
- [ ] Environment variables configured
- [ ] Firebase configuration updated
- [ ] API endpoints updated for production

### ✅ Environment Variables
Set these in Cloudflare Pages dashboard → Settings → Environment variables:

**Production:**
```
VITE_API_URL=https://your-worker.your-subdomain.workers.dev
VITE_APP_NAME=Vadivelu Cars Admin Portal
VITE_ENVIRONMENT=production
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

**Preview:**
```
VITE_API_URL=https://your-worker-dev.your-subdomain.workers.dev
VITE_APP_NAME=Vadivelu Cars Admin Portal (Dev)
VITE_ENVIRONMENT=development
# Add Firebase dev variables here
```

### ✅ Firebase Configuration
- [ ] Firebase project created and configured
- [ ] Authentication enabled (Email/Password, Google, etc.)
- [ ] Firestore database created
- [ ] Storage bucket configured
- [ ] Security rules properly set
- [ ] Service accounts configured

### ✅ Build Configuration
- [ ] Framework preset: Vite
- [ ] Build command: `npm run build`
- [ ] Build output directory: `dist`
- [ ] Root directory: `admin-app`
- [ ] Node.js version: 18+

## Deployment Steps

### Option 1: Cloudflare Dashboard (Recommended)
1. Go to [Cloudflare Pages](https://pages.cloudflare.com)
2. Click "Create a project"
3. Connect your Git repository
4. Select the admin-app directory
5. Configure build settings (above)
6. Set environment variables
7. Click "Save and Deploy"

### Option 2: Wrangler CLI
```bash
# Install Wrangler
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Deploy to preview
npm run deploy:preview

# Deploy to production
npm run deploy:production
```

## Post-Deployment Checklist

### ✅ Authentication Testing
- [ ] Admin login page loads correctly
- [ ] Firebase authentication works
- [ ] Google Sign-In functions (if enabled)
- [ ] Email/password login works
- [ ] Session persistence works
- [ ] Logout functionality works

### ✅ Core Functionality Testing
- [ ] Dashboard displays correctly
- [ ] Customer management works
- [ ] Invoice creation/editing works
- [ ] Vehicle management functions
- [ ] Service history tracking works
- [ ] Reports and analytics load
- [ ] PDF generation works

### ✅ API Integration Testing
- [ ] API connectivity verified
- [ ] CRUD operations work
- [ ] Error handling works
- [ ] Loading states display correctly
- [ ] CORS headers correct

### ✅ Performance & Security
- [ ] Page load times under 3 seconds
- [ ] SSL certificate active
- [ ] HTTPS redirects working
- [ ] No console errors
- [ ] Firebase security rules effective
- [ ] Sensitive data not exposed

### ✅ Mobile & UX Testing
- [ ] Responsive design works on mobile
- [ ] Touch interactions work
- [ ] Navigation is mobile-friendly
- [ ] Forms work on mobile devices
- [ ] PDF downloads work on mobile

## Firebase Security Checklist

### ✅ Security Rules
- [ ] Firestore rules restrict access appropriately
- [ ] Only authenticated users can access data
- [ ] Admin-only operations are protected
- [ ] Data validation rules in place
- [ ] Rate limiting configured if needed

### ✅ Authentication Security
- [ ] Strong password requirements
- [ ] Account lockout after failed attempts
- [ ] Session timeout configured
- [ ] Multi-factor authentication (optional)
- [ ] Social login security reviewed

## Monitoring Setup
- [ ] Cloudflare Analytics enabled
- [ ] Firebase Analytics configured
- [ ] Error tracking set up (Sentry optional)
- [ ] Performance monitoring active
- [ ] Uptime monitoring configured
- [ ] Backup procedures documented

## Troubleshooting

### Build Issues
```bash
# Check build locally
npm run build

# Check specific errors
npm run lint

# Verify Firebase config
npm run dev
```

### Firebase Issues
- Verify all Firebase config variables are set
- Check Firebase project settings
- Test authentication in Firebase console
- Review Firestore security rules
- Check Firebase quotas and limits

### API Connection Issues
- Verify `VITE_API_URL` is correct
- Check Workers deployment
- Test API endpoints directly
- Verify CORS configuration
- Check authentication headers

### Environment Variables
- Must start with `VITE_` prefix
- Restart deployment after changes
- Check for typos in variable names
- Verify Firebase keys are correct

## Rollback Plan
If deployment fails:
1. Revert to previous commit
2. Redeploy automatically
3. Monitor Firebase for issues
4. Communicate status to team
5. Verify all functionality restored

## Performance Optimizations (Automatic)
- ✅ Global CDN distribution
- ✅ HTTP/3 support
- ✅ Automatic minification
- ✅ Image optimization
- ✅ DDoS protection
- ✅ Browser caching

## Custom Domain Setup (Optional)
1. In Cloudflare Pages → Custom domains
2. Add domain (e.g., `admin.vadivelucars.com`)
3. Update DNS records as instructed
4. Wait for SSL certificate issuance
5. Update Firebase auth domain if needed

---

## Quick Commands
```bash
# Local testing
npm run dev

# Production build
npm run build

# Preview build locally
npm run preview

# Deploy commands
npm run deploy:preview
npm run deploy:production
```

## Support Resources
- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages/)
- [Wrangler CLI Documentation](https://developers.cloudflare.com/workers/wrangler/)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Vite Deployment Guide](https://vitejs.dev/guide/build.html)
