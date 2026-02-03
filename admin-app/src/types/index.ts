
export interface Customer {
    id: string
    name: string
    phone?: string
    email?: string
    address?: string
    vehicles?: Vehicle[]
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
    price?: number
    unit: string
    is_active: boolean
}

export interface InvoiceItem {
    id?: string
    invoice_id?: string
    part_id?: string
    description: string
    category: string // Required in schema
    quantity: number
    unit?: string // Optional in schema (not present)
    rate?: number // Legacy/UI alias
    unit_price: number // Required in schema
    amount: number
    item_type?: 'part' | 'labor' // Optional in schema (not present)
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
    payment_status: 'paid' | 'unpaid' | 'partial' | 'pending'
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
    payment_status?: 'paid' | 'unpaid' | 'partial' | 'pending'
    payment_method?: string
    paid_amount?: number
    notes?: string
    mechanic_name?: string
    invoice_date?: string
    idempotencyKey?: string
}

export interface CreateCustomerInput {
    name: string
    phone?: string
    email?: string
    address?: string
    vehicles?: {
        vehicle_number: string
        make?: string
        model?: string
        year?: number
    }[]
}

export interface CreatePartInput {
    name: string
    category: string
    default_rate: number
    unit: string
    is_active?: boolean
}

export interface User {
    id: string
    username: string
    email: string
    name: string
    phone?: string
    role: 'admin' | 'manager' | 'staff' | 'technician'
    permissions: Record<string, any>
    is_active: boolean
    login_attempts?: number
    locked_until?: string
    last_login?: string
    created_at: string
    updated_at: string
}

export interface CreateUserInput {
    username: string
    email: string
    name: string
    role: 'admin' | 'manager' | 'staff' | 'technician'
    password?: string
}

export interface UpdateUserInput {
    name?: string
    email?: string
    role?: 'admin' | 'manager' | 'staff' | 'technician'
    is_active?: boolean
}

export interface AuditLogInput {
    action: string
    resource: string
    resourceId?: string
    performedBy?: string
    severity: 'low' | 'medium' | 'high' | 'critical'
    changes?: Record<string, any>
    metadata?: Record<string, any>
}

export interface ApiResponse<T> {
    success: boolean
    data?: T
    message?: string
    pagination?: {
        page: number
        limit: number
        total: number
        pages: number
    }
}
export interface CarModel {
    id: string
    make: string
    model: string
    type: string
}
