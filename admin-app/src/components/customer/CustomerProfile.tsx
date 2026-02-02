import { useState, useEffect } from 'react'
import { User, Phone, Mail, MapPin, Edit2, Save, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { api } from '@/lib/api'

interface CustomerProfileProps {
  customerId: string
  onUpdate?: (customer: any) => void
}

export default function CustomerProfile({ customerId, onUpdate, customer: initialCustomer, readOnly = false }: CustomerProfileProps & { customer?: any, readOnly?: boolean }) {
  const [customer, setCustomer] = useState<any>(initialCustomer || null)
  const [loading, setLoading] = useState(!initialCustomer)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: ''
  })

  useEffect(() => {
    if (!initialCustomer) {
      fetchCustomer()
    } else {
      setCustomer(initialCustomer)
      setLoading(false)
    }
  }, [customerId, initialCustomer])

  const fetchCustomer = async () => {
    try {
      const response = await api.getCustomer(customerId)
      if (response.success) {
        setCustomer(response.data)
        setFormData({
          name: response.data.name || '',
          phone: response.data.phone || '',
          email: response.data.email || '',
          address: response.data.address || ''
        })
      }
    } catch (error) {
      console.error('Error fetching customer:', error)
      toast.error('Failed to load customer information')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdate = async () => {
    try {
      const response = await api.updateCustomer(customerId, formData)
      if (response.success) {
        setCustomer(response.data)
        setEditing(false)
        toast.success('Profile updated successfully')
        onUpdate?.(response.data)
      } else {
        toast.error('Failed to update profile')
      }
    } catch (error) {
      console.error('Error updating customer:', error)
      toast.error('Failed to update profile')
    }
  }

  const handleCancel = () => {
    setEditing(false)
    if (customer) {
      setFormData({
        name: customer.name || '',
        phone: customer.phone || '',
        email: customer.email || '',
        address: customer.address || ''
      })
    }
  }

  // Initialize form data when entering edit mode
  useEffect(() => {
    if (editing && customer) {
      setFormData({
        name: customer.name || '',
        phone: customer.phone || '',
        email: customer.email || '',
        address: customer.address || ''
      })
    }
  }, [editing, customer])

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading profile...</div>
        </CardContent>
      </Card>
    )
  }

  if (!customer) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">Customer not found</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Profile Information
          </CardTitle>
          {!readOnly && !editing && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditing(true)}
            >
              <Edit2 className="w-4 h-4 mr-1" />
              Edit
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {editing ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  maxLength={10}
                />
              </div>
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, address: e.target.value }))}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleUpdate}>
                <Save className="w-4 h-4 mr-1" />
                Save Changes
              </Button>
              <Button variant="outline" onClick={handleCancel}>
                <X className="w-4 h-4 mr-1" />
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <User className="w-4 h-4 text-muted-foreground" />
              <div>
                <div className="font-medium">{customer.name}</div>
                <div className="text-sm text-muted-foreground">Customer Name</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-muted-foreground" />
              <div>
                <div className="font-medium">{customer.phone}</div>
                <div className="text-sm text-muted-foreground">Phone Number</div>
              </div>
            </div>
            {customer.email && (
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <div>
                  <div className="font-medium">{customer.email}</div>
                  <div className="text-sm text-muted-foreground">Email Address</div>
                </div>
              </div>
            )}
            {customer.address && (
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-muted-foreground mt-1" />
                <div>
                  <div className="font-medium">{customer.address}</div>
                  <div className="text-sm text-muted-foreground">Address</div>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
