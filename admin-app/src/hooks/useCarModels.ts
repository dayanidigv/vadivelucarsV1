import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "../lib/api"
import type { CarModel } from "@/types"

export function useCarModels() {
    return useQuery<CarModel[]>({
        queryKey: ["car-models"],
        queryFn: async () => {
            const res = await api.getCarModels()
            return res.data || []
        }
    })
}

export function useCreateCarModel() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: { make: string, model: string, type?: string }) =>
            api.createCarModel(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["car-models"] })
        }
    })
}
