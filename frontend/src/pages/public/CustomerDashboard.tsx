
import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { Car, Calendar, FileText, Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export default function CustomerDashboard() {
    const { id } = useParams()
    const [customer, setCustomer] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchCustomer() {
            try {
                const res = await fetch(`http://localhost:8787/api/customers/${id}`)
                const data = await res.json()
                if (data.success) {
                    setCustomer(data.data)
                }
            } catch (error) {
                console.error('Error fetching customer:', error)
            } finally {
                setLoading(false)
            }
        }
        if (id) fetchCustomer()
    }, [id])

    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>
    if (!customer) return <div className="min-h-screen flex items-center justify-center">Customer not found</div>

    // Sort invoices by date desc
    const invoices = customer.invoices?.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()) || []
    const activeService = invoices.find((inv: any) => inv.payment_status === 'unpaid' || inv.payment_status === 'partial')

    return (
        <>
            <Helmet>
                <title>My Vehicle | Vadivelu Cars</title>
            </Helmet>

            <div className="bg-slate-50 min-h-screen pb-20">
                {/* Header */}
                <div className="bg-slate-900 text-white pt-20 pb-12">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div>
                                <h1 className="text-3xl font-bold mb-2">My Vehicle Dashboard</h1>
                                <p className="text-slate-400">Welcome back, {customer.name}</p>
                            </div>
                            <Link to="/book">
                                <Button className="bg-brand-600 hover:bg-brand-700 font-semibold">
                                    Book New Service
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
                    {/* Vehicle Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        {customer.vehicles?.map((vehicle: any) => (
                            <Card key={vehicle.id} className="shadow-lg border-none">
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
                                    <div className="grid grid-cols-2 gap-4 text-sm mt-4">
                                        <div className="flex items-center gap-2 text-slate-600">
                                            <Calendar className="w-4 h-4" />
                                            <span>Year: {vehicle.year}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-slate-600">
                                            <Clock className="w-4 h-4" />
                                            <span>{vehicle.current_mileage || 'N/A'} km</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Active Service Status */}
                    {activeService && (
                        <Card className="mb-8 border-brand-200 bg-brand-50/50 shadow-md">
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
                                        <Button variant="outline" className="border-brand-300 text-brand-700 hover:bg-brand-100">Contact Advisor</Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

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
                                                {/* In real app, add download PDF link */}
                                                <Button size="sm" variant="ghost" className="text-brand-600 hover:text-brand-700 hover:bg-brand-50">View Details</Button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-center text-slate-500 py-8">No service history found.</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    )
}
