-- Reset GR Installment Manager Data
-- This script removes all test data but keeps the database structure and default product

-- WARNING: This will delete ALL customer, sales, and payment data!
-- Make sure you want to do this before running.

-- Delete data in the correct order to respect foreign key constraints

-- 1. Delete payments first (they reference sales)
DELETE FROM payments;

-- 2. Delete registration fees 
DELETE FROM registration_fees;

-- 3. Delete sales (they reference customers and products)
DELETE FROM sales;

-- 4. Delete customers (but keep the users table for login)
DELETE FROM customers;

-- 5. Reset inventory (optional - uncomment if you want to reset stock levels)
-- DELETE FROM inventory;

-- 6. Reset audit log (optional - uncomment if you want to clear audit trail)
-- DELETE FROM audit_log;

-- Reset auto-increment sequences (if using serial IDs)
-- Note: Supabase uses UUIDs, so no sequence reset needed

-- Re-insert default inventory for FM Tyre if you deleted it
DO $$
DECLARE
    product_id UUID;
BEGIN
    SELECT id INTO product_id 
    FROM products 
    WHERE name = 'FM Tyre' 
    LIMIT 1;

    IF product_id IS NOT NULL THEN
        INSERT INTO inventory (
            product_id,
            quantity_in_stock,
            reorder_level,
            last_restocked
        ) VALUES (
            product_id,
            50,  -- Starting with 50 tires
            10,  -- Alert when below 10
            CURRENT_DATE
        )
        ON CONFLICT (product_id) DO UPDATE SET
            quantity_in_stock = 50,
            reorder_level = 10,
            last_restocked = CURRENT_DATE;
        
        RAISE NOTICE 'Inventory reset for FM Tyre: 50 units in stock';
    END IF;
END $$;

-- Show summary of remaining data
SELECT 
    'customers' as table_name, 
    COUNT(*) as remaining_records 
FROM customers
UNION ALL
SELECT 
    'sales' as table_name, 
    COUNT(*) as remaining_records 
FROM sales
UNION ALL
SELECT 
    'payments' as table_name, 
    COUNT(*) as remaining_records 
FROM payments
UNION ALL
SELECT 
    'users' as table_name, 
    COUNT(*) as remaining_records 
FROM users;

-- Success message
SELECT 'Database reset completed successfully!' as status;

