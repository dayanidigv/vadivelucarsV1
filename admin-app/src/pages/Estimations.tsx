
import { EstimationList } from "@/components/estimation/EstimationList"
import { BackButton } from "@/components/ui/BackButton"

export default function Estimations() {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <BackButton fallback="/dashboard" />
            </div>
            <EstimationList />
        </div>
    )
}
