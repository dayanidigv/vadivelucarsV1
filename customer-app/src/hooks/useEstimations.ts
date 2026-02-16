import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'

export function useCustomerEstimations() {
  return useQuery({
    queryKey: ['customer', 'estimations'],
    queryFn: () => api.getCustomerEstimations(),
  })
}

export function useCustomerEstimation(id: string) {
  return useQuery({
    queryKey: ['customer', 'estimations', id],
    queryFn: () => api.getCustomerEstimation(id),
    enabled: !!id,
  })
}

export function useEstimationForPrint(id: string) {
  return useQuery({
    queryKey: ['estimations', id, 'print'],
    queryFn: () => api.getEstimationForPrint(id),
    enabled: !!id,
  })
}
