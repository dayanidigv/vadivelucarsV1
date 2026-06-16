import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
    Users,
    FileText,
    IndianRupee,
    Loader2,
    Package,
    Calendar,
    ArrowUpRight,
    AlertCircle,
    Plus,
    Printer
} from "lucide-react"
import { useDashboardStats } from "@/hooks/useDashboard"
import { Link, useNavigate } from "react-router-dom"
import { api } from "@/lib/api"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from "recharts"

export default function Dashboard() {
    const navigate = useNavigate()
    const { data: dashboardData, isLoading: isLoadingStats } = useDashboardStats()
    const [revenueData, setRevenueData] = useState<any[]>([])
    const [isLoadingChart, setIsLoadingChart] = useState(true)

    useEffect(() => {
        async function fetchChartData() {
            try {
                const response = await api.getRevenueReports({ range: "6m" })
                if (response.success && response.data?.monthly) {
                    setRevenueData(response.data.monthly)
                }
            } catch (error) {
                console.error("Failed to fetch dashboard chart data", error)
            } finally {
                setIsLoadingChart(false)
            }
        }
        fetchChartData()
    }, [])

    if (isLoadingStats) {
        return (
            <div className="flex flex-col justify-center items-center h-96 space-y-4">
                <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
                <p className="text-sm font-medium text-gray-500">Loading dashboard...</p>
            </div>
        )
    }

    const statsData = dashboardData?.data || {
        revenue: 0,
        activeInvoices: 0,
        customers: 0,
        lowStock: 0,
        recentActivity: []
    }

    const stats = [
        {
            title: "Total Revenue",
            value: `₹${statsData.revenue.toLocaleString('en-IN')}`,
            icon: IndianRupee,
            description: "Total paid invoice collections",
            color: "bg-emerald-50 text-emerald-600 ring-emerald-500/10",
            borderColor: "border-emerald-100",
            glowColor: "group-hover:bg-emerald-500/10"
        },
        {
            title: "Active Invoices",
            value: statsData.activeInvoices.toString(),
            icon: FileText,
            description: "Invoices awaiting payment",
            color: "bg-amber-50 text-amber-600 ring-amber-500/10",
            borderColor: "border-amber-100",
            glowColor: "group-hover:bg-amber-500/10"
        },
        {
            title: "Total Customers",
            value: statsData.customers.toString(),
            icon: Users,
            description: "Registered vehicle owners",
            color: "bg-blue-50 text-blue-600 ring-blue-500/10",
            borderColor: "border-blue-100",
            glowColor: "group-hover:bg-blue-500/10"
        },
    ]

    return (
        <div className="space-y-8 p-1">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        Vadivelu Cars
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">Workspace Overview & Management Dashboard.</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500 bg-white border border-gray-200 shadow-sm rounded-lg px-3 py-1.5 self-start sm:self-auto">
                    <Calendar className="h-4 w-4 text-blue-500" />
                    <span className="font-semibold">{new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
            </div>

            {/* Low stock warning banner */}
            {statsData.lowStock > 0 && (
                <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 flex items-center justify-between shadow-sm animate-pulse">
                    <div className="flex items-center gap-3">
                        <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                        <span className="text-sm font-semibold">Alert: {statsData.lowStock} spare parts are running low on stock.</span>
                    </div>
                    <Link to="/parts" className="text-xs font-bold underline hover:text-red-900">
                        Restock Now
                    </Link>
                </div>
            )}

            {/* Stats Cards */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {stats.map((stat, index) => {
                    const Icon = stat.icon
                    return (
                        <Card key={index} className={`border border-gray-150 shadow-sm bg-white overflow-hidden hover:shadow-md transition duration-200 group`}>
                            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                                <CardTitle className="text-sm font-bold text-gray-500 uppercase tracking-wider">
                                    {stat.title}
                                </CardTitle>
                                <div className={`p-2.5 rounded-lg ring-1 ${stat.color} transition duration-200 ${stat.glowColor}`}>
                                    <Icon className="h-5 w-5" />
                                </div>
                            </CardHeader>
                            <CardContent className="pt-2">
                                <div className="text-3xl font-black text-gray-900 tracking-tight">{stat.value}</div>
                                <p className="text-xs text-gray-500 mt-1.5 font-medium">
                                    {stat.description}
                                </p>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>

            {/* Main Content Grid */}
            <div className="grid gap-6 lg:grid-cols-7">
                {/* Recent Activity Chart */}
                <Card className="lg:col-span-4 border border-gray-200 shadow-sm bg-white">
                    <CardHeader className="flex flex-row items-center justify-between pb-4">
                        <div>
                            <CardTitle className="text-lg font-bold text-gray-800">Revenue Overview</CardTitle>
                            <CardDescription>Billed and collected aggregates over last 6 months.</CardDescription>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate("/reports")}
                            className="text-xs font-bold text-blue-600 hover:text-blue-700"
                        >
                            View Reports Analytics
                        </Button>
                    </CardHeader>
                    <CardContent className="pl-1">
                        {isLoadingChart ? (
                            <div className="h-[300px] flex items-center justify-center">
                                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                            </div>
                        ) : revenueData.length > 0 ? (
                            <div className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="dashRevenue" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                                            </linearGradient>
                                            <linearGradient id="dashCollected" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                                                <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                        <XAxis dataKey="name" stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} />
                                        <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v.toLocaleString()}`} />
                                        <Tooltip formatter={(value: any) => [`₹${Number(value).toLocaleString()}`]} contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }} />
                                        <Area type="monotone" dataKey="revenue" name="Revenue Billed" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#dashRevenue)" />
                                        <Area type="monotone" dataKey="collected" name="Cash Inflow" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#dashCollected)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <div className="h-[300px] flex items-center justify-center bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg text-sm text-gray-400">
                                No sales data available for chart.
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Recent Invoices */}
                <Card className="lg:col-span-3 border border-gray-200 shadow-sm bg-white">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-lg font-bold text-gray-800">Recent Transactions</CardTitle>
                            <CardDescription>Latest generated bills.</CardDescription>
                        </div>
                        <Link to="/invoices" className="text-sm text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1.5 transition-colors">
                            View All
                            <ArrowUpRight className="h-4 w-4" />
                        </Link>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {statsData.recentActivity && statsData.recentActivity.length > 0 ? (
                                statsData.recentActivity.map((invoice: any) => (
                                    <div key={invoice.id} className="flex items-center gap-4 p-3 rounded-xl border border-gray-50 hover:bg-gray-50 hover:border-gray-100 transition duration-150">
                                        <div className="w-10 h-10 bg-blue-50 border border-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 text-blue-600">
                                            <FileText className="h-5 w-5" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <p className="text-sm font-bold text-gray-900 truncate">
                                                    {invoice.customer?.name || "Unknown Customer"}
                                                </p>
                                                <Badge
                                                    variant="secondary"
                                                    className={`text-[9px] px-1 py-0 height-4 font-semibold rounded-md uppercase ${
                                                        invoice.payment_status === "paid"
                                                            ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                                                            : invoice.payment_status === "partial"
                                                            ? "bg-amber-50 text-amber-700 border border-amber-100"
                                                            : "bg-red-50 text-red-700 border border-red-100"
                                                    }`}
                                                >
                                                    {invoice.payment_status}
                                                </Badge>
                                            </div>
                                            <p className="text-[11px] text-gray-500 truncate mt-0.5">
                                                {invoice.vehicle ? `${invoice.vehicle.make || ''} ${invoice.vehicle.model || ''}`.trim() : "No vehicle"} • {invoice.vehicle?.vehicle_number}
                                            </p>
                                        </div>
                                        <div className="text-right flex-shrink-0 flex items-center gap-1">
                                            <p className="text-sm font-extrabold text-gray-900">
                                                ₹{invoice.grand_total.toLocaleString('en-IN')}
                                            </p>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-gray-400 hover:text-blue-600 hover:bg-gray-100"
                                                onClick={() => window.open(`/invoices/${invoice.id}/print`, "_blank")}
                                            >
                                                <Printer className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                    <div className="w-12 h-12 bg-gray-55/50 border border-gray-100 rounded-full flex items-center justify-center mb-3 text-gray-400">
                                        <FileText className="h-6 w-6" />
                                    </div>
                                    <p className="text-sm font-semibold text-gray-900">No recent transactions</p>
                                    <p className="text-xs text-gray-500 mt-1">Invoice activity will appear here</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
            <div>
                <h2 className="text-lg font-bold text-gray-800 mb-4">Quick Management Actions</h2>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    {/* Invoice */}
                    <Link to="/invoices/new" className="group">
                        <Card className="border border-blue-100 shadow-sm hover:shadow-md transition duration-200 bg-gradient-to-br from-blue-500 to-indigo-600 text-white cursor-pointer relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full translate-x-8 -translate-y-8 group-hover:scale-110 transition duration-300" />
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-semibold text-blue-100 uppercase tracking-wider">Create New</p>
                                        <p className="text-xl font-black mt-0.5">Invoice</p>
                                    </div>
                                    <div className="w-12 h-12 bg-white/15 rounded-xl flex items-center justify-center backdrop-blur-sm group-hover:bg-white/20 transition">
                                        <Plus className="h-6 w-6" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>

                    {/* Estimation */}
                    <Link to="/estimations/new" className="group">
                        <Card className="border border-purple-100 shadow-sm hover:shadow-md transition duration-200 bg-gradient-to-br from-purple-500 to-violet-600 text-white cursor-pointer relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full translate-x-8 -translate-y-8 group-hover:scale-110 transition duration-300" />
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-semibold text-purple-100 uppercase tracking-wider">Generate New</p>
                                        <p className="text-xl font-black mt-0.5">Estimation</p>
                                    </div>
                                    <div className="w-12 h-12 bg-white/15 rounded-xl flex items-center justify-center backdrop-blur-sm group-hover:bg-white/20 transition">
                                        <Plus className="h-6 w-6" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>

                    {/* Customer */}
                    <Link to="/customers" className="group">
                        <Card className="border border-emerald-100 shadow-sm hover:shadow-md transition duration-200 bg-gradient-to-br from-emerald-500 to-teal-600 text-white cursor-pointer relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full translate-x-8 -translate-y-8 group-hover:scale-110 transition duration-300" />
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-semibold text-emerald-100 uppercase tracking-wider">Manage</p>
                                        <p className="text-xl font-black mt-0.5">Customers</p>
                                    </div>
                                    <div className="w-12 h-12 bg-white/15 rounded-xl flex items-center justify-center backdrop-blur-sm group-hover:bg-white/20 transition">
                                        <Users className="h-6 w-6" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>

                    {/* Parts */}
                    <Link to="/parts" className="group">
                        <Card className="border border-orange-100 shadow-sm hover:shadow-md transition duration-200 bg-gradient-to-br from-orange-500 to-amber-600 text-white cursor-pointer relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full translate-x-8 -translate-y-8 group-hover:scale-110 transition duration-300" />
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-semibold text-orange-100 uppercase tracking-wider">Inspect Catalog</p>
                                        <p className="text-xl font-black mt-0.5">Inventory</p>
                                    </div>
                                    <div className="w-12 h-12 bg-white/15 rounded-xl flex items-center justify-center backdrop-blur-sm group-hover:bg-white/20 transition">
                                        <Package className="h-6 w-6" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                </div>
            </div>
        </div>
    )
}