-- =====================================================
-- VADIVELU CARS - COMPLETE DATABASE SCHEMA (2026)
-- Unified Single Source of Truth
-- =====================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto"; -- For gen_random_uuid if needed

-- 2. TABLES & EXTENDED SCHEMA

-- USERS (Admin/Staff)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255), -- Nullable for OAuth
  google_id VARCHAR(255) UNIQUE, -- New for OAuth
  avatar_url TEXT,
  phone VARCHAR(15),
  name VARCHAR(100) NOT NULL,
  role VARCHAR(20) DEFAULT 'staff' CHECK (role IN ('admin', 'manager', 'staff', 'technician')),
  permissions JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMPTZ,
  login_attempts INTEGER DEFAULT 0,
  locked_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_google_id ON users(google_id);

-- USER SESSIONS
CREATE TABLE user_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  session_token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- CUSTOMERS
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100),
  phone VARCHAR(15), -- Nullable now
  email VARCHAR(100), -- Nullable now
  address TEXT, -- Nullable now
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  communication_preferences JSONB DEFAULT '{"sms": true, "email": true, "whatsapp": false}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_customers_phone ON customers(phone);
CREATE INDEX idx_customers_name ON customers(name);

-- CUSTOMER SESSIONS
CREATE TABLE customer_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  session_token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- CUSTOMER FEEDBACK
CREATE TABLE customer_feedback (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    feedback_text TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- CAR MODELS (New)
CREATE TABLE car_models (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  make VARCHAR(50),
  model VARCHAR(50),
  type VARCHAR(50), 
  year_start INTEGER,
  year_end INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_car UNIQUE (make, model)
);

CREATE INDEX idx_car_models_make ON car_models(make);
CREATE INDEX idx_car_models_model ON car_models(model);

-- VEHICLES
CREATE TABLE vehicles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  vehicle_number VARCHAR(20) UNIQUE NOT NULL,
  make VARCHAR(50),
  model VARCHAR(50),
  year INTEGER,
  current_mileage INTEGER,
  insurance_date DATE,
  is_active BOOLEAN DEFAULT true,
  deactivated_at TIMESTAMPTZ,
  deactivation_reason TEXT,
  notes TEXT,
  contact_preferences JSONB DEFAULT '{"sms": false, "email": true, "whatsapp": true}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_vehicles_number ON vehicles(vehicle_number);
CREATE INDEX idx_vehicles_customer ON vehicles(customer_id);
CREATE INDEX idx_vehicles_insurance_date ON vehicles(insurance_date);

-- PARTS CATALOG
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
CREATE INDEX idx_parts_search ON parts_catalog USING gin(to_tsvector('english', name));

-- INVOICES
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
CREATE INDEX idx_invoices_customer ON invoices(customer_id);

-- INVOICE ITEMS
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

-- 3. SEQUENCES & FUNCTIONS

CREATE SEQUENCE IF NOT EXISTS invoice_number_seq START WITH 2098;

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

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply Triggers
CREATE TRIGGER update_users_timestamp BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_customers_timestamp BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_vehicles_timestamp BEFORE UPDATE ON vehicles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_parts_timestamp BEFORE UPDATE ON parts_catalog FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_invoices_timestamp BEFORE UPDATE ON invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_car_models_timestamp BEFORE UPDATE ON car_models FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_customer_feedback_updated_at BEFORE UPDATE ON customer_feedback FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Create Audit Logs table
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    action VARCHAR(255) NOT NULL,
    resource VARCHAR(255) NOT NULL,
    resource_id VARCHAR(255),
    performed_by VARCHAR(255),
    severity VARCHAR(50) DEFAULT 'info',
    changes JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indices for faster querying
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON audit_logs(resource);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

-- 4. DATA SEEDING (Merged from all sources)

-- USERS
INSERT INTO "public"."users" ("id", "username", "email", "password_hash", "phone", "name", "role", "permissions", "is_active", "last_login", "login_attempts", "locked_until", "created_at", "updated_at") VALUES ('0f98a908-fc08-4b49-a833-add63bfa3777', 'dayanidi', 'dayanidigv954@gmail.com', '$2b$10$9hnLiSL18BgVlDoRQYVBB.dhg7NwKjPmI4bifG.FRfPCcE8hhRaMu', '9677724053', 'Dayanidi GV', 'admin', '{"all":true,"users":["create","read","update","delete"],"settings":["read","update"]}', 'true', '2026-02-02 16:02:59.194+00', '0', null, '2026-02-01 17:23:02.313194+00', '2026-02-02 16:02:59.361545+00'), ('d111824c-ba9c-41d4-9bf1-5cf172fd1316', 'vadivelucars', 'vadivelucars@gmail.com', '$2b$10$IRoCd6adMrczJdhxQGHdu.LOWVatpfWDYNmmrID5zulN3B4VnYIGa', '8903626677', 'Vadivel', 'admin', '{}', 'true', '2026-02-03 05:24:54.594+00', '0', null, '2026-02-02 10:58:20.97875+00', '2026-02-03 05:24:54.73304+00');

-- CUSTOMERS
INSERT INTO "public"."customers" ("id", "name", "phone", "email", "address", "created_at", "updated_at", "emergency_contact_name", "emergency_contact_phone", "communication_preferences") VALUES ('716dbb45-6749-4e19-b5cd-3f6a3682d551', ' Mr. Murugasen', '9488648800', '', 'Thivittipatty ', '2026-02-02 07:01:48.591018+00', '2026-02-03 05:23:18.773795+00', null, null, '{"sms":true,"email":true,"whatsapp":false}'), ('81e45929-32ab-4029-8139-4ac6d24c1bf3', 'DR.Preetha ', '9443831811', '', 'Salem', '2026-02-02 06:34:10.018118+00', '2026-02-02 06:34:10.018118+00', null, null, '{"sms":true,"email":true,"whatsapp":false}'), ('8ca7b193-6378-48f4-a6ff-bd903bc04247', 'Mr.Rajesh', '9677724053', '', 'Salem', '2026-02-03 05:28:30.764052+00', '2026-02-03 05:28:30.764052+00', null, null, '{"sms":true,"email":true,"whatsapp":false}'), ('f6b5dc24-f34c-40d4-9235-261b792f1de5', 'Mr velu', '9488648806', '', 'Salem', '2026-02-03 05:49:09.729112+00', '2026-02-03 05:49:09.729112+00', null, null, '{"sms":true,"email":true,"whatsapp":false}'), ('f93d7e3e-c97c-40fe-a59f-07fd86cb2758', 'Test Customer 2', '9677724053', 'test@example.com', 'Test Address', '2026-02-01 18:04:17.748487+00', '2026-02-01 18:33:33.644476+00', null, null, '{"sms":true,"email":true,"whatsapp":false}'), ('fe8a8541-f708-40f4-8024-30cd9ad861e2', 'Mr.Gunasekaran', '000000000', '', 'Salem', '2026-02-03 05:43:27.717668+00', '2026-02-03 05:43:27.717668+00', null, null, '{"sms":true,"email":true,"whatsapp":false}'), ('feeb6ef8-efe3-47b4-b9eb-bb4046b08900', 'Test Customer', '9876543210', null, null, '2026-02-01 17:23:02.313194+00', '2026-02-01 17:23:02.313194+00', null, null, '{"sms":true,"email":true,"whatsapp":false}');

-- CAR MODELS
INSERT INTO car_models (make, model, type) VALUES
('Maruti Suzuki', 'Swift', 'Hatchback'),
('Maruti Suzuki', 'Baleno', 'Hatchback'),
('Maruti Suzuki', 'Dzire', 'Sedan'),
('Maruti Suzuki', 'Ertiga', 'MPV'),
('Maruti Suzuki', 'Brezza', 'SUV'),
('Maruti Suzuki', 'Alto', 'Hatchback'),
('Maruti Suzuki', 'Wagon R', 'Hatchback'),
('Maruti Suzuki', 'Celerio', 'Hatchback'),
('Maruti Suzuki', 'FRONX', 'SUV'),
('Maruti Suzuki', 'Vitara Brezza', 'SUV'),
('Maruti Suzuki', 'XL6', 'MPV'),
('Maruti Suzuki', 'Ciaz', 'Sedan'),
('Maruti Suzuki', 'Grand Vitara', 'SUV'),
('Maruti Suzuki', 'Jimny', 'SUV'),
('Maruti Suzuki', 'S-Presso', 'Hatchback'),
('Maruti Suzuki', 'Ritz', 'Hatchback'),
('Maruti Suzuki', 'Ignis', 'Hatchback'),
('Maruti Suzuki', 'Alto K10', 'Hatchback'),
('Maruti Suzuki', 'Tour H1', 'Hatchback'),
('Maruti Suzuki', 'Victoris', 'Sedan'),
('Maruti Suzuki', '800', 'Hatchback'),
('Maruti Suzuki', 'Maruti 1000', 'Sedan'),
('Maruti Suzuki', 'Esteem', 'Sedan'),
('Hyundai', 'i20', 'Hatchback'),
('Hyundai', 'Creta', 'SUV'),
('Hyundai', 'Verna', 'Sedan'),
('Hyundai', 'Venue', 'SUV'),
('Hyundai', 'Eon', 'Hatchback'),
('Hyundai', 'i10', 'Hatchback'),
('Hyundai', 'Grand i10', 'Hatchback'),
('Hyundai', 'Grand i10 Nios', 'Hatchback'),
('Hyundai', 'Aura', 'Sedan'),
('Hyundai', 'Tucson', 'SUV'),
('Hyundai', 'Creta Electric', 'SUV'),
('Hyundai', 'Exter', 'SUV'),
('Hyundai', 'Kona', 'SUV'),
('Hyundai', 'Nexo', 'SUV'),
('Hyundai', 'Santro', 'Hatchback'),
('Hyundai', 'Santro Xing', 'Hatchback'),
('Hyundai', 'i20 N Line', 'Hatchback'),
('Hyundai', 'Getz', 'Hatchback'),
('Hyundai', 'i30', 'Hatchback'),
('Tata', 'Nexon', 'SUV'),
('Tata', 'Harrier', 'SUV'),
('Tata', 'Safari', 'SUV'),
('Tata', 'Tiago', 'Hatchback'),
('Tata', 'Tigor', 'Sedan'),
('Tata', 'Altroz', 'Hatchback'),
('Tata', 'Punch', 'SUV'),
('Tata', 'Curvv', 'SUV'),
('Tata', 'Sierra', 'SUV'),
('Tata', 'Avinya', 'SUV'),
('Tata', 'Nexon EV', 'SUV'),
('Tata', 'Harrier EV', 'SUV'),
('Tata', 'Punch EV', 'SUV'),
('Tata', 'Sierra EV', 'SUV'),
('Tata', 'Altroz Racer', 'Hatchback'),
('Tata', 'Xpres', 'Sedan'),
('Tata', 'Xpres T EV', 'Sedan'),
('Tata', 'Tiago NRG', 'Hatchback'),
('Tata', 'Indigo', 'Sedan'),
('Tata', 'Indica', 'Hatchback'),
('Mahindra', 'Scorpio', 'SUV'),
('Mahindra', 'Scorpio N', 'SUV'),
('Mahindra', 'XUV700', 'SUV'),
('Mahindra', 'XUV500', 'SUV'),
('Mahindra', 'Thar', 'SUV'),
('Mahindra', 'Thar ROXX', 'SUV'),
('Mahindra', 'Bolero', 'SUV'),
('Mahindra', 'Bolero Neo', 'SUV'),
('Mahindra', 'Bolero Neo Plus', 'SUV'),
('Mahindra', 'XUV300', 'SUV'),
('Mahindra', 'XUV3XO', 'SUV'),
('Mahindra', 'XUV3XO EV', 'SUV'),
('Mahindra', 'BE 6', 'SUV'),
('Mahindra', 'XEV 9e', 'SUV'),
('Mahindra', 'XEV 9S', 'SUV'),
('Mahindra', 'Alturas G4', 'SUV'),
('Mahindra', 'Bolero Camper', 'SUV'),
('Mahindra', 'XUV 7XO', 'SUV'),
('Mahindra', 'Xylo', 'MPV'),
('Mahindra', 'Quanto', 'SUV'),
('Honda', 'City', 'Sedan'),
('Honda', 'Amaze', 'Sedan'),
('Honda', 'Jazz', 'Hatchback'),
('Honda', 'HR-V', 'SUV'),
('Honda', 'Elevate', 'SUV'),
('Honda', 'CR-V', 'SUV'),
('Honda', 'Accord', 'Sedan'),
('Honda', 'Civic', 'Sedan'),
('Toyota', 'Innova Crysta', 'MPV'),
('Toyota', 'Innova Hycross', 'MPV'),
('Toyota', 'Fortuner', 'SUV'),
('Toyota', 'Glanza', 'Hatchback'),
('Toyota', 'Vellfire', 'MPV'),
('Toyota', 'Camry', 'Sedan'),
('Toyota', 'Land Cruiser 300', 'SUV'),
('Toyota', 'Land Cruiser Prado', 'SUV'),
('Toyota', 'Hilux', 'Pickup'),
('Toyota', 'Corolla', 'Sedan'),
('Kia', 'Seltos', 'SUV'),
('Kia', 'Sonet', 'SUV'),
('Kia', 'Carens', 'MPV'),
('Kia', 'Carens EV', 'MPV'),
('Kia', 'Syros', 'SUV'),
('Kia', 'EV6', 'SUV'),
('Kia', 'EV9', 'SUV'),
('Skoda', 'Rapid', 'Sedan'),
('Skoda', 'Slavia', 'Sedan'),
('Skoda', 'Octavia', 'Sedan'),
('Skoda', 'Superb', 'Sedan'),
('Skoda', 'Kodiaq', 'SUV'),
('Skoda', 'Kylaq', 'SUV'),
('Skoda', 'Kushaq', 'SUV'),
('Skoda', 'Karoq', 'SUV'),
('Volkswagen', 'Polo', 'Hatchback'),
('Volkswagen', 'Vento', 'Sedan'),
('Volkswagen', 'Virtus', 'Sedan'),
('Volkswagen', 'Taigun', 'SUV'),
('Volkswagen', 'Tiguan', 'SUV'),
('Volkswagen', 'T-Roc', 'SUV'),
('Volkswagen', 'Tayron', 'SUV'),
('Citroen', 'C3', 'Hatchback'),
('Citroen', 'C3 Aircross', 'SUV'),
('Citroen', 'Basalt', 'SUV'),
('Citroen', 'C5 Aircross', 'SUV'),
('Jeep', 'Compass', 'SUV'),
('Jeep', 'Wrangler', 'SUV'),
('Jeep', 'Meridian', 'SUV'),
('Jeep', 'Grand Cherokee', 'SUV'),
('Renault', 'Kiger', 'SUV'),
('Renault', 'Duster', 'SUV'),
('Renault', 'Kwid', 'Hatchback'),
('Renault', 'Triber', 'MPV'),
('MG', 'Hector', 'SUV'),
('MG', 'Astor', 'SUV'),
('MG', 'Comet', 'Hatchback'),
('MG', 'Comet EV', 'Hatchback'),
('MG', 'Windsor EV', 'SUV'),
('MG', 'ZS EV', 'SUV'),
('MG', 'Cyberster', 'Coupe'),
('Nissan', 'Magnite', 'SUV'),
('Nissan', 'Kicks', 'SUV'),
('Nissan', 'Terrano', 'SUV'),
('Nissan', 'Ariya', 'SUV'),
('Datsun', 'Redi-GO', 'Hatchback'),
('Datsun', 'GO', 'Hatchback'),
('Datsun', 'GO+', 'MPV'),
('Audi', 'A4', 'Sedan'),
('Audi', 'A6', 'Sedan'),
('Audi', 'Q3', 'SUV'),
('Audi', 'Q5', 'SUV'),
('Audi', 'Q7', 'SUV'),
('Audi', 'Q8', 'SUV'),
('BMW', 'X1', 'SUV'),
('BMW', 'X3', 'SUV'),
('BMW', 'X5', 'SUV'),
('BMW', 'X7', 'SUV'),
('BMW', '3 Series', 'Sedan'),
('BMW', '5 Series', 'Sedan'),
('BMW', 'M5', 'Sedan'),
('BMW', 'iX1 LWB', 'SUV'),
('Mercedes-Benz', 'C-Class', 'Sedan'),
('Mercedes-Benz', 'E-Class', 'Sedan'),
('Mercedes-Benz', 'S-Class', 'Sedan'),
('Mercedes-Benz', 'GLA', 'SUV'),
('Mercedes-Benz', 'GLB', 'SUV'),
('Mercedes-Benz', 'GLC', 'SUV'),
('Mercedes-Benz', 'GLE', 'SUV'),
('Mercedes-Benz', 'G-Class', 'SUV'),
('Land Rover', 'Discovery', 'SUV'),
('Land Rover', 'Discovery Sport', 'SUV'),
('Land Rover', 'Range Rover', 'SUV'),
('Land Rover', 'Range Rover Evoque', 'SUV'),
('Land Rover', 'Range Rover Velar', 'SUV'),
('Land Rover', 'Defender', 'SUV'),
('Porsche', '911', 'Coupe'),
('Porsche', 'Cayenne', 'SUV'),
('Porsche', 'Macan', 'SUV'),
('Porsche', 'Panamera', 'Sedan'),
('Jaguar', 'XE', 'Sedan'),
('Jaguar', 'XF', 'Sedan'),
('Jaguar', 'F-Pace', 'SUV'),
('Lexus', 'LX', 'SUV'),
('Lexus', 'RX', 'SUV'),
('Lexus', 'ES', 'Sedan'),
('Rolls-Royce', 'Spectre', 'Coupe'),
('Rolls-Royce', 'Ghost', 'Sedan'),
('Rolls-Royce', 'Phantom', 'Sedan'),
('Bentley', 'Flying Spur', 'Sedan'),
('Bentley', 'Continental', 'Coupe'),
('Bentley', 'Bentayga', 'SUV'),
('Lamborghini', 'Revuelto', 'Coupe'),
('Lamborghini', 'Huracan', 'Coupe'),
('Ferrari', '812', 'Coupe'),
('Ferrari', 'F8', 'Coupe'),
('McLaren', 'GT', 'Coupe'),
('McLaren', '570S', 'Coupe'),
('Volvo', 'S90', 'Sedan'),
('Volvo', 'XC40', 'SUV'),
('Volvo', 'XC60', 'SUV'),
('Volvo', 'XC90', 'SUV'),
('Volvo', 'EX30', 'SUV'),
('Volvo', 'EX40', 'SUV'),
('Mazda', 'CX-5', 'SUV'),
('Mazda', 'CX-3', 'SUV'),
('Subaru', 'Forester', 'SUV'),
('Subaru', 'XV', 'SUV'),
('Fiat', 'Abarth', 'Hatchback'),
('BYD', 'Atto 2', 'SUV'),
('BYD', 'Song Plus DM-i', 'SUV'),
('VinFast', 'VF8', 'SUV'),
('VinFast', 'VF9', 'SUV'),
('Vayve Mobility', 'Eva', 'Hatchback'),
('Force Motors', 'Gurkha', 'SUV'),
('ISUZU', 'D-Max', 'Pickup'),
('ISUZU', 'MU-X', 'SUV'),
('Chevrolet', 'Beat', 'Hatchback'),
('Chevrolet', 'Sail', 'Sedan'),
('Chevrolet', 'Enjoy', 'MPV'),
('Chevrolet', 'Cruze', 'Sedan'),
('Hindustan', 'Ambassador', 'Sedan'),
('Hindustan', 'Contessa', 'Sedan'),
('Premier', '800', 'Hatchback'),
('Premier', 'Padmini', 'Sedan'),
('Ashok Leyland', 'Stile', 'Sedan'),
('Ashok Leyland', 'Stile Plus', 'Sedan');

-- VEHICLES
INSERT INTO "public"."vehicles" ("id", "customer_id", "vehicle_number", "make", "model", "year", "current_mileage", "insurance_date", "created_at", "updated_at", "is_active", "deactivated_at", "deactivation_reason", "notes", "contact_preferences") VALUES ('080210e9-ba2a-470b-ae23-ca24e2c7bbf7', '81e45929-32ab-4029-8139-4ac6d24c1bf3', 'TN 03 C 7428', null, 'Alto ', '2007', '84077', null, '2026-02-02 06:34:10.17132+00', '2026-02-02 06:34:10.17132+00', 'true', null, null, null, '{"sms":true,"email":true,"whatsapp":false}'), ('3619a4a7-4077-4077-85db-a64997e6a83e', 'f6b5dc24-f34c-40d4-9235-261b792f1de5', 'TN 30 E 4417', null, '800cc', '2010', '10250', null, '2026-02-03 05:49:09.884851+00', '2026-02-03 05:49:09.884851+00', 'true', null, null, null, '{"sms":true,"email":true,"whatsapp":false}'), ('48fd6652-100d-49d2-af25-c23364f0e1de', 'feeb6ef8-efe3-47b4-b9eb-bb4046b08900', 'KA 55 M 3966', null, 'Scorpio', null, '45000', null, '2026-02-01 17:23:02.313194+00', '2026-02-01 17:23:02.313194+00', 'true', null, null, null, '{"sms":true,"email":true,"whatsapp":false}'), ('52f66fd8-d599-4e7c-8eae-42ac3fa188ab', 'fe8a8541-f708-40f4-8024-30cd9ad861e2', 'TN 54 C 5331', null, 'Eeco', '2010', null, null, '2026-02-03 05:43:27.810373+00', '2026-02-03 05:43:27.810373+00', 'true', null, null, null, '{"sms":true,"email":true,"whatsapp":false}'), ('9e8e0c31-17dc-4ffd-80be-7a0bfeaffed4', '716dbb45-6749-4e19-b5cd-3f6a3682d551', 'TN 27 F 4669', null, 'Omni', '1999', null, null, '2026-02-03 05:23:19.118339+00', '2026-02-03 05:23:19.118339+00', 'true', null, null, null, '{"sms":true,"email":true,"whatsapp":false}'), ('e8bbbb31-2cee-4254-85c9-0cff6900b6ba', 'f93d7e3e-c97c-40fe-a59f-07fd86cb2758', 'TN 30 4545', null, null, null, null, null, '2026-02-01 18:33:33.827149+00', '2026-02-01 18:33:33.827149+00', 'true', null, null, null, '{"sms":true,"email":true,"whatsapp":false}'), ('f1c5c881-76ba-48e3-94e1-2087ec22f7f3', '8ca7b193-6378-48f4-a6ff-bd903bc04247', 'TN 34 k 6886', 'Chevrolet ', 'Spark ', '2000', '174200', null, '2026-02-03 05:28:30.881387+00', '2026-02-03 05:28:30.881387+00', 'true', null, null, null, '{"sms":true,"email":true,"whatsapp":false}');

-- PARTS CATALOG
INSERT INTO "public"."parts_catalog" ("id", "name", "category", "default_rate", "unit", "is_active", "created_at", "updated_at") VALUES ('03380dd7-5d65-4f1b-b132-10c08fbf2258', 'Oil Filter', 'Engine', '800.00', 'No', 'true', '2026-02-01 17:23:02.313194+00', '2026-02-01 17:23:02.313194+00'), ('16f456d6-b17e-4398-9db7-a30fd316f837', 'Wheel cylinders ', 'General', '550.00', 'No', 'true', '2026-02-03 05:46:27.707197+00', '2026-02-03 05:46:27.707197+00'), ('181b47f0-4fa2-4b3b-befc-cce32b6461d5', 'Belt', 'General', '400.00', 'No', 'true', '2026-02-03 05:38:13.893252+00', '2026-02-03 05:38:13.893252+00'), ('1a2722fa-eda7-4987-8ea3-39a9f46397c6', 'Labour', 'General', '1000.00', 'No', 'true', '2026-02-02 16:09:17.505339+00', '2026-02-02 16:09:17.505339+00'), ('1ba37928-af2c-48c5-b197-e8bece6b2e12', 'Chassis Assy Complete', 'Chassis', '88000.00', 'No', 'true', '2026-02-01 17:23:02.313194+00', '2026-02-01 17:23:02.313194+00'), ('30375258-0c1c-46a6-a1c2-2d67cede6c17', 'Moter assy radiator fan', 'General', '4000.00', 'No', 'true', '2026-02-03 05:52:41.539502+00', '2026-02-03 05:52:41.539502+00'), ('3040d3f4-144c-42bc-b322-004b27439fb1', 'Labor - Painting', 'Labor', '3500.00', 'Panel', 'true', '2026-02-01 17:23:02.313194+00', '2026-02-01 17:23:02.313194+00'), ('3adfdb00-74d9-4969-8a47-4b80736531bd', 'Shock Absorber', 'Suspension', '1200.00', 'No', 'true', '2026-02-01 17:23:02.313194+00', '2026-02-01 17:23:02.313194+00'), ('5fa250ab-079d-43d3-bae9-4868c64d18ff', 'Lower Arm', 'Suspension', '3400.00', 'No', 'true', '2026-02-01 17:23:02.313194+00', '2026-02-01 17:23:02.313194+00'), ('630d4878-bcfa-463a-b321-0679877dade7', 'Brake Pad', 'Brakes', '2000.00', 'Set', 'true', '2026-02-01 17:23:02.313194+00', '2026-02-01 17:23:02.313194+00'), ('6696a83b-cacf-495f-9404-d0d1e9519295', 'Knuckle Arm', 'Suspension', '2400.00', 'No', 'true', '2026-02-01 17:23:02.313194+00', '2026-02-01 17:23:02.313194+00'), ('6ba73275-0fa4-4cc7-bced-3ba4c1cc6f2b', 'Upper Arm Ball', 'Suspension', '650.00', 'No', 'true', '2026-02-01 17:23:02.313194+00', '2026-02-01 17:23:02.313194+00'), ('6dd415ac-efc7-4138-993d-d3f4420b0364', 'ACC Cable ', 'General', '400.00', 'No', 'true', '2026-02-03 05:38:14.251858+00', '2026-02-03 05:38:14.251858+00'), ('8bf944e0-556a-4d5a-8000-8fdf86b8d163', 'Engine Oil', 'Engine', '2500.00', 'Ltr', 'true', '2026-02-01 17:23:02.313194+00', '2026-02-01 17:23:02.313194+00'), ('98100189-fc10-4ea3-a5e9-583280fb3314', 'Coolant ', 'General', '250.00', 'No', 'true', '2026-02-03 05:52:41.883119+00', '2026-02-03 05:52:41.883119+00'), ('a0ee2467-942b-4e2d-a576-85daa10c0c1e', 'Air Filter', 'Engine', '600.00', 'No', 'true', '2026-02-01 17:23:02.313194+00', '2026-02-01 17:23:02.313194+00'), ('a60dd1d0-5d65-4e9d-9a4b-527b0be31d01', 'Past ', 'General', '120.00', 'No', 'true', '2026-02-03 05:52:42.184834+00', '2026-02-03 05:52:42.184834+00'), ('a9b20d1b-8def-4a0b-8aaf-78956a10d8e3', 'Upper Arm', 'Suspension', '2700.00', 'No', 'true', '2026-02-01 17:23:02.313194+00', '2026-02-01 17:23:02.313194+00'), ('b7091347-2b3e-4056-82f3-8d9312b46d51', 'Upper Arm Bush', 'Suspension', '300.00', 'No', 'true', '2026-02-01 17:23:02.313194+00', '2026-02-01 17:23:02.313194+00'), ('d2f7f963-b788-4782-80c4-05a63547f722', 'Brake Disc', 'Brakes', '3500.00', 'No', 'true', '2026-02-01 17:23:02.313194+00', '2026-02-01 17:23:02.313194+00'), ('d5518d21-a36d-4a7b-a80f-0a8eab6c92f4', 'Radiator fan R&R', 'General', '1200.00', 'No', 'true', '2026-02-03 05:52:42.493692+00', '2026-02-03 05:52:42.493692+00'), ('e5c32ef6-610d-4e48-82f0-205e39d012ae', 'Body Bush', 'Suspension', '3800.00', 'Set', 'true', '2026-02-01 17:23:02.313194+00', '2026-02-01 17:23:02.313194+00'), ('e83e7516-7268-4800-86ba-bef303fe90f5', 'Lower Arm Ball', 'Suspension', '960.00', 'No', 'true', '2026-02-01 17:23:02.313194+00', '2026-02-01 17:23:02.313194+00'), ('ebebf6bf-8a6f-4e38-b957-2a92539182a9', 'Lower Arm Bush', 'Suspension', '300.00', 'No', 'true', '2026-02-01 17:23:02.313194+00', '2026-02-01 17:23:02.313194+00'), ('f12209ab-aac0-4577-9fc1-580c5c7e77fc', 'Labor - Denting', 'Labor', '4000.00', 'Hour', 'true', '2026-02-01 17:23:02.313194+00', '2026-02-01 17:23:02.313194+00'), ('f7402594-03f8-49b4-845e-e7cb6c27e6fa', 'Labor - General', 'Labor', '500.00', 'Hour', 'true', '2026-02-01 17:23:02.313194+00', '2026-02-01 17:23:02.313194+00'), ('f9c26924-4187-4986-9f8b-ee40ebcec9e7', 'Labour ', 'General', '600.00', 'No', 'true', '2026-02-03 05:38:14.530748+00', '2026-02-03 05:38:14.530748+00');

-- INVOICES
INSERT INTO "public"."invoices" ("id", "invoice_number", "customer_id", "vehicle_id", "invoice_date", "mileage", "parts_total", "labor_total", "discount_amount", "grand_total", "payment_status", "payment_method", "paid_amount", "balance_amount", "notes", "mechanic_name", "pdf_url", "created_at", "updated_at") VALUES ('00db97ae-5263-49e4-ad50-b671b1ebd425', '2100', 'f93d7e3e-c97c-40fe-a59f-07fd86cb2758', 'e8bbbb31-2cee-4254-85c9-0cff6900b6ba', '2026-02-01', '0', '200.00', '4000.00', '25.00', '4175.00', 'partial', 'cash', '50.00', '4125.00', '', '', null, '2026-02-01 19:27:46.719117+00', '2026-02-02 09:19:32.857022+00'), ('15a6edd1-b13a-4941-b19b-a649df93b585', '2101', 'f93d7e3e-c97c-40fe-a59f-07fd86cb2758', 'e8bbbb31-2cee-4254-85c9-0cff6900b6ba', '2026-02-02', '0', '3600.00', '0.00', '0.00', '3600.00', 'partial', 'cash', '100.00', '3500.00', '', '', null, '2026-02-02 03:42:24.947114+00', '2026-02-02 14:21:01.044947+00'), ('263f8f7c-e2d4-4927-8ec7-9f13367e0cff', '2102', '81e45929-32ab-4029-8139-4ac6d24c1bf3', '080210e9-ba2a-470b-ae23-ca24e2c7bbf7', '2026-02-02', '0', '17000.00', '2000.00', '0.00', '19000.00', 'unpaid', 'cash', '0.00', '19000.00', '', '', null, '2026-02-02 16:09:17.756467+00', '2026-02-02 16:09:18.175482+00'), ('58dd497b-03de-489a-a9ed-4474da697e5c', '2103', '8ca7b193-6378-48f4-a6ff-bd903bc04247', 'f1c5c881-76ba-48e3-94e1-2087ec22f7f3', '2026-02-03', '0', '1200.00', '600.00', '0.00', '1800.00', 'paid', 'cash', '1800.00', '0.00', '', 'Prakash ', null, '2026-02-03 05:38:14.667379+00', '2026-02-03 05:38:15.014627+00'), ('67e7dd62-a4bd-4c74-ac4b-3b93a3a3f942', '2105', 'f6b5dc24-f34c-40d4-9235-261b792f1de5', '3619a4a7-4077-4077-85db-a64997e6a83e', '2026-02-03', '0', '4370.00', '1200.00', '0.00', '5570.00', 'paid', 'cash', '5570.00', '0.00', '', 'Prakash', null, '2026-02-03 05:52:42.644779+00', '2026-02-03 05:52:43.004193+00'), ('f5b47cc0-b697-493f-bb2e-cffe8d867350', '2104', 'fe8a8541-f708-40f4-8024-30cd9ad861e2', '52f66fd8-d599-4e7c-8eae-42ac3fa188ab', '2026-02-03', '0', '1100.00', '700.00', '0.00', '1800.00', 'paid', 'cash', '1800.00', '0.00', '', 'Prakash', null, '2026-02-03 05:46:28.045334+00', '2026-02-03 05:46:28.363287+00');

-- INVOICE ITEMS
INSERT INTO "public"."invoice_items" ("id", "invoice_id", "part_id", "description", "category", "quantity", "unit", "rate", "amount", "item_type", "created_at") VALUES ('03d40335-cc0b-4772-abb4-7a99b326c0de', '67e7dd62-a4bd-4c74-ac4b-3b93a3a3f942', null, 'Radiator fan R&R', 'General', '1.00', 'No', '1200.00', '1200.00', 'labor', '2026-02-03 05:52:42.836991+00'), ('0974e0bd-9e54-457b-848f-f4f57407a4d6', '15a6edd1-b13a-4941-b19b-a649df93b585', '8bf944e0-556a-4d5a-8000-8fdf86b8d163', 'Engine Oil', 'Engine', '1.00', 'Ltr', '2500.00', '2500.00', 'part', '2026-02-02 14:21:00.94375+00'), ('0eea2fe6-87c8-41f5-b44e-62e31419521f', '58dd497b-03de-489a-a9ed-4474da697e5c', null, 'Belt', 'General', '2.00', 'No', '400.00', '800.00', 'part', '2026-02-03 05:38:14.851776+00'), ('2113d7d1-8355-476e-afdb-688981f6ac2d', '00db97ae-5263-49e4-ad50-b671b1ebd425', 'f12209ab-aac0-4577-9fc1-580c5c7e77fc', 'Labor - Denting', 'Labor', '1.00', 'Hour', '4000.00', '4000.00', 'labor', '2026-02-02 09:19:32.772595+00'), ('42669964-1b1d-4e35-a9c7-90f66774d94d', '15a6edd1-b13a-4941-b19b-a649df93b585', 'a0ee2467-942b-4e2d-a576-85daa10c0c1e', 'Air Filter', 'Engine', '1.00', 'No', '600.00', '600.00', 'part', '2026-02-02 14:21:00.94375+00'), ('48031b32-8100-4709-bb7d-3517d7dcfeff', '00db97ae-5263-49e4-ad50-b671b1ebd425', null, 'Oil Filter', 'General', '1.00', 'No', '200.00', '200.00', 'part', '2026-02-02 09:19:32.772595+00'), ('681e57fd-26ba-437b-943f-60cfff10c5ac', '67e7dd62-a4bd-4c74-ac4b-3b93a3a3f942', null, 'Past ', 'General', '1.00', 'No', '120.00', '120.00', 'part', '2026-02-03 05:52:42.836991+00'), ('6b1a98a2-6e0c-4395-8bd1-344518296ac2', '263f8f7c-e2d4-4927-8ec7-9f13367e0cff', 'e5c32ef6-610d-4e48-82f0-205e39d012ae', 'Body Bush', 'Suspension', '3.00', 'Set', '3800.00', '11400.00', 'part', '2026-02-02 16:09:17.983903+00'), ('72e2ebbb-7d53-4161-b041-a637825fd380', '15a6edd1-b13a-4941-b19b-a649df93b585', 'f7402594-03f8-49b4-845e-e7cb6c27e6fa', 'Labor - General', 'Labor', '1.00', 'Hour', '500.00', '500.00', 'part', '2026-02-02 14:21:00.94375+00'), ('84026ca1-d033-467a-b53b-ff577a4d6309', '67e7dd62-a4bd-4c74-ac4b-3b93a3a3f942', null, 'Moter assy radiator fan', 'General', '1.00', 'No', '4000.00', '4000.00', 'part', '2026-02-03 05:52:42.836991+00'), ('88d45688-60dc-4c4c-8a48-39da9b011ebd', '263f8f7c-e2d4-4927-8ec7-9f13367e0cff', '8bf944e0-556a-4d5a-8000-8fdf86b8d163', 'Engine Oil', 'Engine', '2.00', 'Ltr', '2500.00', '5000.00', 'part', '2026-02-02 16:09:17.983903+00'), ('bcec3438-2cdd-4a2d-94fe-c8b8657e7886', '263f8f7c-e2d4-4927-8ec7-9f13367e0cff', null, 'Labour', 'General', '2.00', 'No', '1000.00', '2000.00', 'labor', '2026-02-02 16:09:17.983903+00'), ('c30f1ecc-d77e-4cd2-9a28-a3f1be6c18fe', '58dd497b-03de-489a-a9ed-4474da697e5c', null, 'ACC Cable ', 'General', '1.00', 'No', '400.00', '400.00', 'part', '2026-02-03 05:38:14.851776+00'), ('e05b2688-c6ca-4128-9ccd-e4d86d66f3ee', '263f8f7c-e2d4-4927-8ec7-9f13367e0cff', 'ebebf6bf-8a6f-4e38-b957-2a92539182a9', 'Lower Arm Bush', 'Suspension', '2.00', 'No', '300.00', '600.00', 'part', '2026-02-02 16:09:17.983903+00'), ('e3cd33fe-476a-4421-9662-f7354e333987', '58dd497b-03de-489a-a9ed-4474da697e5c', null, 'Labour ', 'General', '1.00', 'No', '600.00', '600.00', 'labor', '2026-02-03 05:38:14.851776+00'), ('e7d74c41-5413-45aa-9b89-33da7cd7d7c9', 'f5b47cc0-b697-493f-bb2e-cffe8d867350', null, 'Labour ', 'General', '1.00', 'No', '700.00', '700.00', 'labor', '2026-02-03 05:46:28.210405+00'), ('f9a4368a-2f42-4c85-948f-d6d571264ac6', '67e7dd62-a4bd-4c74-ac4b-3b93a3a3f942', null, 'Coolant ', 'General', '1.00', 'No', '250.00', '250.00', 'part', '2026-02-03 05:52:42.836991+00'), ('fe24433b-330a-47d0-99a1-5c62958a2536', 'f5b47cc0-b697-493f-bb2e-cffe8d867350', null, 'Wheel cylinders ', 'General', '2.00', 'No', '550.00', '1100.00', 'part', '2026-02-03 05:46:28.210405+00');

-- 5. POST-DATA FIXES
-- Reset invoice sequence to avoid conflicts with imported data
SELECT setval('invoice_number_seq', (SELECT MAX(invoice_number::int) FROM invoices));
