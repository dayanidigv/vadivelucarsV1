import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import type { CreatePartInput } from '@/types'

export function useParts(category?: string, page = 1) {
    return useQuery({
        queryKey: ['parts', category, page],
        queryFn: () => api.getParts(category, page),
    })
}

export function useSearchParts(query: string) {
    return useQuery({
        queryKey: ['parts', 'search', query],
        queryFn: () => api.searchParts(query),
        enabled: query.length > 0,
    })
}

export function useCreatePart() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: CreatePartInput) => api.createPart(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['parts'] })
        },
    })
}

export function useUpdatePart() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<CreatePartInput> }) => api.updatePart(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['parts'] })
        },
    })
}

export function useDeletePart() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: string) => api.deletePart(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['parts'] })
        },
    })
}
