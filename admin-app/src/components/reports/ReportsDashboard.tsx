import { useState, useEffect } from 'react'
import { TrendingUp, DollarSign, AlertCircle, Calendar, Download } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'

interface ReportData {
  monthlyRevenue: Array<{ month: string; revenue: number; invoices: number }>
  partsUsage: Array<{ name: string; quantity: number; revenue: number }>
  pendingPayments: Array<{ customer: string; amount: number; dueDate: string }>
  summary: {
    totalRevenue: number
    totalInvoices: number
    pendingAmount: number
    topPart: string
  }
}

export default function ReportsDashboard() {
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState('30days')
  const [activeReport, setActiveReport] = useState<'overview' | 'revenue' | 'parts' | 'payments'>('overview')

  useEffect(() => {
    fetchReportData()
  }, [dateRange])

  const fetchReportData = async () => {
    setLoading(true)
    try {
      // Mock data for now - would be actual API calls
      const mockData: ReportData = {
        monthlyRevenue: [
          { month: 'Jan', revenue: 150000, invoices: 8 },
          { month: 'Feb', revenue: 180000, invoices: 10 },
          { month: 'Mar', revenue: 165000, invoices: 9 }
        ],
        partsUsage: [
          { name: 'Engine Oil', quantity: 25, revenue: 12500 },
          { name: 'Oil Filter', quantity: 30, revenue: 9000 },
          { name: 'Brake Pads', quantity: 12, revenue: 18000 },
          { name: 'Air Filter', quantity: 18, revenue: 7200 }
        ],
        pendingPayments: [
          { customer: 'Ramesh Kumar', amount: 25000, dueDate: '2024-02-15' },
          { customer: 'Suresh Babu', amount: 15000, dueDate: '2024-02-18' },
          { customer: 'Mohan Reddy', amount: 35000, dueDate: '2024-02-20' }
        ],
        summary: {
          totalRevenue: 495000,
          totalInvoices: 27,
          pendingAmount: 75000,
          topPart: 'Engine Oil'
        }
      }

      setReportData(mockData)
    } catch (error) {
      console.error('Error fetching report data:', error)
      toast.error('Failed to load reports')
    } finally {
      setLoading(false)
    }
  }

  const exportReport = (type: string) => {
    toast.info(`Exporting ${type} report...`)
    // Would generate and download CSV/PDF
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (!reportData) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No Data Available</h3>
          <p className="text-muted-foreground">Unable to load report data</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Reports Dashboard</h2>
          <p className="text-muted-foreground">Business analytics and insights</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 days</SelectItem>
              <SelectItem value="30days">Last 30 days</SelectItem>
              <SelectItem value="90days">Last 90 days</SelectItem>
              <SelectItem value="1year">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => exportReport('full')}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">₹{reportData.summary.totalRevenue.toLocaleString('en-IN')}</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Invoices</p>
                <p className="text-2xl font-bold">{reportData.summary.totalInvoices}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Payments</p>
                <p className="text-2xl font-bold">₹{reportData.summary.pendingAmount.toLocaleString('en-IN')}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Top Part</p>
                <p className="text-lg font-bold">{reportData.summary.topPart}</p>
              </div>
              <Calendar className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Report Tabs */}
      <div className="flex gap-2 border-b">
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'revenue', label: 'Revenue' },
          { id: 'parts', label: 'Parts Usage' },
          { id: 'payments', label: 'Pending Payments' }
        ].map((tab) => (
          <Button
            key={tab.id}
            variant={activeReport === tab.id ? 'default' : 'ghost'}
            onClick={() => setActiveReport(tab.id as any)}
            className="rounded-b-none"
          >
            {tab.label}
          </Button>
        ))}
      </div>

      {/* Report Content */}
      {activeReport === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Revenue Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reportData.monthlyRevenue.map((item) => (
                  <div key={item.month} className="flex items-center justify-between">
                    <span className="font-medium">{item.month}</span>
                    <div className="text-right">
                      <div className="font-bold">₹{item.revenue.toLocaleString('en-IN')}</div>
                      <div className="text-sm text-muted-foreground">{item.invoices} invoices</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top Parts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reportData.partsUsage.slice(0, 5).map((part, index) => (
                  <div key={part.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{index + 1}</Badge>
                      <span className="font-medium">{part.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{part.quantity} units</div>
                      <div className="text-sm text-muted-foreground">₹{part.revenue.toLocaleString('en-IN')}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeReport === 'revenue' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Monthly Revenue Report
              <Button size="sm" onClick={() => exportReport('revenue')}>
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {reportData.monthlyRevenue.map((item) => (
                <div key={item.month} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{item.month} 2024</h4>
                      <p className="text-sm text-muted-foreground">{item.invoices} invoices generated</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">₹{item.revenue.toLocaleString('en-IN')}</div>
                      <div className="text-sm text-muted-foreground">
                        Avg: ₹{Math.round(item.revenue / item.invoices).toLocaleString('en-IN')} per invoice
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {activeReport === 'parts' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Parts Usage Report
              <Button size="sm" onClick={() => exportReport('parts')}>
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Part Name</th>
                    <th className="text-right p-2">Quantity Used</th>
                    <th className="text-right p-2">Revenue</th>
                    <th className="text-right p-2">Avg Price</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.partsUsage.map((part) => (
                    <tr key={part.name} className="border-b">
                      <td className="p-2 font-medium">{part.name}</td>
                      <td className="text-right p-2">{part.quantity}</td>
                      <td className="text-right p-2">₹{part.revenue.toLocaleString('en-IN')}</td>
                      <td className="text-right p-2">₹{Math.round(part.revenue / part.quantity).toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {activeReport === 'payments' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Pending Payments Report
              <Button size="sm" onClick={() => exportReport('payments')}>
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {reportData.pendingPayments.map((payment, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{payment.customer}</h4>
                      <p className="text-sm text-muted-foreground">Due: {new Date(payment.dueDate).toLocaleDateString('en-IN')}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-orange-600">₹{payment.amount.toLocaleString('en-IN')}</div>
                      <Button size="sm" variant="outline" className="mt-1">
                        Send Reminder
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              <div className="border-t pt-4">
                <div className="flex items-center justify-between font-bold">
                  <span>Total Pending Amount</span>
                  <span className="text-xl text-orange-600">₹{reportData.summary.pendingAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
