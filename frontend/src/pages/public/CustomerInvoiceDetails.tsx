import { useParams, useNavigate } from "react-router-dom"
import { useCustomerInvoice } from "@/hooks/useInvoices"
import { Helmet } from "react-helmet-async"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Download, Calendar, Car, CreditCard, User } from "lucide-react"

export default function CustomerInvoiceDetails() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { data: invoiceResult, isLoading, error } = useCustomerInvoice(id as string)
    const invoice = invoiceResult?.data

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Loading invoice details...</p>
                </div>
            </div>
        )
    }

    if (error || !invoice) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="text-red-500 text-lg mb-4">Invoice not found</div>
                    <Button onClick={() => navigate('/dashboard')} variant="outline">
                        Back to Dashboard
                    </Button>
                </div>
            </div>
        )
    }

    const handlePrint = () => {
        window.open(`/invoices/${invoice.id}/print`, '_blank')
    }

    return (
        <div className="min-h-screen bg-gray-50 mt-20">
            <Helmet>
                <title>Invoice #{invoice.id.substring(0, 6)} | Vadivelu Cars</title>
            </Helmet>

            <div className="max-w-4xl mx-auto p-6">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <Button
                            variant="outline"
                            onClick={() => navigate('/dashboard')}
                            className="flex items-center gap-2"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to Dashboard
                        </Button>
                        <Button
                            onClick={handlePrint}
                            className="flex items-center gap-2"
                        >
                            <Download className="h-4 w-4" />
                            Print/Download
                        </Button>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 mb-2">
                                Invoice #{invoice.id.substring(0, 8)}
                            </h1>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Calendar className="h-4 w-4" />
                                {new Date(invoice.created_at).toLocaleDateString()}
                            </div>
                        </div>
                        <div className="text-right">
                            <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${invoice.payment_status === 'paid'
                                ? 'bg-green-100 text-green-800'
                                : invoice.payment_status === 'partial'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                {invoice.payment_status?.charAt(0).toUpperCase() + invoice.payment_status?.slice(1)}
                            </span>
                            <div className="text-2xl font-bold text-gray-900 mt-2">
                                ₹{invoice.grand_total?.toLocaleString() || '0'}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Customer & Vehicle Info */}
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <User className="h-5 w-5 text-gray-600" />
                            <h2 className="text-lg font-semibold">Customer Information</h2>
                        </div>
                        <div className="space-y-2 text-sm">
                            <div><strong>Name:</strong> {invoice.customer?.name}</div>
                            <div><strong>Phone:</strong> {invoice.customer?.phone}</div>
                            <div><strong>Email:</strong> {invoice.customer?.email}</div>
                            <div><strong>Address:</strong> {invoice.customer?.address}</div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Car className="h-5 w-5 text-gray-600" />
                            <h2 className="text-lg font-semibold">Vehicle Information</h2>
                        </div>
                        <div className="space-y-2 text-sm">
                            <div><strong>Vehicle Number:</strong> {invoice.vehicle?.vehicle_number}</div>
                            <div><strong>Make:</strong> {invoice.vehicle?.make}</div>
                            <div><strong>Model:</strong> {invoice.vehicle?.model}</div>
                            <div><strong>Year:</strong> {invoice.vehicle?.year}</div>
                        </div>
                    </div>
                </div>

                {/* Invoice Items */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <h2 className="text-lg font-semibold mb-4">Service Details</h2>
                    {invoice.items && invoice.items.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left py-2">Description</th>
                                        <th className="text-center py-2">Quantity</th>
                                        <th className="text-right py-2">Unit Price</th>
                                        <th className="text-right py-2">Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {invoice.items.map((item: any) => (
                                        <tr key={item.id} className="border-b">
                                            <td className="py-3">{item.description}</td>
                                            <td className="text-center py-3">{item.quantity}</td>
                                            <td className="text-right py-3">₹{item.rate?.toLocaleString()}</td>
                                            <td className="text-right py-3">₹{item.amount?.toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-gray-500">No service items found</p>
                    )}
                </div>

                {/* Payment Summary */}
                <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
                    <div className="flex items-center gap-2 mb-4">
                        <CreditCard className="h-5 w-5 text-gray-600" />
                        <h2 className="text-lg font-semibold">Payment Summary</h2>
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <span>Parts Total:</span>
                            <span>₹{invoice.parts_total?.toLocaleString() || '0'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Labor Total:</span>
                            <span>₹{invoice.labor_total?.toLocaleString() || '0'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Discount:</span>
                            <span>-₹{invoice.discount_amount?.toLocaleString() || '0'}</span>
                        </div>
                        <div className="flex justify-between font-bold text-lg border-t pt-2">
                            <span>Grand Total:</span>
                            <span>₹{invoice.grand_total?.toLocaleString() || '0'}</span>
                        </div>
                        <div className="flex justify-between text-green-600">
                            <span>Paid:</span>
                            <span>₹{invoice.paid_amount?.toLocaleString() || '0'}</span>
                        </div>
                        <div className="flex justify-between text-red-600 font-semibold">
                            <span>Balance:</span>
                            <span>₹{invoice.balance_amount?.toLocaleString() || '0'}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
