import { useParams } from "react-router-dom"
import { useEstimationForPrint } from "@/hooks/useEstimations"
import { Helmet } from "react-helmet-async"
import { PDFViewer } from "@react-pdf/renderer"
import EstimationPDF from "@/components/estimation/EstimationPDF"

export default function EstimationPrint() {
    const { id } = useParams()
    const { data: estimationResult, isLoading } = useEstimationForPrint(id as string)
    const estimation = estimationResult?.data

    if (isLoading) return <div className="p-8 text-center text-gray-500">Loading estimation...</div>
    if (!estimation) return <div className="p-8 text-center text-red-500">Estimation not found</div>

    return (
        <div className="h-screen w-full bg-slate-900">
            <Helmet>
                <title>Estimation {estimation.estimation_number} | Vadivelu Cars</title>
            </Helmet>

            <PDFViewer width="100%" height="100%" className="h-screen w-full border-none">
                <EstimationPDF estimation={estimation} />
            </PDFViewer>
        </div>
    )
}
