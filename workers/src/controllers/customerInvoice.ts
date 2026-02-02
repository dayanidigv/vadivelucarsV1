import { Hono, Context } from 'hono'
import { getSupabaseClient, Env } from '../lib/supabase'
import { getCurrentCustomer } from '../middleware/customerAuth'

const customerInvoices = new Hono<{ Bindings: Env }>()

// Get customer's invoices list
export async function list(c: Context) {
    try {
        const customer = getCurrentCustomer(c)
        const page = parseInt(c.req.query('page') || '1')
        const limit = parseInt(c.req.query('limit') || '20')
        const supabase = getSupabaseClient(c.env)

        const { data, error } = await supabase
            .from('invoices')
            .select(`
                *,
                customer:customers(id, name, phone, email, address),
                vehicle:vehicles(id, vehicle_number, make, model, year)
            `)
            .eq('customer_id', customer.customerId)
            .order('created_at', { ascending: false })
            .range((page - 1) * limit, page * limit - 1)

        if (error) {
            console.error('Customer invoice list error:', error)
            return c.json({ success: false, message: 'Failed to fetch invoices' }, 500)
        }

        return c.json({
            success: true,
            data: data || []
        })
    } catch (error) {
        console.error('Customer invoice list error:', error)
        return c.json({
            error: "Internal server error",
            message: error instanceof Error ? error.message : 'Unknown error'
        }, 500)
    }
}

// Get specific invoice for the authenticated customer
export async function get(c: Context) {
    try {
        const customer = getCurrentCustomer(c)
        const { id } = c.req.param()
        const supabase = getSupabaseClient(c.env)

        console.log('🔍 Customer invoice lookup:', {
            invoiceId: id,
            customerId: customer.customerId
        })

        const { data, error } = await supabase
            .from('invoices')
            .select(`
                *,
                customer:customers(id, name, phone, email, address),
                vehicle:vehicles(id, vehicle_number, make, model, year),
                items:invoice_items(*)
            `)
            .eq('id', id)
            .eq('customer_id', customer.customerId)
            .single()

        if (error) {
            console.error('❌ Supabase error:', error)
            return c.json({ success: false, message: 'Invoice not found', error: error.message }, 404)
        }

        if (!data) {
            console.log('❌ No invoice found for customer:', customer.customerId, 'invoice:', id)
            return c.json({ success: false, message: 'Invoice not found' }, 404)
        }

        console.log('✅ Invoice found:', data.id)
        return c.json({
            success: true,
            data
        })
    } catch (error) {
        console.error('Get customer invoice error:', error)
        return c.json({ success: false, message: 'Failed to fetch invoice' }, 500)
    }
}

// Simple test endpoint
export async function test(c: Context) {
    try {
        return c.json({
            success: true,
            message: 'Customer invoice controller working'
        })
    } catch (error) {
        return c.json({ error: "Internal server error" }, 500)
    }
}

// Register routes with customer auth middleware
import { customerAuthMiddleware } from '../middleware/customerAuth'

customerInvoices.use('*', customerAuthMiddleware)
customerInvoices.get('/test', test)
customerInvoices.get('/', list)
customerInvoices.get('/:id', get)

export { customerInvoices }
