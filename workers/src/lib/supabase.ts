import { createClient } from '@supabase/supabase-js'

export interface Env {
    SUPABASE_URL: string
    SUPABASE_ANON_KEY: string
    SUPABASE_SERVICE_KEY: string
    CUSTOMER_JWT_SECRET: string
    JWT_SECRET: string
    DEV?: string
}

export function getSupabaseClient(env: Env) {
    // Use service key for backend operations to bypass RLS if needed, 
    // or anon key if acting as public. 
    // For this backend API, we largely act as admin/staff, so we might want service key 
    // BUT effectively we want to be careful. The guide uses anon key in some places 
    // but for backend admin tasks service key is better. 
    // Let's stick to the guide's pattern or use service key for full access.
    // Given we are building an internal billing tool, service key is appropriate for server-side operations.
    return createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_KEY)
}
