import { Context } from 'hono'
import { getSupabaseClient } from '../lib/supabase'

export async function list(c: Context) {
    const supabase = getSupabaseClient(c.env)

    const page = Number(c.req.query('page')) || 1
    const limit = Number(c.req.query('limit')) || 20
    const offset = (page - 1) * limit

    const { data, error, count } = await supabase
        .from('customers')
        .select(`
      *,
      vehicles:vehicles(*)
    `, { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

    if (error) {
        return c.json({ error: error.message }, 400)
    }

    return c.json({
        success: true,
        data,
        pagination: {
            page,
            limit,
            total: count || 0,
            pages: Math.ceil((count || 0) / limit)
        }
    })
}

export async function get(c: Context) {
    const id = c.req.param('id')
    const supabase = getSupabaseClient(c.env)

    const { data, error } = await supabase
        .from('customers')
        .select(`
      *,
      vehicles:vehicles(*),
      invoices:invoices(*)
    `)
        .eq('id', id)
        .single()

    if (error) {
        return c.json({ error: error.message }, 404)
    }

    return c.json({ success: true, data })
}

export async function search(c: Context) {
    const query = c.req.query('q') || ''
    const supabase = getSupabaseClient(c.env)

    // Search by phone, name, or vehicle number
    const { data: customers } = await supabase
        .from('customers')
        .select(`
      *,
      vehicles:vehicles(*)
    `)
        .or(`phone.ilike.%${query}%,name.ilike.%${query}%`)
        .limit(10)

    const { data: vehicles } = await supabase
        .from('vehicles')
        .select(`
      *,
      customer:customers(*)
    `)
        .ilike('vehicle_number', `%${query}%`)
        .limit(10)

    return c.json({
        success: true,
        data: {
            customers: customers || [],
            vehicles: vehicles || []
        }
    })
}

export async function create(c: Context) {
    const body = await c.req.json()
    const supabase = getSupabaseClient(c.env)

    // Create customer
    const { data: customer, error: customerError } = await supabase
        .from('customers')
        .insert({
            name: body.name,
            phone: body.phone,
            email: body.email,
            address: body.address
        })
        .select()
        .single()

    if (customerError) {
        return c.json({ error: customerError.message }, 400)
    }

    // Create vehicle if provided
    if (body.vehicle) {
        const { error: vehicleError } = await supabase
            .from('vehicles')
            .insert({
                customer_id: customer.id,
                vehicle_number: body.vehicle.vehicle_number,
                make: body.vehicle.make,
                model: body.vehicle.model,
                year: body.vehicle.year,
                current_mileage: body.vehicle.current_mileage
            })

        if (vehicleError) {
            // Rollback customer
            await supabase.from('customers').delete().eq('id', customer.id)
            return c.json({ error: vehicleError.message }, 400)
        }
    }

    return c.json({
        success: true,
        data: customer,
        message: 'Customer created successfully'
    })
}

export async function update(c: Context) {
    const id = c.req.param('id')
    const body = await c.req.json()
    const supabase = getSupabaseClient(c.env)

    const { data, error } = await supabase
        .from('customers')
        .update(body)
        .eq('id', id)
        .select()
        .single()

    if (error) {
        return c.json({ error: error.message }, 400)
    }

    return c.json({ success: true, data })
}
