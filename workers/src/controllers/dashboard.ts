
import { Context } from 'hono'
import { getSupabaseClient } from '../lib/supabase'

export async function getStats(c: Context) {
    const supabase = getSupabaseClient(c.env)

    // 1. Total Revenue (Paid Invoices)
    const { data: revenueData, error: revenueError } = await supabase
        .from('invoices')
        .select('grand_total')
        .eq('payment_status', 'paid')

    const totalRevenue = revenueData?.reduce((sum, inv) => sum + (inv.grand_total || 0), 0) || 0

    // 2. Active Invoices (Unpaid or Partial)
    const { count: activeInvoicesCount, error: activeError } = await supabase
        .from('invoices')
        .select('*', { count: 'exact', head: true })
        .in('payment_status', ['unpaid', 'partial'])

    // 3. Total Customers
    const { count: customersCount, error: customersError } = await supabase
        .from('customers')
        .select('*', { count: 'exact', head: true })

    // 4. Low Stock Parts (Placeholder for now)
    const lowStockCount = 0

    // 5. Recent Activity (Latest 5 Invoices)
    const { data: recentInvoices, error: recentError } = await supabase
        .from('invoices')
        .select(`
            id,
            created_at,
            grand_total,
            payment_status,
            customer:customers(name),
            vehicle:vehicles(model, vehicle_number)
        `)
        .order('created_at', { ascending: false })
        .limit(5)

    if (revenueError || activeError || customersError || recentError) {
        return c.json({ error: 'Failed to fetch dashboard stats' }, 500)
    }

    return c.json({
        success: true,
        data: {
            revenue: totalRevenue,
            activeInvoices: activeInvoicesCount || 0,
            customers: customersCount || 0,
            lowStock: lowStockCount,
            recentActivity: recentInvoices
        }
    })
}

export async function getRevenueStats(c: Context) {
    const supabase = getSupabaseClient(c.env)

    // Get invoices from last 6 months
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    const { data: invoices, error } = await supabase
        .from('invoices')
        .select('created_at, grand_total, payment_status')
        .gte('created_at', sixMonthsAgo.toISOString())
        .order('created_at', { ascending: true })

    if (error) {
        return c.json({ error: error.message }, 500)
    }

    // Group by month
    const monthlyData_map = (invoices || []).reduce((acc: any, inv: any) => {
        const month = new Date(inv.created_at).toLocaleString('default', { month: 'short', year: '2-digit' })
        if (!acc[month]) {
            acc[month] = { name: month, revenue: 0, count: 0 }
        }

        acc[month].revenue += inv.grand_total || 0
        acc[month].count += 1
        return acc
    }, {})

    // Convert map to array
    const chartData = Object.values(monthlyData_map)

    return c.json({
        success: true,
        data: chartData
    })
}
