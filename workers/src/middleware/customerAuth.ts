import { Context, Next } from 'hono'
import { verify } from 'hono/jwt'
import { getSupabaseClient, Env } from '../lib/supabase'

// JWT Secret for customer tokens
const CUSTOMER_JWT_SECRET = 'vadivelu-cars-customer-secret-key'

export interface CustomerAuthContext {
  customerId: string
  phone: string
  sessionId: string
}

export async function customerAuthMiddleware(c: Context<{ Bindings: Env }>, next: Next) {
  try {
    const authHeader = c.req.header('Authorization')
    
    // Skip auth for customer auth endpoints
    if (c.req.path.startsWith('/api/customer-auth')) {
      await next()
      return
    }

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json({ success: false, message: 'Authorization token required' }, 401)
    }

    const token = authHeader.substring(7)
    
    // Verify and decode customer JWT token
    const payload = await verify(token, CUSTOMER_JWT_SECRET, 'HS256').catch(() => null)
    if (!payload || payload.type !== 'customer') {
      return c.json({ success: false, message: 'Invalid or expired customer token' }, 401)
    }

    console.log('Customer auth check:', { 
      path: c.req.path, 
      customerId: payload.customerId,
      sessionId: payload.sessionId
    })

    // Check if customer session exists and is not expired
    const supabase = getSupabaseClient(c.env)
    const { data: session, error } = await supabase
      .from('customer_sessions')
      .select('*')
      .eq('session_token', payload.sessionId)
      .eq('customer_id', payload.customerId)
      .single()

    if (error || !session || new Date(session.expires_at) < new Date()) {
      console.log('Customer session validation failed')
      return c.json({ success: false, message: 'Session expired' }, 401)
    }

    // Get customer details and check if active
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .select('id, name, phone, email, address, is_active')
      .eq('id', payload.customerId)
      .single()

    if (customerError || !customer) {
      console.log('Customer validation failed')
      return c.json({ success: false, message: 'Customer not found' }, 401)
    }

    // Add customer info to context using jwtPayload key
    c.set('jwtPayload', {
      customerId: payload.customerId,
      phone: payload.phone,
      sessionId: payload.sessionId,
      type: 'customer'
    } as CustomerAuthContext & { type: string })

    console.log('Customer auth successful for:', customer.name)
    await next()
  } catch (error) {
    console.error('Customer auth middleware error:', error)
    return c.json({ success: false, message: 'Authentication failed' }, 401)
  }
}

// Helper function to get current customer from context
export function getCurrentCustomer(c: Context): CustomerAuthContext {
  const customer = c.get('jwtPayload') as CustomerAuthContext & { type: string }
  if (!customer || customer.type !== 'customer') {
    throw new Error('Customer authentication required')
  }
  return customer
}
