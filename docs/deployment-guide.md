# GR Installment Manager - Deployment Guide

## Prerequisites

1. **Node.js 18+** installed on your system
2. **Supabase account** (free tier available)
3. **Git** for version control
4. **Code editor** (VS Code recommended)

## Setup Instructions

### 1. Clone and Setup Project

```bash
# Clone the repository
git clone <repository-url>
cd fm-tire-management

# Install dependencies
npm install
```

### 2. Supabase Database Setup

#### Step 1: Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Sign up/Login to your account
3. Click "New Project"
4. Choose your organization
5. Fill in project details:
   - Name: FM Tire Management
   - Database Password: (save this securely)
   - Region: (choose closest to your location)
6. Click "Create new project"

#### Step 2: Setup Database Schema
1. Wait for project initialization (2-3 minutes)
2. Go to the SQL Editor in Supabase dashboard
3. Copy and paste the entire content from `database/schema.sql`
4. Click "Run" to execute the schema

#### Step 3: Create Default Admin User
Run this SQL in Supabase SQL Editor:

```sql
-- Insert default admin user (you can change these details)
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_user_meta_data,
  raw_app_meta_data,
  is_super_admin,
  role
) VALUES (
  gen_random_uuid(),
  'admin@fmtire.com',
  crypt('password123', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"full_name":"System Administrator"}',
  '{"provider":"email","providers":["email"]}',
  true,
  'authenticated'
);

-- Insert corresponding user profile
INSERT INTO users (
  id,
  email,
  full_name,
  nic_number,
  role,
  is_active
) VALUES (
  (SELECT id FROM auth.users WHERE email = 'admin@fmtire.com'),
  'admin@fmtire.com',
  'System Administrator',
  '123456789V',
  'super_admin',
  true
);
```

### 3. Environment Configuration

#### Step 1: Get Supabase Credentials
1. In Supabase Dashboard, go to Settings > API
2. Copy the following:
   - Project URL
   - Anon/Public Key
   - Service Role Key (keep secret)

#### Step 2: Create Environment File
1. Copy `env.example` to `.env.local`:
```bash
cp env.example .env.local
```

2. Fill in your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
NEXTAUTH_SECRET=your_random_secret_key
NEXTAUTH_URL=http://localhost:3000
NODE_ENV=development
```

### 4. Run Development Server

```bash
# Start the development server
npm run dev

# Open browser and go to:
# http://localhost:3000
```

### 5. First Login

1. Go to `http://localhost:3000`
2. You'll be redirected to login page
3. Use default credentials:
   - Email: `admin@fmtire.com`
   - Password: `password123`

**Important:** Change these credentials immediately after first login!

## Production Deployment

### Option 1: Vercel (Recommended)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your GitHub repository
4. Add environment variables in Vercel dashboard
5. Deploy

### Option 2: Netlify

1. Build the project: `npm run build`
2. Upload `out` folder to Netlify
3. Configure environment variables
4. Set up custom domain (optional)

### Option 3: Self-Hosted

1. Use a VPS (DigitalOcean, AWS, etc.)
2. Install Node.js and PM2
3. Clone repository and install dependencies
4. Build project: `npm run build`
5. Start with PM2: `pm2 start npm --name "fm-tire" -- start`
6. Setup Nginx reverse proxy
7. Configure SSL certificate

## Post-Deployment Steps

### 1. Security Configuration

1. **Change Default Password**
   - Login with default credentials
   - Go to Profile settings
   - Update password immediately

2. **Setup Row Level Security**
   - Review RLS policies in Supabase
   - Ensure proper access controls

3. **Configure Backup**
   - Setup automated Supabase backups
   - Export initial data regularly

### 2. Business Configuration

1. **Update Business Constants**
   - Edit `src/utils/constants.ts`
   - Adjust prices, fees as needed
   - Update company information

2. **Add Additional Users**
   - Create staff accounts through Users page
   - Assign appropriate roles

3. **Setup Data Entry**
   - Add initial tire inventory
   - Import existing customer data (if any)

## Maintenance

### Daily Tasks
- Monitor dashboard for payments due
- Check system health in Supabase
- Backup critical data

### Weekly Tasks
- Review user activity logs
- Update inventory levels
- Generate business reports

### Monthly Tasks
- Update security patches
- Review and optimize database performance
- Analyze business metrics

## Troubleshooting

### Common Issues

1. **Login Problems**
   - Check Supabase auth settings
   - Verify environment variables
   - Clear browser cache

2. **Database Errors**
   - Check RLS policies
   - Verify table permissions
   - Review SQL logs in Supabase

3. **Performance Issues**
   - Monitor database queries
   - Check API response times
   - Optimize table indexes

### Support

For technical support:
1. Check application logs
2. Review Supabase dashboard
3. Contact system administrator

## Scaling Considerations

### When to Scale
- More than 1000 customers
- High concurrent users (50+)
- Large payment volumes

### Scaling Options
1. **Database**: Upgrade Supabase plan
2. **Frontend**: Use CDN for static assets
3. **Compute**: Upgrade hosting plan
4. **Monitoring**: Add application monitoring tools

## Security Best Practices

1. **Regular Updates**
   - Keep dependencies updated
   - Monitor security advisories
   - Apply patches promptly

2. **Access Control**
   - Use strong passwords
   - Enable 2FA where possible
   - Regular access review

3. **Data Protection**
   - Regular backups
   - Encrypt sensitive data
   - Audit data access

4. **Monitoring**
   - Log all user actions
   - Monitor failed login attempts
   - Set up alerts for suspicious activity
