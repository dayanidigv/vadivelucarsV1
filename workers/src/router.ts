import { Hono } from 'hono'
import * as invoiceController from './controllers/invoice'
import * as customerController from './controllers/customer'
import * as partsController from './controllers/parts'
import * as dashboardController from './controllers/dashboard'
import { Env } from './lib/supabase'

// Define Bindings to include Env
type Bindings = Env

const router = new Hono<{ Bindings: Bindings }>()

// Health check
router.get('/health', (c) => c.json({ status: 'healthy' }))

// Invoices
router.get('/invoices', invoiceController.list)
router.get('/invoices/:id', invoiceController.get)
router.post('/invoices', invoiceController.create)
router.put('/invoices/:id', invoiceController.update)
router.delete('/invoices/:id', invoiceController.remove)

// Customers
router.get('/customers', customerController.list)
router.get('/customers/search', customerController.search)
router.get('/customers/:id', customerController.get)
router.post('/customers', customerController.create)
router.put('/customers/:id', customerController.update)

// Parts
router.get('/parts', partsController.list)
router.get('/parts/search', partsController.search)
router.post('/parts', partsController.create)

// Dashboard
router.get('/dashboard', dashboardController.getStats)
router.get('/reports/revenue', dashboardController.getRevenueStats)

export default router
