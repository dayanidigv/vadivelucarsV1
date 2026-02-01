
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AdminLayout } from './components/layout/AdminLayout'
import { PublicLayout } from './components/layout/PublicLayout'
import LandingPage from './pages/public/LandingPage'
import CustomerLogin from './pages/public/CustomerLogin'
import CustomerDashboard from './pages/public/CustomerDashboard'
import Invoices from './pages/Invoices'
import CreateInvoice from './pages/CreateInvoice'
import InvoicePrint from './pages/InvoicePrint'
import Customers from './pages/Customers'
import Parts from './pages/Parts'
import { Toaster } from "@/components/ui/sonner"

import { Dashboard } from './pages/Dashboard'
import { Reports } from './pages/Reports'
import { Settings } from './pages/Settings'

function App() {
  return (
    <Router>

      <Routes>
        {/* Public Routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<CustomerLogin />} />
          <Route path="/my-car/:id" element={<CustomerDashboard />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/dashboard" element={<AdminLayout><Dashboard /></AdminLayout>} />
        <Route path="/invoices" element={<AdminLayout><Invoices /></AdminLayout>} />
        <Route path="/invoices/new" element={<AdminLayout><CreateInvoice /></AdminLayout>} />

        <Route path="/invoices/:id" element={<AdminLayout><CreateInvoice /></AdminLayout>} />
        <Route path="/invoices/:id/print" element={<InvoicePrint />} />
        <Route path="/customers" element={<AdminLayout><Customers /></AdminLayout>} />
        <Route path="/parts" element={<AdminLayout><Parts /></AdminLayout>} />
        <Route path="/reports" element={<AdminLayout><Reports /></AdminLayout>} />
        <Route path="/settings" element={<AdminLayout><Settings /></AdminLayout>} />
      </Routes>

      <Toaster />
    </Router >
  )
}

export default App
