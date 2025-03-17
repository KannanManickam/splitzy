-- Add paid_by column to expenses table
ALTER TABLE expenses ADD COLUMN paid_by uuid REFERENCES users(id);

-- Set paid_by to created_by for existing records
UPDATE expenses SET paid_by = created_by WHERE paid_by IS NULL;

-- Make paid_by not nullable
ALTER TABLE expenses ALTER COLUMN paid_by SET NOT NULL;