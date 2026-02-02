import { Hono, Context } from 'hono'
import { hash, compare } from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'
import { getSupabaseClient, Env } from '../lib/supabase'

const users = new Hono<{ Bindings: Env }>()

// Helper function to check if user has permission
function hasPermission(userRole: string, requiredRole: string): boolean {
    const roleHierarchy = {
        'admin': 4,
        'manager': 3,
        'staff': 2,
        'technician': 1
    }
    
    return roleHierarchy[userRole as keyof typeof roleHierarchy] >= roleHierarchy[requiredRole as keyof typeof roleHierarchy]
}

// Helper function to get current user from context
async function getCurrentUser(c: Context): Promise<any> {
    const user = c.get('jwtPayload')
    if (!user) {
        throw new Error('Authentication required')
    }
    return user
}

// List all users
export async function list(c: Context) {
    try {
        const currentUser = await getCurrentUser(c)
        
        // Only admin and manager can list users
        if (!hasPermission(currentUser.role, 'manager')) {
            return c.json({ success: false, message: 'Insufficient permissions' }, 403)
        }

        const supabase = getSupabaseClient(c.env)
        const page = parseInt(c.req.query('page') || '1')
        const limit = parseInt(c.req.query('limit') || '20')
        const search = c.req.query('search') || ''

        let query = supabase
            .from('users')
            .select('id, username, email, name, phone, role, permissions, is_active, last_login, login_attempts, locked_until, created_at, updated_at', { count: 'exact' })
            .order('created_at', { ascending: false })
            .range((page - 1) * limit, page * limit - 1)

        if (search) {
            query = query.or(`username.ilike.%${search}%,email.ilike.%${search}%,name.ilike.%${search}%`)
        }

        const { data, error, count } = await query

        if (error) throw error

        return c.json({
            success: true,
            data: data || [],
            pagination: {
                page,
                limit,
                total: count || 0,
                pages: Math.ceil((count || 0) / limit)
            }
        })
    } catch (error) {
        console.error('List users error:', error)
        return c.json({ success: false, message: 'Failed to fetch users' }, 500)
    }
}

// Get user by ID
export async function get(c: Context) {
    try {
        const supabase = getSupabaseClient(c.env)
        const { id } = c.req.param()

        const { data, error } = await supabase
            .from('users')
            .select('id, username, email, name, phone, role, permissions, is_active, last_login, login_attempts, locked_until, created_at, updated_at')
            .eq('id', id)
            .single()

        if (error) throw error

        return c.json({
            success: true,
            data
        })
    } catch (error) {
        console.error('Get user error:', error)
        return c.json({ success: false, message: 'User not found' }, 404)
    }
}

// Create new user
export async function create(c: Context) {
    try {
        const currentUser = await getCurrentUser(c)
        
        // Only admin and manager can create users
        if (!hasPermission(currentUser.role, 'manager')) {
            return c.json({ success: false, message: 'Insufficient permissions' }, 403)
        }

        // Managers can only create staff and technicians, not other managers or admins
        const userData = await c.req.json()
        const { username, email, password, name, phone, role = 'staff', permissions = {}, is_active = true } = userData

        if (currentUser.role === 'manager' && (role === 'admin' || role === 'manager')) {
            return c.json({ success: false, message: 'Managers can only create staff and technician accounts' }, 403)
        }

        const supabase = getSupabaseClient(c.env)

        // Validate required fields
        if (!username || !email || !password || !name) {
            return c.json({ success: false, message: 'Username, email, password, and name are required' }, 400)
        }

        // Check if username or email already exists
        const { data: existingUser } = await supabase
            .from('users')
            .select('id')
            .or(`username.eq.${username},email.eq.${email}`)
            .single()

        if (existingUser) {
            return c.json({ success: false, message: 'Username or email already exists' }, 409)
        }

        // Hash password
        const passwordHash = await hash(password, 10)

        // Create user
        const { data, error } = await supabase
            .from('users')
            .insert({
                username,
                email,
                password_hash: passwordHash,
                name,
                phone: phone || null,
                role,
                permissions,
                is_active
            })
            .select('id, username, email, name, phone, role, permissions, is_active, created_at')
            .single()

        if (error) throw error

        return c.json({
            success: true,
            message: 'User created successfully',
            data
        })
    } catch (error) {
        console.error('Create user error:', error)
        return c.json({ success: false, message: 'Failed to create user' }, 500)
    }
}

// Update user
export async function update(c: Context) {
    try {
        const supabase = getSupabaseClient(c.env)
        const { id } = c.req.param()
        const updateData = await c.req.json()

        // Remove sensitive fields that shouldn't be updated directly
        const { password_hash, created_at, updated_at, ...safeUpdateData } = updateData

        // If password is provided, hash it
        if (safeUpdateData.password) {
            safeUpdateData.password_hash = await hash(safeUpdateData.password, 10)
            delete safeUpdateData.password
        }

        // Add updated timestamp
        safeUpdateData.updated_at = new Date().toISOString()

        const { data, error } = await supabase
            .from('users')
            .update(safeUpdateData)
            .eq('id', id)
            .select('id, username, email, name, phone, role, permissions, is_active, updated_at')
            .single()

        if (error) throw error

        return c.json({
            success: true,
            message: 'User updated successfully',
            data
        })
    } catch (error) {
        console.error('Update user error:', error)
        return c.json({ success: false, message: 'Failed to update user' }, 500)
    }
}

// Delete user
export async function remove(c: Context) {
    try {
        const supabase = getSupabaseClient(c.env)
        const { id } = c.req.param()

        // Check if user exists
        const { data: user } = await supabase
            .from('users')
            .select('username')
            .eq('id', id)
            .single()

        if (!user) {
            return c.json({ success: false, message: 'User not found' }, 404)
        }

        // Delete user (this will cascade delete sessions due to foreign key)
        const { error } = await supabase
            .from('users')
            .delete()
            .eq('id', id)

        if (error) throw error

        return c.json({
            success: true,
            message: `User '${user.username}' deleted successfully`
        })
    } catch (error) {
        console.error('Delete user error:', error)
        return c.json({ success: false, message: 'Failed to delete user' }, 500)
    }
}

// Reset user password
export async function resetPassword(c: Context) {
    try {
        const supabase = getSupabaseClient(c.env)
        const { id } = c.req.param()
        const { newPassword } = await c.req.json()

        if (!newPassword) {
            return c.json({ success: false, message: 'New password is required' }, 400)
        }

        // Hash new password
        const passwordHash = await hash(newPassword, 10)

        const { error } = await supabase
            .from('users')
            .update({ 
                password_hash: passwordHash,
                login_attempts: 0,
                locked_until: null,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)

        if (error) throw error

        return c.json({
            success: true,
            message: 'Password reset successfully'
        })
    } catch (error) {
        console.error('Reset password error:', error)
        return c.json({ success: false, message: 'Failed to reset password' }, 500)
    }
}

// Toggle user active status
export async function toggleStatus(c: Context) {
    try {
        const supabase = getSupabaseClient(c.env)
        const { id } = c.req.param()

        const { data: user } = await supabase
            .from('users')
            .select('is_active')
            .eq('id', id)
            .single()

        if (!user) {
            return c.json({ success: false, message: 'User not found' }, 404)
        }

        const newStatus = !user.is_active

        const { data, error } = await supabase
            .from('users')
            .update({ 
                is_active: newStatus,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .select('id, username, email, name, is_active, updated_at')
            .single()

        if (error) throw error

        return c.json({
            success: true,
            message: `User ${newStatus ? 'activated' : 'deactivated'} successfully`,
            data
        })
    } catch (error) {
        console.error('Toggle status error:', error)
        return c.json({ success: false, message: 'Failed to update user status' }, 500)
    }
}

// Register routes
users.get('/', list)
users.get('/:id', get)
users.post('/', create)
users.put('/:id', update)
users.delete('/:id', remove)
users.post('/:id/reset-password', resetPassword)
users.post('/:id/toggle-status', toggleStatus)

export { users }
