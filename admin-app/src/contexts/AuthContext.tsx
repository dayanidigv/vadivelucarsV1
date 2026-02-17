import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'
import type { ReactNode } from 'react'
import { toast } from 'sonner'
import { api } from '@/lib/api'

interface User {
  id: string
  username: string
  email: string
  name: string
  role: string
  permissions?: string[]
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (token: string, user: User) => void
  logout: () => Promise<void>
  isAuthenticated: boolean
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const SESSION_TIMEOUT = 30 * 60 * 1000 // 30 minutes

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  // Restore user/token from storage immediately (no API call needed for initial render)
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem('user')
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })
  const [token, setToken] = useState<string | null>(() => {
    return sessionStorage.getItem('token')
  })
  const [isLoading, setIsLoading] = useState(() => {
    // Only show loading if we have a token to verify
    return !!sessionStorage.getItem('token')
  })
  const verifyCalledRef = useRef(false)

  // Verify session with the backend once on mount
  useEffect(() => {
    if (verifyCalledRef.current) return
    verifyCalledRef.current = true

    const storedToken = sessionStorage.getItem('token')
    if (!storedToken) {
      setIsLoading(false)
      return
    }

    const verifyToken = async () => {
      try {
        const response = await api.verifyToken(storedToken)
        if (response.success && response.data?.user) {
          setToken(storedToken)
          setUser(response.data.user)
          localStorage.setItem('user', JSON.stringify(response.data.user))
        } else {
          // Token is definitively invalid — clear auth
          clearAuth()
        }
      } catch (error) {
        // Network error — keep the cached auth state so user isn't logged out
        // They'll get 401s on actual API calls if the token is truly expired
        console.warn('Session verification failed (network issue), keeping cached auth:', error)
      } finally {
        setIsLoading(false)
      }
    }

    verifyToken()
  }, [])

  const clearAuth = useCallback(() => {
    sessionStorage.removeItem('token')
    sessionStorage.removeItem('invoice-draft')
    localStorage.removeItem('user')
    localStorage.removeItem('invoice-draft')
    setToken(null)
    setUser(null)
  }, [])

  const login = useCallback((newToken: string, userData: User) => {
    sessionStorage.setItem('token', newToken)
    localStorage.setItem('user', JSON.stringify(userData))
    setToken(newToken)
    setUser(userData)
  }, [])

  const logout = useCallback(async () => {
    try {
      if (token) {
        await fetch(`${import.meta.env.VITE_API_URL}/api/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }).catch(() => {}) // Ignore logout API errors
      }
    } finally {
      clearAuth()
      toast.success('Logged out successfully')
    }
  }, [token, clearAuth])

  const isAuthenticated = !!token && !!user

  // Session timeout — auto logout after inactivity
  useEffect(() => {
    if (!isAuthenticated) return

    let timeoutId: ReturnType<typeof setTimeout>

    const handleTimeout = async () => {
      await logout()
      toast.warning('Session expired. Please login again.')
      window.location.href = '/login'
    }

    const resetTimeout = () => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(handleTimeout, SESSION_TIMEOUT)
    }

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart']
    events.forEach(event => document.addEventListener(event, resetTimeout))
    resetTimeout()

    return () => {
      clearTimeout(timeoutId)
      events.forEach(event => document.removeEventListener(event, resetTimeout))
    }
  }, [isAuthenticated, logout])

  const value: AuthContextType = {
    user,
    token,
    login,
    logout,
    isAuthenticated,
    isLoading,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
