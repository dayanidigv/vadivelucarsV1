import { Hono } from 'hono'
import * as invoiceController from './controllers/invoice'
import * as customerController from './controllers/customer'
import * as partsController from './controllers/parts'
import * as dashboardController from './controllers/dashboard'
import * as authController from './controllers/auth'
import * as customerAuthController from './controllers/customerAuth'
import * as userController from './controllers/user'
import * as customerInvoiceController from './controllers/customerInvoice'
import * as customerProfileController from './controllers/customerProfile'
import * as customerVehicleController from './controllers/customerVehicle'
import * as customerFeedbackController from './controllers/customerFeedback'
import * as carModelController from './controllers/carModel'
import { Env } from './lib/supabase'

// Define Bindings to include Env
type Bindings = Env

const router = new Hono<{ Bindings: Bindings }>()

// Health check
router.get('/health', (c) => c.json({ status: 'healthy' }))

// Authentication
router.route('/auth', authController.auth)
router.route('/customer-auth', customerAuthController.customerAuth)

// Customer-specific routes (protected by customer auth)
router.route('/customer/invoices', customerInvoiceController.customerInvoices)
router.get('/customer/profile', customerProfileController.getProfile)
router.put('/customer/profile', customerProfileController.updateProfile)
router.post('/customer/profile/send-verification', customerProfileController.sendPhoneVerification)
router.get('/customer/vehicles', customerVehicleController.getVehicles)
router.post('/customer/vehicles', customerVehicleController.addVehicle)
router.put('/customer/vehicles/:id', customerVehicleController.updateVehicle)
router.delete('/customer/vehicles/:id', customerVehicleController.deactivateVehicle)
router.post('/customer/vehicles/:id/reactivate', customerVehicleController.reactivateVehicle)
router.post('/customer/feedback', customerFeedbackController.submitFeedback)
router.get('/customer/feedback/history', customerFeedbackController.getFeedbackHistory)

// Test route
router.get('/customer/test', (c) => c.json({ success: true, message: 'Test route working' }))

// Shared invoice print endpoint (accessible by both admin and customer)
router.get('/invoices/:id/print', invoiceController.print)

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

// Car Models
router.route('/car-models', carModelController.carModels)

// Dashboard
router.get('/dashboard', dashboardController.getStats)
router.get('/reports/revenue', dashboardController.getRevenueStats)

export default router
