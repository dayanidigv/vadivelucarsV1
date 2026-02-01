import { Context } from 'hono'
import { getSupabaseClient } from '../lib/supabase'

export async function list(c: Context) {
    const supabase = getSupabaseClient(c.env)
    const category = c.req.query('category')
    const page = Number(c.req.query('page')) || 1
    const limit = Number(c.req.query('limit')) || 20
    const offset = (page - 1) * limit

    let query = supabase
        .from('parts_catalog')
        .select('*', { count: 'exact' })
        .eq('is_active', true)
        .order('name')

    if (category) {
        query = query.eq('category', category)
    }

    const { data, error, count } = await query
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

export async function search(c: Context) {
    const query = c.req.query('q') || ''
    const supabase = getSupabaseClient(c.env)

    const { data, error } = await supabase
        .from('parts_catalog')
        .select('*')
        .eq('is_active', true)
        .or(`name.ilike.%${query}%,category.ilike.%${query}%`)
        .order('name')
        .limit(20)

    if (error) {
        return c.json({ error: error.message }, 400)
    }

    return c.json({ success: true, data })
}

export async function create(c: Context) {
    const body = await c.req.json()
    const supabase = getSupabaseClient(c.env)

    const { data, error } = await supabase
        .from('parts_catalog')
        .insert(body)
        .select()
        .single()

    if (error) {
        return c.json({ error: error.message }, 400)
    }

    return c.json({ success: true, data })
}

export async function update(c: Context) {
    const id = c.req.param('id')
    const body = await c.req.json()
    const supabase = getSupabaseClient(c.env)

    const { data, error } = await supabase
        .from('parts_catalog')
        .update(body)
        .eq('id', id)
        .select()
        .single()

    if (error) {
        return c.json({ error: error.message }, 400)
    }

    return c.json({ success: true, data })
}

export async function remove(c: Context) {
    const id = c.req.param('id')
    const supabase = getSupabaseClient(c.env)

    const { error } = await supabase
        .from('parts_catalog')
        .update({ is_active: false })
        .eq('id', id)

    if (error) {
        return c.json({ error: error.message }, 400)
    }

    return c.json({ success: true, message: 'Part deleted successfully' })
}

export async function recent(c: Context) {
    const supabase = getSupabaseClient(c.env)
    const limit = Number(c.req.query('limit')) || 10

    const { data, error } = await supabase
        .from('parts_catalog')
        .select('*')
        .eq('is_active', true)
        .order('updated_at', { ascending: false })
        .limit(limit)

    if (error) {
        return c.json({ error: error.message }, 400)
    }

    return c.json({ success: true, data })
}
