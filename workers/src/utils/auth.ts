import { Context } from 'hono'
import { AuthContext } from '../middleware/auth'

export function getCurrentUser(c: Context): AuthContext {
  const user = c.get('jwtPayload') as AuthContext
  if (!user) {
    throw new Error('User not authenticated')
  }
  return user
}

export function requireAuth(c: Context): AuthContext {
  const user = getCurrentUser(c)
  if (!user) {
    throw new Error('Authentication required')
  }
  return user
}
