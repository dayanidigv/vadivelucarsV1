import { Hono, Context } from 'hono'
import { getSupabaseClient, Env } from '../lib/supabase'

const carModels = new Hono<{ Bindings: Env }>()

export async function list(c: Context) {
    const supabase = getSupabaseClient(c.env)
    const { data: models, error } = await supabase
        .from('car_models')
        .select('*')
        .order('make', { ascending: true })
        .order('model', { ascending: true })

    if (error) {
        return c.json({ error: error.message }, 400)
    }

    return c.json({
        success: true,
        data: models
    })
}

export async function search(c: Context) {
    const query = c.req.query('q') || ''
    const supabase = getSupabaseClient(c.env)

    const { data: models, error } = await supabase
        .from('car_models')
        .select('*')
        .or(`make.ilike.%${query}%,model.ilike.%${query}%`)
        .limit(20)

    if (error) {
        return c.json({ error: error.message }, 400)
    }

    return c.json({
        success: true,
        data: models
    })
}

export async function create(c: Context) {
    const body = await c.req.json()
    const supabase = getSupabaseClient(c.env)

    if (!body.make && !body.model) {
        return c.json({ error: 'Either Make or Model is required' }, 400)
    }

    const { data, error } = await supabase
        .from('car_models')
        .insert({
            make: body.make,
            model: body.model,
            type: body.type || 'Other'
        })
        .select()
        .single()

    if (error) {
        return c.json({ error: error.message }, 400)
    }

    return c.json({
        success: true,
        data,
        message: 'Car model created successfully'
    })
}

carModels.get('/', list)
carModels.get('/search', search)
carModels.post('/', create)

export { carModels }
