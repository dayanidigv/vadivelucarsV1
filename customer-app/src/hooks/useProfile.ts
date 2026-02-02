import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { api } from '../lib/api'

export function useProfile() {
  return useQuery({
    queryKey: ['profile'],
    queryFn: () => api.getProfile(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useUpdateProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: any) => api.updateProfile(data),
    onSuccess: (data) => {
      if (data.success) {
        toast.success(data.message || 'Profile updated successfully')
        queryClient.invalidateQueries({ queryKey: ['profile'] })
      } else {
        toast.error(data.message || 'Failed to update profile')
      }
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update profile')
    },
  })
}

export function useSendPhoneVerification() {
  return useMutation({
    mutationFn: (phone: string) => api.sendPhoneVerification(phone),
    onSuccess: (data) => {
      if (data.success) {
        toast.success(data.message || 'OTP sent successfully')
      } else {
        toast.error(data.message || 'Failed to send OTP')
      }
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to send OTP')
    },
  })
}
