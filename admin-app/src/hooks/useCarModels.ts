import { useQuery } from "@tanstack/react-query"
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
