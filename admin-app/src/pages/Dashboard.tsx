import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, FileText, IndianRupee, Loader2 } from "lucide-react"
import { useDashboardStats } from "@/hooks/useDashboard"

export default function Dashboard() {
    const { data: dashboardData, isLoading } = useDashboardStats()

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-96">
                <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
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
        },
        {
            title: "Active Invoices",
            value: statsData.activeInvoices.toString(),
            icon: FileText,
            description: "Unpaid or partial invoices",
        },
        {
            title: "Customers",
            value: statsData.customers.toString(),
            icon: Users,
            description: "Total registered customers",
        },
        // {
        //     title: "Low Stock Items",
        //     value: statsData.lowStock.toString(),
        //     icon: Package,
        //     description: "Items needing reorder",
        // },
    ]

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Dashboard</h1>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {stats.map((stat, index) => {
                    const Icon = stat.icon
                    return (
                        <Card key={index}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    {stat.title}
                                </CardTitle>
                                <Icon className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stat.value}</div>
                                <p className="text-xs text-muted-foreground">
                                    {stat.description}
                                </p>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                            Activity Chart Placeholder
                        </div>
                    </CardContent>
                </Card>
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Recent Invoices</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-8">
                            {statsData.recentActivity && statsData.recentActivity.length > 0 ? (
                                statsData.recentActivity.map((invoice: any) => (
                                    <div key={invoice.id} className="flex items-center">
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium leading-none">
                                                {invoice.customer?.name || "Unknown Customer"}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {invoice.vehicle?.model} - {invoice.vehicle?.vehicle_number}
                                            </p>
                                        </div>
                                        <div className="ml-auto font-medium">
                                            +₹{invoice.grand_total.toLocaleString('en-IN')}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-muted-foreground">No recent activity.</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
