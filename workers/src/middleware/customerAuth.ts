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
    const jwtSecret = c.env.CUSTOMER_JWT_SECRET || 'fallback-secret-for-dev'

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
    const payload = await verify(token, jwtSecret, 'HS256').catch((err) => {
      // console.debug('JWT verification failed:', err.message)
      return null
    })

    if (!payload || payload.type !== 'customer') {
      return c.json({ success: false, message: 'Invalid or expired customer token' }, 401)
    }

    // Check if customer session exists and is not expired
    const supabase = getSupabaseClient(c.env)
    const { data: session, error } = await supabase
      .from('customer_sessions')
      .select('*')
      .eq('session_token', payload.sessionId)
      .eq('customer_id', payload.customerId)
      .single()

    if (error || !session || new Date(session.expires_at) < new Date()) {
      return c.json({ success: false, message: 'Session expired' }, 401)
    }

    // We trust verified JWT + Session check
    // No need to query customer table again as we have id and phone in token
    // This reduces DB calls from 2 to 1 per request

    // Add customer info to context using jwtPayload key
    c.set('jwtPayload', {
      customerId: payload.customerId,
      phone: payload.phone,
      sessionId: payload.sessionId,
      type: 'customer'
    } as CustomerAuthContext & { type: string })

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
