
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import type { CreateInvoiceData } from '../types'

export function useInvoices(page = 1) {
    return useQuery({
        queryKey: ['invoices', page],
        queryFn: () => api.getInvoices(page),
    })
}

export function useInvoice(id: string) {
    return useQuery({
        queryKey: ['invoices', id],
        queryFn: () => api.getInvoice(id),
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

export function useCustomerInvoice(id: string) {
    return useQuery({
        queryKey: ['customer', 'invoices', id],
        queryFn: () => api.getCustomerInvoice(id),
        enabled: !!id,
    })
}

export function useCustomerInvoices() {
    return useQuery({
        queryKey: ['customer', 'invoices'],
        queryFn: () => api.getCustomerInvoices(),
    })
}

export function useCreateInvoice() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: CreateInvoiceData) => api.createInvoice(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['invoices'] })
            // Invalidate parts cache to refresh autosaved parts
            queryClient.invalidateQueries({ queryKey: ['parts'] })
        },
    })
}

export function useUpdateInvoice() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) => api.updateInvoice(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['invoices'] })
            // Invalidate parts cache to refresh autosaved parts
            queryClient.invalidateQueries({ queryKey: ['parts'] })
        },
    })
}

export function useDeleteInvoice() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: string) => api.deleteInvoice(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['invoices'] })
        },
    })
}
