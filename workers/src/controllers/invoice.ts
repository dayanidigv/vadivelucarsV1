import { Context } from 'hono'
import { getSupabaseClient } from '../lib/supabase'
import { authMiddleware } from '../middleware/auth'
import { customerAuthMiddleware } from '../middleware/customerAuth'

// Shared invoice print endpoint (accessible by both admin and customer)
export async function print(c: Context) {
    try {
        const { id } = c.req.param()
        const supabase = getSupabaseClient(c.env)

        // Check authentication type and validate accordingly
        const authHeader = c.req.header('Authorization')
        let userContext = null

        if (authHeader?.startsWith('Bearer ')) {

            // Try admin auth first
            await authMiddleware(c, async () => { })
            userContext = c.get('jwtPayload')

            // If admin auth failed (no jwtPayload), try customer auth
            if (!userContext) {
                await customerAuthMiddleware(c, async () => { })
                userContext = c.get('jwtPayload')
            }
        }

        if (!userContext) {
            return c.json({ success: false, message: 'Authentication required' }, 401)
        }

        let query = supabase
            .from('invoices')
            .select(`
                *,
                items:invoice_items(*),
                customer:customers(id, name, phone, email, address),
                vehicle:vehicles(id, vehicle_number, make, model, year)
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

export async function list(c: Context) {
    const supabase = getSupabaseClient(c.env)

    const page = Number(c.req.query('page')) || 1
    const limit = Number(c.req.query('limit')) || 20
    const offset = (page - 1) * limit

    const { data, error, count } = await supabase
        .from('invoices')
        .select(`
      *,
      customer:customers(*),
      vehicle:vehicles(*)
    `, { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

    if (error) {
        console.error('Error fetching invoices:', error)
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
        .from('invoices')
        .select(`
      *,
      customer:customers(*),
      vehicle:vehicles(*),
      items:invoice_items(*)
    `)
        .eq('id', id)
        .single()

    if (error) {
        return c.json({ error: 'Invoice not found' }, 404)
    }

    return c.json({ success: true, data })
}

export async function getLastByVehicle(c: Context) {
    const vehicleId = c.req.query('vehicle_id')
    if (!vehicleId) {
        return c.json({ error: 'vehicle_id is required' }, 400)
    }

    const supabase = getSupabaseClient(c.env)

    const { data, error } = await supabase
        .from('invoices')
        .select(`
      id,
      items:invoice_items(*)
    `)
        .eq('vehicle_id', vehicleId)
        .order('created_at', { ascending: false })
        .limit(1)

    if (error) {
        return c.json({ error: error.message }, 400)
    }

    const invoice = data && data[0]

    if (!invoice) {
        return c.json({ success: true, data: null })
    }

    return c.json({ success: true, data: invoice })
}

export async function create(c: Context) {
    const body = await c.req.json()
    const supabase = getSupabaseClient(c.env)

    // Autosave non-part items as parts (both parts and labor items)
    for (const item of body.items) {
        if (!item.part_id) {
            // Check if part already exists
            const { data: existingPart } = await supabase
                .from('parts_catalog')
                .select('id')
                .ilike('name', item.description)
                .single()

            if (!existingPart) {
                // Create new part (for both part and labor items)
                await supabase
                    .from('parts_catalog')
                    .insert({
                        name: item.description,
                        category: item.category || 'General',
                        default_rate: item.rate,
                        unit: item.unit || 'No'
                    })
            }
        }
    }

    // Create invoice
    const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .insert({
            customer_id: body.customer_id,
            vehicle_id: body.vehicle_id,
            mileage: body.mileage,
            discount_amount: body.discount_amount || 0,
            payment_status: body.payment_status || 'unpaid',
            payment_method: body.payment_method,
            paid_amount: body.paid_amount || 0,
            notes: body.notes,
            mechanic_name: body.mechanic_name,
            grand_total: 0 // Placeholder, will update
        })
        .select()
        .single()

    if (invoiceError) {
        return c.json({ error: invoiceError.message }, 400)
    }

    // Create invoice items
    // Ensure items have all required fields
    const items = body.items.map((item: any) => ({
        invoice_id: invoice.id,
        part_id: item.part_id,
        description: item.description,
        category: item.category,
        quantity: item.quantity,
        unit: item.unit || 'No',
        rate: item.rate,
        amount: item.quantity * item.rate,
        item_type: item.item_type || 'part'
    }))

    const { error: itemsError } = await supabase
        .from('invoice_items')
        .insert(items)

    if (itemsError) {
        // Rollback
        await supabase.from('invoices').delete().eq('id', invoice.id)
        return c.json({ error: itemsError.message }, 400)
    }

    // Calculate totals
    const partsTotal = items
        .filter((i: any) => i.item_type === 'part')
        .reduce((sum: number, i: any) => sum + i.amount, 0)

    const laborTotal = items
        .filter((i: any) => i.item_type === 'labor')
        .reduce((sum: number, i: any) => sum + i.amount, 0)

    const grandTotal = partsTotal + laborTotal - (body.discount_amount || 0)
    const balanceAmount = grandTotal - (body.paid_amount || 0)

    // Update invoice with totals
    const { data: updatedInvoice, error: updateError } = await supabase
        .from('invoices')
        .update({
            parts_total: partsTotal,
            labor_total: laborTotal,
            grand_total: grandTotal,
            balance_amount: balanceAmount
        })
        .eq('id', invoice.id)
        .select()
        .single()

    if (updateError) {
        console.error("Error updating invoice totals:", updateError)
        // We don't delete here because data is mostly there, but totals are wrong.
        // User can edit later.
    }

    return c.json({
        success: true,
        data: updatedInvoice,
        message: 'Invoice created successfully'
    })
}

export async function update(c: Context) {
    const id = c.req.param('id')
    const body = await c.req.json()
    const supabase = getSupabaseClient(c.env)

    // Autosave non-part items as parts (both parts and labor items)
    if (body.items && Array.isArray(body.items)) {
        for (const item of body.items) {
            if (!item.part_id) {
                // Check if part already exists
                const { data: existingPart } = await supabase
                    .from('parts_catalog')
                    .select('id')
                    .ilike('name', item.description)
                    .single()

                if (!existingPart) {
                    // Create new part (for both part and labor items)
                    await supabase
                        .from('parts_catalog')
                        .insert({
                            name: item.description,
                            category: item.category || 'General',
                            default_rate: item.rate,
                            unit: item.unit || 'No'
                        })
                }
            }
        }
    }

    // Separate items from invoice data
    const { items, ...invoiceData } = body

    // 1. Update invoice details (excluding items)
    const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .update({
            customer_id: invoiceData.customer_id,
            vehicle_id: invoiceData.vehicle_id,
            mileage: invoiceData.mileage,
            discount_amount: invoiceData.discount_amount || 0,
            payment_status: invoiceData.payment_status || 'unpaid',
            payment_method: invoiceData.payment_method,
            paid_amount: invoiceData.paid_amount || 0,
            notes: invoiceData.notes,
            mechanic_name: invoiceData.mechanic_name
        })
        .eq('id', id)
        .select()
        .single()

    if (invoiceError) {
        return c.json({ error: invoiceError.message }, 400)
    }

    // 2. Handle Items: Delete existing and insert new
    if (items && Array.isArray(items)) {
        // Delete existing items
        const { error: deleteError } = await supabase
            .from('invoice_items')
            .delete()
            .eq('invoice_id', id)

        if (deleteError) {
            console.error("Error deleting old items:", deleteError)
            return c.json({ error: "Failed to update items" }, 400)
        }

        // Prepare new items
        const newItems = items.map((item: any) => ({
            invoice_id: id,
            part_id: item.part_id,
            description: item.description,
            category: item.category,
            quantity: item.quantity,
            unit: item.unit || 'No',
            rate: item.rate,
            amount: item.quantity * item.rate,
            item_type: item.item_type || 'part'
        }))

        // Insert new items
        const { error: insertError } = await supabase
            .from('invoice_items')
            .insert(newItems)

        if (insertError) {
            console.error("Error inserting new items:", insertError)
            return c.json({ error: "Failed to save new items" }, 400)
        }

        // 3. Recalculate Totals
        const partsTotal = newItems
            .filter((i: any) => i.item_type === 'part')
            .reduce((sum: number, i: any) => sum + i.amount, 0)

        const laborTotal = newItems
            .filter((i: any) => i.item_type === 'labor')
            .reduce((sum: number, i: any) => sum + i.amount, 0)

        const grandTotal = partsTotal + laborTotal - (invoiceData.discount_amount || 0)
        const balanceAmount = grandTotal - (invoiceData.paid_amount || 0)

        // Update invoice with totals
        const { data: updatedInvoice, error: updateError } = await supabase
            .from('invoices')
            .update({
                parts_total: partsTotal,
                labor_total: laborTotal,
                grand_total: grandTotal,
                balance_amount: balanceAmount
            })
            .eq('id', id)
            .select()
            .single()

        if (updateError) {
            console.error("Error updating totals:", updateError)
        }

        return c.json({ success: true, data: updatedInvoice })
    }

    return c.json({ success: true, data: invoice })
}

export async function remove(c: Context) {
    const id = c.req.param('id')
    const supabase = getSupabaseClient(c.env)

    const { error } = await supabase
        .from('invoices')
        .delete()
        .eq('id', id)

    if (error) {
        return c.json({ error: error.message }, 400)
    }

    return c.json({ success: true, message: 'Invoice deleted' })
}
