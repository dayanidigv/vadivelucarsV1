import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { Phone, Car, ArrowRight, FileText, Clock, Shield } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { api } from '@/lib/api'

export default function CustomerLoginSimple() {
    const [phone, setPhone] = useState('')
    const [vehicleNumber, setVehicleNumber] = useState('')
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()

    // Get return URL from query params
    const returnUrl = searchParams.get('returnUrl') || `/my-car`

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            // First check if phone number exists using public API
            const phoneCheckResult = await api.checkCustomerPhone(phone)
            
            if (!phoneCheckResult.success || !phoneCheckResult.available) {
                toast.error('Phone number not found. Please register first.')
                setLoading(false)
                return
            }

            // Get full customer data with vehicles using authenticated API
            const customerResult = await api.searchCustomers(phone)
            
            if (!customerResult.success || !customerResult.data?.customers?.length) {
                toast.error('Unable to fetch customer details. Please try again.')
                setLoading(false)
                return
            }

            // Check if the customer has the specified vehicle
            const customer = customerResult.data.customers[0]
            const hasVehicle = customer.vehicles?.some((vehicle: any) => 
                vehicle.vehicle_number.toLowerCase() === vehicleNumber.toLowerCase()
            )

            if (!hasVehicle) {
                toast.error('Vehicle number not found for this customer.')
                setLoading(false)
                return
            }

            // Get customer token from backend
            const loginResult = await api.customerLogin(phone)

            if (loginResult.success) {
                // Store customer token and data
                localStorage.setItem('customerToken', loginResult.data.token)
                localStorage.setItem('customer', JSON.stringify(loginResult.data.customer))
                toast.success('Welcome back, ' + loginResult.data.customer.name)
                
                // Navigate to return URL or default dashboard
                if (returnUrl.includes('/invoices/')) {
                    // If returning to invoice print, go directly there
                    navigate(returnUrl)
                } else {
                    // Otherwise go to customer dashboard
                    navigate(`/my-car/${loginResult.data.customer.id}`)
                }
            } else {
                toast.error('Login failed. Please try again.')
            }
            
        } catch (error) {
            console.error('Login error:', error)
            toast.error('Failed to login. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            <Helmet>
                <title>Customer Login | Vadivelu Cars</title>
                <meta name="description" content="Secure customer login for Vadivelu Cars" />
                <meta name="robots" content="noindex,nofollow" />
                <link rel="canonical" href="https://vadivelucars.in/login" />
            </Helmet>
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center px-4 py-12">
                <div className="w-full max-w-md">
                    <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
                        <CardHeader className="space-y-4 pb-6">
                            <div className="text-center">
                                <CardTitle className="text-3xl font-bold text-slate-900 mb-2">
                                    Customer Portal
                                </CardTitle>
                                <CardDescription className="text-slate-600 text-base">
                                    Access your vehicle service history, invoices, and track ongoing repairs
                                </CardDescription>
                            </div>
                            
                            {/* Features */}
                            <div className="grid grid-cols-3 gap-4 pt-4">
                                <div className="text-center">
                                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                                        <FileText className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <p className="text-xs text-slate-600">Invoices</p>
                                </div>
                                <div className="text-center">
                                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                                        <Clock className="w-5 h-5 text-green-600" />
                                    </div>
                                    <p className="text-xs text-slate-600">Service History</p>
                                </div>
                                <div className="text-center">
                                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                                        <Car className="w-5 h-5 text-purple-600" />
                                    </div>
                                    <p className="text-xs text-slate-600">Vehicle Status</p>
                                </div>
                            </div>
                        </CardHeader>
                        
                        <CardContent className="pt-0">
                            <form onSubmit={handleLogin} className="space-y-6">
                                <div className="space-y-3">
                                    <Label htmlFor="phone" className="text-slate-700 font-medium">Phone Number</Label>
                                    <div className="relative">
                                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                                            <Phone className="h-5 w-5 text-slate-400" />
                                        </div>
                                        <Input
                                            id="phone"
                                            type="tel"
                                            placeholder="Enter your 10-digit number"
                                            className="pl-12 h-12 text-lg border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                            required
                                            maxLength={10}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <Label htmlFor="vehicleNumber" className="text-slate-700 font-medium">Vehicle Number</Label>
                                    <div className="relative">
                                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                                            <Car className="h-5 w-5 text-slate-400" />
                                        </div>
                                        <Input
                                            id="vehicleNumber"
                                            type="text"
                                            placeholder="e.g., TN-30-B-4545"
                                            className="pl-12 h-12 text-lg border-slate-200 focus:border-blue-500 focus:ring-blue-500 uppercase"
                                            value={vehicleNumber}
                                            onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
                                            required
                                        />
                                    </div>
                                    <p className="text-xs text-slate-500">Enter your vehicle registration number</p>
                                </div>

                                <Button 
                                    type="submit" 
                                    className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-base shadow-lg hover:shadow-xl transition-all duration-200" 
                                    disabled={loading || phone.length !== 10 || !vehicleNumber.trim()}
                                >
                                    {loading ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                                            Logging in...
                                        </>
                                    ) : (
                                        <>
                                            <Shield className="mr-2 w-5 h-5" />
                                            Login to Dashboard
                                            <ArrowRight className="ml-2 w-5 h-5" />
                                        </>
                                    )}
                                </Button>
                            </form>

                            {/* Help Section */}
                            <div className="text-center pt-4 border-t border-slate-200">
                                <p className="text-sm text-slate-600">
                                    Need help? 
                                    <a href="tel:+918903626677" className="text-blue-600 hover:text-blue-700 font-medium ml-1">
                                        Call us
                                    </a>
                                    <span className="text-slate-400 mx-2">•</span>
                                    <a href="https://wa.me/918903626677" className="text-blue-600 hover:text-blue-700 font-medium">
                                        WhatsApp
                                    </a>
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    )
}
