import { createClient, SupabaseClient } from '@supabase/supabase-js'

export interface Env {
    SUPABASE_URL: string
    SUPABASE_ANON_KEY: string
    SUPABASE_SERVICE_KEY: string
    CUSTOMER_JWT_SECRET: string
    JWT_SECRET: string
    DEV?: string
    AI: any
}

// Cache the Supabase client to avoid creating a new HTTP connection on every request
let cachedClient: SupabaseClient | null = null
let cachedUrl: string | null = null

export function getSupabaseClient(env: Env) {
    if (cachedClient && cachedUrl === env.SUPABASE_URL) {
        return cachedClient
    }
    cachedClient = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_KEY)
    cachedUrl = env.SUPABASE_URL
    return cachedClient
}
