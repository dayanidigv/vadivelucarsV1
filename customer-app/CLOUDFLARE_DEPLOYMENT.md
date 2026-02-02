# Cloudflare Pages configuration for Vadivelu Cars Customer App

## Build Configuration
- **Framework preset**: Vite
- **Build command**: `npm run build`
- **Build output directory**: `dist`
- **Node.js version**: `18` or later

## Environment Variables
The following environment variables need to be set in Cloudflare Pages:

### Required Variables
- `VITE_API_URL`: Your Workers API URL (e.g., `https://your-worker.your-subdomain.workers.dev`)
- `VITE_APP_NAME`: App name (e.g., `Vadivelu Cars Customer Portal`)

### Optional Variables
- `VITE_ENVIRONMENT`: `production` or `development`
- `VITE_SENTRY_DSN`: For error tracking (if using Sentry)

## Deployment Steps

### 1. Connect Repository
1. Go to Cloudflare Dashboard → Pages
2. Click "Create a project"
3. Connect your Git repository
4. Select the customer-app directory

### 2. Configure Build Settings
```
Framework preset: Vite
Build command: npm run build
Build output directory: /dist
Root directory: /customer-app
```

### 3. Set Environment Variables
In Cloudflare Pages dashboard → Settings → Environment variables:

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

### 4. Deploy
- Click "Save and Deploy"
- Cloudflare will automatically build and deploy your app

## Custom Domain (Optional)
1. In Pages dashboard → Custom domains
2. Add your custom domain (e.g., `customers.vadivelucars.com`)
3. Update DNS records as instructed by Cloudflare

## Post-Deployment Checklist
- [ ] Test all pages load correctly
- [ ] Verify API connectivity
- [ ] Check authentication flow
- [ ] Test invoice details and PDF generation
- [ ] Verify responsive design on mobile
- [ ] Check SSL certificate (auto-provided by Cloudflare)

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

### API Connection Issues
- Verify VITE_API_URL is correct
- Check CORS settings in Workers
- Ensure API endpoints are accessible

### Environment Variables
- Variables must start with `VITE_` to be exposed to the frontend
- Restart deployment after changing variables
