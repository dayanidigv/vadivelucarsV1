# Cloudflare Pages Deployment Guide - Admin App

## Build Configuration
- **Framework preset**: Vite
- **Build command**: `npm run build`
- **Build output directory**: `dist`
- **Node.js version**: `18` or later

## Environment Variables
The following environment variables need to be set in Cloudflare Pages:

### Required Variables
- `VITE_API_URL`: Your Workers API URL (e.g., `https://your-worker.your-subdomain.workers.dev`)
- `VITE_APP_NAME`: App name (e.g., `Vadivelu Cars Admin Portal`)

### Firebase Variables (Required)
- `VITE_FIREBASE_API_KEY`: Firebase API key
- `VITE_FIREBASE_AUTH_DOMAIN`: Firebase auth domain
- `VITE_FIREBASE_PROJECT_ID`: Firebase project ID
- `VITE_FIREBASE_STORAGE_BUCKET`: Firebase storage bucket
- `VITE_FIREBASE_MESSAGING_SENDER_ID`: Firebase messaging sender ID
- `VITE_FIREBASE_APP_ID`: Firebase app ID

### Optional Variables
- `VITE_ENVIRONMENT`: `production` or `development`
- `VITE_SENTRY_DSN`: For error tracking (if using Sentry)
- `VITE_GA_TRACKING_ID`: For Google Analytics

## Deployment Steps

### 1. Connect Repository
1. Go to Cloudflare Dashboard → Pages
2. Click "Create a project"
3. Connect your Git repository
4. Select the admin-app directory

### 2. Configure Build Settings
```
Framework preset: Vite
Build command: npm run build
Build output directory: /dist
Root directory: /admin-app
```

### 3. Set Environment Variables
In Cloudflare Pages dashboard → Settings → Environment variables:

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

### 4. Deploy
- Click "Save and Deploy"
- Cloudflare will automatically build and deploy your app

## Custom Domain (Optional)
1. In Pages dashboard → Custom domains
2. Add your custom domain (e.g., `admin.vadivelucars.com`)
3. Update DNS records as instructed by Cloudflare

## Post-Deployment Checklist
- [ ] Test admin login functionality
- [ ] Verify Firebase authentication
- [ ] Check API connectivity
- [ ] Test invoice management
- [ ] Verify customer management
- [ ] Check responsive design on mobile
- [ ] Verify SSL certificate (auto-provided by Cloudflare)

## Performance Optimizations
Cloudflare Pages automatically provides:
- ✅ Global CDN distribution
- ✅ HTTP/3 support
- ✅ Automatic minification
- ✅ Image optimization
- ✅ DDoS protection
- ✅ SSL certificates

## Troubleshooting

### Build Issues
- Check Node.js version compatibility
- Verify all dependencies are in package.json
- Check build logs for specific errors
- Ensure Firebase configuration is correct

### Firebase Issues
- Verify all Firebase config variables are set
- Check Firebase project settings
- Ensure Firebase auth is enabled
- Verify Firebase rules allow access

### API Connection Issues
- Verify VITE_API_URL is correct
- Check CORS settings in Workers
- Ensure API endpoints are accessible

### Environment Variables
- Variables must start with `VITE_` to be exposed to the frontend
- Restart deployment after changing variables
- Check for typos in variable names

## Security Considerations
- Firebase API keys are public (client-side)
- Ensure Firebase security rules are properly configured
- Use environment-specific Firebase projects
- Regularly rotate Firebase keys if needed
- Monitor Firebase usage and costs

## Manual Deployment
```bash
# Install Wrangler CLI
npm install -g wrangler

# Deploy to preview environment
npm run deploy:preview

# Deploy to production environment
npm run deploy:production
```

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
