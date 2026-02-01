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
