import { useParams } from "react-router-dom"
import { useInvoiceForPrint } from "@/hooks/useInvoices"
import { Helmet } from "react-helmet-async"
import { PDFViewer, pdf } from "@react-pdf/renderer"
import InvoicePDF from "@/components/invoices/InvoicePDF"
import { useEffect, useState, useMemo } from "react"
import { Download, Loader2, FileText, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"

function useIsMobile() {
    return useMemo(() => {
        if (typeof navigator === 'undefined') return false
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
            || (navigator.maxTouchPoints > 0 && window.innerWidth < 1024)
    }, [])
}

function MobilePDFView({ invoice }: { invoice: any }) {
    const [blobUrl, setBlobUrl] = useState<string | null>(null)
    const [isGenerating, setIsGenerating] = useState(true)

    useEffect(() => {
        let cancelled = false
        const generate = async () => {
            try {
                const blob = await pdf(<InvoicePDF invoice={invoice} />).toBlob()
                if (cancelled) return
                const url = URL.createObjectURL(blob)
                setBlobUrl(url)
            } catch (err) {
                console.error('PDF generation failed:', err)
            } finally {
                if (!cancelled) setIsGenerating(false)
            }
        }
        generate()
        return () => {
            cancelled = true
            if (blobUrl) URL.revokeObjectURL(blobUrl)
        }
    }, [invoice])

    const handleDownload = () => {
        if (!blobUrl) return
        const link = document.createElement('a')
        link.href = blobUrl
        link.download = `Invoice-${invoice.invoice_number}.pdf`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    const handleOpen = () => {
        if (!blobUrl) return
        window.open(blobUrl, '_blank')
    }

    const handleShare = async () => {
        if (!blobUrl) return
        try {
            const response = await fetch(blobUrl)
            const blob = await response.blob()
            const file = new File([blob], `Invoice-${invoice.invoice_number}.pdf`, { type: 'application/pdf' })
            if (navigator.share && navigator.canShare({ files: [file] })) {
                await navigator.share({ files: [file], title: `Invoice ${invoice.invoice_number}` })
            } else {
                handleDownload()
            }
        } catch {
            handleDownload()
        }
    }

    if (isGenerating) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-white gap-4">
                <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
                <p className="text-gray-600 font-medium">Generating PDF...</p>
            </div>
        )
    }

    if (!blobUrl) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-white gap-4">
                <p className="text-red-500">Failed to generate PDF</p>
            </div>
        )
    }

    return (
        <div className="flex flex-col h-screen bg-gray-100">
            {/* Top bar with actions */}
            <div className="bg-white border-b px-4 py-3 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <span className="font-semibold text-sm text-gray-900">
                        {invoice.invoice_number}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" onClick={handleShare}>
                        <Share2 className="h-4 w-4 mr-1" />
                        Share
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleOpen}>
                        Open
                    </Button>
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={handleDownload}>
                        <Download className="h-4 w-4 mr-1" />
                        Download
                    </Button>
                </div>
            </div>
            {/* PDF preview via embed */}
            <div className="flex-1">
                <iframe src={blobUrl} className="w-full h-full border-none" title="PDF Preview" />
            </div>
        </div>
    )
}

export default function InvoicePrint() {
    const { id } = useParams()
    const { data: invoiceResult, isLoading, error } = useInvoiceForPrint(id as string)
    const invoice = invoiceResult?.data
    const isMobile = useIsMobile()

    if (isLoading) return <div className="p-8 text-center text-gray-500">Loading invoice...</div>
    if (error) return <div className="p-8 text-center text-red-500">Error loading invoice: {error instanceof Error ? error.message : 'An unexpected error occurred'}</div>
    if (!invoice) return <div className="p-8 text-center text-red-500">Invoice not found</div>

    if (isMobile) {
        return (
            <>
                <Helmet>
                    <title>Invoice {invoice.invoice_number} | Vadivelu Cars</title>
                </Helmet>
                <MobilePDFView invoice={invoice} />
            </>
        )
    }

    return (
        <div className="h-screen w-full bg-slate-900">
            <Helmet>
                <title>Invoice {invoice.invoice_number} | Vadivelu Cars</title>
            </Helmet>

            <PDFViewer width="100%" height="100%" className="h-screen w-full border-none">
                <InvoicePDF invoice={invoice} />
            </PDFViewer>
        </div>
    )
}
