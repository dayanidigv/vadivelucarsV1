import { Routes, Route, Navigate } from 'react-router-dom'
import AuthProvider from './contexts/AuthContext'
import CustomerProtectedRoute from './components/auth/CustomerProtectedRoute'
import SessionTimeoutWarning from './components/auth/SessionTimeoutWarning'

// Import pages directly
import Login from './pages/Login'
import Dashboard from './pages/Dashboard.tsx'
import InvoiceDetails from './pages/InvoiceDetails.tsx'
import Profile from './pages/Profile.tsx'
import Vehicles from './pages/Vehicles.tsx'
import Feedback from './pages/Feedback.tsx'

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50">
        <SessionTimeoutWarning />
        <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Navigate to="/login" replace />} />
            
            {/* Protected Customer Routes */}
            <Route path="/dashboard" element={
              <CustomerProtectedRoute>
                <Dashboard />
              </CustomerProtectedRoute>
            } />
            
            <Route path="/invoices/:id" element={
              <CustomerProtectedRoute>
                <InvoiceDetails />
              </CustomerProtectedRoute>
            } />
            
            <Route path="/profile" element={
              <CustomerProtectedRoute>
                <Profile />
              </CustomerProtectedRoute>
            } />
            
            <Route path="/vehicles" element={
              <CustomerProtectedRoute>
                <Vehicles />
              </CustomerProtectedRoute>
            } />
            
            <Route path="/feedback" element={
              <CustomerProtectedRoute>
                <Feedback />
              </CustomerProtectedRoute>
            } />
            
            {/* Catch all */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
    </AuthProvider>
  )
}

export default App
