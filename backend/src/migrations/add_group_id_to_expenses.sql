-- Add group_id column to expenses table
ALTER TABLE expenses 
ADD COLUMN IF NOT EXISTS group_id UUID NULL;

-- Add foreign key constraint
ALTER TABLE expenses
ADD CONSTRAINT fk_expenses_group
FOREIGN KEY (group_id) 
REFERENCES groups(id)
ON DELETE SET NULL;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_expenses_group_id 
ON expenses(group_id);