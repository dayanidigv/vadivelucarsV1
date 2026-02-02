import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { toast } from 'sonner'

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

  useEffect(() => {
    const initAuth = () => {
      try {
        const storedToken = localStorage.getItem('token')
        const storedUser = localStorage.getItem('user')

        if (storedToken && storedUser) {
          const userData = JSON.parse(storedUser)
          setToken(storedToken)
          setUser(userData)
        }
      } catch (error) {
        console.error('Error initializing auth:', error)
        // Clear corrupted data
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      } finally {
        setIsLoading(false)
      }
    }

    initAuth()
  }, [])

  const login = (newToken: string, userData: User) => {
    console.log('🔐 AuthContext.login called:', { 
      tokenLength: newToken.length, 
      userId: userData.id,
      username: userData.username 
    })
    
    localStorage.setItem('token', newToken)
    localStorage.setItem('user', JSON.stringify(userData))
    setToken(newToken)
    setUser(userData)
    
    console.log('✅ Token stored in localStorage')
    console.log('🔍 Verify token stored:', localStorage.getItem('token')?.substring(0, 20) + '...')
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
      // Always clear local storage even if API call fails
      localStorage.removeItem('token')
      localStorage.removeItem('user')
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
    isLoading
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
