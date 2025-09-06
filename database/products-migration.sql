-- Add RLS policies for products table and insert default product
-- Migration: Add products RLS and default data

-- Add RLS policy for products table
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "All authenticated users can view products" ON products FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Super admin can manage products" ON products FOR ALL USING (auth.jwt() ->> 'role' = 'super_admin');

-- Insert default FM Tyre product (based on current business constants)
INSERT INTO products (
    name,
    cost_price,
    selling_price,
    service_charge,
    daily_installment,
    max_installments,
    is_active
) VALUES (
    'FM Tyre',
    5110.00,  -- TIRE_COST_PRICE
    5610.00,  -- TIRE_SELLING_PRICE  
    700.00,   -- SERVICE_CHARGE
    57.00,    -- DAILY_INSTALLMENT
    100,      -- MAX_INSTALLMENTS
    true
)
ON CONFLICT DO NOTHING;

-- Insert additional default products for demonstration
INSERT INTO products (
    name,
    cost_price,
    selling_price,
    service_charge,
    daily_installment,
    max_installments,
    is_active
) VALUES 
(
    'Premium Motorcycle Tyre 120/80-17',
    6500.00,
    7200.00,
    800.00,
    80.00,
    100,
    true
),
(
    'Standard Motorcycle Tyre 100/90-17',
    4200.00,
    4800.00,
    600.00,
    54.00,
    100,
    true
),
(
    'Heavy Duty Motorcycle Tyre 130/90-17',
    7800.00,
    8500.00,
    900.00,
    94.00,
    100,
    true
)
ON CONFLICT DO NOTHING;
