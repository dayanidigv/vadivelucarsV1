import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useVehicles, useAddVehicle, useUpdateVehicle, useDeactivateVehicle, useReactivateVehicle } from '../hooks/useVehicles'
import { Helmet } from 'react-helmet-async'
import { ArrowLeft, Car, Plus, Edit2, Trash2, Calendar, Gauge, AlertCircle } from 'lucide-react'
import { formatISTDateOnly } from '../contexts/AuthContext'

export default function Vehicles() {
  const navigate = useNavigate()
  const { data: vehiclesData, isLoading } = useVehicles()
  const addVehicleMutation = useAddVehicle()
  const updateVehicleMutation = useUpdateVehicle()
  const deactivateVehicleMutation = useDeactivateVehicle()
  const reactivateVehicleMutation = useReactivateVehicle()
  
  const [isAddingVehicle, setIsAddingVehicle] = useState(false)
  const [editingVehicle, setEditingVehicle] = useState<any>(null)

  const vehicles = vehiclesData?.data || []

  const handleAddVehicle = () => {
    setIsAddingVehicle(true)
    setEditingVehicle(null)
  }

  const handleEditVehicle = (vehicle: any) => {
    setEditingVehicle(vehicle)
    setIsAddingVehicle(false)
  }

  const handleSaveVehicle = async () => {
    if (isAddingVehicle) {
      await addVehicleMutation.mutateAsync(editingVehicle)
    } else {
      await updateVehicleMutation.mutateAsync({ 
        id: editingVehicle.id, 
        data: editingVehicle 
      })
    }
    setIsAddingVehicle(false)
    setEditingVehicle(null)
  }

  const handleCancelEdit = () => {
    setIsAddingVehicle(false)
    setEditingVehicle(null)
  }

  const handleDeactivateVehicle = async (vehicleId: string) => {
    if (window.confirm('Are you sure you want to deactivate this vehicle? Your service history will be preserved.')) {
      await deactivateVehicleMutation.mutateAsync(vehicleId)
    }
  }

  const handleReactivateVehicle = async (vehicleId: string) => {
    await reactivateVehicleMutation.mutateAsync(vehicleId)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading vehicles...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>My Vehicles | Vadivelu Cars</title>
        <meta name="description" content="Manage your vehicles with Vadivelu Cars." />
      </Helmet>

      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </button>
              <h1 className="text-2xl font-bold text-gray-900">My Vehicles</h1>
            </div>
            
            <button
              onClick={handleAddVehicle}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              Add Vehicle
            </button>
          </div>
        </div>

        {/* Vehicle Form */}
        {(isAddingVehicle || editingVehicle) && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {isAddingVehicle ? 'Add New Vehicle' : 'Edit Vehicle'}
            </h2>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vehicle Number *
                </label>
                <input
                  type="text"
                  value={editingVehicle?.vehicle_number || ''}
                  onChange={(e) => setEditingVehicle({ ...editingVehicle, vehicle_number: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., KA 01 AB 1234"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Make
                </label>
                <input
                  type="text"
                  value={editingVehicle?.make || ''}
                  onChange={(e) => setEditingVehicle({ ...editingVehicle, make: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Maruti Suzuki"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Model
                </label>
                <input
                  type="text"
                  value={editingVehicle?.model || ''}
                  onChange={(e) => setEditingVehicle({ ...editingVehicle, model: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Swift Dzire"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Year
                </label>
                <input
                  type="number"
                  value={editingVehicle?.year || ''}
                  onChange={(e) => setEditingVehicle({ ...editingVehicle, year: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 2022"
                  min="1900"
                  max={new Date().getFullYear() + 1}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Mileage (km)
                </label>
                <input
                  type="number"
                  value={editingVehicle?.current_mileage || ''}
                  onChange={(e) => setEditingVehicle({ ...editingVehicle, current_mileage: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 45000"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Insurance Date
                </label>
                <input
                  type="date"
                  value={editingVehicle?.insurance_date || ''}
                  onChange={(e) => setEditingVehicle({ ...editingVehicle, insurance_date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={handleCancelEdit}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveVehicle}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Save Vehicle
              </button>
            </div>
          </div>
        )}

        {/* Vehicles List */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vehicles.length > 0 ? (
            vehicles.map((vehicle: any) => (
              <div key={vehicle.id} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Car className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{vehicle.vehicle_number}</h3>
                      <p className="text-sm text-gray-600">
                        {vehicle.make} {vehicle.model}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleEditVehicle(vehicle)}
                      className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    {vehicle.is_active ? (
                      <button
                        onClick={() => handleDeactivateVehicle(vehicle.id)}
                        className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                        title={vehicle.has_invoices ? "Deactivate (service history will be preserved)" : "Delete vehicle"}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        onClick={() => handleReactivateVehicle(vehicle.id)}
                        className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                        title="Reactivate vehicle"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  {!vehicle.is_active && (
                    <div className="flex items-center gap-2 text-sm text-orange-600 bg-orange-50 px-2 py-1 rounded">
                      <AlertCircle className="w-4 h-4" />
                      <span>Deactivated</span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">Year:</span>
                    <span className="font-medium">{vehicle.year || 'N/A'}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm">
                    <Gauge className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">Mileage:</span>
                    <span className="font-medium">{vehicle.current_mileage?.toLocaleString() || 'N/A'} km</span>
                  </div>

                  {vehicle.insurance_date && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-gray-600">Insurance:</span>
                      <span className="font-medium">
                        {formatISTDateOnly(vehicle.insurance_date)}
                      </span>
                    </div>
                  )}

                  {vehicle.has_invoices && (
                    <div className="text-sm text-blue-600">
                      {vehicle.invoice_count} service record{vehicle.invoice_count > 1 ? 's' : ''}
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => navigate(`/dashboard?vehicle=${vehicle.id}`)}
                    className="w-full text-center text-sm text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    View Service History →
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full">
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <Car className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No vehicles registered</h3>
                <p className="text-gray-600 mb-6">
                  Add your first vehicle to start tracking service history and receiving updates.
                </p>
                <button
                  onClick={handleAddVehicle}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Plus className="w-5 h-5" />
                  Add Your First Vehicle
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
