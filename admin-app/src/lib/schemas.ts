import { z } from 'zod'

export const CustomerSchema = z.object({
    name: z.string()
        .min(2, 'Name must be at least 2 characters')
        .max(100, 'Name too long')
        .regex(/^[a-zA-Z\s.-]+$/, 'Name can only contain letters, spaces, dots and hyphens'),
    phone: z.string()
        .regex(/^[0-9+ \s-]{10,20}$/, 'Invalid phone number format')
        .transform(v => v.replace(/\s|-/g, ''))
        .optional()
        .or(z.literal('')),
    email: z.string()
        .email('Invalid email')
        .optional()
        .or(z.literal('')),
    address: z.string()
        .max(500, 'Address too long')
        .optional()
        .or(z.literal('')),
    vehicles: z.array(z.object({
        vehicle_number: z.string()
            .trim()
            .toUpperCase()
            .regex(/^[A-Z0-9\s-]+$/, 'Invalid vehicle number format'),
        make: z.string().optional().or(z.literal('')),
        model: z.string().optional().or(z.literal('')),
    })).optional()
})

export const InvoiceItemSchema = z.object({
    category: z.string().min(1, 'Category is required'),
    description: z.string().min(1, 'Description is required').max(1000),
    quantity: z.number().min(0.01, 'Quantity must be greater than 0'),
    rate: z.number().min(0, 'Rate cannot be negative').optional(),
    unit_price: z.number().min(0, 'Price cannot be negative').optional(),
    amount: z.number().min(0).optional(),
    item_type: z.enum(['part', 'labor']).optional()
}).refine(data => data.rate !== undefined || data.unit_price !== undefined, {
    message: "Either rate or unit_price is required"
})

export const InvoiceSchema = z.object({
    customer_id: z.string().uuid('Invalid customer selection'),
    vehicle_id: z.string().uuid('Invalid vehicle selection'),
    items: z.array(InvoiceItemSchema).min(1, 'At least one item is required'),
    total_amount: z.number().min(0).optional(),
    grand_total: z.number().min(0).optional(),
    paid_amount: z.number().min(0).optional(),
    payment_status: z.enum(['pending', 'partial', 'paid', 'unpaid']),
    payment_method: z.string().optional(),
    discount_amount: z.number().min(0).optional(),
    notes: z.string().max(2000).optional().or(z.literal('')),
    mileage: z.number().min(0).nullable().optional(),
    mechanic_name: z.string().optional().or(z.literal('')),
    invoice_date: z.string().optional()
})
