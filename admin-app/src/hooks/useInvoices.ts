import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { z } from 'zod'
import { InvoiceSchema } from '../lib/schemas'
import { toast } from 'sonner'
import type { CreateInvoiceData } from '@/types'

export function useInvoices(page = 1, limit = 20) {
    return useQuery({
        queryKey: ['invoices', page, limit],
        queryFn: () => api.getInvoices(page, limit),
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
        mutationFn: (data: CreateInvoiceData) => {
            const validated = InvoiceSchema.parse(data)
            return api.createInvoice(validated as CreateInvoiceData)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['invoices'] })
            // Invalidate parts cache to refresh autosaved parts
            queryClient.invalidateQueries({ queryKey: ['parts'] })
        },
        onError: (error: Error) => {
            if (error instanceof z.ZodError) {
                toast.error(error.issues[0].message)
            } else {
                toast.error(error.message || 'Failed to create invoice')
            }
        }
    })
}

export function useUpdateInvoice() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<CreateInvoiceData> }) => {
            const validated = InvoiceSchema.partial().parse(data)
            return api.updateInvoice(id, validated as Partial<CreateInvoiceData>)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['invoices'] })
            // Invalidate parts cache to refresh autosaved parts
            queryClient.invalidateQueries({ queryKey: ['parts'] })
        },
        onError: (error: Error) => {
            if (error instanceof z.ZodError) {
                toast.error(error.issues[0].message)
            } else {
                toast.error(error.message || 'Failed to update invoice')
            }
        }
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
