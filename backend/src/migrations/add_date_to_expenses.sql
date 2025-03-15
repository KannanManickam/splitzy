-- Add date column to expenses table
ALTER TABLE expenses
ADD COLUMN date TIMESTAMP WITH TIME ZONE;

-- Set default value for existing rows
UPDATE expenses 
SET date = created_at 
WHERE date IS NULL;

-- Make date column not null after updating existing rows
ALTER TABLE expenses 
ALTER COLUMN date SET NOT NULL;
