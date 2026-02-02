export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787'

class ApiClient {
    private baseUrl: string

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl
    }

    private async request<T>(
        endpoint: string,
        options?: RequestInit
    ): Promise<T> {
        const url = `${this.baseUrl}${endpoint}`

        // Get token from localStorage for authenticated endpoints
        const token = localStorage.getItem('token')
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
            ...options?.headers,
        }

        // Add Authorization header for protected endpoints (except auth endpoints)
        if (token && !endpoint.startsWith('/api/auth') && !endpoint.startsWith('/api/customer-auth')) {
            (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`
        }

        const response = await fetch(url, {
            ...options,
            headers,
        })

        if (!response.ok) {
            const error = await response.json().catch(() => ({}))
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

    async customerLogout(token: string) {
        return this.request<any>('/api/customer-auth/logout', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
    }

    async verifyCustomerToken(token: string) {
        return this.request<any>('/api/customer-auth/verify', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
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
}

export const api = new ApiClient(API_URL)
