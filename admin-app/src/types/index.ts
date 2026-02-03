
export interface Customer {
    id: string
    name: string
    phone?: string
    email?: string
    address?: string
    created_at: string
    updated_at: string
}

export interface Vehicle {
    id: string
    customer_id: string
    vehicle_number: string
    make?: string
    model?: string
    year?: number
    current_mileage?: number
    insurance_date?: string
    created_at: string
    updated_at: string
}

export interface Part {
    id: string
    name: string
    category: string
    default_rate: number
    unit: string
    is_active: boolean
}

export interface InvoiceItem {
    id?: string
    invoice_id?: string
    part_id?: string
    description: string
    category?: string
    quantity: number
    unit: string
    rate: number
    amount: number
    item_type: 'part' | 'labor'
}

export interface Invoice {
    id: string
    invoice_number: string
    customer_id: string
    vehicle_id: string
    invoice_date: string
    mileage?: number
    parts_total: number
    labor_total: number
    discount_amount: number
    grand_total: number
    payment_status: 'paid' | 'unpaid' | 'partial'
    payment_method?: string
    paid_amount: number
    balance_amount: number
    notes?: string
    mechanic_name?: string
    pdf_url?: string
    created_at: string
    updated_at: string
    customer?: Customer
    vehicle?: Vehicle
    items?: InvoiceItem[]
}

export interface CreateInvoiceData {
    customer_id: string
    vehicle_id: string
    mileage?: number
    items: InvoiceItem[]
    discount_amount?: number
    payment_status?: 'paid' | 'unpaid' | 'partial'
    payment_method?: string
    paid_amount?: number
    notes?: string
    mechanic_name?: string
    invoice_date?: string
}
