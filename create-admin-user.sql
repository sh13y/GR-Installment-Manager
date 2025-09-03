-- Create Admin User Profile for GR Installment Manager
-- UUID from your Supabase auth user: 080b1167-0ed2-47a8-98d7-ffa9ae52966f

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
    '080b1167-0ed2-47a8-98d7-ffa9ae52966f',
    'admin@fmtire.com',
    'managed_by_supabase_auth',
    'super_admin',
    'System Administrator',
    '123456789V',
    '0771234567',
    true
);

-- Verify the user was created
SELECT id, email, role, full_name, is_active FROM users WHERE email = 'admin@fmtire.com';

