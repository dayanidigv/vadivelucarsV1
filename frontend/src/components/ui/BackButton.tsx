import { useNavigate } from 'react-router-dom'
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
  fallback = '/dashboard', 
  label = 'Back', 
  variant = 'outline',
  size = 'default',
  className = ''
}: BackButtonProps) {
  const navigate = useNavigate()

  const handleBack = () => {
    // Try to go back in history if possible, otherwise use fallback
    if (window.history.length > 1) {
      navigate(-1)
    } else {
      navigate(fallback)
    }
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
