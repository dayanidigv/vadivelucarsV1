import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { Phone, ArrowRight, Car, FileText, Clock, Shield, ArrowLeft } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import { setupRecaptcha, sendOTP, verifyOTP } from '@/lib/firebase'
// For development without Firebase billing
// import { setupRecaptcha, sendOTP, verifyOTP } from '@/lib/firebase-dev'

export default function CustomerLoginWithOTP() {
    const [phone, setPhone] = useState('')
    const [otp, setOtp] = useState('')
    const [showOTP, setShowOTP] = useState(false)
    const [loading, setLoading] = useState(false)
    const [confirmationResult, setConfirmationResult] = useState<any>(null)
    const recaptchaContainerRef = useRef<HTMLDivElement>(null)
    const navigate = useNavigate()

    const handleSendOTP = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            // First check if customer exists
            const customerResult = await api.searchCustomers(phone)
            
            if (!customerResult.success || !customerResult.data?.customers?.length) {
                toast.error('Phone number not found. Please register first.')
                setLoading(false)
                return
            }

            // Initialize reCAPTCHA
            if (!recaptchaContainerRef.current) {
                toast.error('reCAPTCHA not ready. Please refresh the page.')
                setLoading(false)
                return
            }

            const recaptchaVerifier = setupRecaptcha('recaptcha-container')
            
            // Send OTP
            const confirmation = await sendOTP(`+91${phone}`, recaptchaVerifier)
            setConfirmationResult(confirmation)
            setShowOTP(true)
            toast.success('OTP sent successfully!')
            
        } catch (error: any) {
            console.error('Error sending OTP:', error)
            if (error.code === 'auth/too-many-requests') {
                toast.error('Too many requests. Please try again later.')
            } else if (error.code === 'auth/invalid-phone-number') {
                toast.error('Invalid phone number format.')
            } else {
                toast.error('Failed to send OTP. Please try again.')
            }
        } finally {
            setLoading(false)
        }
    }

    const handleVerifyOTP = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const user = await verifyOTP(confirmationResult, otp)
            
            if (user) {
                // Get customer token from our backend
                const result = await api.customerLogin(phone)

                if (result.success) {
                    // Store customer token and data
                    localStorage.setItem('customerToken', result.data.token)
                    localStorage.setItem('customer', JSON.stringify(result.data.customer))
                    toast.success('Welcome back, ' + result.data.customer.name)
                    navigate(`/my-car/${result.data.customer.id}`)
                } else {
                    toast.error('Login failed. Please try again.')
                }
            }
        } catch (error: any) {
            console.error('Error verifying OTP:', error)
            if (error.code === 'auth/invalid-verification-code') {
                toast.error('Invalid OTP. Please try again.')
            } else if (error.code === 'auth/code-expired') {
                toast.error('OTP expired. Please request a new one.')
            } else {
                toast.error('Failed to verify OTP. Please try again.')
            }
        } finally {
            setLoading(false)
        }
    }

    const handleResendOTP = async () => {
        setLoading(true)
        try {
            const recaptchaVerifier = setupRecaptcha('recaptcha-container')
            const confirmation = await sendOTP(`+91${phone}`, recaptchaVerifier)
            setConfirmationResult(confirmation)
            toast.success('OTP resent successfully!')
        } catch (error: any) {
            console.error('Error resending OTP:', error)
            toast.error('Failed to resend OTP. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const handleBackToPhone = () => {
        setShowOTP(false)
        setOtp('')
        setConfirmationResult(null)
    }

    return (
        <>
            <Helmet>
                <title>Customer Login | Vadivelu Cars</title>
                <meta name="description" content="Secure customer login with OTP verification for Vadivelu Cars" />
                <meta name="robots" content="noindex,nofollow" />
                <link rel="canonical" href="https://vadivelucars.in/login" />
            </Helmet>
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center px-4 py-12">
                <div className="w-full max-w-md">
                    <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
                        <CardHeader className="space-y-4 pb-6">
                            <div className="text-center">
                                <CardTitle className="text-3xl font-bold text-slate-900 mb-2">
                                    {showOTP ? 'Verify OTP' : 'Customer Portal'}
                                </CardTitle>
                                <CardDescription className="text-slate-600 text-base">
                                    {showOTP 
                                        ? 'Enter the 6-digit OTP sent to your phone'
                                        : 'Access your vehicle service history, invoices, and track ongoing repairs'
                                    }
                                </CardDescription>
                            </div>
                            
                            {!showOTP && (
                                <>
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
                                </>
                            )}
                        </CardHeader>
                        
                        <CardContent className="pt-0">
                            {!showOTP ? (
                                // Phone Number Form
                                <form onSubmit={handleSendOTP} className="space-y-6">
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
                                        <p className="text-xs text-slate-500">We'll send a 6-digit OTP to this number</p>
                                    </div>

                                    <Button 
                                        type="submit" 
                                        className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-base shadow-lg hover:shadow-xl transition-all duration-200" 
                                        disabled={loading || phone.length !== 10}
                                    >
                                        {loading ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                                                Sending OTP...
                                            </>
                                        ) : (
                                            <>
                                                Send OTP
                                                <ArrowRight className="ml-2 w-5 h-5" />
                                            </>
                                        )}
                                    </Button>
                                </form>
                            ) : (
                                // OTP Verification Form
                                <form onSubmit={handleVerifyOTP} className="space-y-6">
                                    <div className="space-y-3">
                                        <Label htmlFor="otp" className="text-slate-700 font-medium">Enter OTP</Label>
                                        <Input
                                            id="otp"
                                            type="text"
                                            placeholder="Enter 6-digit OTP"
                                            className="h-12 text-lg text-center tracking-widest border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                            required
                                            maxLength={6}
                                        />
                                        <p className="text-xs text-slate-500">Sent to +91{phone}</p>
                                    </div>

                                    <div className="space-y-3">
                                        <Button 
                                            type="submit" 
                                            className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-base shadow-lg hover:shadow-xl transition-all duration-200" 
                                            disabled={loading || otp.length !== 6}
                                        >
                                            {loading ? (
                                                <>
                                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                                                    Verifying...
                                                </>
                                            ) : (
                                                <>
                                                    <Shield className="mr-2 w-5 h-5" />
                                                    Verify & Login
                                                </>
                                            )}
                                        </Button>

                                        <div className="flex items-center justify-between text-sm">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                onClick={handleBackToPhone}
                                                className="text-slate-600 hover:text-slate-800"
                                            >
                                                <ArrowLeft className="mr-1 w-4 h-4" />
                                                Back
                                            </Button>
                                            
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                onClick={handleResendOTP}
                                                disabled={loading}
                                                className="text-blue-600 hover:text-blue-700"
                                            >
                                                Resend OTP
                                            </Button>
                                        </div>
                                    </div>
                                </form>
                            )}

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

                    {/* reCAPTCHA container */}
                    <div id="recaptcha-container" ref={recaptchaContainerRef} className="hidden"></div>
                </div>
            </div>
        </>
    )
}
