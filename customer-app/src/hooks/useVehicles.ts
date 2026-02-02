import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { api } from '../lib/api'

export function useVehicles() {
  return useQuery({
    queryKey: ['vehicles'],
    queryFn: () => api.getVehicles(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useAddVehicle() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: any) => api.addVehicle(data),
    onSuccess: (data) => {
      if (data.success) {
        toast.success(data.message || 'Vehicle added successfully')
        queryClient.invalidateQueries({ queryKey: ['vehicles'] })
        queryClient.invalidateQueries({ queryKey: ['profile'] })
      } else {
        toast.error(data.message || 'Failed to add vehicle')
      }
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to add vehicle')
    },
  })
}

export function useUpdateVehicle() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      api.updateVehicle(id, data),
    onSuccess: (data) => {
      if (data.success) {
        toast.success(data.message || 'Vehicle updated successfully')
        queryClient.invalidateQueries({ queryKey: ['vehicles'] })
        queryClient.invalidateQueries({ queryKey: ['profile'] })
      } else {
        toast.error(data.message || 'Failed to update vehicle')
      }
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update vehicle')
    },
  })
}

export function useDeactivateVehicle() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => api.deactivateVehicle(id),
    onSuccess: (data) => {
      if (data.success) {
        toast.success(data.message || 'Vehicle deactivated successfully')
        queryClient.invalidateQueries({ queryKey: ['vehicles'] })
        queryClient.invalidateQueries({ queryKey: ['profile'] })
      } else {
        toast.error(data.message || 'Failed to deactivate vehicle')
      }
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to deactivate vehicle')
    },
  })
}

export function useReactivateVehicle() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => api.reactivateVehicle(id),
    onSuccess: (data) => {
      if (data.success) {
        toast.success(data.message || 'Vehicle reactivated successfully')
        queryClient.invalidateQueries({ queryKey: ['vehicles'] })
        queryClient.invalidateQueries({ queryKey: ['profile'] })
      } else {
        toast.error(data.message || 'Failed to reactivate vehicle')
      }
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to reactivate vehicle')
    },
  })
}
