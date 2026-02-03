import { Navigate, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'

interface InvoicePrintProtectedProps {
  children: ReactNode
}

export default function InvoicePrintProtected({ children }: InvoicePrintProtectedProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<'customer' | 'admin' | null>(null)
  const [loading, setLoading] = useState(true)
  const location = useLocation()

  useEffect(() => {
    const checkAuth = () => {
      // Check customer authentication
      const customerToken = sessionStorage.getItem('customerToken') || localStorage.getItem('customerToken')
      const customer = localStorage.getItem('customer')

      if (customerToken && customer) {
        setIsAuthenticated('customer')
        setLoading(false)
        return
      }

      // Check admin authentication
      const adminToken = sessionStorage.getItem('token') || localStorage.getItem('token')
      const admin = localStorage.getItem('user')

      if (adminToken && admin) {
        setIsAuthenticated('admin')
        setLoading(false)
        return
      }

      setIsAuthenticated(null)
      setLoading(false)
    }

    checkAuth()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Verifying access...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    // Redirect to login with return URL
    const returnUrl = encodeURIComponent(location.pathname + location.search)
    return <Navigate to={`/login?returnUrl=${returnUrl}`} replace />
  }

  return <>{children}</>
}
