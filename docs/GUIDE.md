# 🚀 COMPLETE DEVELOPMENT GUIDE
## Vadivelu Cars - Digital Billing System

**From Zero to Deployed in 7s**

---

## 📚 Table of Contents

1. [Prerequisites & Setup](#prerequisites--setup)
2. [1: Project Setup](#day-1-project-setup)
3. [2: Database Setup](#day-2-database-setup)
4. [3: Backend Development](#day-3-backend-development)
5. [4: Frontend Development](#day-4-frontend-development)
6. [5: PDF & WhatsApp Integration](#day-5-pdf--whatsapp-integration)
7. [6: Testing & Optimization](#day-6-testing--optimization)
8. [7: Deployment](#day-7-deployment)
9. [Troubleshooting Guide](#troubleshooting-guide)
10. [Maintenance & Updates](#maintenance--updates)

---



### **Step 2: Install Required Tools**

```bash
# Install pnpm (faster than npm)
npm install -g pnpm

# Install Wrangler (Cloudflare CLI)
npm install -g wrangler

# Install VS Code extensions (recommended)
# - ESLint
# - Prettier
# - Tailwind CSS IntelliSense
# - Error Lens
```

### **Step 3: Create Accounts**

```bash
# 1. GitHub Account
https://github.com/signup

# 2. Cloudflare Account
https://dash.cloudflare.com/sign-up

# 3. Supabase Account
https://supabase.com/dashboard

# 4. WhatsApp Business API (optional for now)
https://business.facebook.com/
```

---

## 📅1: Project Setup

### **Morning: Initialize Project**

#### **1. Create Project Structure**

```bash
# Create main directory
mkdir vadivelu-cars
cd vadivelu-cars

# Initialize Git
git init

# Create .gitignore
cat > .gitignore << 'EOF'
node_modules/
dist/
.env
.env.local
*.log
.DS_Store
.wrangler/
EOF
```

#### **2. Create Frontend Project**

```bash
# Create React + Vite project
pnpm create vite frontend --template react-ts

# Navigate to frontend
cd frontend

# Install dependencies
pnpm install

# Install additional packages
pnpm add @supabase/supabase-js
pnpm add zustand react-query
pnpm add react-router-dom
pnpm add @tanstack/react-query
pnpm add date-fns
pnpm add lucide-react

# Install Tailwind CSS
pnpm add -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Install shadcn/ui
pnpm add -D @types/node
npx shadcn-ui@latest init
```

#### **3. Configure Tailwind CSS**

```typescript
// frontend/tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
```

```css
/* frontend/src/index.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 222.2 84% 4.9%;
  }
}
```

#### **4. Create Backend Project**

```bash
# Go back to root
cd ..

# Create workers directory
mkdir workers
cd workers

# Initialize npm project
npm init -y

# Install dependencies
pnpm add hono
pnpm add @supabase/supabase-js
pnpm add -D wrangler typescript @types/node

# Initialize TypeScript
npx tsc --init
```

#### **5. Configure Backend**

```toml
# workers/wrangler.toml
name = "vadivelu-cars-api"
main = "src/index.ts"
compatibility_date = "2024-01-01"
node_compat = true

[build]
command = "npm run build"

[[r2_buckets]]
binding = "R2_BUCKET"
bucket_name = "vadivelu-cars-invoices"
preview_bucket_name = "vadivelu-cars-invoices-preview"
```

```json
// workers/package.json
{
  "name": "vadivelu-cars-api",
  "version": "1.0.0",
  "scripts": {
    "dev": "wrangler dev",
    "deploy": "wrangler deploy",
    "build": "tsc"
  },
  "dependencies": {
    "hono": "^4.0.0",
    "@supabase/supabase-js": "^2.39.0"
  },
  "devDependencies": {
    "@cloudflare/workers-types": "^4.20240620.0",
    "wrangler": "^3.60.0",
    "typescript": "^5.4.0"
  }
}
```

```typescript
// workers/tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ES2020",
    "lib": ["ES2020"],
    "moduleResolution": "node",
    "types": ["@cloudflare/workers-types"],
    "resolveJsonModule": true,
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true,
    "strict": true,
    "skipLibCheck": true,
    "outDir": "./dist"
  },
  "include": ["src/**/*"]
}
```

### **Afternoon: Create Project Structure**

```bash
# Frontend structure
cd ../frontend
mkdir -p src/{components,pages,lib,hooks,stores,types,assets}
mkdir -p src/components/{ui,layout,invoice,customer,reports}

# Backend structure
cd ../workers
mkdir -p src/{controllers,middleware,lib,types}
```

#### **Create Base Files**

```typescript
// workers/src/index.ts
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'

const app = new Hono()

app.use('*', cors())
app.use('*', logger())

app.get('/', (c) => {
  return c.json({ 
    status: 'ok',
    message: 'Vadivelu Cars API v1.0',
    timestamp: new Date().toISOString()
  })
})

export default app
```

```typescript
// frontend/src/App.tsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto py-6 px-4">
            <h1 className="text-3xl font-bold text-gray-900">
              Vadivelu Cars
            </h1>
          </div>
        </header>
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <Routes>
            <Route path="/" element={<div>Home</div>} />
            <Route path="/invoices" element={<div>Invoices</div>} />
            <Route path="/customers" element={<div>Customers</div>} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App
```

### **Evening: Test Setup**

```bash
# Test frontend
cd frontend
pnpm dev
# Open http://localhost:5173

# Test backend (in new terminal)
cd workers
pnpm dev
# Open http://localhost:8787
```

✅ **1 Complete!** You should see both frontend and backend running.

---

## 📅2: Database Setup

### **Morning: Supabase Setup**

#### **1. Create Supabase Project**

```bash
# Go to https://supabase.com/dashboard
# Click "New Project"
# Fill in:
# - Name: vadivelu-cars
# - Database Password: (generate strong password)
# - Region: Mumbai (ap-south-1)
# - Pricing Plan: Free

# Wait 2-3 minutes for provisioning
```

#### **2. Get Connection Details**

```bash
# In Supabase Dashboard:
# Settings → API

# Copy these values:
# - Project URL: https://xxxxx.supabase.co
# - anon/public key: eyJhbGc...
# - service_role key: eyJhbGc... (keep secret!)
```

#### **3. Create .env Files**

```bash
# Frontend .env
cd frontend
cat > .env << 'EOF'
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
VITE_API_URL=http://localhost:8787
EOF

# Backend .env
cd ../workers
cat > .env << 'EOF'
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_KEY=eyJhbGc...
EOF
```

### **Afternoon: Create Database Schema**

#### **1. Run SQL in Supabase**

```bash
# Go to Supabase Dashboard
# SQL Editor → New Query
# Copy and paste this entire schema:
```

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- USERS TABLE
-- =====================================================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone VARCHAR(15) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100),
  role VARCHAR(20) DEFAULT 'staff',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_phone ON users(phone);

-- =====================================================
-- CUSTOMERS TABLE
-- =====================================================
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100),
  phone VARCHAR(15),
  email VARCHAR(100),
  address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_customers_phone ON customers(phone);
CREATE INDEX idx_customers_name ON customers(name);

-- =====================================================
-- VEHICLES TABLE
-- =====================================================
CREATE TABLE vehicles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  vehicle_number VARCHAR(20) UNIQUE NOT NULL,
  make VARCHAR(50),
  model VARCHAR(50),
  year INTEGER,
  current_mileage INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_vehicles_number ON vehicles(vehicle_number);
CREATE INDEX idx_vehicles_customer ON vehicles(customer_id);

-- =====================================================
-- PARTS CATALOG
-- =====================================================
CREATE TABLE parts_catalog (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(200) NOT NULL,
  category VARCHAR(50) NOT NULL,
  default_rate DECIMAL(10, 2) NOT NULL,
  unit VARCHAR(20) DEFAULT 'No',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_parts_name ON parts_catalog(name);
CREATE INDEX idx_parts_category ON parts_catalog(category);

-- Full-text search
CREATE INDEX idx_parts_search ON parts_catalog 
  USING gin(to_tsvector('english', name));

-- =====================================================
-- INVOICES TABLE
-- =====================================================
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_number VARCHAR(20) UNIQUE NOT NULL,
  customer_id UUID REFERENCES customers(id),
  vehicle_id UUID REFERENCES vehicles(id),
  invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,
  mileage INTEGER,
  
  parts_total DECIMAL(10, 2) DEFAULT 0,
  labor_total DECIMAL(10, 2) DEFAULT 0,
  discount_amount DECIMAL(10, 2) DEFAULT 0,
  grand_total DECIMAL(10, 2) NOT NULL,
  
  payment_status VARCHAR(20) DEFAULT 'unpaid',
  payment_method VARCHAR(20),
  paid_amount DECIMAL(10, 2) DEFAULT 0,
  balance_amount DECIMAL(10, 2) DEFAULT 0,
  
  notes TEXT,
  mechanic_name VARCHAR(100),
  pdf_url TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_invoices_number ON invoices(invoice_number);
CREATE INDEX idx_invoices_date ON invoices(invoice_date DESC);
CREATE INDEX idx_invoices_customer ON invoices(customer_id);

-- =====================================================
-- INVOICE ITEMS TABLE
-- =====================================================
CREATE TABLE invoice_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
  part_id UUID REFERENCES parts_catalog(id),
  description VARCHAR(200) NOT NULL,
  category VARCHAR(50),
  quantity DECIMAL(10, 2) NOT NULL DEFAULT 1,
  unit VARCHAR(20) DEFAULT 'No',
  rate DECIMAL(10, 2) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  item_type VARCHAR(10) DEFAULT 'part',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_invoice_items_invoice ON invoice_items(invoice_id);

-- =====================================================
-- AUTO-INCREMENT INVOICE NUMBER
-- =====================================================
CREATE SEQUENCE invoice_number_seq START WITH 2098;

CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.invoice_number IS NULL OR NEW.invoice_number = '' THEN
    NEW.invoice_number := nextval('invoice_number_seq')::text;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_invoice_number 
  BEFORE INSERT ON invoices 
  FOR EACH ROW EXECUTE FUNCTION generate_invoice_number();

-- =====================================================
-- UPDATE TIMESTAMPS
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_customers_timestamp
  BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_vehicles_timestamp
  BEFORE UPDATE ON vehicles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_parts_timestamp
  BEFORE UPDATE ON parts_catalog
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_invoices_timestamp
  BEFORE UPDATE ON invoices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

#### **2. Insert Sample Data**

```sql
-- Insert sample parts
INSERT INTO parts_catalog (name, category, default_rate, unit) VALUES
('Chassis Assy Complete', 'Chassis', 88000, 'No'),
('Body Bush', 'Suspension', 3800, 'Set'),
('Lower Arm', 'Suspension', 3400, 'No'),
('Lower Arm Ball', 'Suspension', 960, 'No'),
('Lower Arm Bush', 'Suspension', 300, 'No'),
('Upper Arm Ball', 'Suspension', 650, 'No'),
('Upper Arm Bush', 'Suspension', 300, 'No'),
('Upper Arm', 'Suspension', 2700, 'No'),
('Shock Absorber', 'Suspension', 1200, 'No'),
('Knuckle Arm', 'Suspension', 2400, 'No'),
('Engine Oil', 'Engine', 2500, 'Ltr'),
('Oil Filter', 'Engine', 800, 'No'),
('Air Filter', 'Engine', 600, 'No'),
('Brake Pad', 'Brakes', 2000, 'Set'),
('Brake Disc', 'Brakes', 3500, 'No'),
('Labor - General', 'Labor', 500, 'Hour'),
('Labor - Denting', 'Labor', 4000, 'Hour'),
('Labor - Painting', 'Labor', 3500, 'Panel');

-- Insert sample customer
INSERT INTO customers (name, phone) VALUES
('Test Customer', '9876543210');

-- Insert sample vehicle
INSERT INTO vehicles (customer_id, vehicle_number, model, current_mileage)
SELECT id, 'KA 55 M 3966', 'Scorpio', 45000
FROM customers WHERE phone = '9876543210';
```

### **Evening: Test Database Connection**

```typescript
// workers/src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

export interface Env {
  SUPABASE_URL: string
  SUPABASE_ANON_KEY: string
}

export function getSupabaseClient(env: Env) {
  return createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY)
}
```

```typescript
// workers/src/index.ts
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { getSupabaseClient } from './lib/supabase'

type Bindings = {
  SUPABASE_URL: string
  SUPABASE_ANON_KEY: string
}

const app = new Hono<{ Bindings: Bindings }>()

app.use('*', cors())

app.get('/', (c) => {
  return c.json({ status: 'ok' })
})

// Test database connection
app.get('/test-db', async (c) => {
  const supabase = getSupabaseClient(c.env)
  
  const { data, error } = await supabase
    .from('parts_catalog')
    .select('*')
    .limit(5)
  
  if (error) {
    return c.json({ error: error.message }, 500)
  }
  
  return c.json({ success: true, data })
})

export default app
```

```bash
# Test the connection
cd workers

# Set secrets
wrangler secret put SUPABASE_URL
# Paste your URL

wrangler secret put SUPABASE_ANON_KEY
# Paste your key

# Run dev server
pnpm dev

# Test in browser
# http://localhost:8787/test-db
# Should return parts data
```

✅ **2 Complete!** Database is ready and connected.

---

## 📅3: Backend Development

### **Morning: Build API Structure**

#### **1. Create Router**

```typescript
// workers/src/router.ts
import { Hono } from 'hono'
import * as invoiceController from './controllers/invoice'
import * as customerController from './controllers/customer'
import * as partsController from './controllers/parts'

const router = new Hono()

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
router.post('/customers', customerController.create)
router.put('/customers/:id', customerController.update)

// Parts
router.get('/parts', partsController.list)
router.get('/parts/search', partsController.search)
router.post('/parts', partsController.create)

export default router
```

#### **2. Create Invoice Controller**

```typescript
// workers/src/controllers/invoice.ts
import { Context } from 'hono'
import { getSupabaseClient } from '../lib/supabase'

export async function list(c: Context) {
  const supabase = getSupabaseClient(c.env)
  
  const page = Number(c.req.query('page')) || 1
  const limit = Number(c.req.query('limit')) || 20
  const offset = (page - 1) * limit
  
  const { data, error, count } = await supabase
    .from('invoices')
    .select(`
      *,
      customer:customers(*),
      vehicle:vehicles(*)
    `, { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)
  
  if (error) {
    return c.json({ error: error.message }, 400)
  }
  
  return c.json({
    success: true,
    data,
    pagination: {
      page,
      limit,
      total: count || 0,
      pages: Math.ceil((count || 0) / limit)
    }
  })
}

export async function get(c: Context) {
  const id = c.req.param('id')
  const supabase = getSupabaseClient(c.env)
  
  const { data, error } = await supabase
    .from('invoices')
    .select(`
      *,
      customer:customers(*),
      vehicle:vehicles(*),
      items:invoice_items(*)
    `)
    .eq('id', id)
    .single()
  
  if (error) {
    return c.json({ error: 'Invoice not found' }, 404)
  }
  
  return c.json({ success: true, data })
}

export async function create(c: Context) {
  const body = await c.req.json()
  const supabase = getSupabaseClient(c.env)
  
  // Create invoice
  const { data: invoice, error: invoiceError } = await supabase
    .from('invoices')
    .insert({
      customer_id: body.customer_id,
      vehicle_id: body.vehicle_id,
      mileage: body.mileage,
      discount_amount: body.discount_amount || 0,
      payment_status: body.payment_status || 'unpaid',
      payment_method: body.payment_method,
      paid_amount: body.paid_amount || 0,
      notes: body.notes,
      mechanic_name: body.mechanic_name
    })
    .select()
    .single()
  
  if (invoiceError) {
    return c.json({ error: invoiceError.message }, 400)
  }
  
  // Create invoice items
  const items = body.items.map((item: any) => ({
    invoice_id: invoice.id,
    part_id: item.part_id,
    description: item.description,
    category: item.category,
    quantity: item.quantity,
    unit: item.unit || 'No',
    rate: item.rate,
    amount: item.quantity * item.rate,
    item_type: item.item_type || 'part'
  }))
  
  const { error: itemsError } = await supabase
    .from('invoice_items')
    .insert(items)
  
  if (itemsError) {
    // Rollback
    await supabase.from('invoices').delete().eq('id', invoice.id)
    return c.json({ error: itemsError.message }, 400)
  }
  
  // Calculate totals
  const partsTotal = items
    .filter((i: any) => i.item_type === 'part')
    .reduce((sum: number, i: any) => sum + i.amount, 0)
  
  const laborTotal = items
    .filter((i: any) => i.item_type === 'labor')
    .reduce((sum: number, i: any) => sum + i.amount, 0)
  
  const grandTotal = partsTotal + laborTotal - (body.discount_amount || 0)
  const balanceAmount = grandTotal - (body.paid_amount || 0)
  
  // Update invoice with totals
  const { data: updatedInvoice } = await supabase
    .from('invoices')
    .update({
      parts_total: partsTotal,
      labor_total: laborTotal,
      grand_total: grandTotal,
      balance_amount: balanceAmount
    })
    .eq('id', invoice.id)
    .select()
    .single()
  
  return c.json({
    success: true,
    data: updatedInvoice,
    message: 'Invoice created successfully'
  })
}

export async function update(c: Context) {
  const id = c.req.param('id')
  const body = await c.req.json()
  const supabase = getSupabaseClient(c.env)
  
  const { data, error } = await supabase
    .from('invoices')
    .update(body)
    .eq('id', id)
    .select()
    .single()
  
  if (error) {
    return c.json({ error: error.message }, 400)
  }
  
  return c.json({ success: true, data })
}

export async function remove(c: Context) {
  const id = c.req.param('id')
  const supabase = getSupabaseClient(c.env)
  
  const { error } = await supabase
    .from('invoices')
    .delete()
    .eq('id', id)
  
  if (error) {
    return c.json({ error: error.message }, 400)
  }
  
  return c.json({ success: true, message: 'Invoice deleted' })
}
```

#### **3. Create Customer Controller**

```typescript
// workers/src/controllers/customer.ts
import { Context } from 'hono'
import { getSupabaseClient } from '../lib/supabase'

export async function list(c: Context) {
  const supabase = getSupabaseClient(c.env)
  
  const { data, error } = await supabase
    .from('customers')
    .select(`
      *,
      vehicles:vehicles(*)
    `)
    .order('created_at', { ascending: false })
    .limit(100)
  
  if (error) {
    return c.json({ error: error.message }, 400)
  }
  
  return c.json({ success: true, data })
}

export async function search(c: Context) {
  const query = c.req.query('q') || ''
  const supabase = getSupabaseClient(c.env)
  
  // Search by phone, name, or vehicle number
  const { data: customers } = await supabase
    .from('customers')
    .select(`
      *,
      vehicles:vehicles(*)
    `)
    .or(`phone.ilike.%${query}%,name.ilike.%${query}%`)
    .limit(10)
  
  const { data: vehicles } = await supabase
    .from('vehicles')
    .select(`
      *,
      customer:customers(*)
    `)
    .ilike('vehicle_number', `%${query}%`)
    .limit(10)
  
  return c.json({
    success: true,
    data: {
      customers: customers || [],
      vehicles: vehicles || []
    }
  })
}

export async function create(c: Context) {
  const body = await c.req.json()
  const supabase = getSupabaseClient(c.env)
  
  // Create customer
  const { data: customer, error: customerError } = await supabase
    .from('customers')
    .insert({
      name: body.name,
      phone: body.phone,
      email: body.email,
      address: body.address
    })
    .select()
    .single()
  
  if (customerError) {
    return c.json({ error: customerError.message }, 400)
  }
  
  // Create vehicle if provided
  if (body.vehicle) {
    const { error: vehicleError } = await supabase
      .from('vehicles')
      .insert({
        customer_id: customer.id,
        vehicle_number: body.vehicle.vehicle_number,
        make: body.vehicle.make,
        model: body.vehicle.model,
        year: body.vehicle.year,
        current_mileage: body.vehicle.current_mileage
      })
    
    if (vehicleError) {
      // Rollback customer
      await supabase.from('customers').delete().eq('id', customer.id)
      return c.json({ error: vehicleError.message }, 400)
    }
  }
  
  return c.json({
    success: true,
    data: customer,
    message: 'Customer created successfully'
  })
}

export async function update(c: Context) {
  const id = c.req.param('id')
  const body = await c.req.json()
  const supabase = getSupabaseClient(c.env)
  
  const { data, error } = await supabase
    .from('customers')
    .update(body)
    .eq('id', id)
    .select()
    .single()
  
  if (error) {
    return c.json({ error: error.message }, 400)
  }
  
  return c.json({ success: true, data })
}
```

#### **4. Create Parts Controller**

```typescript
// workers/src/controllers/parts.ts
import { Context } from 'hono'
import { getSupabaseClient } from '../lib/supabase'

export async function list(c: Context) {
  const supabase = getSupabaseClient(c.env)
  const category = c.req.query('category')
  
  let query = supabase
    .from('parts_catalog')
    .select('*')
    .eq('is_active', true)
    .order('name')
  
  if (category) {
    query = query.eq('category', category)
  }
  
  const { data, error } = await query
  
  if (error) {
    return c.json({ error: error.message }, 400)
  }
  
  return c.json({ success: true, data })
}

export async function search(c: Context) {
  const query = c.req.query('q') || ''
  const supabase = getSupabaseClient(c.env)
  
  const { data, error } = await supabase
    .from('parts_catalog')
    .select('*')
    .eq('is_active', true)
    .or(`name.ilike.%${query}%,category.ilike.%${query}%`)
    .order('name')
    .limit(20)
  
  if (error) {
    return c.json({ error: error.message }, 400)
  }
  
  return c.json({ success: true, data })
}

export async function create(c: Context) {
  const body = await c.req.json()
  const supabase = getSupabaseClient(c.env)
  
  const { data, error } = await supabase
    .from('parts_catalog')
    .insert(body)
    .select()
    .single()
  
  if (error) {
    return c.json({ error: error.message }, 400)
  }
  
  return c.json({ success: true, data })
}
```

### **Afternoon: Update Main Index**

```typescript
// workers/src/index.ts
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import router from './router'

type Bindings = {
  SUPABASE_URL: string
  SUPABASE_ANON_KEY: string
  R2_BUCKET: R2Bucket
}

const app = new Hono<{ Bindings: Bindings }>()

// Middleware
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization']
}))
app.use('*', logger())

// Routes
app.get('/', (c) => {
  return c.json({
    status: 'ok',
    message: 'Vadivelu Cars API v1.0',
    timestamp: new Date().toISOString()
  })
})

app.route('/api', router)

// 404 handler
app.notFound((c) => {
  return c.json({ error: 'Not found' }, 404)
})

// Error handler
app.onError((err, c) => {
  console.error('Error:', err)
  return c.json({ error: 'Internal server error' }, 500)
})

export default app
```

### **Evening: Test API Endpoints**

```bash
# Install HTTPie or use curl
brew install httpie  # macOS
# or
sudo apt install httpie  # Linux

# Test endpoints
# 1. Health check
http GET localhost:8787/api/health

# 2. List parts
http GET localhost:8787/api/parts

# 3. Search parts
http GET localhost:8787/api/parts/search q==chassis

# 4. Create customer
http POST localhost:8787/api/customers \
  name="John Doe" \
  phone="9876543210"

# 5. List invoices
http GET localhost:8787/api/invoices

# 6. Create invoice
http POST localhost:8787/api/invoices \
  customer_id="uuid-from-step-4" \
  vehicle_id="uuid-here" \
  items:='[{"description":"Oil Change","quantity":1,"rate":2500,"item_type":"part"}]'
```

✅ **3 Complete!** Backend API is functional.

---

## 📅  4: Frontend Development

### **Morning: Setup React App Structure**

#### **1. Create Type Definitions**

```typescript
// frontend/src/types/index.ts

export interface Customer {
  id: string
  name: string
  phone: string
  email?: string
  address?: string
  created_at: string
  updated_at: string
}

export interface Vehicle {
  id: string
  customer_id: string
  vehicle_number: string
  make?: string
  model?: string
  year?: number
  current_mileage?: number
  created_at: string
  updated_at: string
}

export interface Part {
  id: string
  name: string
  category: string
  default_rate: number
  unit: string
  is_active: boolean
}

export interface InvoiceItem {
  id?: string
  invoice_id?: string
  part_id?: string
  description: string
  category?: string
  quantity: number
  unit: string
  rate: number
  amount: number
  item_type: 'part' | 'labor'
}

export interface Invoice {
  id: string
  invoice_number: string
  customer_id: string
  vehicle_id: string
  invoice_date: string
  mileage?: number
  parts_total: number
  labor_total: number
  discount_amount: number
  grand_total: number
  payment_status: 'paid' | 'unpaid' | 'partial'
  payment_method?: string
  paid_amount: number
  balance_amount: number
  notes?: string
  mechanic_name?: string
  pdf_url?: string
  created_at: string
  updated_at: string
  customer?: Customer
  vehicle?: Vehicle
  items?: InvoiceItem[]
}

export interface CreateInvoiceData {
  customer_id: string
  vehicle_id: string
  mileage?: number
  items: InvoiceItem[]
  discount_amount?: number
  payment_status?: 'paid' | 'unpaid' | 'partial'
  payment_method?: string
  paid_amount?: number
  notes?: string
  mechanic_name?: string
}
```

#### **2. Create API Client**

```typescript
// frontend/src/lib/api.ts

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
  async getCustomers() {
    return this.request<any>('/api/customers')
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

  // Parts
  async getParts(category?: string) {
    const url = category 
      ? `/api/parts?category=${encodeURIComponent(category)}`
      : '/api/parts'
    return this.request<any>(url)
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
}

export const api = new ApiClient(API_URL)
```

#### **3. Setup React Query**

```typescript
// frontend/src/lib/query-client.ts

import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
})
```

```tsx
// frontend/src/main.tsx

import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from './lib/query-client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>,
)
```

#### **4. Create Custom Hooks**

```typescript
// frontend/src/hooks/useInvoices.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import type { CreateInvoiceData } from '../types'

export function useInvoices(page = 1) {
  return useQuery({
    queryKey: ['invoices', page],
    queryFn: () => api.getInvoices(page),
  })
}

export function useInvoice(id: string) {
  return useQuery({
    queryKey: ['invoices', id],
    queryFn: () => api.getInvoice(id),
    enabled: !!id,
  })
}

export function useCreateInvoice() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateInvoiceData) => api.createInvoice(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
    },
  })
}

export function useDeleteInvoice() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => api.deleteInvoice(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
    },
  })
}
```

```typescript
// frontend/src/hooks/useCustomers.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'

export function useCustomers() {
  return useQuery({
    queryKey: ['customers'],
    queryFn: () => api.getCustomers(),
  })
}

export function useSearchCustomers(query: string) {
  return useQuery({
    queryKey: ['customers', 'search', query],
    queryFn: () => api.searchCustomers(query),
    enabled: query.length > 0,
  })
}

export function useCreateCustomer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: any) => api.createCustomer(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] })
    },
  })
}
```

```typescript
// frontend/src/hooks/useParts.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'

export function useParts(category?: string) {
  return useQuery({
    queryKey: ['parts', category],
    queryFn: () => api.getParts(category),
  })
}

export function useSearchParts(query: string) {
  return useQuery({
    queryKey: ['parts', 'search', query],
    queryFn: () => api.searchParts(query),
    enabled: query.length > 1,
  })
}

export function useCreatePart() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: any) => api.createPart(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parts'] })
    },
  })
}
```

### **Afternoon: Build UI Components**

#### **1. Install shadcn/ui Components**

```bash
cd frontend

# Install required components
npx shadcn-ui@latest add button
npx shadcn-ui@latest add input
npx shadcn-ui@latest add label
npx shadcn-ui@latest add card
npx shadcn-ui@latest add select
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add table
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add toast
npx shadcn-ui@latest add command
```

#### **2. Create Layout Component**

```tsx
// frontend/src/components/layout/Layout.tsx

import { Link, useLocation } from 'react-router-dom'
import { Home, FileText, Users, Package, BarChart3 } from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Invoices', href: '/invoices', icon: FileText },
  { name: 'Customers', href: '/customers', icon: Users },
  { name: 'Parts', href: '/parts', icon: Package },
  { name: 'Reports', href: '/reports', icon: BarChart3 },
]

export function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <span className="text-2xl"></span>
              <h1 className="ml-2 text-xl font-bold text-gray-900">
                Vadivelu Cars
              </h1>
            </div>
            <nav className="hidden md:flex space-x-4">
              {navigation.map((item) => {
                const Icon = item.icon
                const isActive = location.pathname === item.href
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                      isActive
                        ? 'bg-gray-100 text-gray-900'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {item.name}
                  </Link>
                )
              })}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Mobile Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
        <div className="grid grid-cols-5 gap-1">
          {navigation.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.href
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex flex-col items-center justify-center py-3 ${
                  isActive ? 'text-blue-600' : 'text-gray-600'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs mt-1">{item.name}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
```

#### **3. Create Dashboard Page**

```tsx
// frontend/src/pages/Dashboard.tsx

import { useInvoices } from '../hooks/useInvoices'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { useNavigate } from 'react-router-dom'
import { Plus, TrendingUp, FileText, Users } from 'lucide-react'
import { format } from 'date-fns'

export function Dashboard() {
  const navigate = useNavigate()
  const { data, isLoading } = useInvoices(1)

  if (isLoading) {
    return <div>Loading...</div>
  }

  const invoices = data?.data || []
  
  // Calculate stats
  const today = new Date().toISOString().split('T')[0]
  const todayInvoices = invoices.filter((inv: any) => 
    inv.invoice_date === today
  )
  const todayRevenue = todayInvoices.reduce((sum: number, inv: any) => 
    sum + Number(inv.grand_total), 0
  )
  const pendingAmount = invoices
    .filter((inv: any) => inv.payment_status !== 'paid')
    .reduce((sum: number, inv: any) => sum + Number(inv.balance_amount), 0)

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            {format(new Date(), 'EEEE, MMMM d, yyyy')}
          </p>
        </div>
        <Button
          size="lg"
          onClick={() => navigate('/invoices/new')}
          className="flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          New Invoice
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Today's Revenue
            </CardTitle>
            <TrendingUp className="w-4 h-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">₹{todayRevenue.toLocaleString('en-IN')}</div>
            <p className="text-sm text-gray-600 mt-1">
              {todayInvoices.length} invoices
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Pending Payments
            </CardTitle>
            <FileText className="w-4 h-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">₹{pendingAmount.toLocaleString('en-IN')}</div>
            <p className="text-sm text-gray-600 mt-1">
              {invoices.filter((inv: any) => inv.payment_status !== 'paid').length} invoices
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Customers
            </CardTitle>
            <Users className="w-4 h-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {new Set(invoices.map((inv: any) => inv.customer_id)).size}
            </div>
            <p className="text-sm text-gray-600 mt-1">Active customers</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Invoices */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {invoices.slice(0, 5).map((invoice: any) => (
              <div
                key={invoice.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                onClick={() => navigate(`/invoices/${invoice.id}`)}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <span className="font-semibold">#{invoice.invoice_number}</span>
                    <span className="text-gray-600">
                      {invoice.vehicle?.vehicle_number || 'N/A'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {invoice.customer?.name || 'Unknown Customer'}
                  </p>
                </div>
                <div className="text-right">
                  <div className="font-semibold">
                    ₹{Number(invoice.grand_total).toLocaleString('en-IN')}
                  </div>
                  <div className="text-sm">
                    {invoice.payment_status === 'paid' ? (
                      <span className="text-green-600">Paid</span>
                    ) : invoice.payment_status === 'partial' ? (
                      <span className="text-orange-600">Partial</span>
                    ) : (
                      <span className="text-red-600">Unpaid</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
```

#### **4. Create Invoices List Page**

```tsx
// frontend/src/pages/Invoices.tsx

import { useState } from 'react'
import { useInvoices, useDeleteInvoice } from '../hooks/useInvoices'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Plus, Eye, Trash2, Download } from 'lucide-react'
import { format } from 'date-fns'

export function Invoices() {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const { data, isLoading } = useInvoices(page)
  const deleteInvoice = useDeleteInvoice()

  if (isLoading) {
    return <div>Loading...</div>
  }

  const invoices = data?.data || []
  const pagination = data?.pagination

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this invoice?')) {
      await deleteInvoice.mutateAsync(id)
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Invoices</h1>
        <Button onClick={() => navigate('/invoices/new')}>
          <Plus className="w-4 h-4 mr-2" />
          New Invoice
        </Button>
      </div>

      {/* Invoices List */}
      <Card>
        <CardHeader>
          <CardTitle>All Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Invoice #</th>
                  <th className="text-left py-3 px-4">Date</th>
                  <th className="text-left py-3 px-4">Customer</th>
                  <th className="text-left py-3 px-4">Vehicle</th>
                  <th className="text-right py-3 px-4">Amount</th>
                  <th className="text-center py-3 px-4">Status</th>
                  <th className="text-right py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice: any) => (
                  <tr key={invoice.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">
                      #{invoice.invoice_number}
                    </td>
                    <td className="py-3 px-4">
                      {format(new Date(invoice.invoice_date), 'dd MMM yyyy')}
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-medium">
                          {invoice.customer?.name || 'Unknown'}
                        </div>
                        <div className="text-sm text-gray-600">
                          {invoice.customer?.phone}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {invoice.vehicle?.vehicle_number || 'N/A'}
                    </td>
                    <td className="py-3 px-4 text-right font-semibold">
                      ₹{Number(invoice.grand_total).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Badge
                        variant={
                          invoice.payment_status === 'paid'
                            ? 'default'
                            : invoice.payment_status === 'partial'
                            ? 'secondary'
                            : 'destructive'
                        }
                      >
                        {invoice.payment_status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/invoices/${invoice.id}`)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(invoice.id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination && pagination.pages > 1 && (
            <div className="flex justify-between items-center mt-4">
              <div className="text-sm text-gray-600">
                Page {pagination.page} of {pagination.pages}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === pagination.pages}
                  onClick={() => setPage(page + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
```

### **Evening: Create Invoice Form (Part 1)**

```tsx
// frontend/src/pages/NewInvoice.tsx

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCreateInvoice } from '../hooks/useInvoices'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { CustomerSearch } from '../components/invoice/CustomerSearch'
import { PartsSearch } from '../components/invoice/PartsSearch'
import { InvoiceItemsList } from '../components/invoice/InvoiceItemsList'
import type { InvoiceItem, Customer, Vehicle } from '../types'

export function NewInvoice() {
  const navigate = useNavigate()
  const createInvoice = useCreateInvoice()

  const [customer, setCustomer] = useState<Customer | null>(null)
  const [vehicle, setVehicle] = useState<Vehicle | null>(null)
  const [mileage, setMileage] = useState('')
  const [items, setItems] = useState<InvoiceItem[]>([])
  const [discountAmount, setDiscountAmount] = useState(0)
  const [paymentStatus, setPaymentStatus] = useState<'paid' | 'unpaid'>('unpaid')
  const [paymentMethod, setPaymentMethod] = useState('')
  const [paidAmount, setPaidAmount] = useState(0)
  const [mechanicName, setMechanicName] = useState('')
  const [notes, setNotes] = useState('')

  const addItem = (item: InvoiceItem) => {
    setItems([...items, { ...item, id: Date.now().toString() }])
  }

  const updateItem = (id: string, updates: Partial<InvoiceItem>) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, ...updates, amount: (updates.quantity || item.quantity) * (updates.rate || item.rate) } : item
    ))
  }

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id))
  }

  const calculateTotals = () => {
    const partsTotal = items
      .filter(i => i.item_type === 'part')
      .reduce((sum, i) => sum + i.amount, 0)
    
    const laborTotal = items
      .filter(i => i.item_type === 'labor')
      .reduce((sum, i) => sum + i.amount, 0)
    
    const subtotal = partsTotal + laborTotal
    const grandTotal = subtotal - discountAmount

    return { partsTotal, laborTotal, subtotal, grandTotal }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!customer || !vehicle) {
      alert('Please select customer and vehicle')
      return
    }

    if (items.length === 0) {
      alert('Please add at least one item')
      return
    }

    const { grandTotal } = calculateTotals()

    try {
      await createInvoice.mutateAsync({
        customer_id: customer.id,
        vehicle_id: vehicle.id,
        mileage: mileage ? parseInt(mileage) : undefined,
        items: items.map(({ id, ...item }) => item),
        discount_amount: discountAmount,
        payment_status: paymentStatus,
        payment_method: paymentMethod || undefined,
        paid_amount: paidAmount,
        notes: notes || undefined,
        mechanic_name: mechanicName || undefined,
      })

      alert('Invoice created successfully!')
      navigate('/invoices')
    } catch (error) {
      alert('Failed to create invoice')
      console.error(error)
    }
  }

  const totals = calculateTotals()

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">New Invoice</h1>
        <p className="text-gray-600 mt-1">Create a new invoice for a customer</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Customer & Vehicle Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <CustomerSearch
              onSelect={(c, v) => {
                setCustomer(c)
                setVehicle(v)
              }}
            />

            {customer && vehicle && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm font-medium text-gray-600">Customer</div>
                    <div className="font-semibold">{customer.name}</div>
                    <div className="text-sm text-gray-600">{customer.phone}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-600">Vehicle</div>
                    <div className="font-semibold">{vehicle.vehicle_number}</div>
                    <div className="text-sm text-gray-600">{vehicle.model}</div>
                  </div>
                </div>
              </div>
            )}

            <div>
              <Label htmlFor="mileage">Current Mileage (KM)</Label>
              <Input
                id="mileage"
                type="number"
                value={mileage}
                onChange={(e) => setMileage(e.target.value)}
                placeholder="45000"
              />
            </div>
          </CardContent>
        </Card>

        {/* Items */}
        <Card>
          <CardHeader>
            <CardTitle>Items & Services</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <PartsSearch onSelect={addItem} />
            <InvoiceItemsList
              items={items}
              onUpdate={updateItem}
              onRemove={removeItem}
            />
          </CardContent>
        </Card>

        {/* Totals & Payment */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Totals */}
            <div className="space-y-2 p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between">
                <span className="text-gray-600">Parts Total:</span>
                <span className="font-semibold">₹{totals.partsTotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Labor Total:</span>
                <span className="font-semibold">₹{totals.laborTotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-semibold">₹{totals.subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Discount:</span>
                <Input
                  type="number"
                  value={discountAmount}
                  onChange={(e) => setDiscountAmount(Number(e.target.value))}
                  className="w-32 text-right"
                  placeholder="0"
                />
              </div>
              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span>Grand Total:</span>
                <span>₹{totals.grandTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Payment Status */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Payment Status</Label>
                <select
                  className="w-full mt-1 rounded-md border border-gray-300 px-3 py-2"
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(e.target.value as any)}
                >
                  <option value="unpaid">Unpaid</option>
                  <option value="paid">Paid</option>
                  <option value="partial">Partial</option>
                </select>
              </div>

              {paymentStatus !== 'unpaid' && (
                <div>
                  <Label>Payment Method</Label>
                  <select
                    className="w-full mt-1 rounded-md border border-gray-300 px-3 py-2"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  >
                    <option value="">Select method</option>
                    <option value="cash">Cash</option>
                    <option value="upi">UPI</option>
                    <option value="card">Card</option>
                    <option value="bank_transfer">Bank Transfer</option>
                  </select>
                </div>
              )}
            </div>

            {paymentStatus !== 'unpaid' && (
              <div>
                <Label>Paid Amount</Label>
                <Input
                  type="number"
                  value={paidAmount}
                  onChange={(e) => setPaidAmount(Number(e.target.value))}
                  placeholder="0"
                />
              </div>
            )}

            <div>
              <Label>Mechanic Name</Label>
              <Input
                value={mechanicName}
                onChange={(e) => setMechanicName(e.target.value)}
                placeholder="Enter mechanic name"
              />
            </div>

            <div>
              <Label>Notes</Label>
              <textarea
                className="w-full mt-1 rounded-md border border-gray-300 px-3 py-2"
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Additional notes..."
              />
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/invoices')}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={createInvoice.isPending}>
            {createInvoice.isPending ? 'Creating...' : 'Create Invoice'}
          </Button>
        </div>
      </form>
    </div>
  )
}
```

# 🚀 COMPLETE DEVELOPMENT GUIDE (CONTINUED)

---

## 📅 4: Frontend Development (Continued)

### **Afternoon: Build Invoice Components**

#### **5. Create Customer Search Component**

```tsx
// frontend/src/components/invoice/CustomerSearch.tsx

import { useState } from 'react'
import { useSearchCustomers } from '../../hooks/useCustomers'
import { useCreateCustomer } from '../../hooks/useCustomers'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog'
import { Label } from '../ui/label'
import { Search, Plus, User, Car } from 'lucide-react'
import type { Customer, Vehicle } from '../../types'

interface CustomerSearchProps {
  onSelect: (customer: Customer, vehicle: Vehicle) => void
}

export function CustomerSearch({ onSelect }: CustomerSearchProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [showNewCustomerDialog, setShowNewCustomerDialog] = useState(false)
  const { data: searchResults, isLoading } = useSearchCustomers(searchQuery)
  const createCustomer = useCreateCustomer()

  // New customer form state
  const [newCustomerData, setNewCustomerData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    vehicle: {
      vehicle_number: '',
      make: '',
      model: '',
      year: new Date().getFullYear(),
      current_mileage: 0
    }
  })

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const result = await createCustomer.mutateAsync(newCustomerData)
      
      if (result.success) {
        // Get the created customer and vehicle
        const customer = result.data
        // Fetch vehicle (in real scenario, backend returns it)
        const vehicle = newCustomerData.vehicle
        
        onSelect(customer, vehicle as any)
        setShowNewCustomerDialog(false)
        setSearchQuery('')
      }
    } catch (error) {
      alert('Failed to create customer')
    }
  }

  const handleSelectCustomer = (customer: any) => {
    // Customer should have vehicles array from API
    const vehicle = customer.vehicles?.[0]
    if (vehicle) {
      onSelect(customer, vehicle)
      setSearchQuery('')
    } else {
      alert('Customer has no vehicles registered')
    }
  }

  const handleSelectVehicle = (vehicle: any) => {
    // Vehicle should have customer from API
    if (vehicle.customer) {
      onSelect(vehicle.customer, vehicle)
      setSearchQuery('')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search by vehicle number, phone, or name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Dialog open={showNewCustomerDialog} onOpenChange={setShowNewCustomerDialog}>
          <DialogTrigger asChild>
            <Button variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              New Customer
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Customer</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateCustomer} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Customer Name *</Label>
                  <Input
                    id="name"
                    required
                    value={newCustomerData.name}
                    onChange={(e) => setNewCustomerData({
                      ...newCustomerData,
                      name: e.target.value
                    })}
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    required
                    value={newCustomerData.phone}
                    onChange={(e) => setNewCustomerData({
                      ...newCustomerData,
                      phone: e.target.value
                    })}
                    placeholder="9876543210"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newCustomerData.email}
                    onChange={(e) => setNewCustomerData({
                      ...newCustomerData,
                      email: e.target.value
                    })}
                    placeholder="john@example.com"
                  />
                </div>
                <div>
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={newCustomerData.address}
                    onChange={(e) => setNewCustomerData({
                      ...newCustomerData,
                      address: e.target.value
                    })}
                    placeholder="123 Main St"
                  />
                </div>
              </div>

              <div className="border-t pt-4 mt-4">
                <h3 className="font-semibold mb-4">Vehicle Details</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="vehicle_number">Vehicle Number *</Label>
                    <Input
                      id="vehicle_number"
                      required
                      value={newCustomerData.vehicle.vehicle_number}
                      onChange={(e) => setNewCustomerData({
                        ...newCustomerData,
                        vehicle: {
                          ...newCustomerData.vehicle,
                          vehicle_number: e.target.value.toUpperCase()
                        }
                      })}
                      placeholder="KA 55 M 3966"
                    />
                  </div>
                  <div>
                    <Label htmlFor="model">Model *</Label>
                    <Input
                      id="model"
                      required
                      value={newCustomerData.vehicle.model}
                      onChange={(e) => setNewCustomerData({
                        ...newCustomerData,
                        vehicle: {
                          ...newCustomerData.vehicle,
                          model: e.target.value
                        }
                      })}
                      placeholder="Scorpio"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <Label htmlFor="make">Make</Label>
                    <Input
                      id="make"
                      value={newCustomerData.vehicle.make}
                      onChange={(e) => setNewCustomerData({
                        ...newCustomerData,
                        vehicle: {
                          ...newCustomerData.vehicle,
                          make: e.target.value
                        }
                      })}
                      placeholder="Mahindra"
                    />
                  </div>
                  <div>
                    <Label htmlFor="year">Year</Label>
                    <Input
                      id="year"
                      type="number"
                      value={newCustomerData.vehicle.year}
                      onChange={(e) => setNewCustomerData({
                        ...newCustomerData,
                        vehicle: {
                          ...newCustomerData.vehicle,
                          year: parseInt(e.target.value)
                        }
                      })}
                      placeholder="2020"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowNewCustomerDialog(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={createCustomer.isPending}>
                  {createCustomer.isPending ? 'Creating...' : 'Create Customer'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search Results */}
      {searchQuery && (
        <div className="border rounded-lg p-4 max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">Searching...</div>
          ) : (
            <>
              {/* Customers */}
              {searchResults?.data?.customers?.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-gray-600 mb-2">Customers</h3>
                  <div className="space-y-2">
                    {searchResults.data.customers.map((customer: any) => (
                      <div
                        key={customer.id}
                        className="flex items-center justify-between p-3 border rounded hover:bg-gray-50 cursor-pointer"
                        onClick={() => handleSelectCustomer(customer)}
                      >
                        <div className="flex items-center gap-3">
                          <User className="w-5 h-5 text-gray-400" />
                          <div>
                            <div className="font-medium">{customer.name}</div>
                            <div className="text-sm text-gray-600">{customer.phone}</div>
                          </div>
                        </div>
                        {customer.vehicles?.length > 0 && (
                          <div className="text-sm text-gray-600">
                            {customer.vehicles.length} vehicle(s)
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Vehicles */}
              {searchResults?.data?.vehicles?.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-600 mb-2">Vehicles</h3>
                  <div className="space-y-2">
                    {searchResults.data.vehicles.map((vehicle: any) => (
                      <div
                        key={vehicle.id}
                        className="flex items-center justify-between p-3 border rounded hover:bg-gray-50 cursor-pointer"
                        onClick={() => handleSelectVehicle(vehicle)}
                      >
                        <div className="flex items-center gap-3">
                          <Car className="w-5 h-5 text-gray-400" />
                          <div>
                            <div className="font-medium">{vehicle.vehicle_number}</div>
                            <div className="text-sm text-gray-600">
                              {vehicle.model} - {vehicle.customer?.name}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* No Results */}
              {!searchResults?.data?.customers?.length && 
               !searchResults?.data?.vehicles?.length && (
                <div className="text-center py-8 text-gray-500">
                  No results found. Try creating a new customer.
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
```

#### **6. Create Parts Search Component**

```tsx
// frontend/src/components/invoice/PartsSearch.tsx

import { useState } from 'react'
import { useSearchParts } from '../../hooks/useParts'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'
import { Label } from '../ui/label'
import { Search, Package } from 'lucide-react'
import type { InvoiceItem } from '../../types'

interface PartsSearchProps {
  onSelect: (item: InvoiceItem) => void
}

export function PartsSearch({ onSelect }: PartsSearchProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [showCustomItemDialog, setShowCustomItemDialog] = useState(false)
  const { data: searchResults, isLoading } = useSearchParts(searchQuery)

  // Custom item state
  const [customItem, setCustomItem] = useState<InvoiceItem>({
    description: '',
    category: 'Other',
    quantity: 1,
    unit: 'No',
    rate: 0,
    amount: 0,
    item_type: 'part'
  })

  const handleSelectPart = (part: any) => {
    const item: InvoiceItem = {
      part_id: part.id,
      description: part.name,
      category: part.category,
      quantity: 1,
      unit: part.unit,
      rate: part.default_rate,
      amount: part.default_rate,
      item_type: part.category === 'Labor' ? 'labor' : 'part'
    }
    onSelect(item)
    setSearchQuery('')
  }

  const handleAddCustomItem = () => {
    if (!customItem.description || customItem.rate <= 0) {
      alert('Please fill all required fields')
      return
    }

    const item: InvoiceItem = {
      ...customItem,
      amount: customItem.quantity * customItem.rate
    }
    onSelect(item)
    setShowCustomItemDialog(false)
    
    // Reset form
    setCustomItem({
      description: '',
      category: 'Other',
      quantity: 1,
      unit: 'No',
      rate: 0,
      amount: 0,
      item_type: 'part'
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search parts or services..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Button
          type="button"
          variant="outline"
          onClick={() => setShowCustomItemDialog(true)}
        >
          <Package className="w-4 h-4 mr-2" />
          Custom Item
        </Button>
      </div>

      {/* Search Results */}
      {searchQuery && (
        <div className="border rounded-lg p-4 max-h-80 overflow-y-auto">
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">Searching...</div>
          ) : (
            <>
              {searchResults?.data?.length > 0 ? (
                <div className="space-y-2">
                  {searchResults.data.map((part: any) => (
                    <div
                      key={part.id}
                      className="flex items-center justify-between p-3 border rounded hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleSelectPart(part)}
                    >
                      <div className="flex-1">
                        <div className="font-medium">{part.name}</div>
                        <div className="text-sm text-gray-600">
                          {part.category} - {part.unit}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">
                          ₹{part.default_rate.toLocaleString('en-IN')}
                        </div>
                        <div className="text-sm text-gray-600">per {part.unit}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No parts found. Try adding a custom item.
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Custom Item Dialog */}
      <Dialog open={showCustomItemDialog} onOpenChange={setShowCustomItemDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Custom Item</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="description">Description *</Label>
              <Input
                id="description"
                value={customItem.description}
                onChange={(e) => setCustomItem({
                  ...customItem,
                  description: e.target.value
                })}
                placeholder="e.g., Custom Fabrication Work"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="item_type">Type</Label>
                <select
                  id="item_type"
                  className="w-full mt-1 rounded-md border border-gray-300 px-3 py-2"
                  value={customItem.item_type}
                  onChange={(e) => setCustomItem({
                    ...customItem,
                    item_type: e.target.value as 'part' | 'labor'
                  })}
                >
                  <option value="part">Part</option>
                  <option value="labor">Labor</option>
                </select>
              </div>

              <div>
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={customItem.category}
                  onChange={(e) => setCustomItem({
                    ...customItem,
                    category: e.target.value
                  })}
                  placeholder="Other"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="quantity">Quantity *</Label>
                <Input
                  id="quantity"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={customItem.quantity}
                  onChange={(e) => setCustomItem({
                    ...customItem,
                    quantity: parseFloat(e.target.value) || 0
                  })}
                />
              </div>

              <div>
                <Label htmlFor="unit">Unit</Label>
                <Input
                  id="unit"
                  value={customItem.unit}
                  onChange={(e) => setCustomItem({
                    ...customItem,
                    unit: e.target.value
                  })}
                  placeholder="No"
                />
              </div>

              <div>
                <Label htmlFor="rate">Rate (₹) *</Label>
                <Input
                  id="rate"
                  type="number"
                  step="0.01"
                  min="0"
                  value={customItem.rate}
                  onChange={(e) => setCustomItem({
                    ...customItem,
                    rate: parseFloat(e.target.value) || 0
                  })}
                />
              </div>
            </div>

            <div className="p-3 bg-gray-50 rounded">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Amount:</span>
                <span className="text-lg font-bold">
                  ₹{(customItem.quantity * customItem.rate).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCustomItemDialog(false)}
              >
                Cancel
              </Button>
              <Button type="button" onClick={handleAddCustomItem}>
                Add Item
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
```

#### **7. Create Invoice Items List Component**

```tsx
// frontend/src/components/invoice/InvoiceItemsList.tsx

import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Trash2, Edit2 } from 'lucide-react'
import type { InvoiceItem } from '../../types'

interface InvoiceItemsListProps {
  items: InvoiceItem[]
  onUpdate: (id: string, updates: Partial<InvoiceItem>) => void
  onRemove: (id: string) => void
}

export function InvoiceItemsList({ items, onUpdate, onRemove }: InvoiceItemsListProps) {
  if (items.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 border-2 border-dashed rounded-lg">
        <Package className="w-12 h-12 mx-auto mb-2 text-gray-400" />
        <p>No items added yet</p>
        <p className="text-sm">Search and add parts or services above</p>
      </div>
    )
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="text-left py-3 px-4 font-medium text-gray-700">#</th>
            <th className="text-left py-3 px-4 font-medium text-gray-700">Description</th>
            <th className="text-center py-3 px-4 font-medium text-gray-700">Type</th>
            <th className="text-center py-3 px-4 font-medium text-gray-700">Qty</th>
            <th className="text-right py-3 px-4 font-medium text-gray-700">Rate</th>
            <th className="text-right py-3 px-4 font-medium text-gray-700">Amount</th>
            <th className="text-center py-3 px-4 font-medium text-gray-700">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {items.map((item, index) => (
            <tr key={item.id} className="hover:bg-gray-50">
              <td className="py-3 px-4">{index + 1}</td>
              <td className="py-3 px-4">
                <div className="font-medium">{item.description}</div>
                <div className="text-sm text-gray-600">{item.category}</div>
              </td>
              <td className="py-3 px-4 text-center">
                <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                  item.item_type === 'labor' 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-green-100 text-green-800'
                }`}>
                  {item.item_type}
                </span>
              </td>
              <td className="py-3 px-4">
                <Input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={item.quantity}
                  onChange={(e) => onUpdate(item.id!, {
                    quantity: parseFloat(e.target.value) || 1
                  })}
                  className="w-20 text-center"
                />
              </td>
              <td className="py-3 px-4">
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={item.rate}
                  onChange={(e) => onUpdate(item.id!, {
                    rate: parseFloat(e.target.value) || 0
                  })}
                  className="w-28 text-right"
                />
              </td>
              <td className="py-3 px-4 text-right font-semibold">
                ₹{item.amount.toLocaleString('en-IN')}
              </td>
              <td className="py-3 px-4 text-center">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemove(item.id!)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function Package({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
      />
    </svg>
  )
}
```

### **Evening: Update App Routes**

```tsx
// frontend/src/App.tsx

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Layout } from './components/layout/Layout'
import { Dashboard } from './pages/Dashboard'
import { Invoices } from './pages/Invoices'
import { NewInvoice } from './pages/NewInvoice'
import { InvoiceDetail } from './pages/InvoiceDetail'
import { Customers } from './pages/Customers'
import { Parts } from './pages/Parts'
import { Reports } from './pages/Reports'

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/invoices" element={<Invoices />} />
          <Route path="/invoices/new" element={<NewInvoice />} />
          <Route path="/invoices/:id" element={<InvoiceDetail />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/parts" element={<Parts />} />
          <Route path="/reports" element={<Reports />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App
```

#### **8. Create Invoice Detail Page**

```tsx
// frontend/src/pages/InvoiceDetail.tsx

import { useParams, useNavigate } from 'react-router-dom'
import { useInvoice, useDeleteInvoice } from '../hooks/useInvoices'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { ArrowLeft, Download, Trash2, Edit, Share2 } from 'lucide-react'
import { format } from 'date-fns'

export function InvoiceDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data, isLoading } = useInvoice(id!)
  const deleteInvoice = useDeleteInvoice()

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!data?.success) {
    return <div>Invoice not found</div>
  }

  const invoice = data.data

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this invoice?')) {
      await deleteInvoice.mutateAsync(id!)
      navigate('/invoices')
    }
  }

  const handleShare = () => {
    // Will implement WhatsApp sharing in 5
    alert('Share functionality will be implemented tomorrow!')
  }

  const handleDownload = () => {
    // Will implement PDF download in 5
    alert('PDF download will be implemented tomorrow!')
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/invoices')}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Invoices
        </Button>
        
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">Invoice #{invoice.invoice_number}</h1>
            <p className="text-gray-600 mt-1">
              {format(new Date(invoice.invoice_date), 'MMMM d, yyyy')}
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleDownload}>
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
            <Button variant="outline" onClick={handleShare}>
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
            <Button variant="outline" onClick={() => navigate(`/invoices/${id}/edit`)}>
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Customer & Vehicle Info */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Customer & Vehicle Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Customer</h3>
              <div className="space-y-1">
                <p className="font-medium">{invoice.customer?.name || 'N/A'}</p>
                <p className="text-sm text-gray-600">{invoice.customer?.phone || 'N/A'}</p>
                {invoice.customer?.email && (
                  <p className="text-sm text-gray-600">{invoice.customer.email}</p>
                )}
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Vehicle</h3>
              <div className="space-y-1">
                <p className="font-medium">{invoice.vehicle?.vehicle_number || 'N/A'}</p>
                <p className="text-sm text-gray-600">{invoice.vehicle?.model || 'N/A'}</p>
                {invoice.mileage && (
                  <p className="text-sm text-gray-600">Mileage: {invoice.mileage} KM</p>
                )}
              </div>
            </div>
          </div>

          {invoice.mechanic_name && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm text-gray-600">
                Mechanic: <span className="font-medium text-gray-900">{invoice.mechanic_name}</span>
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Items */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Items & Services</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-4">#</th>
                  <th className="text-left py-3 px-4">Description</th>
                  <th className="text-center py-3 px-4">Type</th>
                  <th className="text-center py-3 px-4">Qty</th>
                  <th className="text-right py-3 px-4">Rate</th>
                  <th className="text-right py-3 px-4">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {invoice.items?.map((item: any, index: number) => (
                  <tr key={item.id}>
                    <td className="py-3 px-4">{index + 1}</td>
                    <td className="py-3 px-4">
                      <div className="font-medium">{item.description}</div>
                      {item.category && (
                        <div className="text-sm text-gray-600">{item.category}</div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Badge variant={item.item_type === 'labor' ? 'default' : 'secondary'}>
                        {item.item_type}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {item.quantity} {item.unit}
                    </td>
                    <td className="py-3 px-4 text-right">
                      ₹{Number(item.rate).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4 text-right font-semibold">
                      ₹{Number(item.amount).toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Totals & Payment */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between text-gray-600">
              <span>Parts Total:</span>
              <span className="font-medium">₹{Number(invoice.parts_total).toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Labor Total:</span>
              <span className="font-medium">₹{Number(invoice.labor_total).toLocaleString('en-IN')}</span>
            </div>
            {invoice.discount_amount > 0 && (
              <div className="flex justify-between text-red-600">
                <span>Discount:</span>
                <span className="font-medium">- ₹{Number(invoice.discount_amount).toLocaleString('en-IN')}</span>
              </div>
            )}
            <div className="flex justify-between text-xl font-bold border-t pt-3">
              <span>Grand Total:</span>
              <span>₹{Number(invoice.grand_total).toLocaleString('en-IN')}</span>
            </div>

            <div className="border-t pt-4 mt-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Payment Status:</span>
                <Badge
                  variant={
                    invoice.payment_status === 'paid'
                      ? 'default'
                      : invoice.payment_status === 'partial'
                      ? 'secondary'
                      : 'destructive'
                  }
                  className="text-sm"
                >
                  {invoice.payment_status.toUpperCase()}
                </Badge>
              </div>

              {invoice.payment_method && (
                <div className="flex justify-between text-gray-600">
                  <span>Payment Method:</span>
                  <span className="font-medium capitalize">{invoice.payment_method}</span>
                </div>
              )}

              {invoice.paid_amount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Paid Amount:</span>
                  <span className="font-medium">₹{Number(invoice.paid_amount).toLocaleString('en-IN')}</span>
                </div>
              )}

              {invoice.balance_amount > 0 && (
                <div className="flex justify-between text-red-600 font-semibold">
                  <span>Balance Due:</span>
                  <span>₹{Number(invoice.balance_amount).toLocaleString('en-IN')}</span>
                </div>
              )}
            </div>

            {invoice.notes && (
              <div className="border-t pt-4 mt-4">
                <p className="text-sm text-gray-600 mb-1">Notes:</p>
                <p className="text-gray-900">{invoice.notes}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
```

✅ **4 Complete!** Frontend is functional with all major pages.

---

## 📅 5: PDF & WhatsApp Integration

### **Morning: PDF Generation**

#### **1. Install PDF Libraries**

```bash
cd frontend
pnpm add jspdf jspdf-autotable
pnpm add -D @types/jspdf
```

#### **2. Create PDF Generator**

```typescript
// frontend/src/lib/pdf-generator.ts

import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { Invoice } from '../types'

export function generateInvoicePDF(invoice: Invoice): jsPDF {
  const doc = new jsPDF()
  
  // Company Header
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.text('VADIVELU CARS', 105, 20, { align: 'center' })
  
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text('Multi Car Service & Express Car Service', 105, 27, { align: 'center' })
  doc.text('Near HP Petrol Bunk, Kondalampatti Community Hall By-Pass Road', 105, 32, { align: 'center' })
  doc.text('Salem - 636 010', 105, 37, { align: 'center' })
  doc.text('Ph: 89036 26677, 80125 26677', 105, 42, { align: 'center' })
  doc.text('Email: vadivels@gmail.com', 105, 47, { align: 'center' })
  
  // Line separator
  doc.setLineWidth(0.5)
  doc.line(15, 52, 195, 52)
  
  // Invoice Title
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text('INVOICE', 105, 60, { align: 'center' })
  
  // Invoice Details
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(`Invoice #: ${invoice.invoice_number}`, 15, 70)
  doc.text(`Date: ${new Date(invoice.invoice_date).toLocaleDateString('en-IN')}`, 15, 76)
  
  // Customer Details Box
  doc.setDrawColor(200)
  doc.setFillColor(240, 240, 240)
  doc.roundedRect(15, 82, 85, 30, 2, 2, 'FD')
  
  doc.setFont('helvetica', 'bold')
  doc.text('Customer Details:', 18, 88)
  doc.setFont('helvetica', 'normal')
  doc.text(`Name: ${invoice.customer?.name || 'N/A'}`, 18, 94)
  doc.text(`Phone: ${invoice.customer?.phone || 'N/A'}`, 18, 100)
  if (invoice.customer?.email) {
    doc.text(`Email: ${invoice.customer.email}`, 18, 106)
  }
  
  // Vehicle Details Box
  doc.roundedRect(110, 82, 85, 30, 2, 2, 'FD')
  
  doc.setFont('helvetica', 'bold')
  doc.text('Vehicle Details:', 113, 88)
  doc.setFont('helvetica', 'normal')
  doc.text(`Number: ${invoice.vehicle?.vehicle_number || 'N/A'}`, 113, 94)
  doc.text(`Model: ${invoice.vehicle?.model || 'N/A'}`, 113, 100)
  if (invoice.mileage) {
    doc.text(`Mileage: ${invoice.mileage} KM`, 113, 106)
  }
  
  // Items Table
  const tableData = invoice.items?.map((item: any, index: number) => [
    index + 1,
    item.description,
    item.item_type,
    `${item.quantity} ${item.unit}`,
    `₹${Number(item.rate).toLocaleString('en-IN')}`,
    `₹${Number(item.amount).toLocaleString('en-IN')}`
  ]) || []
  
  autoTable(doc, {
    startY: 120,
    head: [['#', 'Description', 'Type', 'Qty', 'Rate', 'Amount']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [66, 66, 66],
      fontSize: 10,
      fontStyle: 'bold'
    },
    bodyStyles: {
      fontSize: 9
    },
    columnStyles: {
      0: { cellWidth: 10 },
      1: { cellWidth: 70 },
      2: { cellWidth: 25 },
      3: { cellWidth: 25 },
      4: { cellWidth: 30, halign: 'right' },
      5: { cellWidth: 30, halign: 'right' }
    }
  })
  
  // Get final Y position after table
  const finalY = (doc as any).lastAutoTable.finalY + 10
  
  // Totals Box
  const totalsX = 130
  doc.setDrawColor(200)
  doc.setFillColor(240, 240, 240)
  doc.roundedRect(totalsX, finalY, 65, 45, 2, 2, 'FD')
  
  doc.setFontSize(10)
  doc.text('Parts Total:', totalsX + 5, finalY + 8)
  doc.text(`₹${Number(invoice.parts_total).toLocaleString('en-IN')}`, totalsX + 60, finalY + 8, { align: 'right' })
  
  doc.text('Labor Total:', totalsX + 5, finalY + 15)
  doc.text(`₹${Number(invoice.labor_total).toLocaleString('en-IN')}`, totalsX + 60, finalY + 15, { align: 'right' })
  
  if (invoice.discount_amount > 0) {
    doc.text('Discount:', totalsX + 5, finalY + 22)
    doc.text(`- ₹${Number(invoice.discount_amount).toLocaleString('en-IN')}`, totalsX + 60, finalY + 22, { align: 'right' })
  }
  
  doc.setLineWidth(0.5)
  doc.line(totalsX + 5, finalY + 26, totalsX + 60, finalY + 26)
  
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.text('Grand Total:', totalsX + 5, finalY + 34)
  doc.text(`₹${Number(invoice.grand_total).toLocaleString('en-IN')}`, totalsX + 60, finalY + 34, { align: 'right' })
  
  // Payment Status
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  const paymentY = finalY + 42
  doc.text(`Payment Status: ${invoice.payment_status.toUpperCase()}`, 15, paymentY)
  
  if (invoice.payment_method) {
    doc.text(`Payment Method: ${invoice.payment_method.toUpperCase()}`, 15, paymentY + 6)
  }
  
  if (invoice.paid_amount > 0) {
    doc.text(`Paid Amount: ₹${Number(invoice.paid_amount).toLocaleString('en-IN')}`, 15, paymentY + 12)
  }
  
  if (invoice.balance_amount > 0) {
    doc.setFont('helvetica', 'bold')
    doc.text(`Balance Due: ₹${Number(invoice.balance_amount).toLocaleString('en-IN')}`, 15, paymentY + 18)
  }
  
  // Notes
  if (invoice.notes) {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.text('Notes:', 15, paymentY + 28)
    doc.text(invoice.notes, 15, paymentY + 33, { maxWidth: 180 })
  }
  
  // Footer
  doc.setFontSize(8)
  doc.setFont('helvetica', 'italic')
  doc.text('*Materials once sold cannot be taken back', 105, 280, { align: 'center' })
  doc.text('Thank you for your business!', 105, 285, { align: 'center' })
  
  // Signature line
  doc.line(140, 270, 190, 270)
  doc.text('Authorized Signature', 165, 275, { align: 'center' })
  
  return doc
}
```

#### **3. Add PDF Download to Invoice Detail**

```typescript
// Update frontend/src/pages/InvoiceDetail.tsx

import { generateInvoicePDF } from '../lib/pdf-generator'

// Inside InvoiceDetail component:

const handleDownload = () => {
  const pdf = generateInvoicePDF(invoice)
  pdf.save(`invoice-${invoice.invoice_number}.pdf`)
}
```

### **Afternoon: WhatsApp Integration**

#### **1. Setup WhatsApp in Backend**

First, you need WhatsApp Business API access. For development, we'll create the integration code:

```typescript
// workers/src/lib/whatsapp.ts

export interface WhatsAppMessage {
  to: string
  message: string
  mediaUrl?: string
}

export async function sendWhatsAppMessage(
  env: any,
  { to, message, mediaUrl }: WhatsAppMessage
): Promise<any> {
  // Format phone number (remove + and spaces)
  const formattedPhone = to.replace(/[^0-9]/g, '')
  
  const payload: any = {
    messaging_product: 'whatsapp',
    to: formattedPhone,
    type: 'text',
    text: {
      body: message
    }
  }
  
  // If media URL provided, send as document
  if (mediaUrl) {
    payload.type = 'document'
    payload.document = {
      link: mediaUrl,
      caption: 'Invoice from Vadivelu Cars'
    }
    delete payload.text
  }
  
  try {
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${env.WHATSAPP_PHONE_ID}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.WHATSAPP_ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      }
    )
    
    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.error?.message || 'Failed to send message')
    }
    
    return data
  } catch (error) {
    console.error('WhatsApp API Error:', error)
    throw error
  }
}

export function formatInvoiceMessage(invoice: any): string {
  return `
*VADIVELU CARS*
Multi Car Service & Express Car Service

━━━━━━━━━━━━━━━━━━━━

📄 *Invoice #${invoice.invoice_number}*
📅 Date: ${new Date(invoice.invoice_date).toLocaleDateString('en-IN')}

👤 *Customer:* ${invoice.customer?.name || 'N/A'}
🚙 *Vehicle:* ${invoice.vehicle?.vehicle_number || 'N/A'}

━━━━━━━━━━━━━━━━━━━━

💰 *Amount Details:*
Parts: ₹${Number(invoice.parts_total).toLocaleString('en-IN')}
Labor: ₹${Number(invoice.labor_total).toLocaleString('en-IN')}
${invoice.discount_amount > 0 ? `Discount: -₹${Number(invoice.discount_amount).toLocaleString('en-IN')}` : ''}

💵 *Grand Total: ₹${Number(invoice.grand_total).toLocaleString('en-IN')}*

${invoice.payment_status !== 'paid' ? `⚠️ Balance Due: ₹${Number(invoice.balance_amount).toLocaleString('en-IN')}` : '✅ Payment: PAID'}

━━━━━━━━━━━━━━━━━━━━

📞 For queries: 89036 26677
📧 Email: vadivels@gmail.com

Thank you for choosing Vadivelu Cars! 🙏
  `.trim()
}
```

#### **2. Create WhatsApp Endpoint**

```typescript
// workers/src/controllers/whatsapp.ts

import { Context } from 'hono'
import { getSupabaseClient } from '../lib/supabase'
import { sendWhatsAppMessage, formatInvoiceMessage } from '../lib/whatsapp'

export async function sendInvoiceWhatsApp(c: Context) {
  const { invoice_id, phone_number } = await c.req.json()
  
  if (!invoice_id || !phone_number) {
    return c.json({ error: 'Missing required fields' }, 400)
  }
  
  const supabase = getSupabaseClient(c.env)
  
  // Get invoice details
  const { data: invoice, error } = await supabase
    .from('invoices')
    .select(`
      *,
      customer:customers(*),
      vehicle:vehicles(*)
    `)
    .eq('id', invoice_id)
    .single()
  
  if (error || !invoice) {
    return c.json({ error: 'Invoice not found' }, 404)
  }
  
  // Format message
  const message = formatInvoiceMessage(invoice)
  
  try {
    // Send WhatsApp message
    const result = await sendWhatsAppMessage(c.env, {
      to: phone_number,
      message: message,
      mediaUrl: invoice.pdf_url // If PDF URL exists
    })
    
    return c.json({
      success: true,
      message: 'Invoice sent successfully',
      data: result
    })
  } catch (error: any) {
    return c.json({
      error: error.message || 'Failed to send WhatsApp message'
    }, 500)
  }
}
```

#### **3. Add Route**

```typescript
// workers/src/router.ts

import * as whatsappController from './controllers/whatsapp'

// Add this route:
router.post('/whatsapp/send-invoice', whatsappController.sendInvoiceWhatsApp)
```

#### **4. Frontend WhatsApp Integration**

```typescript
// frontend/src/lib/api.ts

// Add to ApiClient class:

async sendWhatsApp(invoiceId: string, phoneNumber: string) {
  return this.request<any>('/api/whatsapp/send-invoice', {
    method: 'POST',
    body: JSON.stringify({
      invoice_id: invoiceId,
      phone_number: phoneNumber
    })
  })
}
```

```tsx
// frontend/src/components/invoice/ShareDialog.tsx

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { api } from '../../lib/api'
import { MessageCircle, Mail } from 'lucide-react'

interface ShareDialogProps {
  open: boolean
  onClose: () => void
  invoice: any
}

export function ShareDialog({ open, onClose, invoice }: ShareDialogProps) {
  const [phoneNumber, setPhoneNumber] = useState(invoice.customer?.phone || '')
  const [sending, setSending] = useState(false)

  const handleSendWhatsApp = async () => {
    if (!phoneNumber) {
      alert('Please enter phone number')
      return
    }

    setSending(true)
    try {
      await api.sendWhatsApp(invoice.id, phoneNumber)
      alert('Invoice sent successfully!')
      onClose()
    } catch (error: any) {
      alert(error.message || 'Failed to send invoice')
    } finally {
      setSending(false)
    }
  }

  const handleShareNative = () => {
    // Use Web Share API
    if (navigator.share) {
      navigator.share({
        title: `Invoice #${invoice.invoice_number}`,
        text: `Invoice from Vadivelu Cars - ₹${Number(invoice.grand_total).toLocaleString('en-IN')}`,
        url: window.location.href
      })
    } else {
      alert('Share not supported on this device')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share Invoice</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* WhatsApp */}
          <div>
            <Label htmlFor="phone">WhatsApp Number</Label>
            <div className="flex gap-2 mt-1">
              <Input
                id="phone"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="919876543210"
              />
              <Button
                onClick={handleSendWhatsApp}
                disabled={sending}
                className="bg-green-600 hover:bg-green-700"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                {sending ? 'Sending...' : 'Send'}
              </Button>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Include country code (e.g., 91 for India)
            </p>
          </div>

          {/* Native Share */}
          <div className="border-t pt-4">
            <Button
              variant="outline"
              onClick={handleShareNative}
              className="w-full"
            >
              <Mail className="w-4 h-4 mr-2" />
              Share via Other Apps
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
```

#### **5. Update Invoice Detail Page**

```tsx
// Update frontend/src/pages/InvoiceDetail.tsx

import { ShareDialog } from '../components/invoice/ShareDialog'

// Add state:
const [showShareDialog, setShowShareDialog] = useState(false)

// Update handleShare:
const handleShare = () => {
  setShowShareDialog(true)
}

// Add dialog before closing </div>:
<ShareDialog
  open={showShareDialog}
  onClose={() => setShowShareDialog(false)}
  invoice={invoice}
/>
```

### **Evening: Upload PDFs to R2**

```typescript
// workers/src/controllers/invoice.ts

// Add this helper function:
async function uploadPDFToR2(
  bucket: R2Bucket,
  invoiceNumber: string,
  pdfBuffer: ArrayBuffer
): Promise<string> {
  const filename = `invoices/${invoiceNumber}.pdf`
  
  await bucket.put(filename, pdfBuffer, {
    httpMetadata: {
      contentType: 'application/pdf'
    }
  })
  
  // Return public URL
  return `https://storage.vadivelu-cars.com/${filename}`
}

// Update create function to generate and upload PDF:
// After creating invoice...

// Generate PDF (you'll need to implement server-side PDF generation)
// For now, we'll let frontend handle it and upload later

// Or use puppeteer in workers:
// const pdfBuffer = await generatePDFWithPuppeteer(invoice)
// const pdfUrl = await uploadPDFToR2(c.env.R2_BUCKET, invoice.invoice_number, pdfBuffer)
// Update invoice with PDF URL
```

✅ **5 Complete!** PDF generation and WhatsApp sharing working!

---

## 📅 6: Testing & Optimization

### **Morning: Testing**

#### **1. Create Test Data Script**

```typescript
// frontend/src/scripts/seed-data.ts

import { api } from '../lib/api'

async function seedData() {
  console.log('Seeding test data...')
  
  // Create test customers
  const customers = [
    {
      name: 'Rajesh Kumar',
      phone: '9876543210',
      vehicle: {
        vehicle_number: 'TN 01 AB 1234',
        model: 'Swift',
        year: 2020
      }
    },
    {
      name: 'Priya Sharma',
      phone: '9876543211',
      vehicle: {
        vehicle_number: 'TN 02 CD 5678',
        model: 'i20',
        year: 2021
      }
    }
  ]
  
  for (const customer of customers) {
    try {
      await api.createCustomer(customer)
      console.log(`✓ Created customer: ${customer.name}`)
    } catch (error) {
      console.error(`✗ Failed to create customer: ${customer.name}`)
    }
  }
  
  console.log('Seeding complete!')
}

seedData()
```

#### **2. Manual Testing Checklist**

Create a file: `TESTING.md`

```markdown
# Testing Checklist

## Invoice Creation
- [ ] Can search for existing customer
- [ ] Can create new customer inline
- [ ] Can search and add parts
- [ ] Can add custom items
- [ ] Can edit item quantity/rate
- [ ] Can remove items
- [ ] Totals calculate correctly
- [ ] Can set payment status
- [ ] Can add notes
- [ ] Invoice saves successfully

## Invoice Management
- [ ] Can view invoice list
- [ ] Can view invoice details
- [ ] Can download PDF
- [ ] Can share via WhatsApp
- [ ] Can delete invoice
- [ ] Pagination works

## Mobile Experience
- [ ] Responsive on phone
- [ ] Touch-friendly buttons
- [ ] Forms work on mobile
- [ ] Navigation works
- [ ] PDF downloads on mobile

## Performance
- [ ] Page loads < 3 seconds
- [ ] Search is instant
- [ ] No console errors
- [ ] Works offline (after first load)
```

### **Afternoon: Optimization**

#### **1. Add Loading States**

```tsx
// frontend/src/components/ui/loading.tsx

export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
    </div>
  )
}

export function LoadingPage() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  )
}
```

#### **2. Add Error Boundaries**

```tsx
// frontend/src/components/ErrorBoundary.tsx

import { Component, ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
            <h2 className="text-2xl font-bold text-red-600 mb-2">
              Oops! Something went wrong
            </h2>
            <p className="text-gray-600 mb-4">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Reload Page
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
```

```tsx
// Update frontend/src/main.tsx

import { ErrorBoundary } from './components/ErrorBoundary'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </ErrorBoundary>
  </React.StrictMode>,
)
```

#### **3. Add PWA Support**

```bash
cd frontend
pnpm add -D vite-plugin-pwa
```

```typescript
// frontend/vite.config.ts

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'robots.txt', 'apple-touch-icon.png'],
      manifest: {
        name: 'Vadivelu Cars',
        short_name: 'VC Billing',
        description: 'Car service billing system',
        theme_color: '#ffffff',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.vadivelu-cars\.com\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 // 24 hours
              }
            }
          }
        ]
      }
    })
  ]
})
```

### **Evening: Performance Optimization**

#### **1. Code Splitting**

```tsx
// frontend/src/App.tsx

import { lazy, Suspense } from 'react'
import { LoadingPage } from './components/ui/loading'

// Lazy load pages
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Invoices = lazy(() => import('./pages/Invoices'))
const NewInvoice = lazy(() => import('./pages/NewInvoice'))
const InvoiceDetail = lazy(() => import('./pages/InvoiceDetail'))

function App() {
  return (
    <Router>
      <Layout>
        <Suspense fallback={<LoadingPage />}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/invoices" element={<Invoices />} />
            <Route path="/invoices/new" element={<NewInvoice />} />
            <Route path="/invoices/:id" element={<InvoiceDetail />} />
            {/* ... */}
          </Routes>
        </Suspense>
      </Layout>
    </Router>
  )
}
```

✅ **6 Complete!** App is tested and optimized!

---

## 📅 7: Deployment

### **Morning: Prepare for Deployment**

#### **1. Environment Variables**

```bash
# Frontend .env.production
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_URL=https://api.vadivelu-cars.com
```

#### **2. Build Frontend**

```bash
cd frontend
pnpm build

# Test production build locally
pnpm preview
```

### **Afternoon: Deploy Backend**

#### **1. Set Cloudflare Secrets**

```bash
cd workers

# Set production secrets
wrangler secret put SUPABASE_URL
# Paste: https://your-project.supabase.co

wrangler secret put SUPABASE_ANON_KEY
# Paste: your-anon-key

wrangler secret put WHATSAPP_PHONE_ID
# Paste: your-phone-id

wrangler secret put WHATSAPP_ACCESS_TOKEN
# Paste: your-token
```

#### **2. Create R2 Bucket**

```bash
# Create production bucket
wrangler r2 bucket create vadivelu-cars-invoices

# Enable public access
wrangler r2 bucket update vadivelu-cars-invoices --public-url
```

#### **3. Deploy Workers**

```bash
# Deploy to production
wrangler deploy

# Output: Deployed to https://vadivelu-cars-api.your-subdomain.workers.dev
```

### **Evening: Deploy Frontend**

#### **1. Deploy to Cloudflare Pages**

```bash
cd frontend

# Option 1: Using Wrangler
wrangler pages deploy dist

# Option 2: Using GitHub (Recommended)
# 1. Push code to GitHub
git add .
git commit -m "Ready for deployment"
git push origin main

# 2. Go to Cloudflare Dashboard
# 3. Pages → Create a project
# 4. Connect to GitHub repository
# 5. Build settings:
#    - Framework: Vite
#    - Build command: pnpm build
#    - Build output: dist
# 6. Add environment variables
# 7. Deploy!
```

#### **2. Setup Custom Domain**

```bash
# In Cloudflare Dashboard:
# 1. Pages → Your project → Custom domains
# 2. Add domain: vadivelu-cars.com
# 3. Update DNS records (automatic)

# Workers:
# 1. Workers → Your worker → Triggers
# 2. Add route: api.vadivelu-cars.com/*
```

### **Final Steps**

#### **1. Update CORS**

```typescript
// workers/src/index.ts

app.use('*', cors({
  origin: ['https://vadivelu-cars.com', 'https://www.vadivelu-cars.com'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization']
}))
```

#### **2. Test Production**

Visit https://vadivelu-cars.com and test:
- ✅ Create invoice
- ✅ Download PDF
- ✅ Share WhatsApp
- ✅ Mobile responsiveness

#### **3. Setup Monitoring**

```bash
# Cloudflare Dashboard:
# Analytics → Web Analytics
# Workers → Your worker → Metrics

# Set up alerts:
# Workers → Your worker → Settings → Alerts
# - Error rate > 1%
# - CPU time > 50ms
```

✅ **7 Complete! APP IS LIVE! 🎉**

---

## 🎊 CONGRATULATIONS!

Your dad's billing system is now:
- ✅ **Live on production**
- ✅ **Mobile-friendly**
- ✅ **Fast & reliable**
- ✅ **Costing < ₹500/month**
- ✅ **Professional invoices**
- ✅ **WhatsApp integration**

### **Next Steps**

1. **Train your dad** on using the system
2. **Monitor** for first week
3. **Gather feedback**
4. **Iterate** based on real usage

### **Support & Maintenance**

```bash
# View logs
wrangler tail vadivelu-cars-api

# Update backend
cd workers
# Make changes
wrangler deploy

# Update frontend
cd frontend
# Make changes
pnpm build
wrangler pages deploy dist
```

---