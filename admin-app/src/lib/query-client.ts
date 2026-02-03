import { QueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            retry: (failureCount, error: any) => {
                // Don't retry on 429 (rate limit)
                if (error && error.status === 429) return false
                return failureCount < 2
            },
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
            staleTime: 5 * 60 * 1000, // 5 minutes
        },
        mutations: {
            retry: false,
            onError: (error: any) => {
                if (error && error.status === 429) {
                    toast.error('Too many requests. Please wait.')
                }
            }
        }
    },
})
