
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AdminLayout } from './components/layout/AdminLayout'
import { PublicLayout } from './components/layout/PublicLayout'
import ProtectedRoute from './components/auth/ProtectedRoute'
import CustomerProtectedRoute from './components/auth/CustomerProtectedRoute'
import InvoicePrintProtected from './components/auth/InvoicePrintProtected'
import { AuthProvider } from './contexts/AuthContext'
import LandingPage from './pages/public/LandingPage'
import CustomerLoginSimple from './pages/public/CustomerLoginSimple'
import CustomerDashboard from './pages/public/CustomerDashboard'
import CustomerInvoiceDetails from './pages/public/CustomerInvoiceDetails'
import AdminLogin from './pages/AdminLogin'
import { Toaster } from "@/components/ui/sonner"
import NotFound from './pages/NotFound'

// Lazy load heavy components
import { lazy, Suspense } from 'react'
const Invoices = lazy(() => import('./pages/Invoices'))
const CreateInvoice = lazy(() => import('./pages/CreateInvoice'))
const InvoicePrint = lazy(() => import('./pages/InvoicePrint'))
const Customers = lazy(() => import('./pages/Customers'))
const Parts = lazy(() => import('./pages/Parts'))
const Dashboard = lazy(() => import('./pages/Dashboard').then(module => ({ default: module.Dashboard })))
const Reports = lazy(() => import('./pages/Reports').then(module => ({ default: module.Reports })))
const Settings = lazy(() => import('./pages/Settings').then(module => ({ default: module.Settings })))
const Users = lazy(() => import('./pages/Users'))

function App() {
  return (
    <AuthProvider>
      <Router>

      <Routes>
        {/* Public Routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<CustomerLoginSimple />} />
          <Route path="/my-car" element={<CustomerLoginSimple />} />
          <Route path="/my-car/:id" element={<CustomerProtectedRoute><CustomerDashboard /></CustomerProtectedRoute>} />
          <Route path="/customer/invoices/:id" element={<CustomerProtectedRoute><CustomerInvoiceDetails /></CustomerProtectedRoute>} />
        </Route>

        {/* Dual Access Routes - Customer OR Admin */}
        <Route path="/invoices/:id/print" element={<InvoicePrintProtected><Suspense fallback={<div>Loading...</div>}><InvoicePrint /></Suspense></InvoicePrintProtected>} />

        {/* Admin Login */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Protected Admin Routes */}
        <Route path="/dashboard" element={<ProtectedRoute><AdminLayout><Suspense fallback={<div>Loading...</div>}><Dashboard /></Suspense></AdminLayout></ProtectedRoute>} />
        <Route path="/invoices" element={<ProtectedRoute><AdminLayout><Suspense fallback={<div>Loading...</div>}><Invoices /></Suspense></AdminLayout></ProtectedRoute>} />
        <Route path="/invoices/new" element={<ProtectedRoute><AdminLayout><Suspense fallback={<div>Loading...</div>}><CreateInvoice /></Suspense></AdminLayout></ProtectedRoute>} />
        <Route path="/invoices/:id" element={<ProtectedRoute><AdminLayout><Suspense fallback={<div>Loading...</div>}><CreateInvoice /></Suspense></AdminLayout></ProtectedRoute>} />
        <Route path="/customers" element={<ProtectedRoute><AdminLayout><Suspense fallback={<div>Loading...</div>}><Customers /></Suspense></AdminLayout></ProtectedRoute>} />
        <Route path="/parts" element={<ProtectedRoute><AdminLayout><Suspense fallback={<div>Loading...</div>}><Parts /></Suspense></AdminLayout></ProtectedRoute>} />
        <Route path="/users" element={<ProtectedRoute><AdminLayout><Suspense fallback={<div>Loading...</div>}><Users /></Suspense></AdminLayout></ProtectedRoute>} />
        <Route path="/reports" element={<ProtectedRoute><AdminLayout><Suspense fallback={<div>Loading...</div>}><Reports /></Suspense></AdminLayout></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><AdminLayout><Suspense fallback={<div>Loading...</div>}><Settings /></Suspense></AdminLayout></ProtectedRoute>} />
        
        {/* 404 Page */}
        <Route path="*" element={<NotFound />} />
      </Routes>

      <Toaster />
    </Router>
    </AuthProvider>
  )
}

export default App
