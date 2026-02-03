import { Navigate, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { useAuth } from '@/contexts/AuthContext'

interface ProtectedRouteProps {
  children: ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isLoading: authLoading, verifySession } = useAuth()
  const [isVerifying, setIsVerifying] = useState(false)
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null)
  const location = useLocation()

  useEffect(() => {
    const checkAuth = async () => {
      setIsVerifying(true)
      try {
        const verifiedUser = await verifySession()
        if (verifiedUser && ['admin', 'manager'].includes(verifiedUser.role)) {
          setIsAuthorized(true)
        } else {
          setIsAuthorized(false)
        }
      } catch (error) {
        console.error('Verification error:', error)
        setIsAuthorized(false)
      } finally {
        setIsVerifying(false)
      }
    }

    checkAuth()
  }, [location.pathname, verifySession]) // Re-verify on route change

  if (authLoading || isVerifying || isAuthorized === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-transparent">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-slate-400 font-medium">Verifying access...</p>
        </div>
      </div>
    )
  }

  if (!isAuthorized) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <>{children}</>
}
