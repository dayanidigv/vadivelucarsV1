import { Hono, Context } from 'hono'
import { getSupabaseClient, Env } from '../lib/supabase'
import { getCurrentCustomer } from '../middleware/customerAuth'
import { customerAuthMiddleware } from '../middleware/customerAuth'

const customerEstimations = new Hono<{ Bindings: Env }>()

export async function list(c: Context) {
    try {
        const customer = getCurrentCustomer(c)
        const page = parseInt(c.req.query('page') || '1')
        const limit = parseInt(c.req.query('limit') || '20')
        const supabase = getSupabaseClient(c.env)

        const { data, error } = await supabase
            .from('estimations')
            .select(`
                *,
                vehicle:vehicles(id, vehicle_number, make, model, year)
            `)
            .eq('customer_id', customer.customerId)
            .neq('status', 'draft')
            .order('created_at', { ascending: false })
            .range((page - 1) * limit, page * limit - 1)

        if (error) {
            console.error('Customer estimation list error:', error)
            return c.json({ success: false, message: 'Failed to fetch estimations' }, 500)
        }

        return c.json({
            success: true,
            data: data || []
        })
    } catch (error) {
        console.error('Customer estimation list error:', error)
        return c.json({
            error: "Internal server error",
            message: error instanceof Error ? error.message : 'Unknown error'
        }, 500)
    }
}

export async function get(c: Context) {
    try {
        const customer = getCurrentCustomer(c)
        const { id } = c.req.param()
        const supabase = getSupabaseClient(c.env)

        const { data, error } = await supabase
            .from('estimations')
            .select(`
                *,
                customer:customers(id, name, phone, email, address),
                vehicle:vehicles(id, vehicle_number, make, model, year),
                items:estimation_items(*)
            `)
            .eq('id', id)
            .eq('customer_id', customer.customerId)
            .single()

        if (error) {
            return c.json({ success: false, message: 'Estimation not found' }, 404)
        }

        if (!data) {
            return c.json({ success: false, message: 'Estimation not found' }, 404)
        }

        return c.json({ success: true, data })
    } catch (error) {
        console.error('Get customer estimation error:', error)
        return c.json({ success: false, message: 'Failed to fetch estimation' }, 500)
    }
}

customerEstimations.use('*', customerAuthMiddleware)
customerEstimations.get('/', list)
customerEstimations.get('/:id', get)

export { customerEstimations }
