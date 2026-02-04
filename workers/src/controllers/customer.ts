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

    // Validate required fields
    if (!body.name) {
        return c.json({ error: 'Name is required' }, 400)
    }

    // Create customer
    const { data: customer, error: customerError } = await supabase
        .from('customers')
        .insert({
            name: body.name,
            phone: body.phone || null,
            email: body.email || null,
            address: body.address || null
        })
        .select()
        .single()

    if (customerError) {
        return c.json({ error: customerError.message }, 400)
    }

    // Create vehicles if provided (handle both single vehicle and multiple vehicles)
    const vehicles = body.vehicles || (body.vehicle ? [body.vehicle] : [])

    if (vehicles.length > 0) {
        const vehiclesToInsert = vehicles.map((vehicle: any) => ({
            customer_id: customer.id,
            vehicle_number: vehicle.vehicle_number,
            make: vehicle.make || null,
            model: vehicle.model || null,
            year: vehicle.year ? parseInt(vehicle.year) : null,
            current_mileage: vehicle.current_mileage ? parseInt(vehicle.current_mileage) : null,
            insurance_date: vehicle.insurance_date || null
        }))

        const { error: vehicleError } = await supabase
            .from('vehicles')
            .insert(vehiclesToInsert)

        if (vehicleError) {
            // Rollback customer
            await supabase.from('customers').delete().eq('id', customer.id)
            return c.json({ error: vehicleError.message }, 400)
        }
    }

    // Fetch the full customer object with vehicles to return
    const { data: fullCustomer, error: fetchError } = await supabase
        .from('customers')
        .select('*, vehicles(*)')
        .eq('id', customer.id)
        .single()

    if (fetchError) {
        return c.json({ success: true, data: customer, message: 'Customer created, but failed to fetch full details' })
    }

    return c.json({
        success: true,
        data: fullCustomer,
        message: 'Customer created successfully'
    })
}

export async function update(c: Context) {
    const id = c.req.param('id')
    const body = await c.req.json()
    const supabase = getSupabaseClient(c.env)

    // Update customer basic info
    const { data: customer, error: customerError } = await supabase
        .from('customers')
        .update({
            name: body.name,
            phone: body.phone,
            email: body.email,
            address: body.address
        })
        .eq('id', id)
        .select()
        .single()

    if (customerError) {
        return c.json({ error: customerError.message }, 400)
    }

    // Handle vehicles update if provided
    if (body.vehicles && Array.isArray(body.vehicles)) {
        // Delete existing vehicles for this customer
        await supabase
            .from('vehicles')
            .delete()
            .eq('customer_id', id)

        // Insert new vehicles
        if (body.vehicles.length > 0) {
            const vehiclesToInsert = body.vehicles.map((vehicle: any) => ({
                customer_id: id,
                vehicle_number: vehicle.vehicle_number,
                make: vehicle.make || null,
                model: vehicle.model || null,
                year: vehicle.year ? parseInt(vehicle.year) : null,
                current_mileage: vehicle.current_mileage ? parseInt(vehicle.current_mileage) : null,
                insurance_date: vehicle.insurance_date || null
            }))

            const { error: vehicleError } = await supabase
                .from('vehicles')
                .insert(vehiclesToInsert)

            if (vehicleError) {
                return c.json({ error: vehicleError.message }, 400)
            }
        }
    }

    // Fetch the full customer object with vehicles to return
    const { data: fullCustomer, error: fetchError } = await supabase
        .from('customers')
        .select('*, vehicles(*)')
        .eq('id', id)
        .single()

    if (fetchError) {
        return c.json({ success: true, data: customer, message: 'Customer updated, but failed to fetch full details' })
    }

    return c.json({
        success: true,
        data: fullCustomer,
        message: 'Customer updated successfully'
    })
}

export async function remove(c: Context) {
    const id = c.req.param('id')
    const supabase = getSupabaseClient(c.env)

    try {
        // 1. Get all invoices for this customer to delete their items
        const { data: invoices } = await supabase
            .from('invoices')
            .select('id')
            .eq('customer_id', id)

        if (invoices && invoices.length > 0) {
            const invoiceIds = invoices.map(i => i.id)
            // 2. Delete invoice items first
            await supabase
                .from('invoice_items')
                .delete()
                .in('invoice_id', invoiceIds)

            // 3. Delete invoices
            await supabase
                .from('invoices')
                .delete()
                .in('id', invoiceIds)
        }

        // 4. Delete vehicles
        await supabase
            .from('vehicles')
            .delete()
            .eq('customer_id', id)

        // 5. Delete customer feedback if table exists
        await supabase
            .from('customer_feedback')
            .delete()
            .eq('customer_id', id)

        // 6. Finally delete the customer
        const { error: customerError } = await supabase
            .from('customers')
            .delete()
            .eq('id', id)

        if (customerError) {
            return c.json({ error: customerError.message }, 400)
        }

        return c.json({
            success: true,
            message: 'Customer and all related records deleted successfully'
        })
    } catch (error: any) {
        console.error('Delete customer error:', error)
        return c.json({ error: error.message || 'Failed to delete customer' }, 500)
    }
}
