import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useCustomerInvoices } from '../hooks/useInvoices'
import { Helmet } from 'react-helmet-async'
import { Car, FileText, DollarSign, User, LogOut, Calendar } from 'lucide-react'
import { formatISTDateOnly } from '../contexts/AuthContext'

export default function Dashboard() {
  const { customer, logout } = useAuth()
  const navigate = useNavigate()
  const { data: invoicesData, isLoading } = useCustomerInvoices()
  const invoices = invoicesData?.data || []

  // Debug: Log the invoice data structure
  console.log('Dashboard - Invoices data:', invoicesData)
  console.log('Dashboard - First invoice:', invoices[0])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  // Helper function to get amount with fallbacks
  const getAmount = (inv: any) => {
    return inv.grand_total || inv.total_amount || inv.amount || inv.total || 0
  }

  const calculateStats = () => {
    const totalVehicles = customer?.vehicles?.length || 0
    const totalInvoices = invoices.length
    const paidInvoices = invoices.filter((inv: any) => inv.payment_status === 'paid').length
    const totalSpent = invoices
      .filter((inv: any) => inv.payment_status === 'paid' || inv.payment_status === 'partial')
      .reduce((sum: number, inv: any) => {
        // Try different possible field names for the amount
        const amount = getAmount(inv)
        console.log(`Invoice ${inv.id}: amount = ${amount}`)
        return sum + (amount || 0)
      }, 0)

    return { totalVehicles, totalInvoices, paidInvoices, totalSpent }
  }

  const stats = calculateStats()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>Dashboard | Vadivelu Cars</title>
        <meta name="description" content="View your vehicle service history and invoices with Vadivelu Cars." />
      </Helmet>

      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Car className="w-8 h-8 text-blue-600 mr-3" />
              <h1 className="text-xl font-bold text-gray-900">Vadivelu Cars</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{customer?.name}</p>
                <p className="text-xs text-gray-500">{customer?.phone}</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome back, {customer?.name}! 👋
          </h2>
          <p className="text-gray-600">
            Here's an overview of your vehicles and service history.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-full">
                <Car className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Vehicles</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalVehicles}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-full">
                <FileText className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Invoices</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalInvoices}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-full">
                <DollarSign className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Spent</p>
                <p className="text-2xl font-bold text-gray-900">₹{stats.totalSpent.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-full">
                <User className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Profile</p>
                <button
                  onClick={() => navigate('/profile')}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  View Details
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Invoices */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Recent Service History</h3>
          </div>
          <div className="p-6">
            {invoices.length > 0 ? (
              <div className="space-y-4">
                {invoices.slice(0, 5).map((invoice: any) => (
                  <div key={invoice.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h4 className="font-medium text-gray-900">
                          #{invoice.id.substring(0, 8).toUpperCase()}
                        </h4>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          invoice.payment_status === 'paid' 
                            ? 'bg-green-100 text-green-800'
                            : invoice.payment_status === 'partial'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {invoice.payment_status}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatISTDateOnly(invoice.created_at)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Car className="w-4 h-4" />
                          {invoice.vehicle?.vehicle_number || 'N/A'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-bold text-gray-900">
                          ₹{getAmount(invoice)?.toLocaleString()}
                        </p>
                      </div>
                      <button
                        onClick={() => navigate(`/invoices/${invoice.id}`)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
                {invoices.length > 5 && (
                  <div className="text-center mt-4">
                    <button
                      onClick={() => navigate('/invoices')}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      View all invoices →
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No service history found</p>
                <p className="text-sm text-gray-500 mt-2">
                  Your service records will appear here once you have your vehicle serviced with us.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
