import { Hono, Context } from 'hono'
import { getSupabaseClient, Env } from '../lib/supabase'
import { getCurrentCustomer } from '../middleware/customerAuth'

const customerInvoices = new Hono<{ Bindings: Env }>()

// List invoices for the authenticated customer
export async function list(c: Context) {
    try {
        const customer = getCurrentCustomer(c)
        const supabase = getSupabaseClient(c.env)
        
        const page = parseInt(c.req.query('page') || '1')
        const limit = parseInt(c.req.query('limit') || '20')

        const { data, error, count } = await supabase
            .from('invoices')
            .select(`
                *,
                customer:customers(id, name, phone, email),
                vehicles:vehicles(id, vehicle_number, make, model, year),
                invoice_items:invoice_items(id, description, quantity, unit_price, total)
            `, { count: 'exact' })
            .eq('customer_id', customer.customerId)
            .order('created_at', { ascending: false })
            .range((page - 1) * limit, page * limit - 1)

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
        console.error('List customer invoices error:', error)
        return c.json({ success: false, message: 'Failed to fetch invoices' }, 500)
    }
}

// Get specific invoice for the authenticated customer
export async function get(c: Context) {
    try {
        const customer = getCurrentCustomer(c)
        const { id } = c.req.param()
        const supabase = getSupabaseClient(c.env)

        const { data, error } = await supabase
            .from('invoices')
            .select(`
                *,
                customer:customers(id, name, phone, email, address),
                vehicles:vehicles(id, vehicle_number, make, model, year),
                invoice_items:invoice_items(id, description, quantity, unit_price, total)
            `)
            .eq('id', id)
            .eq('customer_id', customer.customerId)
            .single()

        if (error || !data) {
            return c.json({ success: false, message: 'Invoice not found' }, 404)
        }

        return c.json({
            success: true,
            data
        })
    } catch (error) {
        console.error('Get customer invoice error:', error)
        return c.json({ success: false, message: 'Failed to fetch invoice' }, 500)
    }
}

// Shared invoice print endpoint (accessible by both admin and customer)
export async function print(c: Context) {
    try {
        const { id } = c.req.param()
        const supabase = getSupabaseClient(c.env)
        
        // Get user info to determine if it's admin or customer
        const userContext = c.get('jwtPayload')
        
        let query = supabase
            .from('invoices')
            .select(`
                *,
                customer:customers(id, name, phone, email, address),
                vehicles:vehicles(id, vehicle_number, make, model, year),
                invoice_items:invoice_items(id, description, quantity, unit_price, total)
            `)
            .eq('id', id)

        // If customer, filter by their own invoices
        if (userContext?.type === 'customer') {
            query = query.eq('customer_id', userContext.customerId)
        }

        const { data, error } = await query.single()

        if (error || !data) {
            return c.json({ success: false, message: 'Invoice not found' }, 404)
        }

        return c.json({
            success: true,
            data
        })
    } catch (error) {
        console.error('Print invoice error:', error)
        return c.json({ success: false, message: 'Failed to fetch invoice' }, 500)
    }
}

// Register routes
customerInvoices.get('/', list)
customerInvoices.get('/:id', get)

export { customerInvoices }
