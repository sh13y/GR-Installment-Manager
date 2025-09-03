-- Create Default Admin User for FM Tire Management System
-- Run this AFTER running the main schema.sql

-- First, let's create the admin user in Supabase auth
-- This needs to be done through Supabase Auth, not directly in the database

-- Method 1: Using Supabase Dashboard (Recommended)
-- 1. Go to Authentication > Users in Supabase Dashboard
-- 2. Click "Add user"
-- 3. Enter:
--    Email: admin@fmtire.com
--    Password: password123
--    Confirm password: password123
-- 4. Click "Create user"
-- 5. Copy the User ID from the created user

-- Method 2: Using SQL (Alternative - may not work in all Supabase versions)
-- If Method 1 doesn't work, you can try this approach:

-- Replace 'USER_ID_FROM_AUTH_USER' with the actual UUID from auth.users table
-- You can get this by running: SELECT id FROM auth.users WHERE email = 'admin@fmtire.com';

-- Example INSERT (replace the UUID with the actual one):
-- INSERT INTO users (
--     id,
--     email,
--     password_hash,
--     role,
--     full_name,
--     nic_number,
--     phone,
--     is_active
-- ) VALUES (
--     'USER_ID_FROM_AUTH_USER',  -- Replace with actual UUID from auth.users
--     'admin@fmtire.com',
--     'dummy_hash',  -- This is not used for authentication in Supabase
--     'super_admin',
--     'System Administrator',
--     '123456789V',
--     '0771234567',
--     true
-- );

-- Method 3: Programmatic approach (after creating auth user)
-- Once you have created the auth user, run this with the correct UUID:

DO $$
DECLARE
    auth_user_id UUID;
BEGIN
    -- Get the auth user ID (you need to create the auth user first)
    SELECT id INTO auth_user_id 
    FROM auth.users 
    WHERE email = 'admin@fmtire.com' 
    LIMIT 1;

    -- Only insert if auth user exists and profile doesn't exist
    IF auth_user_id IS NOT NULL THEN
        INSERT INTO users (
            id,
            email,
            password_hash,
            role,
            full_name,
            nic_number,
            phone,
            is_active
        ) VALUES (
            auth_user_id,
            'admin@fmtire.com',
            'managed_by_supabase_auth',
            'super_admin',
            'System Administrator',
            '123456789V',
            '0771234567',
            true
        )
        ON CONFLICT (id) DO NOTHING;
        
        RAISE NOTICE 'Admin user profile created successfully with ID: %', auth_user_id;
    ELSE
        RAISE NOTICE 'Auth user not found. Please create the auth user first.';
    END IF;
END $$;

-- Initialize default inventory for FM Tyre
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
        ON CONFLICT DO NOTHING;
        
        RAISE NOTICE 'Default inventory created for FM Tyre';
    END IF;
END $$;

