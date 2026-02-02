# Vadivelu Cars - Admin Portal

A comprehensive admin dashboard for managing Vadivelu Cars automotive service center operations.

## Features

### 🔐 **Authentication**
- Firebase-based authentication
- Multiple login methods (Email, Google, etc.)
- Secure session management
- Role-based access control

### 📊 **Dashboard**
- Real-time business analytics
- Revenue and service statistics
- Customer activity monitoring
- Performance metrics

### 👥 **Customer Management**
- View and manage customer profiles
- Search and filter customers
- Customer service history
- Contact management

### 🧾 **Invoice Management**
- Create and edit invoices
- Track payment status
- Generate PDF invoices
- Bulk operations

### 🚗 **Vehicle Management**
- Track customer vehicles
- Service history per vehicle
- Insurance and registration tracking
- Maintenance schedules

### 📈 **Reports & Analytics**
- Financial reports
- Service trend analysis
- Customer insights
- Performance dashboards

### ⚙️ **System Administration**
- User management
- System settings
- Backup and restore
- Audit logs

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Routing**: React Router v7
- **State Management**: Zustand + TanStack Query
- **UI**: Tailwind CSS + Radix UI
- **Authentication**: Firebase Auth
- **Database**: Firebase Firestore
- **PDF Generation**: React PDF
- **Charts**: Recharts
- **Build Tool**: Vite
- **Deployment**: Cloudflare Pages

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Firebase project

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd admin-app
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
# Copy .env.example to .env
cp .env.example .env

# Edit .env with your Firebase and API configuration
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
- `VITE_FIREBASE_API_KEY`: Firebase API key
- `VITE_FIREBASE_AUTH_DOMAIN`: Firebase auth domain
- `VITE_FIREBASE_PROJECT_ID`: Firebase project ID
- `VITE_FIREBASE_STORAGE_BUCKET`: Firebase storage bucket
- `VITE_FIREBASE_MESSAGING_SENDER_ID`: Firebase messaging sender ID
- `VITE_FIREBASE_APP_ID`: Firebase app ID
- `VITE_API_URL`: Backend API URL
- `VITE_APP_NAME`: Application name

### Firebase Setup
1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com)
2. Enable Authentication (Email, Google, etc.)
3. Create Firestore database
4. Set up Storage bucket
5. Configure security rules
6. Copy configuration to `.env`

## Project Structure

```
src/
├── components/
│   ├── ui/              # Reusable UI components
│   ├── auth/            # Authentication components
│   ├── invoices/        # Invoice components
│   └── charts/          # Chart components
├── pages/
│   ├── Dashboard.tsx    # Main dashboard
│   ├── Customers.tsx    # Customer management
│   ├── Invoices.tsx     # Invoice management
│   ├── Vehicles.tsx     # Vehicle management
│   └── Settings.tsx     # System settings
├── hooks/               # Custom hooks
├── lib/                 # Utilities and API
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
   - **Root directory**: `admin-app`

#### Environment Variables
Set these in Cloudflare Pages dashboard:
```
VITE_API_URL=https://your-worker.your-subdomain.workers.dev
VITE_APP_NAME=Vadivelu Cars Admin Portal
VITE_ENVIRONMENT=production
# Add all Firebase variables here
```

#### Manual Deployment
```bash
# Deploy to preview
npm run deploy:preview

# Deploy to production
npm run deploy:production
```

## Features in Detail

### Authentication Flow
1. Admin enters credentials
2. Firebase authentication validates
3. Session token generated
4. Redirect to dashboard

### Invoice Management
- Create invoices with line items
- Automatic calculations
- PDF generation
- Payment tracking
- Customer notifications

### Customer Management
- Comprehensive customer profiles
- Service history tracking
- Communication logs
- Document management

### Analytics & Reporting
- Real-time dashboards
- Custom date ranges
- Export capabilities
- Performance insights

## Security Features

- Firebase-based authentication
- Role-based access control
- Secure API communication
- Input validation and sanitization
- Session timeout handling
- Audit logging

## Performance Optimizations

- Lazy loading of components
- Efficient data fetching with TanStack Query
- Optimized bundle size
- Responsive design for mobile devices
- PDF generation on-demand
- Global CDN (Cloudflare)

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

© 2024 Vadivelu Cars. All rights reserved.

---

For detailed deployment instructions, see [CLOUDFLARE_DEPLOYMENT.md](./CLOUDFLARE_DEPLOYMENT.md)
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
