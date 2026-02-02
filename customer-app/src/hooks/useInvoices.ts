import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'

export function useCustomerInvoices() {
  return useQuery({
    queryKey: ['customer', 'invoices'],
    queryFn: () => api.getCustomerInvoices(),
  })
}

export function useCustomerInvoice(id: string) {
  return useQuery({
    queryKey: ['customer', 'invoices', id],
    queryFn: () => api.getCustomerInvoice(id),
    enabled: !!id,
  })
}

export function useInvoiceForPrint(id: string) {
  return useQuery({
    queryKey: ['invoices', id, 'print'],
    queryFn: () => api.getInvoiceForPrint(id),
    enabled: !!id,
  })
}
