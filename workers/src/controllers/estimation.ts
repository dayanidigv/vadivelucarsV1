import { Context } from 'hono'
import { getSupabaseClient } from '../lib/supabase'
import { authMiddleware } from '../middleware/auth'
import { customerAuthMiddleware } from '../middleware/customerAuth'

// Shared estimation print endpoint (accessible by both admin and customer)
export async function print(c: Context) {
    try {
        const { id } = c.req.param()
        const supabase = getSupabaseClient(c.env)

        const authHeader = c.req.header('Authorization')
        let userContext = null

        if (authHeader?.startsWith('Bearer ')) {
            await authMiddleware(c, async () => { })
            userContext = c.get('jwtPayload')

            if (!userContext) {
                await customerAuthMiddleware(c, async () => { })
                userContext = c.get('jwtPayload')
            }
        }

        if (!userContext) {
            return c.json({ success: false, message: 'Authentication required' }, 401)
        }

        let query = supabase
            .from('estimations')
            .select(`
                *,
                items:estimation_items(*),
                customer:customers(id, name, phone, email, address),
                vehicle:vehicles(id, vehicle_number, make, model, year)
            `)
            .eq('id', id)

        if (userContext?.type === 'customer') {
            query = query.eq('customer_id', userContext.customerId)
        }

        const { data, error } = await query.single()

        if (error || !data) {
            return c.json({ success: false, message: 'Estimation not found' }, 404)
        }

        return c.json({ success: true, data })
    } catch (error) {
        console.error('Print estimation error:', error)
        return c.json({ success: false, message: 'Failed to fetch estimation' }, 500)
    }
}

export async function list(c: Context) {
    try {
        const supabase = getSupabaseClient(c.env)

        const page = parseInt(c.req.query('page') || '1')
        const limit = parseInt(c.req.query('limit') || '20')
        const status = c.req.query('status')
        const search = c.req.query('search') || ''
        const includeItems = c.req.query('include_items') === 'true'
        const offset = (page - 1) * limit

        const selectFields = includeItems
            ? `id, estimation_number, status, grand_total, parts_total, labor_total,
                discount_amount, notes, created_at, estimation_date, validity_period,
                customer:customers(id, name, phone, email),
                vehicle:vehicles(id, vehicle_number, make, model),
                items:estimation_items(*)`
            : `id, estimation_number, status, grand_total, parts_total, labor_total,
                discount_amount, notes, created_at, estimation_date, validity_period,
                customer:customers(id, name, phone, email),
                vehicle:vehicles(id, vehicle_number, make, model)`

        let query = supabase
            .from('estimations')
            .select(selectFields, { count: 'estimated' })

        // Apply search filter
        if (search.trim()) {
            query = query.or(`estimation_number.ilike.%${search}%,customer.name.ilike.%${search}%,vehicle.vehicle_number.ilike.%${search}%`)
        }

        // Apply status filter
        if (status && status !== 'all') {
            query = query.eq('status', status)
        }

        query = query
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1)

        const { data, error, count } = await query

        if (error) {
            console.error('[EstimationList] Supabase error:', error)
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
        console.error('[EstimationList] Internal error:', e)
        return c.json({ error: e.message || 'Internal Server Error' }, 500)
    }
}

export async function get(c: Context) {
    const id = c.req.param('id')
    const supabase = getSupabaseClient(c.env)

    const { data, error } = await supabase
        .from('estimations')
        .select(`
            *,
            customer:customers(id, name, phone, email, address, vehicles:vehicles(*)),
            vehicle:vehicles(id, vehicle_number, make, model, year),
            items:estimation_items(*)
        `)
        .eq('id', id)
        .single()

    if (error) {
        return c.json({ error: 'Estimation not found' }, 404)
    }

    return c.json({ success: true, data })
}

export async function create(c: Context) {
    const body = await c.req.json()
    const supabase = getSupabaseClient(c.env)

    // 1. Create estimation header
    const { data: estimation, error: estimationError } = await supabase
        .from('estimations')
        .insert({
            customer_id: body.customer_id,
            vehicle_id: body.vehicle_id,
            mileage: body.mileage,
            discount_amount: body.discount_amount || 0,
            status: body.status || 'draft',
            validity_period: body.validity_period || 15,
            notes: body.notes,
            mechanic_name: body.mechanic_name,
            estimation_date: body.estimation_date,
            created_by: body.created_by,
            grand_total: 0
        })
        .select()
        .single()

    if (estimationError) {
        return c.json({ error: estimationError.message }, 400)
    }

    // 2. Process items — resolve parts
    const processedItems = []
    const items = body.items || []

    for (const item of items) {
        let partId = (item.part_id && item.part_id !== "") ? item.part_id : null

        if (!partId && item.item_type !== 'labor') {
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
            estimation_id: estimation.id,
            part_id: partId,
            part_number: item.part_number || '',
            description: item.description || 'No description',
            category: item.category || 'General',
            quantity: Number(item.quantity) || 0,
            unit: item.unit || 'No',
            rate: Number(item.rate) || 0,
            amount: (Number(item.quantity) || 0) * (Number(item.rate) || 0),
            item_type: item.item_type || 'part'
        })
    }

    // 3. Insert estimation items
    if (processedItems.length > 0) {
        const { error: itemsError } = await supabase
            .from('estimation_items')
            .insert(processedItems)

        if (itemsError) {
            console.error("Error inserting estimation items:", itemsError)
            await supabase.from('estimations').delete().eq('id', estimation.id)
            return c.json({ error: `Failed to save estimation items: ${itemsError.message}` }, 400)
        }
    }

    // 4. Calculate totals
    const partsTotal = processedItems
        .filter(i => i.item_type === 'part')
        .reduce((sum, i) => sum + i.amount, 0)

    const laborTotal = processedItems
        .filter(i => i.item_type === 'labor')
        .reduce((sum, i) => sum + i.amount, 0)

    const grandTotal = partsTotal + laborTotal - (body.discount_amount || 0)

    // 5. Update estimation with totals
    const { data: updatedEstimation, error: updateError } = await supabase
        .from('estimations')
        .update({
            parts_total: partsTotal,
            labor_total: laborTotal,
            grand_total: grandTotal
        })
        .eq('id', estimation.id)
        .select()
        .single()

    if (updateError) {
        console.error("Error updating estimation totals:", updateError)
    }

    return c.json({
        success: true,
        data: updatedEstimation || estimation,
        message: 'Estimation created successfully'
    })
}

export async function update(c: Context) {
    const id = c.req.param('id')
    const body = await c.req.json()
    const supabase = getSupabaseClient(c.env)

    const { items, ...estimationData } = body

    // Check status — only draft and sent are editable
    const { data: existing } = await supabase
        .from('estimations')
        .select('status')
        .eq('id', id)
        .single()

    if (existing && !['draft', 'sent'].includes(existing.status)) {
        return c.json({ error: 'Cannot edit estimation in current status' }, 400)
    }

    // 1. Update estimation header
    const { data: estimation, error: estimationError } = await supabase
        .from('estimations')
        .update({
            customer_id: estimationData.customer_id,
            vehicle_id: estimationData.vehicle_id,
            mileage: estimationData.mileage,
            discount_amount: estimationData.discount_amount || 0,
            validity_period: estimationData.validity_period || 15,
            notes: estimationData.notes,
            mechanic_name: estimationData.mechanic_name,
            estimation_date: estimationData.estimation_date,
            status: estimationData.status
        })
        .eq('id', id)
        .select()
        .single()

    if (estimationError) {
        return c.json({ error: estimationError.message }, 400)
    }

    // 2. Handle items
    if (items && Array.isArray(items)) {
        const { error: deleteError } = await supabase
            .from('estimation_items')
            .delete()
            .eq('estimation_id', id)

        if (deleteError) {
            return c.json({ error: "Failed to update items" }, 400)
        }

        const processedItems = []
        for (const item of items) {
            let partId = (item.part_id && item.part_id !== "") ? item.part_id : null

            if (!partId && item.item_type !== 'labor') {
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
                estimation_id: id,
                part_id: partId,
                part_number: item.part_number || '',
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
            .from('estimation_items')
            .insert(processedItems)

        if (insertError) {
            return c.json({ error: `Failed to save items: ${insertError.message}` }, 400)
        }

        // Recalculate totals
        const partsTotal = processedItems
            .filter(i => i.item_type === 'part')
            .reduce((sum, i) => sum + i.amount, 0)

        const laborTotal = processedItems
            .filter(i => i.item_type === 'labor')
            .reduce((sum, i) => sum + i.amount, 0)

        const grandTotal = partsTotal + laborTotal - (estimationData.discount_amount || 0)

        const { data: updatedEstimation, error: updateError } = await supabase
            .from('estimations')
            .update({
                parts_total: partsTotal,
                labor_total: laborTotal,
                grand_total: grandTotal
            })
            .eq('id', id)
            .select()
            .single()

        if (updateError) {
            console.error("Error updating totals:", updateError)
        }

        return c.json({ success: true, data: updatedEstimation || estimation })
    }

    return c.json({ success: true, data: estimation })
}

export async function remove(c: Context) {
    const id = c.req.param('id')
    const supabase = getSupabaseClient(c.env)

    const { error } = await supabase
        .from('estimations')
        .delete()
        .eq('id', id)

    if (error) {
        return c.json({ error: error.message }, 400)
    }

    return c.json({ success: true, message: 'Estimation deleted' })
}

export async function updateStatus(c: Context) {
    const id = c.req.param('id')
    const body = await c.req.json()
    const supabase = getSupabaseClient(c.env)

    const { status } = body

    // Validate status transition
    const { data: current } = await supabase
        .from('estimations')
        .select('status')
        .eq('id', id)
        .single()

    if (!current) {
        return c.json({ error: 'Estimation not found' }, 404)
    }

    const validTransitions: Record<string, string[]> = {
        'draft': ['sent'],
        'sent': ['accepted', 'rejected'],
        'accepted': ['converted'],
    }

    const allowed = validTransitions[current.status] || []
    if (!allowed.includes(status)) {
        return c.json({ error: `Cannot transition from ${current.status} to ${status}` }, 400)
    }

    const { data, error } = await supabase
        .from('estimations')
        .update({ status })
        .eq('id', id)
        .select()
        .single()

    if (error) {
        return c.json({ error: error.message }, 400)
    }

    return c.json({ success: true, data })
}

export async function convertToInvoice(c: Context) {
    const id = c.req.param('id')
    const supabase = getSupabaseClient(c.env)

    // 1. Fetch estimation + items
    const { data: estimation, error: fetchError } = await supabase
        .from('estimations')
        .select(`
            *,
            items:estimation_items(*)
        `)
        .eq('id', id)
        .single()

    if (fetchError || !estimation) {
        return c.json({ error: 'Estimation not found' }, 404)
    }

    if (estimation.status !== 'accepted') {
        return c.json({ error: 'Only accepted estimations can be converted' }, 400)
    }

    // 2. Create invoice
    const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .insert({
            customer_id: estimation.customer_id,
            vehicle_id: estimation.vehicle_id,
            mileage: estimation.mileage,
            discount_amount: estimation.discount_amount || 0,
            payment_status: 'unpaid',
            payment_method: 'cash',
            paid_amount: 0,
            notes: `Converted from ${estimation.estimation_number}`,
            mechanic_name: estimation.mechanic_name,
            invoice_date: new Date().toISOString().split('T')[0],
            grand_total: 0
        })
        .select()
        .single()

    if (invoiceError) {
        return c.json({ error: `Failed to create invoice: ${invoiceError.message}` }, 400)
    }

    // 3. Copy items (drop part_number)
    const invoiceItems = (estimation.items || []).map((item: any) => ({
        invoice_id: invoice.id,
        part_id: item.part_id,
        description: item.description,
        category: item.category,
        quantity: Number(item.quantity),
        unit: item.unit,
        rate: Number(item.rate),
        amount: Number(item.amount),
        item_type: item.item_type
    }))

    if (invoiceItems.length > 0) {
        const { error: itemsError } = await supabase
            .from('invoice_items')
            .insert(invoiceItems)

        if (itemsError) {
            // Cleanup invoice on failure
            await supabase.from('invoices').delete().eq('id', invoice.id)
            return c.json({ error: `Failed to copy items: ${itemsError.message}` }, 400)
        }
    }

    // 4. Calculate invoice totals
    const partsTotal = invoiceItems
        .filter((i: any) => i.item_type === 'part')
        .reduce((sum: number, i: any) => sum + i.amount, 0)

    const laborTotal = invoiceItems
        .filter((i: any) => i.item_type === 'labor')
        .reduce((sum: number, i: any) => sum + i.amount, 0)

    const grandTotal = partsTotal + laborTotal - (estimation.discount_amount || 0)

    await supabase
        .from('invoices')
        .update({
            parts_total: partsTotal,
            labor_total: laborTotal,
            grand_total: grandTotal,
            balance_amount: grandTotal
        })
        .eq('id', invoice.id)

    // 5. Mark estimation as converted
    await supabase
        .from('estimations')
        .update({
            status: 'converted',
            converted_invoice_id: invoice.id
        })
        .eq('id', id)

    return c.json({
        success: true,
        data: { invoice_id: invoice.id },
        message: 'Estimation converted to invoice successfully'
    })
}
