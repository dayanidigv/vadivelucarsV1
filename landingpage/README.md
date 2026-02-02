# Vadivelu Cars - Landing Page

A modern, interactive landing page for Vadivelu Cars automotive service center, featuring stunning 3D animations and smooth user experience.

## Features

### 🎨 **Visual Design**
- Modern, clean interface
- Responsive design for all devices
- Beautiful typography and color scheme
- Smooth transitions and micro-interactions

### 🎮 **3D Interactive Elements**
- Interactive 3D car models
- Animated service demonstrations
- Engaging visual effects
- WebGL-powered graphics

### ⚡ **Performance Optimized**
- Fast loading times
- Optimized 3D assets
- Efficient animations
- Core Web Vitals compliance

### 📱 **Mobile Responsive**
- Touch-friendly interface
- Optimized mobile 3D performance
- Adaptive layouts
- Gesture support

### 🌐 **SEO Ready**
- Search engine optimized
- Meta tags and Open Graph
- Structured data
- Fast page load times

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **3D Graphics**: Three.js + React Three Fiber
- **Animations**: Framer Motion
- **Routing**: React Router v7
- **State Management**: Zustand
- **UI**: Tailwind CSS + Radix UI
- **Build Tool**: Vite
- **Deployment**: Cloudflare Pages

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Modern browser with WebGL support

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd landingpage
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
# Copy .env.example to .env
cp .env.example .env

# Edit .env with your configuration
```

4. Start development server:
```bash
npm run dev
```

5. Build for production:
```bash
npm run build
```

## Configuration

### Environment Variables
- `VITE_API_URL`: Backend API URL
- `VITE_APP_NAME`: Application name
- `VITE_ENVIRONMENT`: Environment (development/production)
- `VITE_GA_TRACKING_ID`: Google Analytics ID (optional)
- `VITE_SENTRY_DSN`: Sentry DSN for error tracking (optional)

## Project Structure

```
src/
├── components/
│   ├── ui/              # Reusable UI components
│   ├── 3d/              # Three.js 3D components
│   └── sections/        # Landing page sections
├── assets/
│   ├── models/          # 3D models
│   ├── textures/        # 3D textures
│   └── images/          # Static images
├── hooks/               # Custom hooks
├── lib/                 # Utilities
├── stores/              # Zustand stores
└── App.tsx              # Main app component
```

## Deployment

### Cloudflare Pages (Recommended)

#### Quick Deploy
1. Go to [Cloudflare Pages](https://pages.cloudflare.com)
2. Connect your Git repository
3. Use these settings:
   - **Framework**: Vite
   - **Build command**: `npm run build`
   - **Output directory**: `dist`
   - **Root directory**: `landingpage`

#### Environment Variables
Set these in Cloudflare Pages dashboard:
```
VITE_API_URL=https://your-worker.your-subdomain.workers.dev
VITE_APP_NAME=Vadivelu Cars
VITE_ENVIRONMENT=production
```

#### Manual Deployment
```bash
# Build the project
npm run build

# Deploy with Wrangler (optional)
npm install -g wrangler
wrangler pages deploy dist
```

## Features in Detail

### 3D Interactive Elements
- **Car Models**: Interactive 3D car showcase
- **Service Animations**: Animated service demonstrations
- **Performance**: Optimized for smooth 60fps
- **Mobile**: Adaptive 3D quality for mobile devices

### Animations
- **Page Transitions**: Smooth section transitions
- **Micro-interactions**: Hover effects and button animations
- **Loading States**: Beautiful loading animations
- **Scroll Animations**: Scroll-triggered animations

### Performance
- **Code Splitting**: Lazy loaded components
- **Asset Optimization**: Compressed 3D models
- **Bundle Analysis**: Optimized bundle size
- **CDN Ready**: Optimized for global CDN

## Performance Considerations

### 3D Asset Optimization
- Use GLTF/GLB format for 3D models
- Compress textures and materials
- Implement LOD (Level of Detail) for complex models
- Use Draco compression for large models

### Animation Performance
- Use GPU acceleration where possible
- Implement will-change CSS property
- Reduce animation complexity on mobile
- Monitor frame rates

### Bundle Optimization
- Code split large components
- Lazy load 3D assets
- Use dynamic imports for heavy libraries
- Monitor Core Web Vitals

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers with WebGL support

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test 3D performance
5. Add tests if applicable
6. Submit a pull request

## License

© 2024 Vadivelu Cars. All rights reserved.

---

For detailed deployment instructions, see [CLOUDFLARE_DEPLOYMENT.md](./CLOUDFLARE_DEPLOYMENT.md)
