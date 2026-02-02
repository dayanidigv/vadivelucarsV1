import { Suspense, lazy } from 'react'
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver'

interface LazyLoadProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  rootMargin?: string
  threshold?: number
}

export function LazyLoad({ 
  children, 
  fallback = <div className="h-32 animate-pulse bg-muted rounded-lg" />,
  rootMargin = '50px',
  threshold = 0.1
}: LazyLoadProps) {
  const { targetRef, isIntersecting } = useIntersectionObserver({
    rootMargin,
    threshold
  })

  return (
    <div ref={targetRef}>
      {isIntersecting ? (
        <Suspense fallback={fallback}>
          {children}
        </Suspense>
      ) : (
        fallback
      )}
    </div>
  )
}

// For lazy loading heavy components
export function createLazyComponent<T extends React.ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  fallback?: React.ReactNode
) {
  const LazyComponent = lazy(importFunc)
  
  return function LazyWrapper(props: React.ComponentProps<T>) {
    return (
      <Suspense fallback={fallback || <div>Loading...</div>}>
        <LazyComponent {...props} />
      </Suspense>
    )
  }
}
