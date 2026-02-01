
import { PartList } from "@/components/parts/PartList"
import { BackButton } from "@/components/ui/BackButton"

export default function Parts() {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <BackButton fallback="/dashboard" />
            </div>
            <PartList />
        </div>
    )
}
