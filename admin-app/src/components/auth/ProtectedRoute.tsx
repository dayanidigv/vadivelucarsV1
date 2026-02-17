import { Navigate, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuth } from '@/contexts/AuthContext'

interface ProtectedRouteProps {
  children: ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth()
  const location = useLocation()

  // Show loading only during initial auth check (handled by AuthProvider)
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-transparent">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-slate-400 font-medium">Verifying access...</p>
        </div>
      </div>
    )
  }

  // Check auth + role
  if (!isAuthenticated || !user || !['admin', 'manager'].includes(user.role)) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <>{children}</>
}
