-- Create customer feedback table
CREATE TABLE IF NOT EXISTS customer_feedback (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    feedback_text TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_customer_feedback_customer_id ON customer_feedback(customer_id);
CREATE INDEX idx_customer_feedback_created_at ON customer_feedback(created_at);
CREATE INDEX idx_customer_feedback_rating ON customer_feedback(rating);

-- Add RLS (Row Level Security) policies
ALTER TABLE customer_feedback ENABLE ROW LEVEL SECURITY;

-- Policy: Customers can only see their own feedback
CREATE POLICY "Customers can view own feedback" ON customer_feedback
    FOR SELECT USING (auth.uid()::text = customer_id::text);

-- Policy: Customers can only insert their own feedback
CREATE POLICY "Customers can insert own feedback" ON customer_feedback
    FOR INSERT WITH CHECK (auth.uid()::text = customer_id::text);

-- Policy: Customers can only update their own feedback (if needed)
CREATE POLICY "Customers can update own feedback" ON customer_feedback
    FOR UPDATE USING (auth.uid()::text = customer_id::text);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_customer_feedback_updated_at 
    BEFORE UPDATE ON customer_feedback 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Add vehicle deactivation fields to vehicles table
ALTER TABLE vehicles 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS deactivated_at TIMESTAMP WITH TIME ZONE NULL,
ADD COLUMN IF NOT EXISTS deactivation_reason TEXT NULL;

-- Create index for active vehicles
CREATE INDEX IF NOT EXISTS idx_vehicles_active ON vehicles(customer_id, is_active);

-- Add communication preferences to customers table
ALTER TABLE customers 
ADD COLUMN IF NOT EXISTS emergency_contact_name TEXT NULL,
ADD COLUMN IF NOT EXISTS emergency_contact_phone TEXT NULL,
ADD COLUMN IF NOT EXISTS communication_preferences JSONB DEFAULT '{"sms": true, "email": true, "whatsapp": false}'::jsonb;

-- Add notes field to vehicles table
ALTER TABLE vehicles 
ADD COLUMN IF NOT EXISTS notes TEXT NULL,
ADD COLUMN IF NOT EXISTS contact_preferences JSONB DEFAULT '{"sms": true, "email": true, "whatsapp": false}'::jsonb;
