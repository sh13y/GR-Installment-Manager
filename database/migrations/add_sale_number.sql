-- Migration: Add sale_number column to sales table
-- This migration adds a sale_number field to help identify sales easily
-- Format: S-YYYYMMDD-NNNN (e.g., S-20250905-0001)

-- Step 1: Add the sale_number column
ALTER TABLE sales 
ADD COLUMN sale_number VARCHAR(20) UNIQUE;

-- Step 2: Create a function to generate sale numbers
CREATE OR REPLACE FUNCTION generate_sale_number()
RETURNS TEXT AS $$
DECLARE
    today_date TEXT;
    next_number INTEGER;
    sale_number TEXT;
BEGIN
    -- Get today's date in YYYYMMDD format
    today_date := to_char(CURRENT_DATE, 'YYYYMMDD');
    
    -- Find the next number for today
    SELECT COALESCE(MAX(CAST(substring(sale_number from 13 for 4) AS INTEGER)), 0) + 1
    INTO next_number
    FROM sales 
    WHERE sale_number LIKE 'S-' || today_date || '-%';
    
    -- Format the sale number
    sale_number := 'S-' || today_date || '-' || LPAD(next_number::TEXT, 4, '0');
    
    RETURN sale_number;
END;
$$ LANGUAGE plpgsql;

-- Step 3: Create a trigger function to auto-assign sale numbers for new sales
CREATE OR REPLACE FUNCTION assign_sale_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.sale_number IS NULL THEN
        NEW.sale_number := generate_sale_number();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 4: Create the trigger
DROP TRIGGER IF EXISTS assign_sale_number_trigger ON sales;
CREATE TRIGGER assign_sale_number_trigger
    BEFORE INSERT ON sales
    FOR EACH ROW
    EXECUTE FUNCTION assign_sale_number();

-- Step 5: Backfill existing sales with sale numbers
-- This will assign sale numbers based on creation date
DO $$
DECLARE
    sale_record RECORD;
    sale_date TEXT;
    counter INTEGER;
    sale_number TEXT;
BEGIN
    counter := 1;
    
    -- Process sales in order of creation date
    FOR sale_record IN 
        SELECT id, created_at::DATE as sale_date_only
        FROM sales 
        WHERE sale_number IS NULL
        ORDER BY created_at
    LOOP
        -- Get date in YYYYMMDD format
        sale_date := to_char(sale_record.sale_date_only, 'YYYYMMDD');
        
        -- Reset counter for each new date
        IF sale_date != COALESCE(LAG(to_char(sale_record.sale_date_only, 'YYYYMMDD')) OVER (ORDER BY sale_record.sale_date_only), '') THEN
            counter := 1;
        END IF;
        
        -- Generate sale number
        sale_number := 'S-' || sale_date || '-' || LPAD(counter::TEXT, 4, '0');
        
        -- Update the sale
        UPDATE sales 
        SET sale_number = sale_number 
        WHERE id = sale_record.id;
        
        counter := counter + 1;
    END LOOP;
END $$;

-- Step 6: Make sale_number NOT NULL after backfill
ALTER TABLE sales 
ALTER COLUMN sale_number SET NOT NULL;

-- Step 7: Create an index on sale_number for performance
CREATE INDEX IF NOT EXISTS idx_sales_sale_number ON sales(sale_number);

-- Verification query (uncomment to check results)
-- SELECT sale_number, customer_id, sale_date, created_at 
-- FROM sales 
-- ORDER BY sale_number;
