import { Navigate, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'

interface ProtectedRouteProps {
  children: ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const location = useLocation()

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token')
      const user = localStorage.getItem('user')
      
      if (token && user) {
        try {
          const userData = JSON.parse(user)
          // Check if user has admin role
          if (userData.role && ['admin', 'manager'].includes(userData.role)) {
            setIsAuthenticated(true)
            return
          }
        } catch (error) {
          console.error('Error parsing user data:', error)
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking authentication...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />
  }

  return <>{children}</>
}
