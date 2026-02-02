import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'

interface SessionTimeoutWarningProps {
  warningMinutes?: number
}

export default function SessionTimeoutWarning({ warningMinutes = 60 }: SessionTimeoutWarningProps) {
  const { timeUntilExpiration, logout } = useAuth()
  const [showWarning, setShowWarning] = useState(false)
  const [timeLeft, setTimeLeft] = useState('')

  useEffect(() => {
    if (!timeUntilExpiration) return

    const warningTime = warningMinutes * 60 * 1000 // Convert minutes to milliseconds
    const shouldShow = timeUntilExpiration <= warningTime && timeUntilExpiration > 0
    setShowWarning(shouldShow)

    if (shouldShow) {
      const interval = setInterval(() => {
        const minutes = Math.floor(timeUntilExpiration / 60000)
        const seconds = Math.floor((timeUntilExpiration % 60000) / 1000)
        setTimeLeft(`${minutes}m ${seconds}s`)
      }, 1000)

      return () => clearInterval(interval)
    }
  }, [timeUntilExpiration, warningMinutes])

  const handleExtendSession = () => {
    // This would typically call an API to refresh the token
    // For now, we'll just reload the page which will extend the session
    window.location.reload()
  }

  const handleLogoutNow = () => {
    logout()
  }

  if (!showWarning) return null

  return (
    <div className="fixed top-4 right-4 bg-yellow-50 border border-yellow-200 rounded-lg shadow-lg p-4 max-w-sm z-50">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg className="h-6 w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-yellow-800">
            Session Expiring Soon
          </h3>
          <div className="mt-2 text-sm text-yellow-700">
            <p>Your session will expire in {timeLeft}. You will be automatically logged out.</p>
          </div>
          <div className="mt-3 flex space-x-2">
            <button
              onClick={handleExtendSession}
              className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded text-sm font-medium hover:bg-yellow-200 transition-colors"
            >
              Extend Session
            </button>
            <button
              onClick={handleLogoutNow}
              className="text-yellow-800 px-3 py-1 rounded text-sm font-medium hover:bg-yellow-200 transition-colors"
            >
              Logout Now
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
