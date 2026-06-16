import { useEffect, useState, useMemo } from "react"
import {
    AreaChart,
    Area,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
    DollarSign,
    CreditCard,
    Activity,
    Download,
    Search,
    Filter,
    Calendar,
    Wrench,
    Package,
    TrendingUp,
    Percent,
    Printer,
    Loader2
} from "lucide-react"
import { api } from "@/lib/api"
import { BackButton } from "@/components/ui/BackButton"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger
} from "@/components/ui/tabs"

const COLORS = ["#10b981", "#3b82f6", "#ef4444", "#f59e0b", "#8b5cf6"]

export default function Reports() {
    const [range, setRange] = useState("6m")
    const [startDate, setStartDate] = useState("")
    const [endDate, setEndDate] = useState("")
    const [reportData, setReportData] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    // Invoice Search and Filter states
    const [searchQuery, setSearchQuery] = useState("")
    const [statusFilter, setStatusFilter] = useState("all")
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 8

    // Item/Service breakdown Search and Filter states
    const [itemSearchQuery, setItemSearchQuery] = useState("")
    const [itemTypeFilter, setItemTypeFilter] = useState("all")
    const [itemCurrentPage, setItemCurrentPage] = useState(1)
    const itemsBreakdownPerPage = 8

    const [generatingPDF, setGeneratingPDF] = useState(false)
    const [trendView, setTrendView] = useState<"daily" | "monthly">("daily")

    const downloadPDFReport = async () => {
        if (!reportData) return
        setGeneratingPDF(true)
        try {
            const rangeLabels: Record<string, string> = {
                '30d': 'Last 30 Days',
                '90d': 'Last 90 Days',
                '6m': 'Last 6 Months',
                '12m': 'Last 12 Months',
                'ytd': 'Year to Date',
                'all': 'All Time',
                'custom': `Custom Range (${startDate} to ${endDate})`
            }
            const label = rangeLabels[range] || 'Report'

            const { pdf } = await import('@react-pdf/renderer')
            const ReportPDF = (await import('@/components/invoices/ReportPDF')).default

            const blob = await pdf(
                <ReportPDF
                    rangeLabel={label}
                    summary={summary}
                    monthly={monthlyData}
                    daily={reportData?.daily || []}
                    methodDistribution={methodDistribution}
                    itemBreakdown={itemBreakdown}
                    categoryBreakdown={reportData?.categoryBreakdown || []}
                    topCustomers={reportData?.topCustomers || []}
                    outstandingInvoices={reportData?.outstandingInvoices || []}
                    invoices={invoices}
                />
            ).toBlob()

            const url = URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.download = `financial_report_${range}_${new Date().toISOString().split('T')[0]}.pdf`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            URL.revokeObjectURL(url)
        } catch (error) {
            console.error('Failed to generate PDF report:', error)
        } finally {
            setGeneratingPDF(false)
        }
    }

    // Fetch reports data
    const fetchReports = async () => {
        setLoading(true)
        try {
            const params: any = {}
            if (range === "custom") {
                if (startDate) params.startDate = startDate
                if (endDate) params.endDate = endDate
            } else {
                params.range = range
            }
            const response = await api.getRevenueReports(params)
            if (response.success) {
                setReportData(response.data)
                setCurrentPage(1)
            }
        } catch (error) {
            console.error("Failed to fetch reports", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (range !== "custom") {
            fetchReports()
            if (range === "30d" || range === "90d") {
                setTrendView("daily")
            } else {
                setTrendView("monthly")
            }
        }
    }, [range])

    const handleApplyCustomDates = () => {
        if (startDate && endDate) {
            fetchReports()
            const diffDays = Math.ceil(Math.abs(new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24))
            if (diffDays <= 45) {
                setTrendView("daily")
            } else {
                setTrendView("monthly")
            }
        }
    }

    // Process summary values with fallbacks
    const summary = reportData?.summary || {
        totalRevenue: 0,
        totalCollected: 0,
        totalOutstanding: 0,
        totalParts: 0,
        totalLabor: 0,
        totalDiscounts: 0,
        count: 0,
        avgTicketSize: 0
    }

    const monthlyData = reportData?.monthly || []
    const statusDistribution = reportData?.paymentStatusDistribution || []
    const methodDistribution = reportData?.paymentMethodDistribution || []
    const invoices = reportData?.invoices || []

    // Collected vs Outstanding percentage for visual meters
    const collectedPercentage = useMemo(() => {
        if (summary.totalRevenue <= 0) return 0
        return Math.round((summary.totalCollected / summary.totalRevenue) * 100)
    }, [summary.totalCollected, summary.totalRevenue])

    const partsPercentage = useMemo(() => {
        const totalCost = summary.totalParts + summary.totalLabor
        if (totalCost <= 0) return 0
        return Math.round((summary.totalParts / totalCost) * 100)
    }, [summary.totalParts, summary.totalLabor])

    // Filtered Invoices
    const filteredInvoices = useMemo(() => {
        return invoices.filter((inv: any) => {
            const matchesSearch =
                inv.invoice_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                inv.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                inv.vehicle_number?.toLowerCase().includes(searchQuery.toLowerCase())
            
            const matchesStatus =
                statusFilter === "all" || inv.payment_status === statusFilter

            return matchesSearch && matchesStatus
        })
    }, [invoices, searchQuery, statusFilter])

    // Paginated Invoices
    const paginatedInvoices = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage
        return filteredInvoices.slice(startIndex, startIndex + itemsPerPage)
    }, [filteredInvoices, currentPage])

    const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage)

    const itemBreakdown = reportData?.itemBreakdown || []

    const filteredItems = useMemo(() => {
        return itemBreakdown.filter((item: any) => {
            const matchesSearch = item.description?.toLowerCase().includes(itemSearchQuery.toLowerCase())
            const matchesType = itemTypeFilter === "all" || item.item_type === itemTypeFilter
            return matchesSearch && matchesType
        })
    }, [itemBreakdown, itemSearchQuery, itemTypeFilter])

    const paginatedItems = useMemo(() => {
        const startIndex = (itemCurrentPage - 1) * itemsBreakdownPerPage
        return filteredItems.slice(startIndex, startIndex + itemsBreakdownPerPage)
    }, [filteredItems, itemCurrentPage])

    const totalItemPages = Math.ceil(filteredItems.length / itemsBreakdownPerPage)

    const exportItemsToCSV = () => {
        if (filteredItems.length === 0) return

        const headers = ["Description", "Type", "Times Sold", "Quantity Sold", "Revenue (₹)"]
        const rows = filteredItems.map((item: any) => [
            item.description,
            item.item_type,
            item.count,
            item.quantity,
            item.amount
        ])

        const csvContent =
            "data:text/csv;charset=utf-8," +
            [headers.join(","), ...rows.map((e: any) => e.map((val: any) => `"${val}"`).join(","))].join("\n")

        const encodedUri = encodeURI(csvContent)
        const link = document.createElement("a")
        link.setAttribute("href", encodedUri)
        link.setAttribute("download", `sales_breakdown_${range}_${new Date().toISOString().split('T')[0]}.csv`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    // Export Invoices list to CSV
    const exportToCSV = () => {
        if (filteredInvoices.length === 0) return

        const headers = [
            "Invoice Number",
            "Date",
            "Customer Name",
            "Customer Phone",
            "Vehicle Number",
            "Vehicle Model",
            "Parts Total (₹)",
            "Labor Total (₹)",
            "Discount Amount (₹)",
            "Grand Total (₹)",
            "Paid Amount (₹)",
            "Balance Amount (₹)",
            "Payment Status",
            "Payment Method"
        ]

        const rows = filteredInvoices.map((inv: any) => [
            inv.invoice_number,
            inv.invoice_date,
            inv.customer_name,
            inv.customer_phone,
            inv.vehicle_number,
            inv.vehicle_model,
            inv.parts_total,
            inv.labor_total,
            inv.discount_amount,
            inv.grand_total,
            inv.paid_amount,
            inv.balance_amount,
            inv.payment_status,
            inv.payment_method || "Unspecified"
        ])

        const csvContent =
            "data:text/csv;charset=utf-8," +
            [headers.join(","), ...rows.map((e: any) => e.map((val: any) => `"${val}"`).join(","))].join("\n")

        const encodedUri = encodeURI(csvContent)
        const link = document.createElement("a")
        link.setAttribute("href", encodedUri)
        link.setAttribute("download", `financial_report_${range}_${new Date().toISOString().split('T')[0]}.csv`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    return (
        <div className="space-y-8 p-1 sm:p-2">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <BackButton fallback="/dashboard" />
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                            Financial Analytics
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">
                            Analyze revenue trends, collections, cashflow, and payment statuses.
                        </p>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-3">
                    <div className="w-[180px]">
                        <Select value={range} onValueChange={setRange}>
                            <SelectTrigger className="w-full bg-white border border-gray-200 shadow-sm focus:ring-2 focus:ring-blue-500 rounded-lg">
                                <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                                <SelectValue placeholder="Select period" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="30d">Last 30 Days</SelectItem>
                                <SelectItem value="90d">Last 90 Days</SelectItem>
                                <SelectItem value="6m">Last 6 Months</SelectItem>
                                <SelectItem value="12m">Last 12 Months</SelectItem>
                                <SelectItem value="ytd">Year to Date</SelectItem>
                                <SelectItem value="all">All Time</SelectItem>
                                <SelectItem value="custom">Custom Range</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {range === "custom" && (
                        <div className="flex items-center gap-2 bg-white p-1 border border-gray-200 rounded-lg shadow-sm">
                            <Input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="h-9 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-sm w-36"
                            />
                            <span className="text-gray-400 text-xs px-1">to</span>
                            <Input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="h-9 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-sm w-36"
                            />
                            <Button
                                onClick={handleApplyCustomDates}
                                size="sm"
                                className="bg-blue-600 hover:bg-blue-700 h-8 rounded-md px-3 text-xs"
                            >
                                Apply
                            </Button>
                        </div>
                    )}

                    <Button
                        onClick={downloadPDFReport}
                        disabled={loading || !reportData || generatingPDF}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold h-9 rounded-lg px-4 text-xs shadow-sm gap-1.5"
                    >
                        {generatingPDF ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                            <Download className="h-3.5 w-3.5" />
                        )}
                        {generatingPDF ? "Generating..." : "Download Report PDF"}
                    </Button>
                </div>
            </div>

            <Separator className="bg-gray-150" />

            {loading ? (
                <div className="flex flex-col justify-center items-center py-24 space-y-4">
                    <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
                    <p className="text-sm font-medium text-gray-500">Generating report analytics...</p>
                </div>
            ) : (
                <>
                    {/* Metrics Cards Grid */}
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                        {/* Billed revenue */}
                        <Card className="border-0 shadow-md ring-1 ring-black/[0.04] bg-white overflow-hidden relative group hover:shadow-lg transition duration-200">
                            <div className="absolute top-0 left-0 w-2 h-full bg-blue-500" />
                            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                                <CardTitle className="text-sm font-bold text-gray-500 uppercase tracking-wider">Gross Billed</CardTitle>
                                <div className="p-2 bg-blue-500/10 rounded-lg text-blue-600">
                                    <DollarSign className="h-5 w-5" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-black text-gray-900">₹{summary.totalRevenue.toLocaleString()}</div>
                                <p className="text-xs text-gray-500 mt-1">Total value of generated invoices</p>
                                <div className="mt-4 flex items-center gap-1 text-xs text-emerald-600 font-semibold">
                                    <TrendingUp className="h-3.5 w-3.5" />
                                    <span>{summary.count} Invoice{summary.count !== 1 ? 's' : ''}</span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Collections */}
                        <Card className="border-0 shadow-md ring-1 ring-black/[0.04] bg-white overflow-hidden relative group hover:shadow-lg transition duration-200">
                            <div className="absolute top-0 left-0 w-2 h-full bg-emerald-500" />
                            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                                <CardTitle className="text-sm font-bold text-gray-500 uppercase tracking-wider">Collected Cash</CardTitle>
                                <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-600">
                                    <CreditCard className="h-5 w-5" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-black text-emerald-700">₹{summary.totalCollected.toLocaleString()}</div>
                                <div className="flex justify-between items-center text-xs text-gray-500 mt-1">
                                    <span>Cash Flow Inflow</span>
                                    <span className="font-bold text-emerald-600">{collectedPercentage}% of billed</span>
                                </div>
                                <div className="mt-3.5 w-full bg-gray-100 rounded-full h-2">
                                    <div
                                        className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                                        style={{ width: `${collectedPercentage}%` }}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Outstanding Receivables */}
                        <Card className="border-0 shadow-md ring-1 ring-black/[0.04] bg-white overflow-hidden relative group hover:shadow-lg transition duration-200">
                            <div className="absolute top-0 left-0 w-2 h-full bg-amber-500" />
                            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                                <CardTitle className="text-sm font-bold text-gray-500 uppercase tracking-wider">Outstanding</CardTitle>
                                <div className="p-2 bg-amber-500/10 rounded-lg text-amber-600">
                                    <Activity className="h-5 w-5" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-black text-amber-700">₹{summary.totalOutstanding.toLocaleString()}</div>
                                <div className="flex justify-between items-center text-xs text-gray-500 mt-1">
                                    <span>Remaining to collect</span>
                                    <span className="font-bold text-amber-600">{100 - collectedPercentage}% outstanding</span>
                                </div>
                                <div className="mt-3.5 w-full bg-gray-100 rounded-full h-2">
                                    <div
                                        className="bg-amber-500 h-2 rounded-full transition-all duration-500"
                                        style={{ width: `${100 - collectedPercentage}%` }}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Avg ticket size & discounts */}
                        <Card className="border-0 shadow-md ring-1 ring-black/[0.04] bg-white overflow-hidden relative group hover:shadow-lg transition duration-200">
                            <div className="absolute top-0 left-0 w-2 h-full bg-indigo-500" />
                            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                                <CardTitle className="text-sm font-bold text-gray-500 uppercase tracking-wider">Avg. Ticket Size</CardTitle>
                                <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-600">
                                    <Percent className="h-5 w-5" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-black text-gray-900">₹{Math.round(summary.avgTicketSize).toLocaleString()}</div>
                                <p className="text-xs text-gray-500 mt-1">Average invoice value</p>
                                <div className="mt-4 pt-1.5 border-t border-gray-100 flex justify-between text-[11px] text-gray-500">
                                    <span>Total Discounts:</span>
                                    <span className="font-bold text-red-500">₹{summary.totalDiscounts.toLocaleString()}</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Breakdown meters */}
                    <div className="grid gap-6 md:grid-cols-2">
                        <Card className="shadow-sm border border-gray-200">
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between text-sm font-semibold mb-2 text-gray-700">
                                    <span className="flex items-center gap-1.5">
                                        <Package className="h-4 w-4 text-blue-500" />
                                        Parts Share (₹{summary.totalParts.toLocaleString()})
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <Wrench className="h-4 w-4 text-purple-500" />
                                        Labor Share (₹{summary.totalLabor.toLocaleString()})
                                    </span>
                                </div>
                                <div className="w-full bg-slate-100 rounded-full h-3 flex overflow-hidden">
                                    <div
                                        className="bg-blue-500 h-3 transition-all"
                                        style={{ width: `${partsPercentage}%` }}
                                        title={`Parts: ${partsPercentage}%`}
                                    />
                                    <div
                                        className="bg-purple-500 h-3 transition-all"
                                        style={{ width: `${100 - partsPercentage}%` }}
                                        title={`Labor: ${100 - partsPercentage}%`}
                                    />
                                </div>
                                <div className="flex justify-between text-xs text-gray-500 mt-2">
                                    <span>Parts: {partsPercentage}%</span>
                                    <span>Labor: {100 - partsPercentage}%</span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="shadow-sm border border-gray-200">
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between text-sm font-semibold mb-2 text-gray-700">
                                    <span>Total Outflow Discounts Rate</span>
                                    <span className="text-red-500">₹{summary.totalDiscounts.toLocaleString()} Out</span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-3">
                                    <div
                                        className="bg-red-400 h-3 rounded-full"
                                        style={{ width: `${summary.totalRevenue > 0 ? (summary.totalDiscounts / summary.totalRevenue) * 100 : 0}%` }}
                                    />
                                </div>
                                <div className="flex justify-between text-xs text-gray-500 mt-2">
                                    <span>Discount Ratio: {summary.totalRevenue > 0 ? ((summary.totalDiscounts / summary.totalRevenue) * 100).toFixed(1) : 0}%</span>
                                    <span>Based on invoice value</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Charts Row */}
                    <div className="grid gap-6 lg:grid-cols-7">
                        {/* Area trend chart */}
                        <Card className="lg:col-span-4 border border-gray-200 shadow-sm bg-white">
                            <CardHeader className="flex flex-row items-center justify-between pb-4 space-y-0">
                                <div>
                                    <CardTitle className="text-lg font-bold text-gray-800">Revenue & Collections Trend</CardTitle>
                                    <CardDescription>Comparison of billed revenue vs collections collected over time.</CardDescription>
                                </div>
                                <div className="flex items-center gap-1 bg-gray-100 p-0.5 rounded-lg text-xs border border-gray-200">
                                    <Button
                                        variant={trendView === "daily" ? "secondary" : "ghost"}
                                        size="sm"
                                        onClick={() => setTrendView("daily")}
                                        className="h-7 px-2.5 text-[11px] font-bold rounded-md"
                                    >
                                        Daily
                                    </Button>
                                    <Button
                                        variant={trendView === "monthly" ? "secondary" : "ghost"}
                                        size="sm"
                                        onClick={() => setTrendView("monthly")}
                                        className="h-7 px-2.5 text-[11px] font-bold rounded-md"
                                    >
                                        Monthly
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="pl-1">
                                <div className="h-[320px]">
                                    {(trendView === "daily" ? (reportData?.daily || []) : monthlyData).length > 0 ? (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={trendView === "daily" ? (reportData?.daily || []) : monthlyData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                                                <defs>
                                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                                                    </linearGradient>
                                                    <linearGradient id="colorCollected" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                                <XAxis dataKey="name" stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} />
                                                <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v.toLocaleString()}`} />
                                                <Tooltip formatter={(value: any) => [`₹${Number(value).toLocaleString()}`]} contentStyle={{ borderRadius: "8px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)", border: "1px solid #f3f4f6" }} />
                                                <Legend verticalAlign="top" height={36} iconType="circle" />
                                                <Area type="monotone" dataKey="revenue" name="Billed Revenue" stroke="#3b82f6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRevenue)" />
                                                <Area type="monotone" dataKey="collected" name="Collected Inflow" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorCollected)" />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-sm text-gray-400">No trend data available</div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Payment Status Pie Chart */}
                        <Card className="lg:col-span-3 border border-gray-200 shadow-sm bg-white">
                            <CardHeader>
                                <CardTitle className="text-lg font-bold text-gray-800">Status Distribution</CardTitle>
                                <CardDescription>Breakdown by invoice payments status counts.</CardDescription>
                            </CardHeader>
                            <CardContent className="flex flex-col items-center justify-center">
                                <div className="h-[220px] w-full relative">
                                    {statusDistribution.some((d: any) => d.value > 0) ? (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={statusDistribution.filter((d: any) => d.value > 0)}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={60}
                                                    outerRadius={80}
                                                    paddingAngle={4}
                                                    dataKey="value"
                                                >
                                                    {statusDistribution.map((_entry: any, index: number) => (
                                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip formatter={(value: any, name: any, props: any) => [`${value} Invoices (₹${props.payload.amount.toLocaleString()})`, name]} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-sm text-gray-400">No distribution data</div>
                                    )}
                                </div>
                                <div className="grid grid-cols-3 gap-2 w-full mt-4 text-center">
                                    {statusDistribution.map((status: any, index: number) => (
                                        <div key={status.name} className="space-y-0.5">
                                            <div className="flex items-center justify-center gap-1 text-[11px] font-semibold text-gray-500">
                                                <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                                                <span>{status.name}</span>
                                            </div>
                                            <div className="text-sm font-bold text-gray-800">{status.value}</div>
                                            <div className="text-[10px] text-gray-500 font-medium">₹{Math.round(status.amount).toLocaleString()}</div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Payment Method bar chart */}
                    <div className="grid gap-6 lg:grid-cols-5">
                        <Card className="lg:col-span-3 border border-gray-200 shadow-sm bg-white">
                            <CardHeader>
                                <CardTitle className="text-lg font-bold text-gray-800">Payment Preferences</CardTitle>
                                <CardDescription>Popularity of payment methods by transaction volumes.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[250px]">
                                    {methodDistribution.length > 0 ? (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={methodDistribution} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f3f4f6" />
                                                <XAxis type="number" stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} />
                                                <YAxis dataKey="name" type="category" stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} />
                                                <Tooltip formatter={(value: any, _name: any, props: any) => [`₹${props.payload.amount.toLocaleString()} (${value} tx)`, "Amount"]} />
                                                <Bar dataKey="value" name="Transactions count" fill="#8b5cf6" radius={[0, 4, 4, 0]} maxBarSize={30} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-sm text-gray-400">No payment preferences data</div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Summary breakdown details */}
                        <Card className="lg:col-span-2 border border-gray-200 shadow-sm bg-white">
                            <CardHeader>
                                <CardTitle className="text-lg font-bold text-gray-800">Detailed Inflow Breakdown</CardTitle>
                                <CardDescription>Component statistics for the selected timeframe.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center text-sm py-2 border-b">
                                        <span className="text-gray-500 font-medium">Total Invoices</span>
                                        <span className="font-extrabold text-gray-900">{summary.count}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm py-2 border-b">
                                        <span className="text-gray-500 font-medium">Parts Billed</span>
                                        <span className="font-extrabold text-gray-900">₹{summary.totalParts.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm py-2 border-b">
                                        <span className="text-gray-500 font-medium">Labor Billed</span>
                                        <span className="font-extrabold text-gray-900">₹{summary.totalLabor.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm py-2 border-b">
                                        <span className="text-gray-500 font-medium">Discounts Awarded</span>
                                        <span className="font-extrabold text-red-500">₹{summary.totalDiscounts.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm py-2">
                                        <span className="text-gray-500 font-medium">Outstanding Balances</span>
                                        <span className="font-extrabold text-amber-600">₹{summary.totalOutstanding.toLocaleString()}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Invoice list table */}
                    <Tabs defaultValue="invoices" className="w-full">
                        <TabsList className="flex flex-wrap gap-1 mb-6 bg-gray-100 p-1 rounded-lg w-full sm:w-auto sm:inline-flex border border-gray-200">
                            <TabsTrigger value="invoices" className="font-semibold text-xs py-1.5 px-3 rounded-md">Invoices / Receipts</TabsTrigger>
                            <TabsTrigger value="services" className="font-semibold text-xs py-1.5 px-3 rounded-md">Service & Parts Sales</TabsTrigger>
                            <TabsTrigger value="outstanding" className="font-semibold text-xs py-1.5 px-3 rounded-md">
                                Outstanding Receivables ({reportData?.outstandingInvoices?.length || 0})
                            </TabsTrigger>
                            <TabsTrigger value="customers" className="font-semibold text-xs py-1.5 px-3 rounded-md">Top Customers</TabsTrigger>
                        </TabsList>

                        <TabsContent value="invoices" className="space-y-4">
                            <Card className="border border-gray-200 shadow-sm bg-white">
                                <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4">
                                    <div>
                                        <CardTitle className="text-lg font-bold text-gray-800">Financial Records</CardTitle>
                                        <CardDescription>Individual transactions and invoice receipts details.</CardDescription>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-3">
                                        <div className="relative w-[240px]">
                                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                            <Input
                                                placeholder="Search inv, customer, car..."
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                className="pl-9 h-9 text-sm"
                                            />
                                        </div>
                                        <div className="w-[140px]">
                                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                                <SelectTrigger className="h-9">
                                                    <Filter className="h-3.5 w-3.5 mr-1.5 text-gray-400" />
                                                    <SelectValue placeholder="All Status" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">All Status</SelectItem>
                                                    <SelectItem value="paid">Paid Only</SelectItem>
                                                    <SelectItem value="unpaid">Unpaid Only</SelectItem>
                                                    <SelectItem value="partial">Partial Only</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={exportToCSV}
                                            disabled={filteredInvoices.length === 0}
                                            className="h-9 gap-1.5 border-gray-200 text-gray-700 font-semibold shadow-sm"
                                        >
                                            <Download className="h-4 w-4" />
                                            Export CSV
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="rounded-lg border border-gray-150 overflow-hidden">
                                        <Table>
                                            <TableHeader className="bg-gray-50">
                                                <TableRow>
                                                    <TableHead className="font-bold text-gray-600">Inv #</TableHead>
                                                    <TableHead className="font-bold text-gray-600">Date</TableHead>
                                                    <TableHead className="font-bold text-gray-600">Customer</TableHead>
                                                    <TableHead className="font-bold text-gray-600">Vehicle</TableHead>
                                                    <TableHead className="font-bold text-gray-600 text-right">Billed Amount</TableHead>
                                                    <TableHead className="font-bold text-gray-600 text-right">Collected</TableHead>
                                                    <TableHead className="font-bold text-gray-600 text-right">Outstanding</TableHead>
                                                    <TableHead className="font-bold text-gray-600">Status</TableHead>
                                                    <TableHead className="font-bold text-gray-600 text-center w-[80px]">Actions</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {paginatedInvoices.length > 0 ? (
                                                    paginatedInvoices.map((inv: any) => (
                                                        <TableRow key={inv.id} className="hover:bg-gray-50/50">
                                                            <TableCell className="font-semibold text-gray-900">#{inv.invoice_number}</TableCell>
                                                            <TableCell className="text-gray-500 text-sm">
                                                                {new Date(inv.invoice_date).toLocaleDateString("en-IN", {
                                                                    day: "2-digit",
                                                                    month: "short",
                                                                    year: "numeric"
                                                                })}
                                                            </TableCell>
                                                            <TableCell>
                                                                <div className="font-medium text-gray-900 text-sm">{inv.customer_name}</div>
                                                                <div className="text-xs text-gray-400">{inv.customer_phone}</div>
                                                            </TableCell>
                                                            <TableCell>
                                                                <div className="text-sm text-gray-800 font-medium">{inv.vehicle_number}</div>
                                                                <div className="text-[11px] text-gray-400">{inv.vehicle_model}</div>
                                                            </TableCell>
                                                            <TableCell className="text-right font-bold text-gray-900">₹{inv.grand_total.toLocaleString()}</TableCell>
                                                            <TableCell className="text-right font-medium text-emerald-600">₹{inv.paid_amount.toLocaleString()}</TableCell>
                                                            <TableCell className="text-right font-medium text-amber-600">₹{inv.balance_amount.toLocaleString()}</TableCell>
                                                            <TableCell>
                                                                <Badge
                                                                    variant="secondary"
                                                                    className={
                                                                        inv.payment_status === "paid"
                                                                            ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border border-emerald-200"
                                                                            : inv.payment_status === "partial"
                                                                            ? "bg-amber-50 text-amber-700 hover:bg-amber-50 border border-amber-200"
                                                                            : "bg-red-50 text-red-700 hover:bg-red-50 border border-red-200"
                                                                    }
                                                                >
                                                                    {inv.payment_status?.toUpperCase()}
                                                                </Badge>
                                                            </TableCell>
                                                            <TableCell className="text-center">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-8 w-8 text-gray-500 hover:text-blue-600"
                                                                    onClick={() => window.open(`/invoices/${inv.id}/print`, "_blank")}
                                                                    title="Print/PDF"
                                                                >
                                                                    <Printer className="h-4 w-4" />
                                                                </Button>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))
                                                ) : (
                                                    <TableRow>
                                                        <TableCell colSpan={9} className="text-center py-8 text-sm text-gray-400">
                                                            No financial records matches filters
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                            </TableBody>
                                        </Table>
                                    </div>

                                    {/* Pagination controls */}
                                    {totalPages > 1 && (
                                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-4 border-t border-gray-100">
                                            <div className="text-xs text-gray-500 font-medium">
                                                Showing <span className="font-semibold text-gray-900">{(currentPage - 1) * itemsPerPage + 1}</span> to{" "}
                                                <span className="font-semibold text-gray-900">{Math.min(currentPage * itemsPerPage, filteredInvoices.length)}</span> of{" "}
                                                <span className="font-semibold text-gray-900">{filteredInvoices.length}</span> invoices
                                            </div>
                                            <div className="flex flex-wrap items-center justify-center gap-1.5">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setCurrentPage((c) => Math.max(c - 1, 1))}
                                                    disabled={currentPage === 1}
                                                    className="h-8 px-2.5 text-xs font-semibold gap-1"
                                                >
                                                    <span className="sr-only">Previous page</span>
                                                    ‹ Prev
                                                </Button>
                                                {(() => {
                                                    const pages: (number | string)[] = [];
                                                    if (totalPages <= 5) {
                                                        for (let i = 1; i <= totalPages; i++) pages.push(i);
                                                    } else {
                                                        pages.push(1);
                                                        if (currentPage > 3) pages.push("...");
                                                        const start = Math.max(2, currentPage - 1);
                                                        const end = Math.min(totalPages - 1, currentPage + 1);
                                                        for (let i = start; i <= end; i++) pages.push(i);
                                                        if (currentPage < totalPages - 2) pages.push("...");
                                                        pages.push(totalPages);
                                                    }
                                                    return pages.map((page, i) => (
                                                        <Button
                                                            key={i}
                                                            variant={currentPage === page ? "default" : "outline"}
                                                            size="sm"
                                                            onClick={() => typeof page === "number" && setCurrentPage(page)}
                                                            disabled={typeof page !== "number"}
                                                            className={`h-8 w-8 text-xs font-medium ${
                                                                typeof page !== "number"
                                                                    ? "border-none cursor-default bg-transparent text-gray-400 hover:bg-transparent"
                                                                    : ""
                                                            }`}
                                                        >
                                                            {page}
                                                        </Button>
                                                    ));
                                                })()}
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setCurrentPage((c) => Math.min(c + 1, totalPages))}
                                                    disabled={currentPage === totalPages}
                                                    className="h-8 px-2.5 text-xs font-semibold gap-1"
                                                >
                                                    Next ›
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="services" className="space-y-4">
                            <Card className="border border-gray-200 shadow-sm bg-white">
                                <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4">
                                    <div>
                                        <CardTitle className="text-lg font-bold text-gray-800">Service & Parts Sales Breakdown</CardTitle>
                                        <CardDescription>Analytics of individual parts sold and services rendered.</CardDescription>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-3">
                                        <div className="relative w-[240px]">
                                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                            <Input
                                                placeholder="Search parts/services..."
                                                value={itemSearchQuery}
                                                onChange={(e) => {
                                                    setItemSearchQuery(e.target.value)
                                                    setItemCurrentPage(1)
                                                }}
                                                className="pl-9 h-9 text-sm"
                                            />
                                        </div>
                                        <div className="w-[140px]">
                                            <Select value={itemTypeFilter} onValueChange={(val) => {
                                                setItemTypeFilter(val)
                                                setItemCurrentPage(1)
                                            }}>
                                                <SelectTrigger className="h-9">
                                                    <Filter className="h-3.5 w-3.5 mr-1.5 text-gray-400" />
                                                    <SelectValue placeholder="All Types" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">All Types</SelectItem>
                                                    <SelectItem value="part">Parts Only</SelectItem>
                                                    <SelectItem value="labor">Labor Only</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={exportItemsToCSV}
                                            disabled={filteredItems.length === 0}
                                            className="h-9 gap-1.5 border-gray-200 text-gray-700 font-semibold shadow-sm"
                                        >
                                            <Download className="h-4 w-4" />
                                            Export CSV
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="rounded-lg border border-gray-150 overflow-hidden">
                                        <Table>
                                            <TableHeader className="bg-gray-50">
                                                <TableRow>
                                                    <TableHead className="font-bold text-gray-600">Item Description</TableHead>
                                                    <TableHead className="font-bold text-gray-600">Type</TableHead>
                                                    <TableHead className="font-bold text-gray-600 text-right">Invoices Count</TableHead>
                                                    <TableHead className="font-bold text-gray-600 text-right">Quantity Sold</TableHead>
                                                    <TableHead className="font-bold text-gray-600 text-right">Total Revenue</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {paginatedItems.length > 0 ? (
                                                    paginatedItems.map((item: any, i: number) => (
                                                        <TableRow key={i} className="hover:bg-gray-50/50">
                                                            <TableCell className="font-semibold text-gray-900">{item.description}</TableCell>
                                                            <TableCell>
                                                                <Badge
                                                                    variant="secondary"
                                                                    className={
                                                                        item.item_type === "part"
                                                                            ? "bg-blue-50 text-blue-700 border border-blue-200"
                                                                            : "bg-purple-50 text-purple-700 border border-purple-200"
                                                                    }
                                                                >
                                                                    {item.item_type?.toUpperCase()}
                                                                </Badge>
                                                            </TableCell>
                                                            <TableCell className="text-right font-medium text-gray-800">{item.count} times</TableCell>
                                                            <TableCell className="text-right font-medium text-gray-800">{item.quantity}</TableCell>
                                                            <TableCell className="text-right font-bold text-indigo-600">₹{item.amount.toLocaleString()}</TableCell>
                                                        </TableRow>
                                                    ))
                                                ) : (
                                                    <TableRow>
                                                        <TableCell colSpan={5} className="text-center py-8 text-sm text-gray-400">
                                                            No parts or services found matching criteria
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                            </TableBody>
                                        </Table>
                                    </div>

                                    {/* Item Pagination controls */}
                                    {totalItemPages > 1 && (
                                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-4 border-t border-gray-100">
                                            <div className="text-xs text-gray-500 font-medium">
                                                Showing <span className="font-semibold text-gray-900">{(itemCurrentPage - 1) * itemsBreakdownPerPage + 1}</span> to{" "}
                                                <span className="font-semibold text-gray-900">{Math.min(itemCurrentPage * itemsBreakdownPerPage, filteredItems.length)}</span> of{" "}
                                                <span className="font-semibold text-gray-900">{filteredItems.length}</span> items
                                            </div>
                                            <div className="flex flex-wrap items-center justify-center gap-1.5">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setItemCurrentPage((c) => Math.max(c - 1, 1))}
                                                    disabled={itemCurrentPage === 1}
                                                    className="h-8 px-2.5 text-xs font-semibold gap-1"
                                                >
                                                    <span className="sr-only">Previous page</span>
                                                    ‹ Prev
                                                </Button>
                                                {(() => {
                                                    const pages: (number | string)[] = [];
                                                    if (totalItemPages <= 5) {
                                                        for (let i = 1; i <= totalItemPages; i++) pages.push(i);
                                                    } else {
                                                        pages.push(1);
                                                        if (itemCurrentPage > 3) pages.push("...");
                                                        const start = Math.max(2, itemCurrentPage - 1);
                                                        const end = Math.min(totalItemPages - 1, itemCurrentPage + 1);
                                                        for (let i = start; i <= end; i++) pages.push(i);
                                                        if (itemCurrentPage < totalItemPages - 2) pages.push("...");
                                                        pages.push(totalItemPages);
                                                    }
                                                    return pages.map((page, i) => (
                                                        <Button
                                                            key={i}
                                                            variant={itemCurrentPage === page ? "default" : "outline"}
                                                            size="sm"
                                                            onClick={() => typeof page === "number" && setItemCurrentPage(page)}
                                                            disabled={typeof page !== "number"}
                                                            className={`h-8 w-8 text-xs font-medium ${
                                                                typeof page !== "number"
                                                                    ? "border-none cursor-default bg-transparent text-gray-400 hover:bg-transparent"
                                                                    : ""
                                                            }`}
                                                        >
                                                            {page}
                                                        </Button>
                                                    ));
                                                })()}
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setItemCurrentPage((c) => Math.min(c + 1, totalItemPages))}
                                                    disabled={itemCurrentPage === totalItemPages}
                                                    className="h-8 px-2.5 text-xs font-semibold gap-1"
                                                >
                                                    Next ›
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Outstanding Receivables Tab Content */}
                        <TabsContent value="outstanding" className="space-y-4">
                            <Card className="border border-gray-200 shadow-sm bg-white">
                                <CardHeader>
                                    <CardTitle className="text-lg font-bold text-gray-800">Outstanding Receivables</CardTitle>
                                    <CardDescription>Invoices generated in the selected period with unpaid balances.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="rounded-lg border border-gray-150 overflow-hidden">
                                        <Table>
                                            <TableHeader className="bg-gray-50">
                                                <TableRow>
                                                    <TableHead className="font-bold text-gray-600">Inv #</TableHead>
                                                    <TableHead className="font-bold text-gray-600">Bill Date</TableHead>
                                                    <TableHead className="font-bold text-gray-600">Customer Details</TableHead>
                                                    <TableHead className="font-bold text-gray-600">Vehicle No.</TableHead>
                                                    <TableHead className="font-bold text-gray-600 text-right">Billed</TableHead>
                                                    <TableHead className="font-bold text-gray-600 text-right">Collected</TableHead>
                                                    <TableHead className="font-bold text-gray-600 text-right">Outstanding</TableHead>
                                                    <TableHead className="font-bold text-gray-600">Status</TableHead>
                                                    <TableHead className="font-bold text-gray-600 text-center w-[80px]">Actions</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {reportData?.outstandingInvoices && reportData.outstandingInvoices.length > 0 ? (
                                                    reportData.outstandingInvoices.map((inv: any) => (
                                                        <TableRow key={inv.id} className="hover:bg-red-50/20">
                                                            <TableCell className="font-semibold text-gray-900">#{inv.invoice_number}</TableCell>
                                                            <TableCell className="text-gray-500 text-sm">
                                                                {new Date(inv.invoice_date).toLocaleDateString("en-IN", {
                                                                    day: "2-digit",
                                                                    month: "short",
                                                                    year: "numeric"
                                                                })}
                                                            </TableCell>
                                                            <TableCell>
                                                                <div className="font-medium text-gray-900 text-sm">{inv.customer_name}</div>
                                                                <div className="text-xs text-red-500 font-semibold">{inv.customer_phone}</div>
                                                            </TableCell>
                                                            <TableCell className="font-medium text-gray-800 text-sm">{inv.vehicle_number}</TableCell>
                                                            <TableCell className="text-right font-bold text-gray-900">₹{inv.grand_total.toLocaleString()}</TableCell>
                                                            <TableCell className="text-right font-medium text-emerald-600">₹{inv.paid_amount.toLocaleString()}</TableCell>
                                                            <TableCell className="text-right font-black text-red-600">₹{inv.balance_amount.toLocaleString()}</TableCell>
                                                            <TableCell>
                                                                <Badge
                                                                    variant="secondary"
                                                                    className={
                                                                        inv.payment_status === "partial"
                                                                            ? "bg-amber-50 text-amber-700 border border-amber-200"
                                                                            : "bg-red-50 text-red-700 border border-red-200"
                                                                    }
                                                                >
                                                                    {inv.payment_status?.toUpperCase()}
                                                                </Badge>
                                                            </TableCell>
                                                            <TableCell className="text-center">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-8 w-8 text-gray-500 hover:text-blue-600"
                                                                    onClick={() => window.open(`/invoices/${inv.id}/print`, "_blank")}
                                                                    title="Print/PDF Invoice"
                                                                >
                                                                    <Printer className="h-4 w-4" />
                                                                </Button>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))
                                                ) : (
                                                    <TableRow>
                                                        <TableCell colSpan={9} className="text-center py-8 text-sm text-gray-400">
                                                            No outstanding receivables in this period. Outstanding ratio is 0%!
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Top Customers Tab Content */}
                        <TabsContent value="customers" className="space-y-4">
                            <Card className="border border-gray-200 shadow-sm bg-white">
                                <CardHeader>
                                    <CardTitle className="text-lg font-bold text-gray-800">Top Customers (By Sales Volume)</CardTitle>
                                    <CardDescription>Workshop VIP clients who generated the highest revenue in the selected range.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="rounded-lg border border-gray-150 overflow-hidden">
                                        <Table>
                                            <TableHeader className="bg-gray-50">
                                                <TableRow>
                                                    <TableHead className="font-bold text-gray-600 w-[60px] text-center font-black">Rank</TableHead>
                                                    <TableHead className="font-bold text-gray-600">Customer Name</TableHead>
                                                    <TableHead className="font-bold text-gray-600">Phone</TableHead>
                                                    <TableHead className="font-bold text-gray-600 text-center">Invoices / Visits</TableHead>
                                                    <TableHead className="font-bold text-gray-600 text-right">Total Billed</TableHead>
                                                    <TableHead className="font-bold text-gray-600 text-right">Total Settled</TableHead>
                                                    <TableHead className="font-bold text-gray-600 text-right">Pending Debt</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {reportData?.topCustomers && reportData.topCustomers.length > 0 ? (
                                                    reportData.topCustomers.map((cust: any, idx: number) => (
                                                        <TableRow key={idx} className="hover:bg-gray-50/50">
                                                            <TableCell className="text-center font-bold text-gray-400">#{idx + 1}</TableCell>
                                                            <TableCell className="font-bold text-gray-900">{cust.name}</TableCell>
                                                            <TableCell className="text-gray-500 font-medium">{cust.phone || 'N/A'}</TableCell>
                                                            <TableCell className="text-center font-semibold text-blue-600">{cust.count} visits</TableCell>
                                                            <TableCell className="text-right font-extrabold text-gray-900">₹{cust.total.toLocaleString()}</TableCell>
                                                            <TableCell className="text-right font-medium text-emerald-600">₹{cust.paid.toLocaleString()}</TableCell>
                                                            <TableCell className="text-right font-semibold text-amber-600">₹{cust.balance.toLocaleString()}</TableCell>
                                                        </TableRow>
                                                    ))
                                                ) : (
                                                    <TableRow>
                                                        <TableCell colSpan={7} className="text-center py-8 text-sm text-gray-400">
                                                            No customer records available.
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </>
            )}
        </div>
    )
}
