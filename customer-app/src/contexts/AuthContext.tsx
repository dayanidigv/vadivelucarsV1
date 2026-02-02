import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

// Helper function to format dates in IST (Indian Standard Time)
const formatISTDate = (date: string | Date, options?: Intl.DateTimeFormatOptions) => {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return dateObj.toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    ...options
  })
}

// Helper function to format dates in IST (date only)
const formatISTDateOnly = (date: string | Date) => {
  return formatISTDate(date, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

// Export IST helper functions for use in other components
export { formatISTDate, formatISTDateOnly }

interface Customer {
  id: string
  name: string
  phone: string
  email?: string
  address?: string
  vehicles?: any[]
  invoices?: any[]
}

interface AuthContextType {
  customer: Customer | null
  customerToken: string | null
  login: (token: string, customer: Customer) => void
  logout: () => void
  isAuthenticated: boolean
  isLoading: boolean
  tokenExpiresAt: number | null
  timeUntilExpiration: number | null
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

export default function AuthProvider({ children }: AuthProviderProps) {
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [customerToken, setCustomerToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [tokenExpiresAt, setTokenExpiresAt] = useState<number | null>(null)
  const [timeUntilExpiration, setTimeUntilExpiration] = useState<number | null>(null)

  // Session duration: 7 days in milliseconds (matches backend)
  const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000

  useEffect(() => {
    // Load auth state from localStorage on mount
    const startTime = performance.now()
    console.log('AuthContext: Starting localStorage load...')

    const token = localStorage.getItem('customerToken')
    const customerData = localStorage.getItem('customer')
    const expiresAt = localStorage.getItem('customerTokenExpiresAt')

    if (token && customerData && expiresAt) {
      const expirationTime = parseInt(expiresAt)
      const currentTime = Date.now()

      // Check if token is expired
      if (currentTime >= expirationTime) {
        console.log('AuthContext: Token expired, clearing localStorage')
        // Clear expired token data directly instead of calling logout()
        localStorage.removeItem('customerToken')
        localStorage.removeItem('customer')
        localStorage.removeItem('customerTokenExpiresAt')
        setCustomerToken(null)
        setCustomer(null)
        setTokenExpiresAt(null)
        setTimeUntilExpiration(null)
      } else {
        try {
          const customer = JSON.parse(customerData)
          setCustomerToken(token)
          setCustomer(customer)
          setTokenExpiresAt(expirationTime)

          // Calculate time until expiration
          const timeLeft = expirationTime - currentTime
          setTimeUntilExpiration(timeLeft)

          // Set up timer to check expiration
          const checkInterval = setInterval(() => {
            const now = Date.now()
            if (now >= expirationTime) {
              console.log('AuthContext: Token expired during session')
              // Clear expired token data directly
              localStorage.removeItem('customerToken')
              localStorage.removeItem('customer')
              localStorage.removeItem('customerTokenExpiresAt')
              setCustomerToken(null)
              setCustomer(null)
              setTokenExpiresAt(null)
              setTimeUntilExpiration(null)
              clearInterval(checkInterval)
            } else {
              setTimeUntilExpiration(expirationTime - now)
            }
          }, 60000) // Check every minute

          setIsLoading(false)
          const endTime = performance.now()
          console.log(`AuthContext: localStorage load completed in ${(endTime - startTime).toFixed(2)}ms`)

          return () => clearInterval(checkInterval)
        } catch (error) {
          console.error('Error parsing customer data:', error)
          // Clear corrupted data directly
          localStorage.removeItem('customerToken')
          localStorage.removeItem('customer')
          localStorage.removeItem('customerTokenExpiresAt')
          setCustomerToken(null)
          setCustomer(null)
          setTokenExpiresAt(null)
          setTimeUntilExpiration(null)
          setIsLoading(false)
        }
      }
    } else if (token && customerData) {
      // Legacy case: no expiration time stored, set it now
      try {
        const customer = JSON.parse(customerData)
        const newExpirationTime = Date.now() + SESSION_DURATION

        setCustomerToken(token)
        setCustomer(customer)
        setTokenExpiresAt(newExpirationTime)
        localStorage.setItem('customerTokenExpiresAt', newExpirationTime.toString())

        const timeLeft = newExpirationTime - Date.now()
        setTimeUntilExpiration(timeLeft)
      } catch (error) {
        console.error('Error parsing customer data:', error)
        // Clear corrupted data directly
        localStorage.removeItem('customerToken')
        localStorage.removeItem('customer')
        setCustomerToken(null)
        setCustomer(null)
        setTokenExpiresAt(null)
        setTimeUntilExpiration(null)
      }
      setIsLoading(false)
    } else {
      // No token found
      setIsLoading(false)
    }
  }, [])

  const login = (token: string, customer: Customer) => {
    const expirationTime = Date.now() + SESSION_DURATION

    setCustomerToken(token)
    setCustomer(customer)
    setTokenExpiresAt(expirationTime)
    setTimeUntilExpiration(SESSION_DURATION)
    setIsLoading(false)

    localStorage.setItem('customerToken', token)
    localStorage.setItem('customer', JSON.stringify(customer))
    localStorage.setItem('customerTokenExpiresAt', expirationTime.toString())

    console.log('AuthContext: User logged in, token expires at:', formatISTDate(new Date(expirationTime)))
  }

  const logout = () => {
    setCustomerToken(null)
    setCustomer(null)
    setTokenExpiresAt(null)
    setTimeUntilExpiration(null)
    localStorage.removeItem('customerToken')
    localStorage.removeItem('customer')
    localStorage.removeItem('customerTokenExpiresAt')

    console.log('AuthContext: User logged out')
  }

  // Listen for unauthorized events from API
  useEffect(() => {
    const handleUnauthorized = () => {
      console.log('AuthContext: Received unauthorized event, logging out...')
      logout()
    }

    window.addEventListener('customer:auth:unauthorized', handleUnauthorized)

    return () => {
      window.removeEventListener('customer:auth:unauthorized', handleUnauthorized)
    }
  }, [logout])

  const value: AuthContextType = {
    customer,
    customerToken,
    login,
    logout,
    isAuthenticated: !!customerToken && !!customer && !!tokenExpiresAt && Date.now() < tokenExpiresAt,
    isLoading,
    tokenExpiresAt,
    timeUntilExpiration
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
