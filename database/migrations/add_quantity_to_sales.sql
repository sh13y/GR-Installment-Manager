-- Add quantity column to sales table
-- This migration adds support for multiple quantities in a single sale

ALTER TABLE sales 
ADD COLUMN quantity INTEGER NOT NULL DEFAULT 1;

-- Add check constraint to ensure quantity is positive
ALTER TABLE sales 
ADD CONSTRAINT sales_quantity_positive CHECK (quantity > 0);

-- Update the comment for the table
COMMENT ON COLUMN sales.quantity IS 'Number of products purchased in this sale';
