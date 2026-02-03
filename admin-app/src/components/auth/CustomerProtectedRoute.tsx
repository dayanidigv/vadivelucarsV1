import { Navigate, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'

interface CustomerProtectedRouteProps {
  children: ReactNode
}

export default function CustomerProtectedRoute({ children }: CustomerProtectedRouteProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const location = useLocation()

  useEffect(() => {
    const checkAuth = async () => {
      const token = sessionStorage.getItem('customerToken') || localStorage.getItem('customerToken')
      const customer = localStorage.getItem('customer')

      if (token && customer) {
        try {
          // If customer data is encrypted, we'd decrypt it here. 
          // For now, following the same pattern as admin if needed.
          // But since Customer auth isn't in AuthContext yet, 
          // I'll just handle the token move.
          sessionStorage.setItem('customerToken', token)
          localStorage.removeItem('customerToken')

          setIsAuthenticated(true)
          return
        } catch (error) {
          console.error('Error parsing customer data:', error)
        }
      }

      setIsAuthenticated(false)
    }

    checkAuth()
  }, [])

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking authentication...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <>{children}</>
}
