import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, FileText, IndianRupee, Loader2, TrendingUp, Package, Calendar, ArrowUpRight } from "lucide-react"
import { useDashboardStats } from "@/hooks/useDashboard"
import { Link } from "react-router-dom"

export default function Dashboard() {
    const { data: dashboardData, isLoading } = useDashboardStats()

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-96">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
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
            description: "All time revenue",
            color: "bg-green-50 text-green-600",
            trend: "+12.5%",
            trendUp: true
        },
        {
            title: "Active Invoices",
            value: statsData.activeInvoices.toString(),
            icon: FileText,
            description: "Unpaid or partial invoices",
            color: "bg-blue-50 text-blue-600",
            trend: "+4.2%",
            trendUp: true
        },
        {
            title: "Total Customers",
            value: statsData.customers.toString(),
            icon: Users,
            description: "Registered customers",
            color: "bg-purple-50 text-purple-600",
            trend: "+8.1%",
            trendUp: true
        },
    ]

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                    <p className="text-sm text-gray-500 mt-1">Welcome back! Here's what's happening today.</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {stats.map((stat, index) => {
                    const Icon = stat.icon
                    return (
                        <Card key={index} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-gray-600">
                                    {stat.title}
                                </CardTitle>
                                <div className={`p-2 rounded-lg ${stat.color}`}>
                                    <Icon className="h-5 w-5" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-baseline justify-between">
                                    <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
                                    <div className={`flex items-center gap-1 text-xs font-medium ${stat.trendUp ? 'text-green-600' : 'text-red-600'}`}>
                                        <TrendingUp className="h-3 w-3" />
                                        <span>{stat.trend}</span>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-500 mt-2">
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
                <Card className="lg:col-span-4 border-0 shadow-sm">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-lg font-semibold text-gray-900">Revenue Overview</CardTitle>
                                <p className="text-sm text-gray-500 mt-1">Monthly revenue trend</p>
                            </div>
                            <select className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <option>Last 7 days</option>
                                <option>Last 30 days</option>
                                <option>Last 3 months</option>
                                <option>Last year</option>
                            </select>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] flex items-center justify-center bg-gradient-to-br from-blue-50 to-white rounded-lg border-2 border-dashed border-gray-200">
                            <div className="text-center">
                                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <TrendingUp className="h-6 w-6 text-blue-600" />
                                </div>
                                <p className="text-sm font-medium text-gray-900">Chart Coming Soon</p>
                                <p className="text-xs text-gray-500 mt-1">Revenue analytics will be displayed here</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Invoices */}
                <Card className="lg:col-span-3 border-0 shadow-sm">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-lg font-semibold text-gray-900">Recent Invoices</CardTitle>
                                <p className="text-sm text-gray-500 mt-1">Latest transactions</p>
                            </div>
                            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
                                View All
                                <ArrowUpRight className="h-3 w-3" />
                            </button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {statsData.recentActivity && statsData.recentActivity.length > 0 ? (
                                statsData.recentActivity.map((invoice: any) => (
                                    <div key={invoice.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <FileText className="h-5 w-5 text-blue-600" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-gray-900 truncate">
                                                {invoice.customer?.name || "Unknown Customer"}
                                            </p>
                                            <p className="text-xs text-gray-500 truncate">
                                                {invoice.vehicle?.model} • {invoice.vehicle?.vehicle_number}
                                            </p>
                                        </div>
                                        <div className="text-right flex-shrink-0">
                                            <p className="text-sm font-bold text-green-600">
                                                +₹{invoice.grand_total.toLocaleString('en-IN')}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="flex flex-col items-center justify-center py-8 text-center">
                                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                                        <FileText className="h-6 w-6 text-gray-400" />
                                    </div>
                                    <p className="text-sm font-medium text-gray-900">No recent invoices</p>
                                    <p className="text-xs text-gray-500 mt-1">Invoice activity will appear here</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid gap-4 md:grid-cols-3">
                <Link to="/invoices/new">
                    <Card className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium opacity-90">Create New</p>
                                    <p className="text-2xl font-bold mt-1">Invoice</p>
                                </div>
                                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                                    <FileText className="h-6 w-6" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </Link>

                <Link to="/customers">
                    <Card className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium opacity-90">Add New</p>
                                    <p className="text-2xl font-bold mt-1">Customer</p>
                                </div>
                                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                                    <Users className="h-6 w-6" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </Link>

                <Link to="/parts">
                    <Card className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer bg-gradient-to-br from-green-500 to-green-600 text-white">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium opacity-90">Manage</p>
                                    <p className="text-2xl font-bold mt-1">Parts</p>
                                </div>
                                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                                    <Package className="h-6 w-6" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </Link>
            </div>
        </div>
    )
}