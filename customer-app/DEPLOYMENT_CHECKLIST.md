# Cloudflare Pages Deployment Checklist

## Pre-Deployment Checklist

### ✅ Code Preparation
- [ ] All TypeScript errors resolved
- [ ] ESLint warnings fixed
- [ ] Build runs successfully (`npm run build`)
- [ ] Environment variables configured
- [ ] API endpoints updated for production

### ✅ Environment Variables
Set these in Cloudflare Pages dashboard → Settings → Environment variables:

**Production:**
```
VITE_API_URL=https://your-worker.your-subdomain.workers.dev
VITE_APP_NAME=Vadivelu Cars Customer Portal
VITE_ENVIRONMENT=production
```

**Preview:**
```
VITE_API_URL=https://your-worker-dev.your-subdomain.workers.dev
VITE_APP_NAME=Vadivelu Cars Customer Portal (Dev)
VITE_ENVIRONMENT=development
```

### ✅ Build Configuration
- [ ] Framework preset: Vite
- [ ] Build command: `npm run build`
- [ ] Build output directory: `dist`
- [ ] Root directory: `customer-app`
- [ ] Node.js version: 18+

## Deployment Steps

### Option 1: Cloudflare Dashboard (Recommended)
1. Go to [Cloudflare Pages](https://pages.cloudflare.com)
2. Click "Create a project"
3. Connect your Git repository
4. Select the customer-app directory
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

### ✅ Functionality Testing
- [ ] Login page loads correctly
- [ ] Authentication flow works
- [ ] Dashboard displays data
- [ ] Invoice details load properly
- [ ] Service items show correct pricing
- [ ] PDF generation works
- [ ] Vehicle management functions
- [ ] Profile updates work
- [ ] Mobile responsive design

### ✅ Performance & Security
- [ ] Page load times under 3 seconds
- [ ] SSL certificate active
- [ ] HTTPS redirects working
- [ ] API connectivity verified
- [ ] CORS headers correct
- [ ] No console errors

### ✅ Monitoring Setup
- [ ] Cloudflare Analytics enabled
- [ ] Error tracking configured (if using Sentry)
- [ ] Uptime monitoring set up
- [ ] Backup procedures documented

## Troubleshooting

### Build Issues
```bash
# Check build locally
npm run build

# Check specific errors
npm run lint
```

### API Connection Issues
- Verify `VITE_API_URL` is correct
- Check Workers deployment
- Test API endpoints directly
- Verify CORS configuration

### Environment Variables
- Must start with `VITE_` prefix
- Restart deployment after changes
- Check for typos in variable names

## Performance Optimizations (Automatic)
- ✅ Global CDN distribution
- ✅ HTTP/3 support
- ✅ Automatic minification
- ✅ Image optimization
- ✅ DDoS protection
- ✅ Browser caching

## Custom Domain Setup (Optional)
1. In Cloudflare Pages → Custom domains
2. Add domain (e.g., `customers.vadivelucars.com`)
3. Update DNS records as instructed
4. Wait for SSL certificate issuance

## Rollback Plan
If deployment fails:
1. Revert to previous commit
2. Redeploy automatically
3. Monitor for issues
4. Communicate status to users

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
- [Vite Deployment Guide](https://vitejs.dev/guide/build.html)
