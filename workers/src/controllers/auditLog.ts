import { Hono, Context } from 'hono'
import { getSupabaseClient, Env } from '../lib/supabase'

const auditLogs = new Hono<{ Bindings: Env }>()

export async function create(c: Context) {
    const body = await c.req.json()
    const supabase = getSupabaseClient(c.env)

    const { data, error } = await supabase
        .from('audit_logs')
        .insert({
            action: body.action,
            resource: body.resource,
            resource_id: body.resourceId,
            performed_by: body.performedBy,
            severity: body.severity,
            changes: body.changes,
            metadata: body.metadata
        })
        .select()
        .single()

    if (error) {
        console.error('Audit Log Error:', error)
        return c.json({ error: error.message }, 400)
    }

    return c.json({
        success: true,
        data,
        message: 'Audit log created successfully'
    })
}

auditLogs.post('/', create)

export { auditLogs }
