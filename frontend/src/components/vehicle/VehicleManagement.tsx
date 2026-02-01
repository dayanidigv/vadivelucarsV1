import { useState } from 'react'
import { Car, Camera, Plus, Edit, Trash2, Save, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import PhotoCapture from '@/components/invoice/PhotoCapture'

interface Vehicle {
  id: string
  vehicle_number: string
  make: string
  model: string
  year: string
  current_mileage: string
  photos: string[]
}

interface VehicleManagementProps {
  vehicles: Vehicle[]
  onVehiclesChange: (vehicles: Vehicle[]) => void
}

export default function VehicleManagement({
  vehicles,
  onVehiclesChange
}: VehicleManagementProps) {
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [formData, setFormData] = useState<Partial<Vehicle>>({
    vehicle_number: '',
    make: '',
    model: '',
    year: '',
    current_mileage: '',
    photos: []
  })

  const handleAddVehicle = () => {
    if (!formData.vehicle_number || !formData.make || !formData.model) {
      toast.error('Please fill in required fields')
      return
    }

    const newVehicle: Vehicle = {
      id: Date.now().toString(),
      vehicle_number: formData.vehicle_number,
      make: formData.make,
      model: formData.model,
      year: formData.year || '',
      current_mileage: formData.current_mileage || '',
      photos: formData.photos || []
    }

    onVehiclesChange([...vehicles, newVehicle])
    setFormData({
      vehicle_number: '',
      make: '',
      model: '',
      year: '',
      current_mileage: '',
      photos: []
    })
    setShowAddForm(false)
    toast.success('Vehicle added successfully')
  }

  const handleUpdateVehicle = () => {
    if (!editingVehicle || !formData.vehicle_number || !formData.make || !formData.model) {
      toast.error('Please fill in required fields')
      return
    }

    const updatedVehicles = vehicles.map(v =>
      v.id === editingVehicle.id
        ? { ...v, ...formData }
        : v
    )

    onVehiclesChange(updatedVehicles)
    setEditingVehicle(null)
    setFormData({
      vehicle_number: '',
      make: '',
      model: '',
      year: '',
      current_mileage: '',
      photos: []
    })
    toast.success('Vehicle updated successfully')
  }

  const handleDeleteVehicle = (vehicleId: string) => {
    if (confirm('Are you sure you want to delete this vehicle?')) {
      onVehiclesChange(vehicles.filter(v => v.id !== vehicleId))
      toast.success('Vehicle deleted successfully')
    }
  }

  const startEdit = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle)
    setFormData(vehicle)
  }

  const cancelEdit = () => {
    setEditingVehicle(null)
    setFormData({
      vehicle_number: '',
      make: '',
      model: '',
      year: '',
      current_mileage: '',
      photos: []
    })
  }

  return (
    <div className="space-y-4">
      {/* Add Vehicle Button */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Vehicles ({vehicles.length})</h3>
        <Button onClick={() => setShowAddForm(true)} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Add Vehicle
        </Button>
      </div>

      {/* Add/Edit Vehicle Form */}
      {(showAddForm || editingVehicle) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{editingVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}</span>
              <Button variant="ghost" size="sm" onClick={() => {
                setShowAddForm(false)
                cancelEdit()
              }}>
                <X className="w-4 h-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="vehicle_number">Vehicle Number *</Label>
                <Input
                  id="vehicle_number"
                  value={formData.vehicle_number}
                  onChange={(e) => setFormData(prev => ({ ...prev, vehicle_number: e.target.value }))}
                  placeholder="e.g., TN-30-B-4545"
                  required
                />
              </div>
              <div>
                <Label htmlFor="make">Make *</Label>
                <Input
                  id="make"
                  value={formData.make}
                  onChange={(e) => setFormData(prev => ({ ...prev, make: e.target.value }))}
                  placeholder="e.g., Toyota"
                  required
                />
              </div>
              <div>
                <Label htmlFor="model">Model *</Label>
                <Input
                  id="model"
                  value={formData.model}
                  onChange={(e) => setFormData(prev => ({ ...prev, model: e.target.value }))}
                  placeholder="e.g., Innova"
                  required
                />
              </div>
              <div>
                <Label htmlFor="year">Year</Label>
                <Input
                  id="year"
                  value={formData.year}
                  onChange={(e) => setFormData(prev => ({ ...prev, year: e.target.value }))}
                  placeholder="e.g., 2022"
                />
              </div>
              <div>
                <Label htmlFor="mileage">Current Mileage</Label>
                <Input
                  id="mileage"
                  value={formData.current_mileage}
                  onChange={(e) => setFormData(prev => ({ ...prev, current_mileage: e.target.value }))}
                  placeholder="e.g., 45000"
                />
              </div>
            </div>

            {/* Photo Capture */}
            <PhotoCapture
              photos={formData.photos || []}
              onPhotosChange={(photos) => setFormData(prev => ({ ...prev, photos }))}
            />

            <div className="flex gap-2">
              <Button onClick={editingVehicle ? handleUpdateVehicle : handleAddVehicle}>
                <Save className="w-4 h-4 mr-2" />
                {editingVehicle ? 'Update' : 'Add'} Vehicle
              </Button>
              <Button variant="outline" onClick={() => {
                setShowAddForm(false)
                cancelEdit()
              }}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Vehicles List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {vehicles.map((vehicle) => (
          <Card key={vehicle.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Car className="w-5 h-5 text-blue-600" />
                  <CardTitle className="text-lg">{vehicle.vehicle_number}</CardTitle>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => startEdit(vehicle)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteVehicle(vehicle.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Make:</span>
                  <span className="font-medium">{vehicle.make}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Model:</span>
                  <span className="font-medium">{vehicle.model}</span>
                </div>
                {vehicle.year && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Year:</span>
                    <span className="font-medium">{vehicle.year}</span>
                  </div>
                )}
                {vehicle.current_mileage && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Mileage:</span>
                    <span className="font-medium">{vehicle.current_mileage} km</span>
                  </div>
                )}
                {vehicle.photos && vehicle.photos.length > 0 && (
                  <div className="pt-2">
                    <div className="flex items-center gap-2 mb-2">
                      <Camera className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        Photos ({vehicle.photos.length})
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-1">
                      {vehicle.photos.slice(0, 3).map((photo, index) => (
                        <img
                          key={index}
                          src={photo}
                          alt={`Vehicle photo ${index + 1}`}
                          className="w-full h-16 object-cover rounded"
                        />
                      ))}
                      {vehicle.photos.length > 3 && (
                        <div className="w-full h-16 bg-muted rounded flex items-center justify-center text-xs text-muted-foreground">
                          +{vehicle.photos.length - 3}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {vehicles.length === 0 && !showAddForm && (
        <Card>
          <CardContent className="p-8 text-center">
            <Car className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Vehicles Added</h3>
            <p className="text-muted-foreground mb-4">
              Add your first vehicle to get started with service tracking.
            </p>
            <Button onClick={() => setShowAddForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Vehicle
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
