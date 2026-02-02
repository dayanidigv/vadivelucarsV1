import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import { useCustomerInvoices } from "@/hooks/useInvoices"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Car, FileText, Filter, Clock, TrendingUp, AlertCircle, User, MessageSquare } from "lucide-react"
import { Helmet } from "react-helmet-async"
import CustomerProfile from '@/components/customer/CustomerProfile'
import CustomerFeedback from '@/components/customer/CustomerFeedback'
import VehicleManagement from '@/components/vehicle/VehicleManagement'

export default function CustomerDashboard() {
    const { id } = useParams()
    const { data: invoicesData } = useCustomerInvoices()
    const [customer, setCustomer] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all')
    const [sortBy, setSortBy] = useState<'name' | 'mileage' | 'recent'>('recent')
    const [activeTab, setActiveTab] = useState<'overview' | 'profile' | 'vehicles' | 'feedback'>('overview')

    // Get invoices from API response
    const apiInvoices = invoicesData?.data || []

    // Handle vehicle updates
    const handleVehiclesChange = (updatedVehicles: any[]) => {
        setCustomer((prev: any) => ({
            ...prev,
            vehicles: updatedVehicles
        }))
    }

    useEffect(() => {
        async function fetchCustomer() {
            try {
                // Get customer data from localStorage (already includes vehicles from login)
                const customerData = localStorage.getItem('customer')
                if (customerData) {
                    const customer = JSON.parse(customerData)

                    // Verify this is the correct customer
                    if (customer.id === id) {
                        setCustomer(customer)
                    } else {
                        console.error('Customer ID mismatch')
                    }
                } else {
                    console.error('No customer data found in localStorage')
                }
            } catch (error) {
                console.error('Error fetching customer:', error)
            } finally {
                setLoading(false)
            }
        }
        if (id) fetchCustomer()
    }, [id])

    if (loading) return <div className="min-h-screen flex items-center justify-center text-white">Loading...</div>
    if (!customer) return <div className="min-h-screen flex items-center justify-center text-white">Customer not found</div>

    // Use API invoices instead of localStorage invoices
    const invoices = apiInvoices

    // Calculate statistics
    const totalVehicles = customer.vehicles?.length || 0
    const vehiclesWithActiveService = customer.vehicles?.filter((vehicle: any) =>
        invoices.some((inv: any) => inv.vehicle_id === vehicle.id && (inv.payment_status === 'unpaid' || inv.payment_status === 'partial'))
    ).length || 0
    const totalSpent = invoices.reduce((sum: number, inv: any) => inv.payment_status === 'paid' ? sum + inv.grand_total : sum, 0)
    const pendingPayments = invoices.reduce((sum: number, inv: any) => (inv.payment_status === 'unpaid' || inv.payment_status === 'partial') ? sum + inv.balance_amount : sum, 0)

    // Filter and sort vehicles
    const getFilteredAndSortedVehicles = () => {
        let vehicles = [...(customer.vehicles || [])]

        // Apply filter
        if (filter === 'active') {
            vehicles = vehicles.filter((vehicle: any) =>
                invoices.some((inv: any) => inv.vehicle_id === vehicle.id && (inv.payment_status === 'unpaid' || inv.payment_status === 'partial'))
            )
        } else if (filter === 'inactive') {
            vehicles = vehicles.filter((vehicle: any) =>
                !invoices.some((inv: any) => inv.vehicle_id === vehicle.id && (inv.payment_status === 'unpaid' || inv.payment_status === 'partial'))
            )
        }

        // Apply sort
        vehicles.sort((a: any, b: any) => {
            if (sortBy === 'name') {
                return `${a.make} ${a.model}`.localeCompare(`${b.make} ${b.model}`)
            } else if (sortBy === 'mileage') {
                return (b.current_mileage || 0) - (a.current_mileage || 0)
            } else if (sortBy === 'recent') {
                const aLatest = invoices.filter((inv: any) => inv.vehicle_id === a.id)[0]
                const bLatest = invoices.filter((inv: any) => inv.vehicle_id === b.id)[0]
                return new Date(bLatest?.created_at || 0).getTime() - new Date(aLatest?.created_at || 0).getTime()
            }
            return 0
        })

        return vehicles
    }

    return (
        <>
            <Helmet>
                <title>My Vehicle Dashboard | Vadivelu Cars</title>
                <meta name="description" content="View your vehicle's service history, active service status, and invoices with Vadivelu Cars in Salem." />
                <meta name="robots" content="noindex,nofollow" />
                <link
                    rel="canonical"
                    href={id ? `https://vadivelucars.in/my-car/${id}` : 'https://vadivelucars.in/my-car'}
                />
            </Helmet>

            <div className="bg-slate-50 min-h-screen pb-20 mt-20">
                {/* Header */}
                <div className="bg-black text-white pt-20 pb-12">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div>
                                <h1 className="text-3xl font-bold mb-2">My Vehicle Dashboard</h1>
                                <p className="text-slate-400">Welcome back, {customer.name}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
                    {/* Statistics Dashboard */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                        <Card className="bg-blue-400 text-white">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-blue-100 text-sm">Total Vehicles</p>
                                        <p className="text-2xl font-bold">{totalVehicles}</p>
                                    </div>
                                    <Car className="w-8 h-8 text-blue-200" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-yellow-400 text-white">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-yellow-100 text-sm">Active Services</p>
                                        <p className="text-2xl font-bold">{vehiclesWithActiveService}</p>
                                    </div>
                                    <Clock className="w-8 h-8 text-yellow-200" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-green-400 text-white">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-green-100 text-sm">Total Spent</p>
                                        <p className="text-2xl font-bold">₹{totalSpent.toLocaleString()}</p>
                                    </div>
                                    <TrendingUp className="w-8 h-8 text-green-200" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-red-400 text-white">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-red-100 text-sm">Pending</p>
                                        <p className="text-2xl font-bold">₹{pendingPayments.toLocaleString()}</p>
                                    </div>
                                    <AlertCircle className="w-8 h-8 text-red-200" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Navigation Tabs */}
                    <Card className="mb-6">
                        <CardContent className="p-4">
                            <div className="flex gap-2 border-b">
                                <Button
                                    variant={activeTab === 'overview' ? 'default' : 'ghost'}
                                    onClick={() => setActiveTab('overview')}
                                    className="rounded-b-none"
                                >
                                    <Car className="w-4 h-4 mr-2" />
                                    Overview
                                </Button>
                                <Button
                                    variant={activeTab === 'profile' ? 'default' : 'ghost'}
                                    onClick={() => setActiveTab('profile')}
                                    className="rounded-b-none"
                                >
                                    <User className="w-4 h-4 mr-2" />
                                    Profile
                                </Button>
                                <Button
                                    variant={activeTab === 'vehicles' ? 'default' : 'ghost'}
                                    onClick={() => setActiveTab('vehicles')}
                                    className="rounded-b-none"
                                >
                                    <Car className="w-4 h-4 mr-2" />
                                    Vehicles
                                </Button>
                                <Button
                                    variant={activeTab === 'feedback' ? 'default' : 'ghost'}
                                    onClick={() => setActiveTab('feedback')}
                                    className="rounded-b-none"
                                >
                                    <MessageSquare className="w-4 h-4 mr-2" />
                                    Feedback
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Tab Content */}
                    {activeTab === 'overview' && (
                        <>
                            {/* Filter and Sort Controls */}
                            <Card className="mb-6">
                                <CardContent className="p-4">
                                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                                        <div className="flex items-center gap-2">
                                            <Filter className="w-4 h-4" />
                                            <span className="font-medium">Filters:</span>
                                            <div className="flex gap-2">
                                                <Button
                                                    variant={filter === 'all' ? 'default' : 'outline'}
                                                    size="sm"
                                                    onClick={() => setFilter('all')}
                                                >
                                                    All ({totalVehicles})
                                                </Button>
                                                <Button
                                                    variant={filter === 'active' ? 'default' : 'outline'}
                                                    size="sm"
                                                    onClick={() => setFilter('active')}
                                                >
                                                    Active ({vehiclesWithActiveService})
                                                </Button>
                                                <Button
                                                    variant={filter === 'inactive' ? 'default' : 'outline'}
                                                    size="sm"
                                                    onClick={() => setFilter('inactive')}
                                                >
                                                    Inactive ({totalVehicles - vehiclesWithActiveService})
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <span className="font-medium">Sort by:</span>
                                            <select
                                                value={sortBy}
                                                onChange={(e) => setSortBy(e.target.value as any)}
                                                className="px-3 py-1 border rounded-md text-sm"
                                            >
                                                <option value="recent">Most Recent</option>
                                                <option value="name">Vehicle Name</option>
                                                <option value="mileage">Mileage</option>
                                            </select>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                            {/* Vehicle Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                {getFilteredAndSortedVehicles().map((vehicle: any) => {
                                    // Find active service for this specific vehicle
                                    const activeService = invoices.find((inv: any) =>
                                        inv.vehicle_id === vehicle.id &&
                                        (inv.payment_status === 'unpaid' || inv.payment_status === 'partial')
                                    )

                                    return (
                                        <div key={vehicle.id}>
                                            <Card className="shadow-lg border-none mb-4">
                                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 bg-blue-100 text-brand-600 rounded-lg">
                                                            <Car className="w-6 h-6" />
                                                        </div>
                                                        <div>
                                                            <CardTitle className="text-xl">{vehicle.make} {vehicle.model}</CardTitle>
                                                            <p className="text-sm text-slate-500 font-mono">{vehicle.vehicle_number}</p>
                                                        </div>
                                                    </div>
                                                    <Badge variant="outline" className="text-brand-600 border-brand-200 bg-brand-50">Active</Badge>
                                                </CardHeader>
                                                <CardContent>
                                                    <div className="flex items-center gap-4 text-sm mt-4">
                                                        <div className="flex items-center gap-2 text-slate-600">
                                                            <Clock className="w-4 h-4" />
                                                            <span>{vehicle.current_mileage || 'N/A'} km</span>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>

                                            {/* Vehicle-specific Active Service Status */}
                                            {activeService && (
                                                <Card className="border-brand-200 bg-brand-50/50 shadow-md">
                                                    <CardHeader>
                                                        <CardTitle className="flex items-center gap-2 text-brand-800">
                                                            <Clock className="w-5 h-5" /> Current Service Status
                                                        </CardTitle>
                                                    </CardHeader>
                                                    <CardContent>
                                                        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                                                            <div>
                                                                <p className="font-semibold text-lg">{activeService.notes || 'General Service'}</p>
                                                                <p className="text-slate-600">Created on {new Date(activeService.created_at).toLocaleDateString()}</p>
                                                            </div>
                                                            <div className="flex items-center gap-4">
                                                                <Badge className="bg-yellow-500 hover:bg-yellow-600 text-black">In Progress</Badge>
                                                                {/* <Button variant="outline" className="border-brand-300 text-brand-700 hover:bg-brand-100">Contact Advisor</Button> */}
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>

                            {/* Service History */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <FileText className="w-5 h-5 text-slate-500" /> Service History
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {invoices.length > 0 ? (
                                            invoices.map((inv: any) => (
                                                <div key={inv.id} className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors">
                                                    <div className="mb-2 md:mb-0">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="font-semibold text-slate-900">#INV-{inv.id.substring(0, 6).toUpperCase()}</span>
                                                            <Badge variant={inv.payment_status === 'paid' ? 'default' : 'secondary'} className={inv.payment_status === 'paid' ? 'bg-green-600' : ''}>
                                                                {inv.payment_status}
                                                            </Badge>
                                                        </div>
                                                        <p className="text-sm text-slate-500">{new Date(inv.created_at).toLocaleDateString()} • {inv.mechanic_name || 'General Service'}</p>
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                        <p className="font-bold text-slate-900">₹{inv.grand_total?.toLocaleString()}</p>
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            className="text-brand-600 hover:text-brand-700 hover:bg-brand-50"
                                                            onClick={() => window.location.href = `/customer/invoices/${inv.id}`}
                                                        >
                                                            View Details
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-center text-slate-500 py-8">No service history found.</p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </>
                    )}

                    {activeTab === 'profile' && (
                        <CustomerProfile
                            customerId={id as string}
                            onUpdate={setCustomer}
                            customer={customer}
                            readOnly={true}
                        />
                    )}

                    {activeTab === 'vehicles' && (
                        <VehicleManagement
                            vehicles={customer?.vehicles || []}
                            onVehiclesChange={handleVehiclesChange}
                        />
                    )}

                    {activeTab === 'feedback' && (
                        <CustomerFeedback
                            customerId={id as string}
                        />
                    )}
                </div>
            </div>
        </>
    )
}
