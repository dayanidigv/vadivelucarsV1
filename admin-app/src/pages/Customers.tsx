
import { CustomerList } from "@/components/customer/CustomerList"
import { BackButton } from "@/components/ui/BackButton"

export default function Customers() {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <BackButton fallback="/dashboard" />
            </div>
            <CustomerList />
        </div>
    )
}
