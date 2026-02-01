
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { Phone, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'

export default function CustomerLogin() {
    const [phone, setPhone] = useState('')
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            // In a real app, we would verify OTP here.
            // For now, we search for the customer by phone.
            const response = await fetch(`http://localhost:8787/api/customers?search=${phone}`)
            const data = await response.json()

            if (data.success && data.data && data.data.length > 0) {
                // Determine which customer it is (simple match)
                const customer = data.data.find((c: any) => c.phone === phone)

                if (customer) {
                    toast.success('Welcome back, ' + customer.name)
                    navigate(`/my-car/${customer.id}`)
                } else {
                    toast.error('Phone number not found. Please register first.')
                }
            } else {
                toast.error('No customers found with this number.')
            }
        } catch (error) {
            console.error(error)
            toast.error('Failed to login. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            <Helmet>
                <title>Customer Login | Vadivelu Cars</title>
            </Helmet>
            <div className="min-h-[80vh] flex items-center justify-center bg-slate-50 px-4">
                <Card className="w-full max-w-md shadow-xl border-slate-200">
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-2xl font-bold text-center text-slate-900">Track Your Vehicle</CardTitle>
                        <CardDescription className="text-center">
                            Enter your phone number to view service history and invoices.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleLogin} className="space-y-4">
                            <div className="space-y-2">
                                <div className="relative">
                                    <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                    <Input
                                        type="tel"
                                        placeholder="Phone Number (e.g., 9876543210)"
                                        className="pl-10"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                            <Button type="submit" className="w-full bg-brand-600 hover:bg-brand-700" disabled={loading}>
                                {loading ? 'Checking...' : 'View Details'} <ArrowRight className="ml-2 w-4 h-4" />
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </>
    )
}
