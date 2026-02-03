import { useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Button } from './button'

interface BackButtonProps {
  fallback?: string
  label?: string
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'destructive'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  className?: string
}

export function BackButton({
  fallback,
  label = 'Back',
  variant = 'outline',
  size = 'default',
  className = ''
}: BackButtonProps) {
  const navigate = useNavigate()
  const location = useLocation()

  const handleBack = () => {
    // 1. If web history exists (basic check), go back
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1)
      return
    }

    // 2. If explicit fallback provided, use it
    if (fallback) {
      navigate(fallback)
      return
    }

    // 3. Dynamic: Go "Up" one level based on URL
    const pathSegments = location.pathname.split('/').filter(Boolean)

    // If we are at root level e.g. /settings or /invoices, go to dashboard
    if (pathSegments.length <= 1) {
      navigate('/dashboard')
      return
    }

    // Otherwise pop the last segment e.g. /invoices/new -> /invoices
    const parentPath = `/${pathSegments.slice(0, -1).join('/')}`
    navigate(parentPath)
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleBack}
      className={className}
    >
      <ArrowLeft className="h-4 w-4 mr-2" />
      {label}
    </Button>
  )
}
