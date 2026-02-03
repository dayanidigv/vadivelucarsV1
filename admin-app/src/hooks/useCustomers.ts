import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { z } from 'zod'
import { CustomerSchema } from '../lib/schemas'
import { toast } from 'sonner'
import type { CreateCustomerInput } from '@/types'

export function useCustomers(page = 1) {
    return useQuery({
        queryKey: ['customers', page],
        queryFn: () => api.getCustomers(page),
    })
}

export function useSearchCustomers(query: string) {
    return useQuery({
        queryKey: ['customers', 'search', query],
        queryFn: () => api.searchCustomers(query),
        enabled: query.length > 0,
    })
}

export function useCheckCustomerPhone() {
    return useMutation({
        mutationFn: (phone: string) => api.checkCustomerPhone(phone),
    })
}

export function useCreateCustomer() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: CreateCustomerInput) => {
            const validated = CustomerSchema.parse(data)
            return api.createCustomer(validated)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['customers'] })
        },
        onError: (error: Error) => {
            if (error instanceof z.ZodError) {
                toast.error(error.issues[0].message)
            } else {
                toast.error(error.message || 'Failed to create customer')
            }
        }
    })
}

export function useUpdateCustomer() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<CreateCustomerInput> }) => {
            const validated = CustomerSchema.partial().parse(data)
            return api.updateCustomer(id, validated)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['customers'] })
        },
        onError: (error: Error) => {
            if (error instanceof z.ZodError) {
                toast.error(error.issues[0].message)
            } else {
                toast.error(error.message || 'Failed to update customer')
            }
        }
    })
}

export function useDeleteCustomer() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: string) => api.deleteCustomer(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['customers'] })
        },
    })
}
