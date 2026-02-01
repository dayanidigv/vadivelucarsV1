import { useParams } from "react-router-dom"
import { useInvoice } from "@/hooks/useInvoices"
import { Helmet } from "react-helmet-async"
import { PDFViewer } from "@react-pdf/renderer"
import InvoicePDF from "@/components/invoices/InvoicePDF"

export default function InvoicePrint() {
    const { id } = useParams()
    const { data: invoiceResult, isLoading } = useInvoice(id as string)
    const invoice = invoiceResult?.data

    if (isLoading) return <div className="p-8 text-center text-gray-500">Loading invoice...</div>
    if (!invoice) return <div className="p-8 text-center text-red-500">Invoice not found</div>

    return (
        <div className="h-screen w-full bg-slate-900">
            <Helmet>
                <title>Invoice #{invoice.id.substring(0, 6)} | Vadivelu Cars</title>
            </Helmet>

            <PDFViewer width="100%" height="100%" className="h-screen w-full border-none">
                <InvoicePDF invoice={invoice} />
            </PDFViewer>
        </div>
    )
}
