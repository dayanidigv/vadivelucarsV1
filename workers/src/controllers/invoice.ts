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
    try {
        const supabase = getSupabaseClient(c.env)

        const pageQuery = c.req.query('page')
        const limitQuery = c.req.query('limit')

        const page = pageQuery ? parseInt(pageQuery) : 1
        const limit = limitQuery ? parseInt(limitQuery) : 20
        const offset = (page - 1) * limit

        console.log(`[InvoiceList] Fetching page=${page}, limit=${limit}, offset=${offset}`)

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
            console.error('[InvoiceList] Supabase error:', error)
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
    } catch (e: any) {
        console.error('[InvoiceList] Internal error:', e)
        return c.json({ error: e.message || 'Internal Server Error', details: String(e) }, 500)
    }
}

export async function get(c: Context) {
    const id = c.req.param('id')
    const supabase = getSupabaseClient(c.env)

    const { data, error } = await supabase
        .from('invoices')
        .select(`
      *,
      customer:customers(*, vehicles(*)),
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
      created_at,
      invoice_date,
      mileage,
      grand_total,
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

    // 1. Create invoice header first
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
            invoice_date: body.invoice_date,
            grand_total: 0 // Placeholder
        })
        .select()
        .single()

    if (invoiceError) {
        return c.json({ error: invoiceError.message }, 400)
    }

    // 2. Link items to parts and create new parts as needed
    const processedItems = []
    const items = body.items || []

    for (const item of items) {
        let partId = (item.part_id && item.part_id !== "") ? item.part_id : null

        if (!partId) {
            const { data: existingPart } = await supabase
                .from('parts_catalog')
                .select('id')
                .ilike('name', item.description)
                .is('is_active', true)
                .maybeSingle()

            if (existingPart) {
                partId = existingPart.id
            } else {
                const { data: newPart, error: partError } = await supabase
                    .from('parts_catalog')
                    .insert({
                        name: item.description,
                        category: item.category || 'General',
                        default_rate: Number(item.rate) || 0,
                        unit: item.unit || 'No'
                    })
                    .select('id')
                    .single()

                if (!partError && newPart) {
                    partId = newPart.id
                }
            }
        }

        processedItems.push({
            invoice_id: invoice.id,
            part_id: partId,
            description: item.description || 'No description',
            category: item.category || 'General',
            quantity: Number(item.quantity) || 0,
            unit: item.unit || 'No',
            rate: Number(item.rate) || 0,
            amount: (Number(item.quantity) || 0) * (Number(item.rate) || 0),
            item_type: item.item_type || 'part'
        })
    }

    // 3. Insert invoice items
    const { error: itemsError } = await supabase
        .from('invoice_items')
        .insert(processedItems)

    if (itemsError) {
        console.error("Error inserting items:", itemsError)
        await supabase.from('invoices').delete().eq('id', invoice.id)
        return c.json({ error: `Failed to save invoice items: ${itemsError.message}`, details: itemsError }, 400)
    }

    // 4. Calculate totals
    const partsTotal = processedItems
        .filter((i: any) => i.item_type === 'part')
        .reduce((sum: number, i: any) => sum + i.amount, 0)

    const laborTotal = processedItems
        .filter((i: any) => i.item_type === 'labor')
        .reduce((sum: number, i: any) => sum + i.amount, 0)

    const grandTotal = partsTotal + laborTotal - (body.discount_amount || 0)
    const balanceAmount = grandTotal - (body.paid_amount || 0)

    // 5. Update invoice with totals
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
    }

    return c.json({
        success: true,
        data: updatedInvoice || invoice,
        message: 'Invoice created successfully'
    })
}

export async function update(c: Context) {
    const id = c.req.param('id')
    const body = await c.req.json()
    const supabase = getSupabaseClient(c.env)

    const { items, ...invoiceData } = body

    // 1. Update invoice details
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
            mechanic_name: invoiceData.mechanic_name,
            invoice_date: invoiceData.invoice_date
        })
        .eq('id', id)
        .select()
        .single()

    if (invoiceError) {
        return c.json({ error: invoiceError.message }, 400)
    }

    // 2. Handle Items: Delete existing and insert new
    if (items && Array.isArray(items)) {
        const { error: deleteError } = await supabase
            .from('invoice_items')
            .delete()
            .eq('invoice_id', id)

        if (deleteError) {
            console.error("Error deleting old items:", deleteError)
            return c.json({ error: "Failed to update items" }, 400)
        }

        const processedItems = []
        for (const item of items) {
            let partId = (item.part_id && item.part_id !== "") ? item.part_id : null

            if (!partId) {
                const { data: existingPart } = await supabase
                    .from('parts_catalog')
                    .select('id')
                    .ilike('name', item.description)
                    .is('is_active', true)
                    .maybeSingle()

                if (existingPart) {
                    partId = existingPart.id
                } else {
                    const { data: newPart, error: partError } = await supabase
                        .from('parts_catalog')
                        .insert({
                            name: item.description,
                            category: item.category || 'General',
                            default_rate: Number(item.rate) || 0,
                            unit: item.unit || 'No'
                        })
                        .select('id')
                        .single()

                    if (!partError && newPart) {
                        partId = newPart.id
                    }
                }
            }

            processedItems.push({
                invoice_id: id,
                part_id: partId,
                description: item.description || 'No description',
                category: item.category || 'General',
                quantity: Number(item.quantity) || 0,
                unit: item.unit || 'No',
                rate: Number(item.rate) || 0,
                amount: (Number(item.quantity) || 0) * (Number(item.rate) || 0),
                item_type: item.item_type || 'part'
            })
        }

        const { error: insertError } = await supabase
            .from('invoice_items')
            .insert(processedItems)

        if (insertError) {
            console.error("Error inserting new items:", insertError)
            return c.json({ error: `Failed to save new items: ${insertError.message}`, details: insertError }, 400)
        }

        // 3. Recalculate Totals
        const partsTotal = processedItems
            .filter((i: any) => i.item_type === 'part')
            .reduce((sum: number, i: any) => sum + i.amount, 0)

        const laborTotal = processedItems
            .filter((i: any) => i.item_type === 'labor')
            .reduce((sum: number, i: any) => sum + i.amount, 0)

        const grandTotal = partsTotal + laborTotal - (invoiceData.discount_amount || 0)
        const balanceAmount = grandTotal - (invoiceData.paid_amount || 0)

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

        return c.json({ success: true, data: updatedInvoice || invoice })
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
