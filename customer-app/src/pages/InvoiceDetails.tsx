import { useParams, useNavigate } from 'react-router-dom'
import { useCustomerInvoice } from '../hooks/useInvoices'
import { Helmet } from 'react-helmet-async'
import { ArrowLeft, Calendar, Car, CreditCard, User } from 'lucide-react'
import { formatISTDateOnly } from '../contexts/AuthContext'

export default function InvoiceDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data: invoiceResult, isLoading, error } = useCustomerInvoice(id as string)
  const invoice = invoiceResult?.data

  // Debug: Log the invoice data structure
  console.log('InvoiceDetails - Invoice data:', invoiceResult)
  console.log('InvoiceDetails - Invoice:', invoice)
  
  // Helper function to get invoice total
  const getInvoiceTotal = (inv: any) => {
    if (!inv) return 0
    
    // Try different possible total fields
    const possibleTotals = [
      inv.grand_total,
      inv.total_amount, 
      inv.total,
      inv.amount,
      inv.final_amount,
      inv.net_amount
    ]
    
    for (const total of possibleTotals) {
      const numTotal = Number(total)
      if (!isNaN(numTotal) && numTotal > 0) {
        return numTotal
      }
    }
    
    // If no total found, try to calculate from items
    if (inv.invoice_items && inv.invoice_items.length > 0) {
      const calculatedTotal = inv.invoice_items.reduce((sum: number, item: any) => {
        const itemTotal = Number(item.total || item.line_total || item.amount || 0)
        return sum + itemTotal
      }, 0)
      return calculatedTotal
    }
    
    if (inv.items && inv.items.length > 0) {
      const calculatedTotal = inv.items.reduce((sum: number, item: any) => {
        const itemTotal = Number(item.total || item.line_total || item.amount || 0)
        return sum + itemTotal
      }, 0)
      return calculatedTotal
    }
    
    return 0
  }
  
  if (invoice) {
    console.log('InvoiceDetails - Invoice total fields:', {
      grand_total: invoice.grand_total,
      total_amount: invoice.total_amount,
      total: invoice.total,
      amount: invoice.amount,
      final_amount: invoice.final_amount,
      net_amount: invoice.net_amount
    })
    console.log('InvoiceDetails - Calculated total:', getInvoiceTotal(invoice))
    console.log('InvoiceDetails - Invoice items:', invoice.invoice_items)
    console.log('InvoiceDetails - First item structure:', invoice.invoice_items?.[0])
  }

  // Helper function to format currency safely
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>Invoice #{invoice.id.substring(0, 6)} | Vadivelu Cars</title>
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
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Invoice #{invoice.id.substring(0, 8)}
              </h1>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="h-4 w-4" />
                {formatISTDateOnly(invoice.created_at)}
              </div>
            </div>
            <div className="text-right">
              <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                invoice.status === 'paid' 
                  ? 'bg-green-100 text-green-800'
                  : invoice.status === 'partial'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {invoice.status?.charAt(0).toUpperCase() + invoice.status?.slice(1)}
              </span>
              <div className="text-2xl font-bold text-gray-900 mt-2">
                {formatCurrency(getInvoiceTotal(invoice))}
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
              <div><strong>Name:</strong> {invoice.customer?.name || 'N/A'}</div>
              <div><strong>Phone:</strong> {invoice.customer?.phone || 'N/A'}</div>
              <div><strong>Email:</strong> {invoice.customer?.email || 'N/A'}</div>
              <div><strong>Address:</strong> {invoice.customer?.address || 'N/A'}</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <Car className="h-5 w-5 text-gray-600" />
              <h2 className="text-lg font-semibold">Vehicle Information</h2>
            </div>
            <div className="space-y-2 text-sm">
              <div><strong>Vehicle Number:</strong> {invoice.vehicle?.vehicle_number || invoice.vehicle_number || 'N/A'}</div>
              <div><strong>Make:</strong> {invoice.vehicle?.make || invoice.vehicle_make || 'N/A'}</div>
              <div><strong>Model:</strong> {invoice.vehicle?.model || invoice.vehicle_model || 'N/A'}</div>
              <div><strong>Year:</strong> {invoice.vehicle?.year || invoice.vehicle_year || 'N/A'}</div>
            </div>
          </div>
        </div>

        {/* Invoice Items */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Service Details</h2>
          {invoice.invoice_items && invoice.invoice_items.length > 0 ? (
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
                  {invoice.invoice_items.map((item: any, index: number) => {
                    // Debug log for each item
                    console.log(`InvoiceDetails - Item ${index}:`, {
                      item,
                      unit_price: item.unit_price,
                      price: item.price,
                      rate: item.rate,
                      total: item.total,
                      line_total: item.line_total,
                      amount: item.amount
                    })
                    
                    // Try multiple field names for unit price
                    const unitPrice = item.unit_price || item.price || item.rate || item.unit_rate || 0
                    // Try multiple field names for total
                    const itemTotal = item.total || item.line_total || item.amount || item.line_amount || 0
                    // Try multiple field names for quantity
                    const quantity = item.quantity || item.qty || item.units || 1
                    
                    return (
                      <tr key={item.id || index} className="border-b">
                        <td className="py-3">{item.description || item.item_description || item.name || 'Service Item'}</td>
                        <td className="text-center py-3">{quantity}</td>
                        <td className="text-right py-3">{formatCurrency(unitPrice)}</td>
                        <td className="text-right py-3">{formatCurrency(itemTotal)}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ) : invoice.items && invoice.items.length > 0 ? (
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
                  {invoice.items.map((item: any, index: number) => {
                    // Debug log for each item
                    console.log(`InvoiceDetails - Alternative Item ${index}:`, {
                      item,
                      unit_price: item.unit_price,
                      price: item.price,
                      rate: item.rate,
                      total: item.total,
                      line_total: item.line_total,
                      amount: item.amount
                    })
                    
                    // Try multiple field names for unit price
                    const unitPrice = item.unit_price || item.price || item.rate || item.unit_rate || 0
                    // Try multiple field names for total
                    const itemTotal = item.total || item.line_total || item.amount || item.line_amount || 0
                    // Try multiple field names for quantity
                    const quantity = item.quantity || item.qty || item.units || 1
                    
                    return (
                      <tr key={item.id || index} className="border-b">
                        <td className="py-3">{item.description || item.item_description || item.name || 'Service Item'}</td>
                        <td className="text-center py-3">{quantity}</td>
                        <td className="text-right py-3">{formatCurrency(unitPrice)}</td>
                        <td className="text-right py-3">{formatCurrency(itemTotal)}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-gray-500 mb-2">No detailed service items found</div>
              <div className="text-sm text-gray-400">
                This might be a summary invoice. Please contact support for detailed service breakdown.
              </div>
            </div>
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
              <span>Subtotal:</span>
              <span>{formatCurrency(invoice.subtotal || invoice.sub_total || 0)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax:</span>
              <span>{formatCurrency(invoice.tax_amount || invoice.tax || 0)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg border-t pt-2">
              <span>Total Amount:</span>
              <span>{formatCurrency(getInvoiceTotal(invoice))}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
