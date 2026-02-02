# Cloudflare Pages Deployment Checklist - Landing Page

## Pre-Deployment Checklist

### ✅ Code Preparation
- [ ] All TypeScript errors resolved
- [ ] ESLint warnings fixed
- [ ] Build runs successfully (`npm run build`)
- [ ] Environment variables configured
- [ ] 3D assets optimized
- [ ] Images optimized for web

### ✅ Environment Variables
Set these in Cloudflare Pages dashboard → Settings → Environment variables:

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

### ✅ Build Configuration
- [ ] Framework preset: Vite
- [ ] Build command: `npm run build`
- [ ] Build output directory: `dist`
- [ ] Root directory: `landingpage`
- [ ] Node.js version: 18+

### ✅ 3D and Animation Testing
- [ ] Three.js models load correctly
- [ ] 3D animations perform well
- [ ] No memory leaks with 3D content
- [ ] Framer Motion animations work
- [ ] Mobile 3D performance acceptable

## Deployment Steps

### Option 1: Cloudflare Dashboard (Recommended)
1. Go to [Cloudflare Pages](https://pages.cloudflare.com)
2. Click "Create a project"
3. Connect your Git repository
4. Select the landingpage directory
5. Configure build settings (above)
6. Set environment variables
7. Click "Save and Deploy"

### Option 2: Wrangler CLI (Optional)
```bash
# Install Wrangler
npm install -g wrangler

# Build the project
npm run build

# Deploy to Pages
wrangler pages deploy dist
```

## Post-Deployment Checklist

### ✅ Core Functionality Testing
- [ ] Landing page loads correctly
- [ ] All sections display properly
- [ ] Navigation works smoothly
- [ ] Contact forms function (if present)
- [ ] External links work correctly

### ✅ 3D and Animation Testing
- [ ] 3D models load without errors
- [ ] Animations play smoothly
- [ ] Interactive 3D elements work
- [ ] Performance on desktop acceptable
- [ ] Mobile 3D performance acceptable

### ✅ Responsive Design Testing
- [ ] Desktop layout looks correct
- [ ] Tablet layout works well
- [ ] Mobile layout is optimized
- [ ] Touch interactions work
- [ ] Text is readable on all devices

### ✅ Performance & SEO
- [ ] Page load time under 3 seconds
- [ ] Core Web Vitals are good
- [ ] Images load efficiently
- [ ] 3D assets load efficiently
- [ ] Meta tags are set correctly
- [ ] Open Graph tags work

### ✅ Cross-Browser Testing
- [ ] Chrome works correctly
- [ ] Firefox works correctly
- [ ] Safari works correctly
- [ ] Edge works correctly
- [ ] Mobile browsers work

## 3D Performance Optimization

### ✅ Asset Optimization
- [ ] 3D models are optimized (GLTF/GLB)
- [ ] Textures are compressed
- [ ] Model polygon count is reasonable
- [ ] Animation files are optimized
- [ ] Asset sizes are monitored

### ✅ Runtime Performance
- [ ] Frame rate stays above 30fps
- [ ] Memory usage is reasonable
- [ ] No memory leaks detected
- [ ] GPU acceleration is working
- [ ] Loading times are acceptable

## SEO and Accessibility

### ✅ SEO Checklist
- [ ] Page title is descriptive
- [ ] Meta description is compelling
- [ ] Header tags are structured properly
- [ ] Image alt tags are set
- [ ] Open Graph tags are configured
- [ ] Structured data is implemented

### ✅ Accessibility
- [ ] Keyboard navigation works
- [ ] Screen reader compatibility
- [ ] Color contrast meets WCAG
- [ ] Focus indicators are visible
- [ ] ARIA labels are used appropriately

## Monitoring Setup
- [ ] Cloudflare Analytics enabled
- [ ] Google Analytics configured (if used)
- [ ] Performance monitoring active
- [ ] Error tracking set up (if using Sentry)
- [ ] Uptime monitoring configured

## Troubleshooting

### Build Issues
```bash
# Check build locally
npm run build

# Check specific errors
npm run lint

# Analyze bundle size
npx vite-bundle-analyzer dist
```

### 3D/Animation Issues
- Verify Three.js dependencies are correct
- Check 3D model formats (GLTF/GLB preferred)
- Test on different browsers
- Monitor console for WebGL errors
- Check GPU memory usage

### Performance Issues
- Analyze bundle size
- Optimize 3D model sizes
- Implement lazy loading
- Check Core Web Vitals
- Monitor Lighthouse scores

### Environment Variables
- Must start with `VITE_` prefix
- Restart deployment after changes
- Check for typos in variable names
- Verify API URLs are correct

## Rollback Plan
If deployment fails:
1. Revert to previous commit
2. Redeploy automatically
3. Monitor performance metrics
4. Test critical functionality
5. Communicate status to team

## Performance Optimizations (Automatic)
- ✅ Global CDN distribution
- ✅ HTTP/3 support
- ✅ Automatic minification
- ✅ Image optimization
- ✅ DDoS protection
- ✅ Browser caching

## Custom Domain Setup (Optional)
1. In Cloudflare Pages → Custom domains
2. Add domain (e.g., `vadivelucars.com`)
3. Update DNS records as instructed
4. Wait for SSL certificate issuance
5. Test domain propagation

## Advanced Optimizations

### 3D Asset Delivery
- [ ] Use CDN for 3D assets
- [ ] Implement progressive loading
- [ ] Add loading states for 3D content
- [ ] Consider LOD (Level of Detail) for models
- [ ] Implement texture compression

### Animation Performance
- [ ] Use GPU acceleration
- [ ] Optimize animation timelines
- [ ] Reduce animation complexity on mobile
- [ ] Implement will-change CSS property
- [ ] Test animation performance metrics

---

## Quick Commands
```bash
# Local testing
npm run dev

# Production build
npm run build

# Preview build locally
npm run preview

# Bundle analysis
npm run build && npx vite-bundle-analyzer dist

# Performance audit
npm run build && npx lighthouse http://localhost:4173
```

## Support Resources
- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages/)
- [Vite Deployment Guide](https://vitejs.dev/guide/build.html)
- [Three.js Performance Guide](https://threejs.org/docs/#manual/en/introduction/Performance)
- [Framer Motion Documentation](https://www.framer.com/motion/)
- [Web.dev Performance](https://web.dev/performance/)
