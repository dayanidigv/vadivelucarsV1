# Cloudflare Pages Deployment Guide - Landing Page

## Build Configuration
- **Framework preset**: Vite
- **Build command**: `npm run build`
- **Build output directory**: `dist`
- **Node.js version**: `18` or later

## Environment Variables
The following environment variables need to be set in Cloudflare Pages:

### Required Variables
- `VITE_API_URL`: Your Workers API URL (e.g., `https://your-worker.your-subdomain.workers.dev`)
- `VITE_APP_NAME`: App name (e.g., `Vadivelu Cars`)

### Optional Variables
- `VITE_ENVIRONMENT`: `production` or `development`
- `VITE_GA_TRACKING_ID`: For Google Analytics
- `VITE_SENTRY_DSN`: For error tracking (if using Sentry)

## Deployment Steps

### 1. Connect Repository
1. Go to Cloudflare Dashboard → Pages
2. Click "Create a project"
3. Connect your Git repository
4. Select the landingpage directory

### 2. Configure Build Settings
In the Cloudflare Pages dashboard, use these exact settings:

**Basic Settings:**
- **Framework preset**: Vite
- **Build command**: `npm run build`
- **Build output directory**: `dist`
- **Root directory**: `landingpage` (important!)

**Advanced Settings:**
- **Node.js version**: `18` or later
- **Environment variables**: Set in the next step

**Important Notes:**
- The Root directory must be set to `landingpage` since that's where the landing page is located
- Build command must be `npm run build`
- Output directory is `dist` relative to the root directory
- Do NOT use wrangler.toml for Pages deployment - use dashboard settings only

### 3. Set Environment Variables
In Cloudflare Pages dashboard → Settings → Environment variables:

**Production:**
```
VITE_API_URL=https://your-worker.your-subdomain.workers.dev
VITE_APP_NAME=Vadivelu Cars
VITE_ENVIRONMENT=production
```

**Preview:**
```
VITE_API_URL=https://your-worker-dev.your-subdomain.workers.dev
VITE_APP_NAME=Vadivelu Cars (Dev)
VITE_ENVIRONMENT=development
```

### 4. Deploy
- Click "Save and Deploy"
- Cloudflare will automatically build and deploy your app

## Custom Domain (Optional)
1. In Pages dashboard → Custom domains
2. Add your custom domain (e.g., `vadivelucars.com`)
3. Update DNS records as instructed by Cloudflare

## Post-Deployment Checklist
- [ ] Test all page sections load correctly
- [ ] Verify 3D animations work
- [ ] Check responsive design on mobile
- [ ] Test navigation links
- [ ] Verify contact forms work (if any)
- [ ] Check SSL certificate (auto-provided by Cloudflare)
- [ ] Test performance and loading times

## Performance Optimizations
Cloudflare Pages automatically provides:
- ✅ Global CDN distribution
- ✅ HTTP/3 support
- ✅ Automatic minification
- ✅ Image optimization
- ✅ DDoS protection
- ✅ SSL certificates

## Landing Page Specific Considerations

### 3D Assets and Performance
- Three.js assets are optimized during build
- Large 3D models may need additional optimization
- Consider using CDN for heavy 3D assets
- Test 3D performance on mobile devices

### Animation Performance
- Framer Motion animations are optimized
- Test animations on slower devices
- Consider reducing animation complexity for mobile
- Monitor Core Web Vitals

### Image Optimization
- Images are automatically optimized by Cloudflare
- Use WebP format for better compression
- Implement lazy loading for below-fold images
- Optimize hero images for fast loading

## Troubleshooting

### Build Issues
- Check Node.js version compatibility
- Verify all dependencies are in package.json
- Check build logs for specific errors
- Ensure Three.js assets are properly imported

### 3D/Animation Issues
- Verify Three.js dependencies are correct
- Check 3D model formats and sizes
- Test on different browsers and devices
- Monitor memory usage with 3D content

### Performance Issues
- Check bundle size with `npm run build`
- Optimize 3D model sizes
- Implement code splitting for large components
- Use Cloudflare's performance insights

### Environment Variables
- Variables must start with `VITE_` to be exposed to the frontend
- Restart deployment after changing variables
- Check for typos in variable names

## Manual Deployment
For manual deployment using Wrangler CLI (optional):
```bash
# Install Wrangler
npm install -g wrangler

# Build the project
npm run build

# Deploy to Pages
wrangler pages deploy dist
```

## Analytics and Monitoring

### Performance Monitoring
- Use Cloudflare Analytics
- Monitor Core Web Vitals
- Track 3D loading times
- Monitor bundle size

### User Analytics
- Set up Google Analytics if needed
- Track page interactions
- Monitor 3D engagement
- Track conversion goals

---

## Quick Commands
```bash
# Local testing
npm run dev

# Production build
npm run build

# Preview build locally
npm run preview

# Check bundle size
npm run build && npx vite-bundle-analyzer dist
```

## Support Resources
- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages/)
- [Vite Deployment Guide](https://vitejs.dev/guide/build.html)
- [Three.js Performance Guide](https://threejs.org/docs/#manual/en/introduction/Performance)
- [Framer Motion Documentation](https://www.framer.com/motion/)
