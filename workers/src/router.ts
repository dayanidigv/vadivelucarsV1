import { Hono } from 'hono'
import * as invoiceController from './controllers/invoice'
import * as customerController from './controllers/customer'
import * as partsController from './controllers/parts'
import * as dashboardController from './controllers/dashboard'
import * as authController from './controllers/auth'
import * as customerAuthController from './controllers/customerAuth'
import * as userController from './controllers/user'
import { Env } from './lib/supabase'

// Define Bindings to include Env
type Bindings = Env

const router = new Hono<{ Bindings: Bindings }>()

// Health check
router.get('/health', (c) => c.json({ status: 'healthy' }))

// Authentication
router.route('/auth', authController.auth)
router.route('/customer-auth', customerAuthController.customerAuth)

// Users Management
router.get('/users', userController.list)
router.get('/users/:id', userController.get)
router.post('/users', userController.create)
router.put('/users/:id', userController.update)
router.delete('/users/:id', userController.remove)
router.post('/users/:id/reset-password', userController.resetPassword)
router.post('/users/:id/toggle-status', userController.toggleStatus)

// Invoices
router.get('/invoices', invoiceController.list)
router.get('/invoices/:id', invoiceController.get)
router.get('/invoices/last', invoiceController.getLastByVehicle)
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
router.get('/parts/recent', partsController.recent)
router.post('/parts', partsController.create)
router.put('/parts/:id', partsController.update)
router.delete('/parts/:id', partsController.remove)

// Dashboard
router.get('/dashboard', dashboardController.getStats)
router.get('/reports/revenue', dashboardController.getRevenueStats)

export default router
