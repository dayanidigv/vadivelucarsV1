import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import router from './router'
import { Env } from './lib/supabase'
import { authMiddleware } from './middleware/auth'

type Bindings = Env

const app = new Hono<{ Bindings: Bindings }>()

// Middleware
app.use('*', cors({
    origin: '*',
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization']
}))
app.use('*', logger())

// Apply authentication middleware to all /api routes except auth endpoints
app.use('/api/*', async (c, next) => {
    // Skip auth middleware for auth endpoints
    if (c.req.path.startsWith('/api/auth') || c.req.path.startsWith('/api/customer-auth')) {
        await next()
        return
    }
    await authMiddleware(c, next)
})

// Routes
app.get('/', (c) => {
    return c.json({
        status: 'ok',
        message: 'Vadivelu Cars API v1.0',
        timestamp: new Date().toISOString()
    })
})

// Enhanced health check
app.get('/health', (c) => {
    const envStatus = {
        hasSupabaseUrl: !!c.env.SUPABASE_URL,
        hasSupabaseAnonKey: !!c.env.SUPABASE_ANON_KEY,
        hasSupabaseServiceKey: !!c.env.SUPABASE_SERVICE_KEY,
        isDev: !!c.env.DEV
    }

    const allEnvSet = envStatus.hasSupabaseUrl && envStatus.hasSupabaseAnonKey && envStatus.hasSupabaseServiceKey

    return c.json({
        status: allEnvSet ? 'healthy' : 'unhealthy',
        timestamp: new Date().toISOString(),
        environment: envStatus
    }, allEnvSet ? 200 : 503)
})

// Database test endpoint
app.get('/test-db', async (c) => {
    try {
        const { getSupabaseClient } = await import('./lib/supabase')
        const supabase = getSupabaseClient(c.env)
        
        // Test basic connection
        const { data, error } = await supabase
            .from('users')
            .select('count')
            .limit(1)
        
        return c.json({
            success: !error,
            error: error?.message,
            hasUsers: !!data,
            timestamp: new Date().toISOString()
        })
    } catch (err) {
        return c.json({
            success: false,
            error: err instanceof Error ? err.message : 'Unknown error',
            timestamp: new Date().toISOString()
        }, 500)
    }
})

app.route('/api', router)

// 404 handler
app.notFound((c) => {
    return c.json({ error: 'Not found' }, 404)
})

// Error handler
app.onError((err, c) => {
    console.error('Error details:', {
        message: err.message,
        stack: err.stack,
        url: c.req.url,
        method: c.req.method,
        env: {
            hasSupabaseUrl: !!c.env.SUPABASE_URL,
            hasSupabaseAnonKey: !!c.env.SUPABASE_ANON_KEY,
            hasSupabaseServiceKey: !!c.env.SUPABASE_SERVICE_KEY
        }
    })
    
    // In development, send detailed error info
    if (c.env.DEV) {
        return c.json({ 
            error: err.message,
            stack: err.stack,
            env: {
                hasSupabaseUrl: !!c.env.SUPABASE_URL,
                hasSupabaseAnonKey: !!c.env.SUPABASE_ANON_KEY,
                hasSupabaseServiceKey: !!c.env.SUPABASE_SERVICE_KEY
            }
        }, 500)
    }
    
    return c.json({ error: 'Internal server error' }, 500)
})

export default app
