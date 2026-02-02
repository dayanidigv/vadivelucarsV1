import { Context } from 'hono'
import { getSupabaseClient } from '../lib/supabase'
import { getCurrentCustomer } from '../middleware/customerAuth'

// Allowed fields for customer to update
const CUSTOMER_EDITABLE_FIELDS = [
  'phone',
  'email',
  'address',
  'emergency_contact_name',
  'emergency_contact_phone',
  'communication_preferences'
]

// Validation functions for each field
const fieldValidators = {
  phone: (value: string) => {
    const phoneRegex = /^[0-9]{10}$/
    return phoneRegex.test(value.replace(/\D/g, ''))
  },
  email: (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(value)
  },
  address: (value: string) => {
    return value && value.trim().length > 0
  },
  emergency_contact_name: (value: string) => {
    return value && value.trim().length > 0
  },
  emergency_contact_phone: (value: string) => {
    const phoneRegex = /^[0-9]{10}$/
    return phoneRegex.test(value.replace(/\D/g, ''))
  },
  communication_preferences: (value: any) => {
    return typeof value === 'object' &&
      ['sms', 'email', 'whatsapp'].every(key =>
        typeof value[key] === 'boolean'
      )
  }
}

// Get customer profile
export async function getProfile(c: Context) {
  try {
    const customer = getCurrentCustomer(c)
    const supabase = getSupabaseClient(c.env)

    const { data, error } = await supabase
      .from('customers')
      .select(`
        id,
        name,
        phone,
        email,
        address,
        emergency_contact_name,
        emergency_contact_phone,
        communication_preferences,
        created_at,
        updated_at,
        vehicles:vehicles(
          id,
          vehicle_number,
          make,
          model,
          year,
          current_mileage,
          insurance_date,
          is_active
        )
      `)
      .eq('id', customer.customerId)
      .single()

    if (error) {
      console.error('Profile fetch error:', error)
      return c.json({
        success: false,
        message: 'Failed to fetch profile'
      }, 500)
    }

    return c.json({
      success: true,
      data
    })

  } catch (error) {
    console.error('Profile fetch error:', error)
    return c.json({
      success: false,
      message: 'Internal server error'
    }, 500)
  }
}

// Update customer profile
export async function updateProfile(c: Context) {
  try {
    const customer = getCurrentCustomer(c)
    const body = await c.req.json()
    const supabase = getSupabaseClient(c.env)

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
        if (validator && !validator(value as any)) {
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

    // Check for duplicate phone/email (if updating)
    if (validUpdates.phone || validUpdates.email) {
      const { data: existingCustomer } = await supabase
        .from('customers')
        .select('id, phone, email')
        .neq('id', customer.customerId)
        .or(`phone.eq.${validUpdates.phone || ''},email.eq.${validUpdates.email || ''}`)
        .single()

      if (existingCustomer) {
        if (existingCustomer.phone === validUpdates.phone) {
          return c.json({
            success: false,
            message: 'Phone number already exists'
          }, 400)
        }
        if (existingCustomer.email === validUpdates.email) {
          return c.json({
            success: false,
            message: 'Email already exists'
          }, 400)
        }
      }
    }

    // Update profile
    const { data, error } = await supabase
      .from('customers')
      .update({
        ...validUpdates,
        updated_at: new Date().toISOString()
      })
      .eq('id', customer.customerId)
      .select()
      .single()

    if (error) {
      console.error('Profile update error:', error)
      return c.json({
        success: false,
        message: 'Failed to update profile'
      }, 500)
    }

    return c.json({
      success: true,
      message: 'Profile updated successfully',
      data
    })

  } catch (error) {
    console.error('Profile update error:', error)
    return c.json({
      success: false,
      message: 'Internal server error'
    }, 500)
  }
}

// Send phone verification OTP
export async function sendPhoneVerification(c: Context) {
  try {
    const customer = getCurrentCustomer(c)
    const { phone } = await c.req.json()

    if (!phone || !fieldValidators.phone(phone)) {
      return c.json({
        success: false,
        message: 'Valid phone number is required'
      }, 400)
    }

    // TODO: Implement actual OTP sending logic
    // For now, just return success
    console.log('Phone verification OTP sent to:', phone)

    return c.json({
      success: true,
      message: 'OTP sent successfully'
    })

  } catch (error) {
    console.error('Phone verification error:', error)
    return c.json({
      success: false,
      message: 'Failed to send OTP'
    }, 500)
  }
}
