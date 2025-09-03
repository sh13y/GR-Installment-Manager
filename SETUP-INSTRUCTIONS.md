# FM Tire Management System - Setup Instructions

## Fix "Invalid Login Credentials" Error

The login error occurs because the default admin user hasn't been created yet. Follow these steps to set up your system:

## Step 1: Supabase Project Setup

### 1.1 Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Sign up or log in to your account
3. Click **"New Project"**
4. Fill in project details:
   - **Name**: FM Tire Management
   - **Database Password**: Choose a strong password (save it!)
   - **Region**: Select closest to your location
5. Click **"Create new project"**
6. Wait 2-3 minutes for initialization

### 1.2 Get Your Credentials
1. In your Supabase dashboard, go to **Settings > API**
2. Copy these values:
   - **Project URL** (e.g., https://xyz.supabase.co)
   - **Anon/Public Key** (starts with eyJhbGciOiJIUzI1NiIsInR5cCI...)
   - **Service Role Key** (starts with eyJhbGciOiJIUzI1NiIsInR5cCI... but different)

## Step 2: Configure Environment Variables

1. Open your project folder: `C:\Users\sh13y\fm-tire-management`
2. Find the file `.env.local` (create it if it doesn't exist)
3. Update it with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
NEXTAUTH_SECRET=your_random_secret_key_here
NEXTAUTH_URL=http://localhost:3000
NODE_ENV=development
```

## Step 3: Setup Database

### 3.1 Run Main Schema
1. In Supabase dashboard, go to **SQL Editor**
2. Click **"New Query"**
3. Copy and paste the entire content from `database/schema.sql`
4. Click **"Run"** (green play button)
5. Wait for "Success" message

### 3.2 Create Admin User
Since we're using Supabase Auth, we need to create the user through the dashboard:

1. In Supabase dashboard, go to **Authentication > Users**
2. Click **"Add user"**
3. Fill in the details:
   - **Email**: `admin@fmtire.com`
   - **Password**: `password123`
   - **Confirm password**: `password123`
4. Click **"Create user"**
5. **Copy the User ID** that appears (looks like: 1234abcd-5678-90ef-ghij-klmnopqrstuv)

### 3.3 Create User Profile
1. Go back to **SQL Editor**
2. Create a new query with this content (replace USER_ID with the copied ID):

```sql
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
    'USER_ID_FROM_STEP_3.2',  -- Replace with the actual UUID
    'admin@fmtire.com',
    'managed_by_supabase_auth',
    'super_admin',
    'System Administrator',
    '123456789V',
    '0771234567',
    true
);
```

3. Replace `'USER_ID_FROM_STEP_3.2'` with the actual User ID you copied
4. Click **"Run"**

## Step 4: Start the Application

1. Open terminal in your project folder
2. Install dependencies (if not done already):
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open browser and go to: `http://localhost:3000`

## Step 5: Test Login

1. You should be redirected to the login page
2. Enter credentials:
   - **Email**: `admin@fmtire.com`
   - **Password**: `password123`
3. Click **"Sign in"**
4. You should now access the dashboard!

## Step 6: Change Default Password (IMPORTANT!)

1. Once logged in, go to your profile settings
2. Change the default password immediately
3. Update the admin email if desired

## Troubleshooting

### If you still get "Invalid credentials":

1. **Check Environment Variables**:
   - Ensure `.env.local` has correct Supabase URL and keys
   - Restart the dev server after changing env vars

2. **Verify Auth User Creation**:
   - In Supabase dashboard, go to Authentication > Users
   - Confirm the admin user exists and is confirmed

3. **Check User Profile**:
   - In SQL Editor, run: `SELECT * FROM users WHERE email = 'admin@fmtire.com';`
   - Should return one row with the user data

4. **Check Console Logs**:
   - Open browser developer tools (F12)
   - Look for error messages in Console tab

5. **Try Alternative Email**:
   - If issues persist, try creating user with your real email instead

### Common Issues:

- **"Auth user not found"**: Create the auth user first through Authentication > Users
- **"Cannot connect to Supabase"**: Check your environment variables
- **"Network error"**: Ensure internet connection and Supabase project is active

## Need Help?

If you're still having issues:

1. **Check Supabase Status**: Make sure your project is active and running
2. **Verify Credentials**: Double-check all copied keys and URLs
3. **Clear Browser Cache**: Sometimes helps with auth issues
4. **Restart Dev Server**: Stop (Ctrl+C) and start again with `npm run dev`

## Success Checklist

✅ Supabase project created  
✅ Database schema imported  
✅ Environment variables configured  
✅ Auth user created in Supabase dashboard  
✅ User profile created in users table  
✅ Application starts without errors  
✅ Can login with admin@fmtire.com / password123  
✅ Dashboard loads successfully  

Once all checkboxes are complete, your system is ready to use!

