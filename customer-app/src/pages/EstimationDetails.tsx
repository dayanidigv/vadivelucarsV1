import { useParams, useNavigate } from 'react-router-dom'
import { useCustomerEstimation } from '../hooks/useEstimations'
import { Helmet } from 'react-helmet-async'
import { ArrowLeft, Calendar, Car, User, ClipboardList } from 'lucide-react'
import { formatISTDateOnly } from '../contexts/AuthContext'

const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
  draft: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Draft' },
  sent: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Sent' },
  accepted: { bg: 'bg-green-100', text: 'text-green-800', label: 'Accepted' },
  rejected: { bg: 'bg-red-100', text: 'text-red-800', label: 'Rejected' },
  converted: { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Converted' },
}

export default function EstimationDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data: estimationResult, isLoading, error } = useCustomerEstimation(id as string)
  const estimation = estimationResult?.data

  const formatCurrency = (amount: any) => {
    const numAmount = Number(amount)
    if (isNaN(numAmount) || numAmount <= 0) return '₹0'
    return `₹${numAmount.toLocaleString('en-IN')}`
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading estimation details...</p>
        </div>
      </div>
    )
  }

  if (error || !estimation) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-lg mb-4">Estimation not found</div>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  const status = statusConfig[estimation.status] || statusConfig.draft

  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>Estimation {estimation.estimation_number} | Vadivelu Cars</title>
      </Helmet>

      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <ClipboardList className="h-5 w-5 text-blue-600" />
                <h1 className="text-2xl font-bold text-gray-900">
                  {estimation.estimation_number}
                </h1>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="h-4 w-4" />
                {formatISTDateOnly(estimation.estimation_date || estimation.created_at)}
              </div>
              {estimation.valid_until && (
                <div className="text-xs text-gray-500 mt-1">
                  Valid until: {new Date(estimation.valid_until).toLocaleDateString('en-IN')}
                </div>
              )}
            </div>
            <div className="text-right">
              <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${status.bg} ${status.text}`}>
                {status.label}
              </span>
              <div className="text-2xl font-bold text-gray-900 mt-2">
                {formatCurrency(estimation.grand_total)}
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
              <div><strong>Name:</strong> {estimation.customer?.name || 'N/A'}</div>
              <div><strong>Phone:</strong> {estimation.customer?.phone || 'N/A'}</div>
              <div><strong>Email:</strong> {estimation.customer?.email || 'N/A'}</div>
              <div><strong>Address:</strong> {estimation.customer?.address || 'N/A'}</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <Car className="h-5 w-5 text-gray-600" />
              <h2 className="text-lg font-semibold">Vehicle Information</h2>
            </div>
            <div className="space-y-2 text-sm">
              <div><strong>Vehicle Number:</strong> {estimation.vehicle?.vehicle_number || 'N/A'}</div>
              <div><strong>Make:</strong> {estimation.vehicle?.make || 'N/A'}</div>
              <div><strong>Model:</strong> {estimation.vehicle?.model || 'N/A'}</div>
              <div><strong>Year:</strong> {estimation.vehicle?.year || 'N/A'}</div>
            </div>
          </div>
        </div>

        {/* Estimation Items */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Estimation Items</h2>
          {estimation.items && estimation.items.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Part No.</th>
                    <th className="text-left py-2">Description</th>
                    <th className="text-center py-2">Qty</th>
                    <th className="text-right py-2">Unit Price</th>
                    <th className="text-right py-2">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {estimation.items.map((item: any, index: number) => (
                    <tr key={item.id || index} className="border-b">
                      <td className="py-3 text-gray-500 text-sm">{item.part_number || '-'}</td>
                      <td className="py-3">{item.description || 'Item'}</td>
                      <td className="text-center py-3">{item.quantity}</td>
                      <td className="text-right py-3">{formatCurrency(item.rate)}</td>
                      <td className="text-right py-3">{formatCurrency(item.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No items found in this estimation.
            </div>
          )}
        </div>

        {/* Summary */}
        <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
          <h2 className="text-lg font-semibold mb-4">Summary</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Parts Total:</span>
              <span>{formatCurrency(estimation.parts_total)}</span>
            </div>
            <div className="flex justify-between">
              <span>Labor Total:</span>
              <span>{formatCurrency(estimation.labor_total)}</span>
            </div>
            {Number(estimation.discount_amount) > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount:</span>
                <span>-{formatCurrency(estimation.discount_amount)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-lg border-t pt-2">
              <span>Grand Total:</span>
              <span>{formatCurrency(estimation.grand_total)}</span>
            </div>
          </div>
          {estimation.validity_period && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm text-blue-800">
              This estimation is valid for {estimation.validity_period} days from the date of issue.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
