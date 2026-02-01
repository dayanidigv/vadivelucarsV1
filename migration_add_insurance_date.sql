-- Add insurance_date column to vehicles table
ALTER TABLE vehicles 
ADD COLUMN insurance_date DATE;

-- Create index for insurance date queries (useful for reminders)
CREATE INDEX idx_vehicles_insurance_date ON vehicles(insurance_date);

-- Comment explaining the new column
COMMENT ON COLUMN vehicles.insurance_date IS 'Insurance renewal date for reminder system';
