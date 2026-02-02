export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787'

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

    // Get customer token from localStorage
    const customerToken = localStorage.getItem('customerToken')

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options?.headers,
    }

    // Add Authorization header if token is available
    if (customerToken) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${customerToken}`
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      })

      if (!response.ok) {
        if (response.status === 401) {
          // Dispatch event for 401 Unauthorized
          window.dispatchEvent(new CustomEvent('customer:auth:unauthorized'))
        }
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('API Error:', error)
      throw error
    }
  }

  // Customer authentication
  async checkPhone(phone: string) {
    return this.request<any>('/api/customer-auth/check-phone', {
      method: 'POST',
      body: JSON.stringify({ phone }),
    })
  }

  async login(phone: string, vehicleNumber?: string) {
    return this.request<any>('/api/customer-auth/login', {
      method: 'POST',
      body: JSON.stringify({ phone, vehicleNumber }),
    })
  }

  async logout() {
    return this.request<any>('/api/customer-auth/logout', {
      method: 'POST',
    })
  }

  async verifyToken() {
    return this.request<any>('/api/customer-auth/verify')
  }

  // Customer invoices
  async getCustomerInvoices(page = 1, limit = 20) {
    return this.request<any>(`/api/customer/invoices?page=${page}&limit=${limit}`)
  }

  async getCustomerInvoice(id: string) {
    return this.request<any>(`/api/customer/invoices/${id}`)
  }

  async getInvoiceForPrint(id: string) {
    return this.request<any>(`/api/invoices/${id}/print`)
  }

  // Customer profile
  async getProfile() {
    return this.request<any>('/api/customer/profile')
  }

  async updateProfile(data: any) {
    return this.request<any>('/api/customer/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async sendPhoneVerification(phone: string) {
    return this.request<any>('/api/customer/profile/send-verification', {
      method: 'POST',
      body: JSON.stringify({ phone }),
    })
  }

  // Customer vehicles
  async getVehicles() {
    return this.request<any>('/api/customer/vehicles')
  }

  async addVehicle(data: any) {
    return this.request<any>('/api/customer/vehicles', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateVehicle(id: string, data: any) {
    return this.request<any>(`/api/customer/vehicles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deactivateVehicle(id: string) {
    return this.request<any>(`/api/customer/vehicles/${id}`, {
      method: 'DELETE',
    })
  }

  async reactivateVehicle(id: string) {
    return this.request<any>(`/api/customer/vehicles/${id}/reactivate`, {
      method: 'POST',
    })
  }

  // Customer feedback
  async submitFeedback(data: { rating: number; feedback_text?: string }) {
    return this.request<any>('/api/customer/feedback', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async getFeedbackHistory() {
    return this.request<any>('/api/customer/feedback/history')
  }
}

export const api = new ApiClient(API_URL)
