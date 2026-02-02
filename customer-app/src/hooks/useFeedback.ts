import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { api } from '../lib/api'

export function useFeedbackHistory() {
  return useQuery({
    queryKey: ['feedback', 'history'],
    queryFn: () => api.getFeedbackHistory(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

export function useSubmitFeedback() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: { rating: number; feedback_text?: string }) => 
      api.submitFeedback(data),
    onSuccess: (data) => {
      if (data.success) {
        toast.success(data.message || 'Thank you for your feedback!')
        queryClient.invalidateQueries({ queryKey: ['feedback', 'history'] })
      } else {
        toast.error(data.message || 'Failed to submit feedback')
      }
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to submit feedback')
    },
  })
}
