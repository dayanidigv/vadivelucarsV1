import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../lib/api'
import { Car, Phone, Lock, ArrowRight } from 'lucide-react'

export default function Login() {
  const [phone, setPhone] = useState('')
  const [vehicleNumber, setVehicleNumber] = useState('')
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<'phone' | 'vehicle'>('phone')
  const [customerData, setCustomerData] = useState<any>(null)
  
  const navigate = useNavigate()
  const { login } = useAuth()

  const handleCheckPhone = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!phone) {
      toast.error('Please enter your phone number')
      return
    }

    setLoading(true)
    try {
      const response = await api.checkPhone(phone)
      if (response.success) {
        setCustomerData(response.customer)
        setStep('vehicle')
        toast.success('Phone number found! Please enter your vehicle number.')
      } else {
        toast.error(response.message || 'Phone number not found')
      }
    } catch (error) {
      toast.error('Failed to check phone number')
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!vehicleNumber) {
      toast.error('Please enter your vehicle number')
      return
    }

    setLoading(true)
    try {
      const response = await api.login(phone, vehicleNumber)
      if (response.success) {
        login(response.data.token, response.data.customer)
        toast.success('Login successful!')
        navigate('/dashboard')
      } else {
        toast.error(response.message || 'Login failed')
      }
    } catch (error) {
      toast.error('Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
              <Car className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Vadivelu Cars</h1>
            <p className="text-gray-600">Customer Portal</p>
          </div>

          {/* Form */}
          <form onSubmit={step === 'phone' ? handleCheckPhone : handleLogin} className="space-y-6">
            {step === 'phone' ? (
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your phone number"
                    required
                  />
                </div>
              </div>
            ) : (
              <>
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-sm text-green-800">
                    Welcome back, {customerData?.name}! Please enter your vehicle number to continue.
                  </p>
                </div>
                
                <div>
                  <label htmlFor="vehicle" className="block text-sm font-medium text-gray-700 mb-2">
                    Vehicle Number
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input
                      id="vehicle"
                      type="text"
                      value={vehicleNumber}
                      onChange={(e) => setVehicleNumber(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your vehicle number (e.g., KA 01 AB 1234)"
                      required
                    />
                  </div>
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  {step === 'phone' ? 'Continue' : 'Login'}
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Back button */}
          {step === 'vehicle' && (
            <button
              type="button"
              onClick={() => setStep('phone')}
              className="w-full mt-4 text-gray-600 hover:text-gray-800 transition-colors"
            >
              ← Back to phone number
            </button>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-600">
            Need help? Contact us at{' '}
            <a href="tel:+918903626677" className="text-blue-600 hover:underline">
              +91 89036 26677
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
