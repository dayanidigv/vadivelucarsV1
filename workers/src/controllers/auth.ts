import { Hono } from 'hono'
import { sign, verify } from 'hono/jwt'
import { hash, compare } from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'
import { getSupabaseClient, Env } from '../lib/supabase'

const auth = new Hono<{ Bindings: Env }>()

// JWT Secret - In production, use environment variable
const JWT_SECRET = 'vadivelu-cars-secret-key'

// Login endpoint
auth.post('/login', async (c) => {
  try {
    const { username, password } = await c.req.json()
    const supabase = getSupabaseClient(c.env)

    console.log('Login attempt:', { username, hasPassword: !!password })

    if (!username || !password) {
      return c.json({ success: false, message: 'Username and password are required' }, 400)
    }

    // Find user by username or email
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .or(`username.eq.${username},email.eq.${username}`)
      .single()

    console.log('User query result:', { error: error?.message, userFound: !!user })

    if (error || !user) {
      console.log('User not found or error:', error)
      return c.json({ success: false, message: 'Invalid credentials' }, 401)
    }

    // Check if user is active
    if (!user.is_active) {
      return c.json({ success: false, message: 'Account is deactivated' }, 401)
    }

    // Check if account is locked
    if (user.locked_until && new Date(user.locked_until) > new Date()) {
      return c.json({ 
        success: false, 
        message: 'Account is temporarily locked. Please try again later.' 
      }, 423)
    }

    // Verify password
    const isValidPassword = await compare(password, user.password_hash)
    console.log('Password verification:', { isValid: isValidPassword })

    if (!isValidPassword) {
      // Increment login attempts
      const attempts = (user.login_attempts || 0) + 1
      const updateData: any = { login_attempts: attempts }

      // Lock account after 5 failed attempts for 30 minutes
      if (attempts >= 5) {
        updateData.locked_until = new Date(Date.now() + 30 * 60 * 1000).toISOString()
      }

      await supabase
        .from('users')
        .update(updateData)
        .eq('id', user.id)

      return c.json({ success: false, message: 'Invalid credentials' }, 401)
    }

    // Reset login attempts on successful login
    await supabase
      .from('users')
      .update({ 
        login_attempts: 0, 
        locked_until: null,
        last_login: new Date().toISOString()
      })
      .eq('id', user.id)

    // Create session token
    const sessionToken = uuidv4()
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    // Store session
    await supabase
      .from('user_sessions')
      .insert({
        user_id: user.id,
        session_token: sessionToken,
        expires_at: expiresAt.toISOString(),
        ip_address: c.req.header('x-forwarded-for') || c.req.header('x-real-ip'),
        user_agent: c.req.header('user-agent')
      })

    // Create JWT token
    const token = await sign({
      userId: user.id,
      username: user.username,
      role: user.role,
      sessionId: sessionToken
    }, JWT_SECRET)

    // Remove sensitive data
    const { password_hash, ...userWithoutPassword } = user

    return c.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: userWithoutPassword,
        expiresIn: 24 * 60 * 60 // 24 hours in seconds
      }
    })

  } catch (error) {
    console.error('Login error:', error)
    return c.json({ success: false, message: 'Internal server error' }, 500)
  }
})

// Logout endpoint
auth.post('/logout', async (c) => {
  try {
    const supabase = getSupabaseClient(c.env)
    const authHeader = c.req.header('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json({ success: false, message: 'No token provided' }, 401)
    }

    const token = authHeader.substring(7)
    
    // Verify and decode token
    const payload = await verify(token, JWT_SECRET, 'HS256').catch(() => null)
    if (!payload) {
      return c.json({ success: false, message: 'Invalid token' }, 401)
    }

    // Remove session from database
    await supabase
      .from('user_sessions')
      .delete()
      .eq('session_token', payload.sessionId)

    return c.json({
      success: true,
      message: 'Logout successful'
    })

  } catch (error) {
    console.error('Logout error:', error)
    return c.json({ success: false, message: 'Internal server error' }, 500)
  }
})

// Verify token endpoint
auth.get('/verify', async (c) => {
  try {
    const supabase = getSupabaseClient(c.env)
    const authHeader = c.req.header('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json({ success: false, message: 'No token provided' }, 401)
    }

    const token = authHeader.substring(7)
    
    // Verify and decode token
    const payload = await verify(token, JWT_SECRET, 'HS256').catch(() => null)
    if (!payload) {
      return c.json({ success: false, message: 'Invalid token' }, 401)
    }

    // Check if session exists and is not expired
    const { data: session, error } = await supabase
      .from('user_sessions')
      .select('*')
      .eq('session_token', payload.sessionId)
      .eq('user_id', payload.userId)
      .single()

    if (error || !session || new Date(session.expires_at) < new Date()) {
      return c.json({ success: false, message: 'Session expired' }, 401)
    }

    // Get user details
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, username, email, name, role, permissions, is_active')
      .eq('id', payload.userId)
      .single()

    if (userError || !user || !user.is_active) {
      return c.json({ success: false, message: 'User not found or inactive' }, 401)
    }

    return c.json({
      success: true,
      data: {
        user,
        sessionId: payload.sessionId
      }
    })

  } catch (error) {
    console.error('Verify error:', error)
    return c.json({ success: false, message: 'Internal server error' }, 500)
  }
})

// Change password endpoint
auth.post('/change-password', async (c) => {
  try {
    const supabase = getSupabaseClient(c.env)
    const authHeader = c.req.header('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json({ success: false, message: 'No token provided' }, 401)
    }

    const token = authHeader.substring(7)
    const { currentPassword, newPassword } = await c.req.json()

    if (!currentPassword || !newPassword) {
      return c.json({ success: false, message: 'Current password and new password are required' }, 400)
    }

    // Verify token
    const payload = await verify(token, JWT_SECRET, 'HS256').catch(() => null)
    if (!payload) {
      return c.json({ success: false, message: 'Invalid token' }, 401)
    }

    // Get user
    const { data: user, error } = await supabase
      .from('users')
      .select('password_hash')
      .eq('id', payload.userId)
      .single()

    if (error || !user) {
      return c.json({ success: false, message: 'User not found' }, 404)
    }

    // Verify current password
    const isValidPassword = await compare(currentPassword, user.password_hash)
    if (!isValidPassword) {
      return c.json({ success: false, message: 'Current password is incorrect' }, 401)
    }

    // Hash new password
    const newPasswordHash = await hash(newPassword, 10)

    // Update password
    await supabase
      .from('users')
      .update({ password_hash: newPasswordHash })
      .eq('id', payload.userId)

    return c.json({
      success: true,
      message: 'Password changed successfully'
    })

  } catch (error) {
    console.error('Change password error:', error)
    return c.json({ success: false, message: 'Internal server error' }, 500)
  }
})

export { auth }
