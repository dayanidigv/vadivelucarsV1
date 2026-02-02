import { Suspense, lazy } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'sonner'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/auth/ProtectedRoute'
import { HelmetProvider } from 'react-helmet-async'

// Layouts
import { AdminLayout } from './components/layout/AdminLayout'

// Pages
import AdminLogin from './pages/AdminLogin'
import InvoicePrint from './pages/InvoicePrint'
import NotFound from './pages/NotFound'

// Admin Pages (Lazy Loaded)
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Invoices = lazy(() => import('./pages/Invoices'))
const CreateInvoice = lazy(() => import('./pages/CreateInvoice'))
const Customers = lazy(() => import('./pages/Customers'))
const Parts = lazy(() => import('./pages/Parts'))
const Reports = lazy(() => import('./pages/Reports'))
const Settings = lazy(() => import('./pages/Settings'))
const Users = lazy(() => import('./pages/Users'))

// Loading Component
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen bg-slate-950">
    <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
  </div>
)

function App() {
  return (
    <HelmetProvider>
      <AuthProvider>
        <Router>
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              {/* Redirect root to dashboard (which deals with auth) or login */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />

              {/* Admin Login */}
              <Route path="/login" element={<AdminLogin />} />

              {/* Protected Admin Routes */}
              <Route path="/" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="invoices" element={<Invoices />} />
                <Route path="invoices/new" element={<CreateInvoice />} />
                <Route path="invoices/:id" element={<CreateInvoice />} />
                <Route path="customers" element={<Customers />} />
                <Route path="parts" element={<Parts />} />
                <Route path="reports" element={<Reports />} />
                <Route path="settings" element={<Settings />} />
                <Route path="users" element={<Users />} />
              </Route>

              {/* Invoice Print (Shared/Admin context) */}
              <Route path="/invoices/:id/print" element={<InvoicePrint />} />

              {/* 404 Page */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
          <Toaster richColors position="top-right" theme="dark" />
        </Router>
      </AuthProvider>
    </HelmetProvider>
  )
}

export default App
