# Vadivelu Cars - Customer Portal

A dedicated customer portal for Vadivelu Cars automotive service center.

## Features

### 🔐 **Authentication**
- Phone-based login system
- Vehicle number verification
- Secure session management
- JWT token authentication

### 📊 **Dashboard**
- Vehicle overview
- Service history summary
- Payment statistics
- Quick access to recent invoices

### 🚗 **Vehicle Management**
- View registered vehicles
- Add/edit vehicle information
- Track mileage and insurance dates
- Service history per vehicle

### 🧾 **Invoice Management**
- View detailed invoices
- Download/print invoices (PDF)
- Payment status tracking
- Service item breakdown

### 👤 **Profile Management**
- Update personal information
- Manage contact details
- View registered vehicles

### 💬 **Feedback System**
- Rate service experience
- Submit detailed feedback
- Star rating system

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Routing**: React Router v6
- **State Management**: React Context + TanStack Query
- **UI**: Tailwind CSS + Lucide Icons
- **PDF Generation**: React PDF
- **Notifications**: Sonner
- **API**: Fetch with custom client

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd customer-app
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
# Create .env file
echo "VITE_API_URL=http://localhost:8787" > .env
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
- `VITE_API_URL`: Backend API URL (default: http://localhost:8787)

### API Endpoints
The app connects to the following API endpoints:
- `/api/customer-auth/login` - Customer login
- `/api/customer-auth/check-phone` - Phone verification
- `/api/customer/invoices` - Customer invoices
- `/api/customer/invoices/:id` - Invoice details
- `/api/invoices/:id/print` - Invoice printing

## Project Structure

```
src/
├── components/
│   ├── auth/           # Authentication components
│   └── invoices/       # Invoice PDF components
├── contexts/
│   └── AuthContext.tsx # Authentication context
├── hooks/
│   └── useInvoices.ts  # Invoice data hooks
├── lib/
│   └── api.ts          # API client
├── pages/
│   ├── Login.tsx       # Login page
│   ├── Dashboard.tsx   # Main dashboard
│   ├── InvoiceDetails.tsx # Invoice details
│   ├── InvoicePrint.tsx   # Invoice printing
│   ├── Profile.tsx     # Profile management
│   ├── Vehicles.tsx    # Vehicle management
│   └── Feedback.tsx    # Feedback system
└── App.tsx             # Main app component
```

## Features in Detail

### Authentication Flow
1. Customer enters phone number
2. System verifies phone exists
3. Customer enters vehicle number
4. Successful login redirects to dashboard

### Invoice Management
- View all invoices with status indicators
- Detailed invoice view with line items
- PDF generation for printing/downloading
- Real-time payment status updates

### Vehicle Management
- Add new vehicles with details
- Edit existing vehicle information
- Track service history per vehicle
- Insurance date reminders

## Deployment

### Production Build
```bash
npm run build
```

### Environment Setup
- Set `VITE_API_URL` to production API endpoint
- Configure proper CORS on backend
- Ensure HTTPS for production

## Security Features

- JWT-based authentication
- Customer data isolation
- Session timeout handling
- Secure API communication
- Input validation and sanitization

## Performance Optimizations

- Lazy loading of components
- Efficient data fetching with TanStack Query
- Optimized bundle size
- Responsive design for mobile devices
- PDF generation on-demand

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
