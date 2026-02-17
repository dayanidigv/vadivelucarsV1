import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { z } from 'zod'
import { EstimationSchema } from '../lib/schemas'
import { toast } from 'sonner'
import type { CreateEstimationData } from '@/types'

export function useEstimations(page = 1, limit = 20, status?: string) {
    return useQuery({
        queryKey: ['estimations', page, limit, status],
        queryFn: () => api.getEstimations(page, limit, status),
    })
}

export function useEstimation(id: string) {
    return useQuery({
        queryKey: ['estimations', id],
        queryFn: () => api.getEstimation(id),
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

export function useCreateEstimation() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: CreateEstimationData) => {
            const validated = EstimationSchema.parse(data)
            return api.createEstimation(validated as CreateEstimationData)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['estimations'] })
            queryClient.invalidateQueries({ queryKey: ['parts'] })
        },
        onError: (error: Error) => {
            if (error instanceof z.ZodError) {
                toast.error(error.issues[0].message)
            } else {
                toast.error(error.message || 'Failed to create estimation')
            }
        }
    })
}

export function useUpdateEstimation() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<CreateEstimationData> }) => {
            const validated = EstimationSchema.partial().parse(data)
            return api.updateEstimation(id, validated as Partial<CreateEstimationData>)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['estimations'] })
            queryClient.invalidateQueries({ queryKey: ['parts'] })
        },
        onError: (error: Error) => {
            if (error instanceof z.ZodError) {
                toast.error(error.issues[0].message)
            } else {
                toast.error(error.message || 'Failed to update estimation')
            }
        }
    })
}

export function useDeleteEstimation() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: string) => api.deleteEstimation(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['estimations'] })
            toast.success('Estimation deleted successfully')
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to delete estimation')
        }
    })
}

export function useUpdateEstimationStatus() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, status }: { id: string; status: string }) =>
            api.updateEstimationStatus(id, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['estimations'] })
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to update status')
        }
    })
}

export function useConvertToInvoice() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: string) => api.convertEstimationToInvoice(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['estimations'] })
            queryClient.invalidateQueries({ queryKey: ['invoices'] })
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to convert to invoice')
        }
    })
}
