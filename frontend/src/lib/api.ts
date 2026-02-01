
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787'

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

        const response = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options?.headers,
            },
        })

        if (!response.ok) {
            const error = await response.json().catch(() => ({}))
            throw new Error(error.error || 'Request failed')
        }

        return response.json()
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
}

export const api = new ApiClient(API_URL)
