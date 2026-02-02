
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
import AdminLogin from './pages/AdminLogin'
import Invoices from './pages/Invoices'
import CreateInvoice from './pages/CreateInvoice'
import InvoicePrint from './pages/InvoicePrint'
import Customers from './pages/Customers'
import Parts from './pages/Parts'
import { Toaster } from "@/components/ui/sonner"
import NotFound from './pages/NotFound'

import { Dashboard } from './pages/Dashboard'
import { Reports } from './pages/Reports'
import { Settings } from './pages/Settings'
import Users from './pages/Users'

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
        </Route>

        {/* Dual Access Routes - Customer OR Admin */}
        <Route path="/invoices/:id/print" element={<InvoicePrintProtected><InvoicePrint /></InvoicePrintProtected>} />

        {/* Admin Login */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Protected Admin Routes */}
        <Route path="/dashboard" element={<ProtectedRoute><AdminLayout><Dashboard /></AdminLayout></ProtectedRoute>} />
        <Route path="/invoices" element={<ProtectedRoute><AdminLayout><Invoices /></AdminLayout></ProtectedRoute>} />
        <Route path="/invoices/new" element={<ProtectedRoute><AdminLayout><CreateInvoice /></AdminLayout></ProtectedRoute>} />
        <Route path="/invoices/:id" element={<ProtectedRoute><AdminLayout><CreateInvoice /></AdminLayout></ProtectedRoute>} />
        <Route path="/customers" element={<ProtectedRoute><AdminLayout><Customers /></AdminLayout></ProtectedRoute>} />
        <Route path="/parts" element={<ProtectedRoute><AdminLayout><Parts /></AdminLayout></ProtectedRoute>} />
        <Route path="/users" element={<ProtectedRoute><AdminLayout><Users /></AdminLayout></ProtectedRoute>} />
        <Route path="/reports" element={<ProtectedRoute><AdminLayout><Reports /></AdminLayout></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><AdminLayout><Settings /></AdminLayout></ProtectedRoute>} />
        
        {/* 404 Page */}
        <Route path="*" element={<NotFound />} />
      </Routes>

      <Toaster />
    </Router>
    </AuthProvider>
  )
}

export default App
