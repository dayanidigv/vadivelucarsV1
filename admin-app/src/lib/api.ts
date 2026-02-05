import type {
    Customer, Part, Invoice, CreateInvoiceData,
    CreateCustomerInput, CreatePartInput, User, CarModel,
    CreateUserInput, UpdateUserInput, AuditLogInput, ApiResponse
} from '@/types'

export const API_URL = import.meta.env.VITE_API_URL || 'https://api.vadivelucars.in'

export class ApiClient {
    private baseUrl: string

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl
    }

    private async request<T>(
        endpoint: string,
        options?: RequestInit
    ): Promise<T> {
        const url = `${this.baseUrl}${endpoint}`

        // Get tokens from sessionStorage (high security) or localStorage (legacy/persistence)
        const adminToken = sessionStorage.getItem('token') || localStorage.getItem('token')
        const customerToken = sessionStorage.getItem('customerToken') || localStorage.getItem('customerToken')

        const headers: HeadersInit = {
            'Content-Type': 'application/json',
            ...options?.headers,
        }

        // Determine which token to use based on endpoint
        let token: string | null = null
        let tokenType: string = 'none'

        if (endpoint.startsWith('/api/customer-auth/login') || endpoint.startsWith('/api/customer-auth/check-phone')) {
            tokenType = 'none'
        } else if (endpoint.startsWith('/api/customer-auth') || endpoint.startsWith('/api/customer/')) {
            token = customerToken
            tokenType = 'customer'
        } else if (endpoint === '/api/auth/login' || endpoint === '/api/auth/google') {
            tokenType = 'none'
        } else {
            // All other routes (including /api/auth/verify) use adminToken
            token = adminToken
            tokenType = 'admin'
        }

        // Add Authorization header if token is available
        if (token) {
            (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`
        }

        // Safe logging in development only
        if (import.meta.env.DEV) {
            console.log(`📡 API Request: ${options?.method || 'GET'} ${endpoint} [Auth: ${tokenType} ${token ? '✓' : '✗'}]`)
        }

        const response = await fetch(url, {
            ...options,
            headers,
        })

        if (!response.ok) {
            const error = await response.json().catch(() => ({}))
            console.error('❌ API Error:', { endpoint, status: response.status, error, tokenType })
            throw new Error(error.error || 'Request failed')
        }

        return response.json()
    }

    // Authentication
    async login(username: string, password: string) {
        return this.request<any>('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({ username, password }),
        })
    }

    async googleLogin(token: string) {
        return this.request<any>('/api/auth/google', {
            method: 'POST',
            body: JSON.stringify({ token }),
        })
    }

    async logout(token: string) {
        return this.request<any>('/api/auth/logout', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
    }

    async verifyToken(token: string) {
        return this.request<any>('/api/auth/verify', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
    }

    async changePassword(token: string, currentPassword: string, newPassword: string) {
        return this.request<any>('/api/auth/change-password', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ currentPassword, newPassword }),
        })
    }

    // Customer Authentication
    async checkCustomerPhone(phone: string) {
        return this.request<any>('/api/customer-auth/check-phone', {
            method: 'POST',
            body: JSON.stringify({ phone }),
        })
    }

    async customerLogin(phone: string) {
        return this.request<any>('/api/customer-auth/login', {
            method: 'POST',
            body: JSON.stringify({ phone }),
        })
    }

    async customerLoginWithVehicle(phone: string, vehicleNumber: string) {
        return this.request<any>('/api/customer-auth/login', {
            method: 'POST',
            body: JSON.stringify({ phone, vehicleNumber }),
        })
    }

    async customerLogout() {
        const customerToken = localStorage.getItem('customerToken')
        if (!customerToken) {
            throw new Error('No customer token found')
        }
        return this.request<any>('/api/customer-auth/logout', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${customerToken}`
            }
        })
    }

    async verifyCustomerToken() {
        const customerToken = localStorage.getItem('customerToken')
        if (!customerToken) {
            throw new Error('No customer token found')
        }
        return this.request<ApiResponse<any>>('/api/customer-auth/verify', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${customerToken}`
            }
        })
    }

    // Invoices
    async getInvoices(page = 1, limit = 20) {
        return this.request<ApiResponse<Invoice[]>>(`/api/invoices?page=${page}&limit=${limit}`)
    }

    async getInvoice(id: string) {
        return this.request<ApiResponse<Invoice>>(`/api/invoices/${id}`)
    }

    async createInvoice(data: CreateInvoiceData) {
        return this.request<ApiResponse<Invoice>>('/api/invoices', {
            method: 'POST',
            body: JSON.stringify(data),
        })
    }

    async updateInvoice(id: string, data: Partial<CreateInvoiceData>) {
        return this.request<ApiResponse<Invoice>>(`/api/invoices/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        })
    }

    async getLastInvoiceByVehicle(vehicleId: string) {
        return this.request<ApiResponse<Invoice>>(`/api/invoices/last?vehicle_id=${vehicleId}`)
    }

    async deleteInvoice(id: string) {
        return this.request<any>(`/api/invoices/${id}`, {
            method: 'DELETE',
        })
    }

    // Customers
    async getCustomers(page = 1, limit = 20) {
        return this.request<ApiResponse<Customer[]>>(`/api/customers?page=${page}&limit=${limit}`)
    }

    async searchCustomers(query: string) {
        return this.request<ApiResponse<{ customers: Customer[] }>>(`/api/customers/search?q=${encodeURIComponent(query)}`)
    }

    async getCustomer(id: string) {
        return this.request<ApiResponse<Customer>>(`/api/customers/${id}`)
    }

    async createCustomer(data: CreateCustomerInput) {
        return this.request<ApiResponse<Customer>>('/api/customers', {
            method: 'POST',
            body: JSON.stringify(data),
        })
    }

    async updateCustomer(id: string, data: Partial<CreateCustomerInput>) {
        return this.request<ApiResponse<Customer>>(`/api/customers/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        })
    }

    async deleteCustomer(id: string) {
        return this.request<any>(`/api/customers/${id}`, {
            method: 'DELETE',
        })
    }

    // Car Models
    async getCarModels() {
        return this.request<ApiResponse<CarModel[]>>('/api/car-models')
    }

    async searchCarModels(query: string) {
        return this.request<ApiResponse<CarModel[]>>(`/api/car-models/search?q=${encodeURIComponent(query)}`)
    }

    async createCarModel(data: { make: string, model: string, type?: string }) {
        return this.request<ApiResponse<CarModel>>('/api/car-models', {
            method: 'POST',
            body: JSON.stringify(data),
        })
    }

    // Parts
    async getParts(category?: string, page = 1, limit = 20) {
        let url = '/api/parts'
        const params = new URLSearchParams()
        if (category) params.append('category', category)
        params.append('page', page.toString())
        params.append('limit', limit.toString())

        return this.request<ApiResponse<Part[]>>(`${url}?${params.toString()}`)
    }

    async searchParts(query: string) {
        return this.request<ApiResponse<Part[]>>(`/api/parts/search?q=${encodeURIComponent(query)}`)
    }

    async createPart(data: CreatePartInput) {
        return this.request<ApiResponse<Part>>('/api/parts', {
            method: 'POST',
            body: JSON.stringify(data),
        })
    }

    async updatePart(id: string, data: Partial<CreatePartInput>) {
        return this.request<ApiResponse<Part>>(`/api/parts/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        })
    }

    async deletePart(id: string) {
        return this.request<any>(`/api/parts/${id}`, {
            method: 'DELETE',
        })
    }

    // Dashboard
    async getDashboardStats() {
        return this.request<ApiResponse<any>>('/api/dashboard')
    }

    async getRevenueReports() {
        return this.request<ApiResponse<any>>('/api/reports/revenue')
    }

    // Users Management
    async getUsers(page = 1, limit = 20) {
        return this.request<ApiResponse<User[]>>(`/api/users?page=${page}&limit=${limit}`)
    }

    async searchUsers(query: string) {
        return this.request<ApiResponse<User[]>>(`/api/users?search=${encodeURIComponent(query)}`)
    }

    async getUser(id: string) {
        return this.request<ApiResponse<User>>(`/api/users/${id}`)
    }

    async createUser(data: CreateUserInput) {
        return this.request<ApiResponse<User>>('/api/users', {
            method: 'POST',
            body: JSON.stringify(data),
        })
    }

    async updateUser(id: string, data: UpdateUserInput) {
        return this.request<ApiResponse<User>>(`/api/users/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        })
    }

    async deleteUser(id: string) {
        return this.request<ApiResponse<any>>(`/api/users/${id}`, {
            method: 'DELETE',
        })
    }

    async resetUserPassword(id: string, data: { newPassword: string }) {
        return this.request<ApiResponse<any>>(`/api/users/${id}/reset-password`, {
            method: 'POST',
            body: JSON.stringify(data),
        })
    }

    async toggleUserStatus(id: string) {
        return this.request<ApiResponse<any>>(`/api/users/${id}/toggle-status`, {
            method: 'POST',
        })
    }

    async createAuditLog(data: AuditLogInput) {
        return this.request<ApiResponse<any>>('/api/audit-logs', {
            method: 'POST',
            body: JSON.stringify(data)
        }).catch(err => {
            console.warn('Failed to log audit event:', err)
            return { success: false } as ApiResponse<any> // Non-blocking failure
        })
    }

    // Customer-specific endpoints
    async getCustomerInvoices(page = 1, limit = 20) {
        return this.request<ApiResponse<Invoice[]>>(`/api/customer/invoices?page=${page}&limit=${limit}`)
    }

    async getCustomerInvoice(id: string) {
        return this.request<ApiResponse<Invoice>>(`/api/customer/invoices/${id}`)
    }

    // Shared invoice print endpoint
    async getInvoiceForPrint(id: string) {
        return this.request<ApiResponse<Invoice>>(`/api/invoices/${id}/print`)
    }
}

export const api = new ApiClient(API_URL)
