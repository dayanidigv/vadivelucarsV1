import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import type { Invoice, InvoiceItem } from '@/types'

interface ServiceItem {
  part_id?: string
  description: string
  quantity: number
  unit_price: number
  amount: number
  item_type: 'part' | 'labor'
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
          const sorted = customerInvoices.sort((a: Invoice, b: Invoice) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          )

          const latestInvoice = sorted[0]
          setLastService({
            id: latestInvoice.id,
            customer_id: latestInvoice.customer_id,
            vehicle_id: latestInvoice.vehicle_id,
            items: (latestInvoice.items || []).map((item: InvoiceItem) => ({
              part_id: item.part_id,
              description: item.description,
              quantity: Number(item.quantity),
              unit_price: Number(item.unit_price),
              amount: Number(item.amount),
              item_type: item.item_type || 'part'
            })),
            created_at: latestInvoice.created_at,
            invoice_date: latestInvoice.invoice_date || latestInvoice.created_at,
            mileage: latestInvoice.mileage || 0,
            total_amount: Number(latestInvoice.grand_total) || 0
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
      description: item.description,
      quantity: item.quantity,
      rate: item.unit_price,
      amount: item.amount,
      item_type: item.item_type
    }))
  }

  return {
    lastService,
    loading,
    fetchLastService,
    repeatLastService
  }
}
