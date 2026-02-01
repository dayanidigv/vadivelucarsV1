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
    const checkAuth = () => {
      const token = localStorage.getItem('customerToken')
      const customer = localStorage.getItem('customer')
      
      if (token && customer) {
        try {
          JSON.parse(customer) // Verify it's valid JSON
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
