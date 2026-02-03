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

        // Get tokens from localStorage for different user types
        const adminToken = localStorage.getItem('token')
        const customerToken = localStorage.getItem('customerToken')

        const headers: HeadersInit = {
            'Content-Type': 'application/json',
            ...options?.headers,
        }

        // Determine which token to use based on endpoint
        let token: string | null = null
        let tokenType: string = 'none'

        if (endpoint.startsWith('/api/customer-auth')) {
            // Customer auth endpoints - no token needed
            tokenType = 'none'
        } else if (endpoint.startsWith('/api/customer/')) {
            // Customer-specific routes - use customer token
            token = customerToken
            tokenType = 'customer'
        } else if (endpoint.startsWith('/api/auth')) {
            // Admin auth endpoints - no token needed
            tokenType = 'none'
        } else if (endpoint.startsWith('/api/invoices/') && endpoint.endsWith('/print')) {
            // Shared invoice print endpoint - try customer token first, then admin token
            token = customerToken || adminToken
            tokenType = customerToken ? 'customer' : (adminToken ? 'admin' : 'none')
        } else {
            // Admin protected routes - use admin token
            token = adminToken
            tokenType = 'admin'
        }

        // Add Authorization header if token is available
        if (token) {
            (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`
            // console.log(`🔐 Adding ${tokenType} auth header for:`, endpoint, 'Token length:', token.length)
        }

        // if(!token){
        //     console.log(`🔓 No auth header for:`, endpoint, {
        //         tokenType,
        //         hasAdminToken: !!adminToken,
        //         hasCustomerToken: !!customerToken,
        //         isAuthEndpoint: endpoint.startsWith('/api/auth'),
        //         isCustomerAuthEndpoint: endpoint.startsWith('/api/customer-auth'),
        //         isCustomerRoute: endpoint.startsWith('/api/customer/')
        //     })
        // }

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
        return this.request<any>('/api/customer-auth/verify', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${customerToken}`
            }
        })
    }

    // Invoices
    async getInvoices(page = 1, limit = 20) {
        return this.request<any>(`/api/invoices?page=${page}&limit=${limit}`)
    }

    async getInvoice(id: string) {
        return this.request<any>(`/api/invoices/${id}`)
    }

    async createInvoice(data: any) {
        return this.request<any>('/api/invoices', {
            method: 'POST',
            body: JSON.stringify(data),
        })
    }

    async updateInvoice(id: string, data: any) {
        return this.request<any>(`/api/invoices/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        })
    }

    async deleteInvoice(id: string) {
        return this.request<any>(`/api/invoices/${id}`, {
            method: 'DELETE',
        })
    }

    // Customers
    async getCustomers(page = 1, limit = 20) {
        return this.request<any>(`/api/customers?page=${page}&limit=${limit}`)
    }

    async searchCustomers(query: string) {
        return this.request<any>(`/api/customers/search?q=${encodeURIComponent(query)}`)
    }

    async getCustomer(id: string) {
        return this.request<any>(`/api/customers/${id}`)
    }

    async createCustomer(data: any) {
        return this.request<any>('/api/customers', {
            method: 'POST',
            body: JSON.stringify(data),
        })
    }

    async updateCustomer(id: string, data: any) {
        return this.request<any>(`/api/customers/${id}`, {
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
        return this.request<any>('/api/car-models')
    }

    async searchCarModels(query: string) {
        return this.request<any>(`/api/car-models/search?q=${encodeURIComponent(query)}`)
    }

    // Parts
    async getParts(category?: string, page = 1, limit = 20) {
        let url = '/api/parts'
        const params = new URLSearchParams()
        if (category) params.append('category', category)
        params.append('page', page.toString())
        params.append('limit', limit.toString())

        return this.request<any>(`${url}?${params.toString()}`)
    }

    async searchParts(query: string) {
        return this.request<any>(`/api/parts/search?q=${encodeURIComponent(query)}`)
    }

    async createPart(data: any) {
        return this.request<any>('/api/parts', {
            method: 'POST',
            body: JSON.stringify(data),
        })
    }

    async updatePart(id: string, data: any) {
        return this.request<any>(`/api/parts/${id}`, {
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
        return this.request<any>('/api/dashboard')
    }

    async getRevenueReports() {
        return this.request<any>('/api/reports/revenue')
    }

    // Users Management
    async getUsers(page = 1, limit = 20) {
        return this.request<any>(`/api/users?page=${page}&limit=${limit}`)
    }

    async searchUsers(query: string) {
        return this.request<any>(`/api/users?search=${encodeURIComponent(query)}`)
    }

    async getUser(id: string) {
        return this.request<any>(`/api/users/${id}`)
    }

    async createUser(data: any) {
        return this.request<any>('/api/users', {
            method: 'POST',
            body: JSON.stringify(data),
        })
    }

    async updateUser(id: string, data: any) {
        return this.request<any>(`/api/users/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        })
    }

    async deleteUser(id: string) {
        return this.request<any>(`/api/users/${id}`, {
            method: 'DELETE',
        })
    }

    async resetUserPassword(id: string, data: { newPassword: string }) {
        return this.request<any>(`/api/users/${id}/reset-password`, {
            method: 'POST',
            body: JSON.stringify(data),
        })
    }

    async toggleUserStatus(id: string) {
        return this.request<any>(`/api/users/${id}/toggle-status`, {
            method: 'POST',
        })
    }

    // Customer-specific endpoints
    async getCustomerInvoices(page = 1, limit = 20) {
        return this.request<any>(`/api/customer/invoices?page=${page}&limit=${limit}`)
    }

    async getCustomerInvoice(id: string) {
        return this.request<any>(`/api/customer/invoices/${id}`)
    }

    // Shared invoice print endpoint
    async getInvoiceForPrint(id: string) {
        return this.request<any>(`/api/invoices/${id}/print`)
    }
}

export const api = new ApiClient(API_URL)
