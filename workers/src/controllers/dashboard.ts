
import { Context } from 'hono'
import { getSupabaseClient } from '../lib/supabase'

export async function getStats(c: Context) {
    const supabase = getSupabaseClient(c.env)

    // 1. Total Revenue (Sum of paid_amount across all invoices)
    const { data: revenueData, error: revenueError } = await supabase
        .from('invoices')
        .select('paid_amount')

    const totalRevenue = revenueData?.reduce((sum, inv) => sum + Number(inv.paid_amount || 0), 0) || 0

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

    const range = c.req.query('range')
    const startDateParam = c.req.query('startDate')
    const endDateParam = c.req.query('endDate')

    let startDate: Date | null = null
    let endDate: Date = new Date()

    if (startDateParam) {
        startDate = new Date(startDateParam)
    } else {
        if (range === '30d') {
            startDate = new Date()
            startDate.setDate(startDate.getDate() - 30)
        } else if (range === '90d') {
            startDate = new Date()
            startDate.setDate(startDate.getDate() - 90)
        } else if (range === '6m') {
            startDate = new Date()
            startDate.setMonth(startDate.getMonth() - 6)
        } else if (range === '12m') {
            startDate = new Date()
            startDate.setMonth(startDate.getMonth() - 12)
        } else if (range === 'ytd') {
            startDate = new Date(new Date().getFullYear(), 0, 1)
        } else if (range === 'all') {
            startDate = null
        } else {
            // default to 6m
            startDate = new Date()
            startDate.setMonth(startDate.getMonth() - 6)
        }
    }

    if (endDateParam) {
        endDate = new Date(endDateParam)
        endDate.setHours(23, 59, 59, 999)
    }

    let query = supabase
        .from('invoices')
        .select(`
            id,
            invoice_number,
            created_at,
            invoice_date,
            grand_total,
            payment_status,
            payment_method,
            parts_total,
            labor_total,
            discount_amount,
            paid_amount,
            balance_amount,
            customer:customers(name, phone),
            vehicle:vehicles(vehicle_number, make, model),
            items:invoice_items(description, quantity, rate, amount, item_type)
        `)
        .order('created_at', { ascending: true })

    if (startDate) {
        query = query.gte('created_at', startDate.toISOString())
    }
    query = query.lte('created_at', endDate.toISOString())

    const { data: invoices, error } = await query

    if (error) {
        return c.json({ error: error.message }, 500)
    }

    const items = invoices || []

    // 1. Calculate overall summary
    let totalRevenue = 0
    let totalCollected = 0
    let totalOutstanding = 0
    let totalParts = 0
    let totalLabor = 0
    let totalDiscounts = 0
    const count = items.length

    items.forEach((inv: any) => {
        totalRevenue += Number(inv.grand_total || 0)
        totalCollected += Number(inv.paid_amount || 0)
        totalOutstanding += Number(inv.balance_amount || 0)
        totalParts += Number(inv.parts_total || 0)
        totalLabor += Number(inv.labor_total || 0)
        totalDiscounts += Number(inv.discount_amount || 0)
    })

    const avgTicketSize = count > 0 ? totalRevenue / count : 0

    // 2. Group by month for monthly breakdown
    const monthlyDataMap: Record<string, any> = {}
    items.forEach((inv: any) => {
        const dateObj = new Date(inv.invoice_date || inv.created_at)
        const month = dateObj.toLocaleString('default', { month: 'short', year: '2-digit' })
        
        if (!monthlyDataMap[month]) {
            monthlyDataMap[month] = {
                name: month,
                revenue: 0,
                collected: 0,
                outstanding: 0,
                parts: 0,
                labor: 0,
                count: 0
            }
        }

        monthlyDataMap[month].revenue += Number(inv.grand_total || 0)
        monthlyDataMap[month].collected += Number(inv.paid_amount || 0)
        monthlyDataMap[month].outstanding += Number(inv.balance_amount || 0)
        monthlyDataMap[month].parts += Number(inv.parts_total || 0)
        monthlyDataMap[month].labor += Number(inv.labor_total || 0)
        monthlyDataMap[month].count += 1
    })
    const monthlyData = Object.values(monthlyDataMap)

    // 2b. Group by day for daily breakdown
    const dailyDataMap: Record<string, any> = {}
    items.forEach((inv: any) => {
        const dateObj = new Date(inv.invoice_date || inv.created_at)
        const dateStr = dateObj.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
        const sortKey = dateObj.toISOString().split('T')[0]
        
        if (!dailyDataMap[sortKey]) {
            dailyDataMap[sortKey] = {
                name: dateStr,
                sortKey,
                revenue: 0,
                collected: 0,
                outstanding: 0,
                count: 0
            }
        }

        dailyDataMap[sortKey].revenue += Number(inv.grand_total || 0)
        dailyDataMap[sortKey].collected += Number(inv.paid_amount || 0)
        dailyDataMap[sortKey].outstanding += Number(inv.balance_amount || 0)
        dailyDataMap[sortKey].count += 1
    })
    const dailyData = Object.values(dailyDataMap).sort((a: any, b: any) => a.sortKey.localeCompare(b.sortKey))

    // 3. Payment Status Distribution
    const statusMap: Record<string, { name: string; value: number; amount: number }> = {
        paid: { name: 'Paid', value: 0, amount: 0 },
        unpaid: { name: 'Unpaid', value: 0, amount: 0 },
        partial: { name: 'Partial', value: 0, amount: 0 }
    }
    items.forEach((inv: any) => {
        const status = inv.payment_status || 'unpaid'
        if (statusMap[status]) {
            statusMap[status].value += 1
            statusMap[status].amount += Number(inv.grand_total || 0)
        } else {
            statusMap[status] = { name: status.toUpperCase(), value: 1, amount: Number(inv.grand_total || 0) }
        }
    })
    const paymentStatusDistribution = Object.values(statusMap)

    // 4. Payment Method Distribution
    const methodMap: Record<string, { name: string; value: number; amount: number }> = {}
    items.forEach((inv: any) => {
        const rawMethod = inv.payment_method || 'unspecified'
        let name = 'Other'
        if (rawMethod === 'cash') name = 'Cash'
        else if (rawMethod === 'card') name = 'Card'
        else if (rawMethod === 'upi') name = 'UPI'
        else if (rawMethod === 'bank_transfer') name = 'Bank Transfer'
        else name = rawMethod.charAt(0).toUpperCase() + rawMethod.slice(1)

        if (!methodMap[rawMethod]) {
            methodMap[rawMethod] = { name, value: 0, amount: 0 }
        }
        methodMap[rawMethod].value += 1
        methodMap[rawMethod].amount += Number(inv.grand_total || 0)
    })
    const paymentMethodDistribution = Object.values(methodMap)

    // 5. Item / Service Sales Breakdown & Category Breakdown
    const itemBreakdownMap: Record<string, { description: string; quantity: number; amount: number; item_type: string; count: number }> = {}
    const categoryMap: Record<string, { category: string; count: number; quantity: number; amount: number }> = {}
    
    items.forEach((inv: any) => {
        const invoiceItems = inv.items || []
        invoiceItems.forEach((item: any) => {
            const desc = item.description || 'Unknown'
            const cleanDesc = desc.trim()
            const key = cleanDesc.toLowerCase()

            if (!itemBreakdownMap[key]) {
                itemBreakdownMap[key] = {
                    description: cleanDesc,
                    quantity: 0,
                    amount: 0,
                    item_type: item.item_type || 'part',
                    count: 0
                }
            }

            itemBreakdownMap[key].quantity += Number(item.quantity || 0)
            itemBreakdownMap[key].amount += Number(item.amount || 0)
            itemBreakdownMap[key].count += 1

            // Category Breakdown
            const cat = item.category || (item.item_type === 'labor' ? 'Labor' : 'General')
            const catKey = cat.trim()
            if (!categoryMap[catKey]) {
                categoryMap[catKey] = { category: catKey, count: 0, quantity: 0, amount: 0 }
            }
            categoryMap[catKey].count += 1
            categoryMap[catKey].quantity += Number(item.quantity || 0)
            categoryMap[catKey].amount += Number(item.amount || 0)
        })
    })

    const itemBreakdown = Object.values(itemBreakdownMap).sort((a, b) => b.amount - a.amount)
    const categoryBreakdown = Object.values(categoryMap).sort((a, b) => b.amount - a.amount)

    // 6. Top Customers Breakdown
    const customerMap: Record<string, { name: string; phone: string; count: number; total: number; paid: number; balance: number }> = {}
    items.forEach((inv: any) => {
        const name = (inv as any).customer?.name || 'Unknown'
        const phone = (inv as any).customer?.phone || ''
        const key = `${name}_${phone}`
        
        if (!customerMap[key]) {
            customerMap[key] = { name, phone, count: 0, total: 0, paid: 0, balance: 0 }
        }
        customerMap[key].count += 1
        customerMap[key].total += Number(inv.grand_total || 0)
        customerMap[key].paid += Number(inv.paid_amount || 0)
        customerMap[key].balance += Number(inv.balance_amount || 0)
    })
    const topCustomers = Object.values(customerMap).sort((a, b) => b.total - a.total).slice(0, 10)

    // 7. Outstanding Invoices list
    const outstandingInvoices = items
        .filter((inv: any) => Number(inv.balance_amount || 0) > 0)
        .map((inv: any) => ({
            id: inv.id,
            invoice_number: inv.invoice_number,
            invoice_date: inv.invoice_date,
            customer_name: (inv as any).customer?.name || 'Unknown',
            customer_phone: (inv as any).customer?.phone || '',
            vehicle_number: (inv as any).vehicle?.vehicle_number || '',
            grand_total: Number(inv.grand_total || 0),
            paid_amount: Number(inv.paid_amount || 0),
            balance_amount: Number(inv.balance_amount || 0),
            payment_status: inv.payment_status
        }))
        .sort((a, b) => b.balance_amount - a.balance_amount)

    return c.json({
        success: true,
        data: {
            summary: {
                totalRevenue,
                totalCollected,
                totalOutstanding,
                totalParts,
                totalLabor,
                totalDiscounts,
                count,
                avgTicketSize
            },
            monthly: monthlyData,
            daily: dailyData,
            paymentStatusDistribution,
            paymentMethodDistribution,
            itemBreakdown,
            categoryBreakdown,
            topCustomers,
            outstandingInvoices,
            invoices: items.map(inv => ({
                id: inv.id,
                invoice_number: inv.invoice_number,
                invoice_date: inv.invoice_date,
                created_at: inv.created_at,
                grand_total: Number(inv.grand_total || 0),
                payment_status: inv.payment_status,
                payment_method: inv.payment_method,
                parts_total: Number(inv.parts_total || 0),
                labor_total: Number(inv.labor_total || 0),
                discount_amount: Number(inv.discount_amount || 0),
                paid_amount: Number(inv.paid_amount || 0),
                balance_amount: Number(inv.balance_amount || 0),
                customer_name: (inv as any).customer?.name || 'Unknown',
                customer_phone: (inv as any).customer?.phone || '',
                vehicle_number: (inv as any).vehicle?.vehicle_number || 'Unknown',
                vehicle_model: (inv as any).vehicle ? `${(inv as any).vehicle.make || ''} ${(inv as any).vehicle.model || ''}`.trim() : ''
            }))
        }
    })
}
