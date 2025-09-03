-- GR Installment Manager Database Schema
-- Supabase PostgreSQL Database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table for authentication and roles
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('super_admin', 'data_entry_staff')),
    full_name TEXT NOT NULL,
    nic_number TEXT UNIQUE NOT NULL,
    phone TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Customers table
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nic_number TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    address TEXT,
    email TEXT,
    registration_fee_paid BOOLEAN DEFAULT false,
    registration_date DATE DEFAULT CURRENT_DATE,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products table (for tires and future expansion)
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    cost_price DECIMAL(10,2) NOT NULL,
    selling_price DECIMAL(10,2) NOT NULL,
    service_charge DECIMAL(10,2) NOT NULL,
    daily_installment DECIMAL(10,2) NOT NULL,
    max_installments INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sales table
CREATE TABLE sales (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES customers(id),
    product_id UUID NOT NULL REFERENCES products(id),
    sale_date DATE DEFAULT CURRENT_DATE,
    initial_payment DECIMAL(10,2) NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL, -- including service charge
    remaining_balance DECIMAL(10,2) NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('active', 'completed', 'defaulted')),
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payments table for installment tracking
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sale_id UUID NOT NULL REFERENCES sales(id),
    payment_date DATE DEFAULT CURRENT_DATE,
    amount DECIMAL(10,2) NOT NULL,
    payment_method TEXT DEFAULT 'cash',
    notes TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Registration fees table
CREATE TABLE registration_fees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES customers(id),
    amount DECIMAL(10,2) NOT NULL DEFAULT 250.00,
    payment_date DATE DEFAULT CURRENT_DATE,
    payment_method TEXT DEFAULT 'cash',
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inventory table
CREATE TABLE inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id),
    quantity_in_stock INTEGER NOT NULL DEFAULT 0,
    reorder_level INTEGER DEFAULT 10,
    last_restocked DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audit log for tracking changes
CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    table_name TEXT NOT NULL,
    record_id UUID NOT NULL,
    action TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
    old_values JSONB,
    new_values JSONB,
    user_id UUID REFERENCES users(id),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_customers_nic ON customers(nic_number);
CREATE INDEX idx_sales_customer ON sales(customer_id);
CREATE INDEX idx_sales_date ON sales(sale_date);
CREATE INDEX idx_payments_sale ON payments(sale_id);
CREATE INDEX idx_payments_date ON payments(payment_date);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sales_updated_at BEFORE UPDATE ON sales
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inventory_updated_at BEFORE UPDATE ON inventory
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default product (FM Tyre)
INSERT INTO products (name, cost_price, selling_price, service_charge, daily_installment, max_installments)
VALUES ('FM Tyre', 5110.00, 5610.00, 700.00, 57.00, 100);

-- Create views for common queries
CREATE VIEW customer_sales_summary AS
SELECT 
    c.id,
    c.nic_number,
    c.full_name,
    c.phone,
    COUNT(s.id) as total_sales,
    COALESCE(SUM(s.total_amount), 0) as total_sales_amount,
    COALESCE(SUM(s.remaining_balance), 0) as outstanding_balance
FROM customers c
LEFT JOIN sales s ON c.id = s.customer_id AND s.status = 'active'
GROUP BY c.id, c.nic_number, c.full_name, c.phone;

CREATE VIEW payment_summary AS
SELECT 
    s.id as sale_id,
    s.customer_id,
    c.full_name,
    c.nic_number,
    p.name as product_name,
    s.total_amount,
    COALESCE(SUM(pay.amount), 0) as total_paid,
    s.total_amount - COALESCE(SUM(pay.amount), 0) as remaining_balance,
    COUNT(pay.id) as payments_made
FROM sales s
JOIN customers c ON s.customer_id = c.id
JOIN products p ON s.product_id = p.id
LEFT JOIN payments pay ON s.id = pay.sale_id
WHERE s.status = 'active'
GROUP BY s.id, s.customer_id, c.full_name, c.nic_number, p.name, s.total_amount;

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE registration_fees ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view all records" ON users FOR SELECT USING (true);
CREATE POLICY "Super admin can modify users" ON users FOR ALL USING (auth.jwt() ->> 'role' = 'super_admin');

CREATE POLICY "All authenticated users can view customers" ON customers FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "All authenticated users can manage customers" ON customers FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "All authenticated users can view sales" ON sales FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "All authenticated users can manage sales" ON sales FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "All authenticated users can view payments" ON payments FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "All authenticated users can manage payments" ON payments FOR ALL USING (auth.role() = 'authenticated');
