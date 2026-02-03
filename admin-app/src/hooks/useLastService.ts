import { useState, useEffect } from 'react'
import { api } from '@/lib/api'

interface ServiceItem {
  part_id: string
  part_name: string
  quantity: number
  unit_price: number
  total: number
}

interface LastService {
  id: string
  customer_id: string
  vehicle_id: string
  items: ServiceItem[]
  created_at: string
  invoice_date: string
  mileage: number
  total_amount: number
}

export function useLastService(customerId?: string, vehicleId?: string) {
  const [lastService, setLastService] = useState<LastService | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (customerId && vehicleId) {
      fetchLastService()
    }
  }, [customerId, vehicleId])

  const fetchLastService = async () => {
    if (!customerId || !vehicleId) return

    setLoading(true)
    try {
      // Get invoices for this customer and vehicle
      const response = await api.getInvoices(1, 50) // Get more invoices to find the last one

      if (response.success && response.data) {
        // Filter invoices for this customer and vehicle
        const customerInvoices = response.data.filter((invoice: any) =>
          invoice.customer_id === customerId && invoice.vehicle_id === vehicleId
        )

        if (customerInvoices.length > 0) {
          // Sort by date and get the most recent
          const sorted = customerInvoices.sort((a: any, b: any) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          )

          const latestInvoice = sorted[0]
          setLastService({
            id: latestInvoice.id,
            customer_id: latestInvoice.customer_id,
            vehicle_id: latestInvoice.vehicle_id,
            items: latestInvoice.items || [],
            created_at: latestInvoice.created_at,
            invoice_date: latestInvoice.invoice_date || latestInvoice.created_at,
            mileage: latestInvoice.mileage || 0,
            total_amount: latestInvoice.grand_total || 0
          })
        }
      }
    } catch (error) {
      console.error('Error fetching last service:', error)
    } finally {
      setLoading(false)
    }
  }

  const repeatLastService = () => {
    if (!lastService) return []

    // Return items ready to be added to new invoice
    return lastService.items.map(item => ({
      part_id: item.part_id,
      name: item.part_name,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total: item.total
    }))
  }

  return {
    lastService,
    loading,
    fetchLastService,
    repeatLastService
  }
}
