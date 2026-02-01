
import { InvoiceList } from "@/components/invoice/InvoiceList"
import { BackButton } from "@/components/ui/BackButton"

export default function Invoices() {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <BackButton fallback="/dashboard" />
            </div>
            <InvoiceList />
        </div>
    )
}
