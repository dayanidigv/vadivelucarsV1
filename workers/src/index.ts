import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import router from './router'
import { Env } from './lib/supabase'

type Bindings = Env

const app = new Hono<{ Bindings: Bindings }>()

// Middleware
app.use('*', cors({
    origin: '*',
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization']
}))
app.use('*', logger())

// Routes
app.get('/', (c) => {
    return c.json({
        status: 'ok',
        message: 'Vadivelu Cars API v1.0',
        timestamp: new Date().toISOString()
    })
})

app.route('/api', router)

// 404 handler
app.notFound((c) => {
    return c.json({ error: 'Not found' }, 404)
})

// Error handler
app.onError((err, c) => {
    console.error('Error:', err)
    return c.json({ error: 'Internal server error' }, 500)
})

export default app
