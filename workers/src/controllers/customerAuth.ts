import { Hono } from 'hono'
import { sign, verify } from 'hono/jwt'
import { v4 as uuidv4 } from 'uuid'
import { getSupabaseClient, Env } from '../lib/supabase'

const customerAuth = new Hono<{ Bindings: Env }>()

// JWT Secret - In production, use environment variable
// JWT Secret managed via env

// Public API to check phone number availability
customerAuth.post('/check-phone', async (c) => {
  try {
    const { phone } = await c.req.json()
    const supabase = getSupabaseClient(c.env)

    if (!phone) {
      return c.json({ success: false, message: 'Phone number is required' }, 400)
    }

    // Check if customer exists with this phone number
    const { data: customer, error } = await supabase
      .from('customers')
      .select('id, name, phone, email')
      .eq('phone', phone)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found" error
      return c.json({ success: false, message: 'Database error' }, 500)
    }

    if (!customer) {
      return c.json({
        success: false,
        message: 'Phone number not found',
        available: false
      }, 404)
    }

    return c.json({
      success: true,
      message: 'Phone number found',
      available: true,
      customer: {
        id: customer.id,
        name: customer.name,
        phone: customer.phone,
        email: customer.email
      }
    })

  } catch (error) {
    console.error('Check phone error:', error)
    return c.json({ success: false, message: 'Internal server error' }, 500)
  }
})

// Customer Login endpoint (phone-based with vehicle validation)
customerAuth.post('/login', async (c) => {
  try {
    const { phone, vehicleNumber } = await c.req.json()
    const supabase = getSupabaseClient(c.env)
    const jwtSecret = c.env.CUSTOMER_JWT_SECRET || 'fallback-secret-for-dev'

    if (!phone || !vehicleNumber) {
      return c.json({ success: false, message: 'Phone number and Vehicle number are required' }, 400)
    }

    // Find customer by phone with vehicles
    // We don't need invoices here, just credentials verification
    const { data: customer, error } = await supabase
      .from('customers')
      .select(`
      *,
      vehicles:vehicles(*)
    `)
      .eq('phone', phone)
      .single()

    if (error || !customer) {
      // Generic error for security
      return c.json({ success: false, message: 'Invalid credentials' }, 401)
    }

    // Validate vehicle number (Acts as password)
    // Normalize string: remove spaces, lowercase
    const normalize = (s: string) => s.replace(/\\s+/g, '').toLowerCase()
    const inputVehicle = normalize(vehicleNumber)

    const hasVehicle = customer.vehicles?.some((vehicle: any) =>
      normalize(vehicle.vehicle_number) === inputVehicle
    )

    if (!hasVehicle) {
      console.warn(`Failed login attempt for ${phone}: Vehicle mismatch`)
      return c.json({ success: false, message: 'Invalid credentials' }, 401)
    }

    // Create session token
    const sessionToken = uuidv4()
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

    // Store customer session
    const { error: sessionError } = await supabase
      .from('customer_sessions')
      .insert({
        customer_id: customer.id,
        session_token: sessionToken,
        expires_at: expiresAt.toISOString(),
        ip_address: c.req.header('x-forwarded-for') || c.req.header('x-real-ip'),
        user_agent: c.req.header('user-agent')
      })

    if (sessionError) {
      console.error('Session creation error:', sessionError)
      return c.json({ success: false, message: 'Login failed' }, 500)
    }

    // Create JWT token
    const token = await sign({
      customerId: customer.id,
      phone: customer.phone,
      type: 'customer',
      sessionId: sessionToken
    }, jwtSecret)

    // Fetch invoices only after successful auth if needed, or let frontend fetch it
    // For login response, we'll keep it light but include basic info

    return c.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        customer: {
          id: customer.id,
          name: customer.name,
          phone: customer.phone,
          email: customer.email,
          vehicles: customer.vehicles
        },
        expiresIn: 7 * 24 * 60 * 60 // 7 days in seconds
      }
    })

  } catch (error) {
    console.error('Customer login error:', error)
    return c.json({ success: false, message: 'Internal server error' }, 500)
  }
})

// Customer Logout endpoint
customerAuth.post('/logout', async (c) => {
  try {
    const supabase = getSupabaseClient(c.env)
    const jwtSecret = c.env.CUSTOMER_JWT_SECRET || 'fallback-secret-for-dev'
    const authHeader = c.req.header('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json({ success: false, message: 'No token provided' }, 401)
    }

    const token = authHeader.substring(7)

    // Verify and decode token
    const payload = await verify(token, jwtSecret, 'HS256').catch(() => null)
    if (!payload || payload.type !== 'customer') {
      return c.json({ success: false, message: 'Invalid token' }, 401)
    }

    // Remove session from database
    await supabase
      .from('customer_sessions')
      .delete()
      .eq('session_token', payload.sessionId)

    return c.json({
      success: true,
      message: 'Logout successful'
    })

  } catch (error) {
    console.error('Customer logout error:', error)
    return c.json({ success: false, message: 'Internal server error' }, 500)
  }
})

// Verify customer token endpoint
customerAuth.get('/verify', async (c) => {
  try {
    const supabase = getSupabaseClient(c.env)
    const jwtSecret = c.env.CUSTOMER_JWT_SECRET || 'fallback-secret-for-dev'
    const authHeader = c.req.header('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json({ success: false, message: 'No token provided' }, 401)
    }

    const token = authHeader.substring(7)

    // Verify and decode token
    const payload = await verify(token, jwtSecret, 'HS256').catch(() => null)
    if (!payload || payload.type !== 'customer') {
      return c.json({ success: false, message: 'Invalid token' }, 401)
    }

    // Check if session exists and is not expired
    const { data: session, error } = await supabase
      .from('customer_sessions')
      .select('*')
      .eq('session_token', payload.sessionId)
      .eq('customer_id', payload.customerId)
      .single()

    if (error || !session || new Date(session.expires_at) < new Date()) {
      return c.json({ success: false, message: 'Session expired' }, 401)
    }

    // Get customer details
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .select('id, name, phone, email, address')
      .eq('id', payload.customerId)
      .single()

    if (customerError || !customer) {
      return c.json({ success: false, message: 'Customer not found' }, 401)
    }

    return c.json({
      success: true,
      data: {
        customer,
        sessionId: payload.sessionId
      }
    })

  } catch (error) {
    console.error('Customer verify error:', error)
    return c.json({ success: false, message: 'Internal server error' }, 500)
  }
})

export { customerAuth }
