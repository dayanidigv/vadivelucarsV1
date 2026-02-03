import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import type { ReactNode } from 'react'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import { encryptData } from '@/lib/crypto'

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
  verifySession: () => Promise<User | null>
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
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const verifySession = useCallback(async () => {
    // Try sessionStorage for high security, fallback to localStorage if needed during migration
    const storedToken = sessionStorage.getItem('token') || localStorage.getItem('token')

    if (!storedToken) {
      setToken(null)
      setUser(null)
      return null
    }

    try {
      const response = await api.verifyToken(storedToken)
      if (response.success && response.data?.user) {
        setToken(storedToken)
        setUser(response.data.user)

        // Ensure token is in sessionStorage for future use
        sessionStorage.setItem('token', storedToken)
        // Cleanup localStorage token if it was there
        localStorage.removeItem('token')

        // Store encrypted user data
        const encryptedUser = await encryptData(JSON.stringify(response.data.user))
        localStorage.setItem('user', encryptedUser)

        return response.data.user
      }
    } catch (error) {
      console.error('Session verification failed:', error)
      sessionStorage.removeItem('token')
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      setToken(null)
      setUser(null)
    }
    return null
  }, [])

  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true)
      await verifySession()
      setIsLoading(false)
    }

    initAuth()
  }, [verifySession])

  const login = async (newToken: string, userData: User) => {
    // console.log('🔐 AuthContext.login called:', {
    //   tokenLength: newToken.length,
    //   userId: userData.id,
    //   username: userData.username
    // })

    // Store token in sessionStorage (not accessible across different tabs/windows)
    sessionStorage.setItem('token', newToken)
    // Clear old token if any
    localStorage.removeItem('token')

    // Encrypt user data before storing in localStorage
    const encryptedUser = await encryptData(JSON.stringify(userData))
    localStorage.setItem('user', encryptedUser)

    setToken(newToken)
    setUser(userData)

    console.log('✅ Token stored in sessionStorage & Encrypted user data in localStorage')
  }

  const logout = async () => {
    try {
      if (token) {
        // Call logout API to invalidate session
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://vadivelucars.dayanidigv954.workers.dev'}/api/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

        if (!response.ok) {
          console.error('Logout API call failed:', response.statusText)
        }
      }
    } catch (error) {
      console.error('Error during logout:', error)
    } finally {
      // Always clear storage even if API call fails
      sessionStorage.removeItem('token')
      sessionStorage.removeItem('invoice-draft')
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      localStorage.removeItem('invoice-draft')
      setToken(null)
      setUser(null)
      toast.success('Logged out successfully')
      // Note: Navigation will be handled by the component that calls logout
    }
  }

  const isAuthenticated = !!token && !!user

  const value: AuthContextType = {
    user,
    token,
    login,
    logout,
    isAuthenticated,
    isLoading,
    verifySession
  }

  // Session timeout implementation
  useEffect(() => {
    if (!isAuthenticated) return

    let timeoutId: number

    const handleLogout = async () => {
      await logout()
      toast.warning('Session expired. Please login again.')
      window.location.href = '/login'
    }

    const resetTimeout = () => {
      if (timeoutId) clearTimeout(timeoutId)
      timeoutId = setTimeout(handleLogout, SESSION_TIMEOUT)
    }

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart']
    const resetOnActivity = () => resetTimeout()

    events.forEach(event => {
      document.addEventListener(event, resetOnActivity)
    })

    resetTimeout()

    return () => {
      if (timeoutId) clearTimeout(timeoutId)
      events.forEach(event => {
        document.removeEventListener(event, resetOnActivity)
      })
    }
  }, [isAuthenticated, logout])

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
