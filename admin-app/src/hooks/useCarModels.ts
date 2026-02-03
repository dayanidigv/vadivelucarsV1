import { useQuery } from "@tanstack/react-query"
import { api } from "../lib/api"

export interface CarModel {
    id: string
    make: string
    model: string
    type: string
}

export function useCarModels() {
    return useQuery({
        queryKey: ["car-models"],
        queryFn: async () => {
            const res = await api.getCarModels()
            return res.data
        }
    })
}
