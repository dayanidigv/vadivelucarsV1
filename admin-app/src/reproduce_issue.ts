
import { Invoice, ApiResponse } from './types';
import { api } from './lib/api';

async function test() {
    const response = await api.getInvoice("123");
    if (!response || !response.data) return;

    // According to my analysis:
    // response is ApiResponse<Invoice>
    // response.data is Invoice
    const fullInvoice: Invoice = response.data;

    // The user claims fullInvoice is ApiResponse<Invoice>
    // const bad: ApiResponse<Invoice> = response.data; // This should fail if my analysis is right
}
