import { Context } from 'hono'
import { getSupabaseClient } from '../lib/supabase'
import { getCurrentCustomer } from '../middleware/customerAuth'

// Fields customers can edit (non-critical, safe to modify)
const CUSTOMER_EDITABLE_FIELDS = [
  'current_mileage',
  'insurance_date',
  'insurance_renewal_date',
  'notes',
  'contact_preferences'
]

// Validation functions
const fieldValidators = {
  current_mileage: (value: number) => {
    return typeof value === 'number' && value >= 0 && value <= 1000000
  },
  insurance_date: (value: string) => {
    return !isNaN(Date.parse(value))
  },
  insurance_renewal_date: (value: string) => {
    return !isNaN(Date.parse(value))
  },
  notes: (value: string) => {
    return typeof value === 'string' && value.length <= 1000
  },
  contact_preferences: (value: any) => {
    return typeof value === 'object' &&
      ['sms', 'email', 'whatsapp'].every(key =>
        typeof value[key] === 'boolean'
      )
  }
}

// Get all customer vehicles (including deactivated)
export async function getVehicles(c: Context) {
  try {
    const customer = getCurrentCustomer(c)
    const supabase = getSupabaseClient(c.env)

    const { data, error } = await supabase
      .from('vehicles')
      .select(`
        id,
        vehicle_number,
        make,
        model,
        year,
        current_mileage,
        insurance_date,
        insurance_renewal_date,
        notes,
        contact_preferences,
        is_active,
        deactivated_at,
        deactivation_reason,
        created_at,
        updated_at,
        invoices:invoices(
          id,
          created_at,
          total_amount,
          payment_status
        )
      `)
      .eq('customer_id', customer.customerId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Vehicles fetch error:', error)
      return c.json({
        success: false,
        message: 'Failed to fetch vehicles'
      }, 500)
    }

    // Add has_invoices flag for each vehicle
    const vehiclesWithFlags = data?.map(vehicle => ({
      ...vehicle,
      has_invoices: vehicle.invoices && vehicle.invoices.length > 0,
      invoice_count: vehicle.invoices?.length || 0
    })) || []

    return c.json({
      success: true,
      data: vehiclesWithFlags
    })

  } catch (error) {
    console.error('Vehicles fetch error:', error)
    return c.json({
      success: false,
      message: 'Internal server error'
    }, 500)
  }
}

// Add new vehicle
export async function addVehicle(c: Context) {
  try {
    const customer = getCurrentCustomer(c)
    const body = await c.req.json()
    const supabase = getSupabaseClient(c.env)

    // Required fields for new vehicle
    const requiredFields = ['vehicle_number', 'make', 'model']
    const missingFields = requiredFields.filter(field => !body[field])

    if (missingFields.length > 0) {
      return c.json({
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`
      }, 400)
    }

    // Check for duplicate vehicle number
    const { data: existingVehicle } = await supabase
      .from('vehicles')
      .select('id')
      .eq('vehicle_number', body.vehicle_number)
      .eq('customer_id', customer.customerId)
      .single()

    if (existingVehicle) {
      return c.json({
        success: false,
        message: 'Vehicle with this number already exists'
      }, 400)
    }

    // Create new vehicle
    const { data, error } = await supabase
      .from('vehicles')
      .insert({
        customer_id: customer.customerId,
        vehicle_number: body.vehicle_number.trim().toUpperCase(),
        make: body.make.trim(),
        model: body.model.trim(),
        year: body.year || null,
        current_mileage: body.current_mileage || 0,
        insurance_date: body.insurance_date || null,
        insurance_renewal_date: body.insurance_renewal_date || null,
        notes: body.notes || null,
        contact_preferences: body.contact_preferences || {
          sms: true,
          email: true,
          whatsapp: false
        },
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('Vehicle creation error:', error)
      return c.json({
        success: false,
        message: 'Failed to add vehicle'
      }, 500)
    }

    return c.json({
      success: true,
      message: 'Vehicle added successfully',
      data
    })

  } catch (error) {
    console.error('Vehicle creation error:', error)
    return c.json({
      success: false,
      message: 'Internal server error'
    }, 500)
  }
}

// Update vehicle (limited fields only)
export async function updateVehicle(c: Context) {
  try {
    const customer = getCurrentCustomer(c)
    const { id } = c.req.param()
    const body = await c.req.json()
    const supabase = getSupabaseClient(c.env)

    // Verify vehicle belongs to customer
    const { data: vehicle } = await supabase
      .from('vehicles')
      .select('id, customer_id, is_active')
      .eq('id', id)
      .eq('customer_id', customer.customerId)
      .single()

    if (!vehicle) {
      return c.json({
        success: false,
        message: 'Vehicle not found'
      }, 404)
    }

    // Validate and filter allowed fields
    const validUpdates: any = {}
    const validationErrors: string[] = []

    for (const [key, value] of Object.entries(body)) {
      // Check if field is editable
      if (!CUSTOMER_EDITABLE_FIELDS.includes(key)) {
        validationErrors.push(`${key} cannot be updated`)
        continue
      }

      // Validate field value
      if (value !== null && value !== undefined) {
        const validator = fieldValidators[key as keyof typeof fieldValidators]
        if (validator && !(validator as (value: any) => boolean)(value)) {
          validationErrors.push(`Invalid ${key} format`)
          continue
        }
      }

      validUpdates[key] = value
    }

    if (validationErrors.length > 0) {
      return c.json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      }, 400)
    }

    // Update vehicle
    const { data, error } = await supabase
      .from('vehicles')
      .update({
        ...validUpdates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('customer_id', customer.customerId)
      .select()
      .single()

    if (error) {
      console.error('Vehicle update error:', error)
      return c.json({
        success: false,
        message: 'Failed to update vehicle'
      }, 500)
    }

    return c.json({
      success: true,
      message: 'Vehicle updated successfully',
      data
    })

  } catch (error) {
    console.error('Vehicle update error:', error)
    return c.json({
      success: false,
      message: 'Internal server error'
    }, 500)
  }
}

// Deactivate vehicle (soft delete)
export async function deactivateVehicle(c: Context) {
  try {
    const customer = getCurrentCustomer(c)
    const { id } = c.req.param()
    const supabase = getSupabaseClient(c.env)

    // Check if vehicle exists and belongs to customer
    const { data: vehicle, error: fetchError } = await supabase
      .from('vehicles')
      .select(`
        id,
        customer_id,
        vehicle_number,
        is_active,
        invoices:invoices(id)
      `)
      .eq('id', id)
      .eq('customer_id', customer.customerId)
      .single()

    if (fetchError || !vehicle) {
      return c.json({
        success: false,
        message: 'Vehicle not found'
      }, 404)
    }

    if (!vehicle.is_active) {
      return c.json({
        success: false,
        message: 'Vehicle is already deactivated'
      }, 400)
    }

    // Check for associated invoices
    const hasInvoices = vehicle.invoices && vehicle.invoices.length > 0

    if (hasInvoices) {
      // Soft delete - preserve invoice relationships
      const { error } = await supabase
        .from('vehicles')
        .update({
          is_active: false,
          deactivated_at: new Date().toISOString(),
          deactivation_reason: 'customer_request',
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('customer_id', customer.customerId)

      if (error) {
        console.error('Vehicle deactivation error:', error)
        return c.json({
          success: false,
          message: 'Failed to deactivate vehicle'
        }, 500)
      }

      return c.json({
        success: true,
        message: 'Vehicle deactivated successfully. Your service history is preserved.',
        hasInvoices: true
      })

    } else {
      // Safe to hard delete (no invoices)
      const { error } = await supabase
        .from('vehicles')
        .delete()
        .eq('id', id)
        .eq('customer_id', customer.customerId)

      if (error) {
        console.error('Vehicle deletion error:', error)
        return c.json({
          success: false,
          message: 'Failed to delete vehicle'
        }, 500)
      }

      return c.json({
        success: true,
        message: 'Vehicle deleted successfully',
        hasInvoices: false
      })
    }

  } catch (error) {
    console.error('Vehicle deactivation error:', error)
    return c.json({
      success: false,
      message: 'Internal server error'
    }, 500)
  }
}

// Reactivate vehicle
export async function reactivateVehicle(c: Context) {
  try {
    const customer = getCurrentCustomer(c)
    const { id } = c.req.param()
    const supabase = getSupabaseClient(c.env)

    const { data, error } = await supabase
      .from('vehicles')
      .update({
        is_active: true,
        deactivated_at: null,
        deactivation_reason: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('customer_id', customer.customerId)
      .select()
      .single()

    if (error) {
      console.error('Vehicle reactivation error:', error)
      return c.json({
        success: false,
        message: 'Failed to reactivate vehicle'
      }, 500)
    }

    if (!data) {
      return c.json({
        success: false,
        message: 'Vehicle not found'
      }, 404)
    }

    return c.json({
      success: true,
      message: 'Vehicle reactivated successfully',
      data
    })

  } catch (error) {
    console.error('Vehicle reactivation error:', error)
    return c.json({
      success: false,
      message: 'Internal server error'
    }, 500)
  }
}
