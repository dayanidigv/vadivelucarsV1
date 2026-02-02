import { Context, Next } from 'hono'
import { verify } from 'hono/jwt'
import { getSupabaseClient, Env } from '../lib/supabase'

// JWT Secret - In production, use environment variable
const JWT_SECRET = 'vadivelu-cars-secret-key'

export interface AuthContext {
  userId: string
  username: string
  role: string
  sessionId: string
  permissions?: string[]
}

// Extend Hono context type to include user
type AppContext = Context<{ Bindings: Env & { user: AuthContext } }>

export async function authMiddleware(c: Context<{ Bindings: Env }>, next: Next) {
  try {
    const authHeader = c.req.header('Authorization')
    
    // Skip auth for health check and root endpoint
    if (c.req.path === '/' || c.req.path === '/health') {
      await next()
      return
    }

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json({ success: false, message: 'Authorization token required' }, 401)
    }

    const token = authHeader.substring(7)
    
    // Verify and decode JWT token
    const payload = await verify(token, JWT_SECRET, 'HS256').catch(() => null)
    if (!payload) {
      return c.json({ success: false, message: 'Invalid or expired token' }, 401)
    }

    // Check if session exists and is not expired
    const supabase = getSupabaseClient(c.env)
    const { data: session, error } = await supabase
      .from('user_sessions')
      .select('*')
      .eq('session_token', payload.sessionId)
      .eq('user_id', payload.userId)
      .single()

    if (error || !session || new Date(session.expires_at) < new Date()) {
      return c.json({ success: false, message: 'Session expired' }, 401)
    }

    // Get user details and check if active
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, username, email, name, role, permissions, is_active')
      .eq('id', payload.userId)
      .single()

    if (userError || !user || !user.is_active) {
      return c.json({ success: false, message: 'User not found or inactive' }, 401)
    }

    // Add user info to context using jwtPayload (Hono's built-in key)
    c.set('jwtPayload', {
      userId: payload.userId,
      username: payload.username,
      role: payload.role,
      sessionId: payload.sessionId,
      permissions: user.permissions
    } as AuthContext)

    await next()
  } catch (error) {
    console.error('Auth middleware error:', error)
    return c.json({ success: false, message: 'Authentication failed' }, 401)
  }
}

// Role-based access control middleware
export function requireRole(requiredRole: string) {
  return async (c: Context<{ Bindings: Env }>, next: Next) => {
    const user = c.get('jwtPayload') as AuthContext
    
    if (!user) {
      return c.json({ success: false, message: 'Authentication required' }, 401)
    }

    if (user.role !== requiredRole && user.role !== 'admin') {
      return c.json({ success: false, message: 'Insufficient permissions' }, 403)
    }

    await next()
  }
}

// Permission-based access control middleware
export function requirePermission(permission: string) {
  return async (c: Context<{ Bindings: Env }>, next: Next) => {
    const user = c.get('jwtPayload') as AuthContext
    
    if (!user) {
      return c.json({ success: false, message: 'Authentication required' }, 401)
    }

    // Admin has all permissions
    if (user.role === 'admin') {
      await next()
      return
    }

    const userPermissions = user.permissions || []
    if (!userPermissions.includes(permission)) {
      return c.json({ success: false, message: 'Insufficient permissions' }, 403)
    }

    await next()
  }
}
