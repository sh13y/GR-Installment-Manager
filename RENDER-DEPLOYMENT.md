# Render Deployment Guide for GR Installment Manager

## Prerequisites
1. Your code is committed and pushed to GitHub
2. You have a Render account (https://render.com)
3. Your Supabase project is set up and running

## Step 1: Prepare Environment Variables
Before deploying, make sure you have these values from your Supabase project:
- `NEXT_PUBLIC_SUPABASE_URL`: https://wzycrzruvgblluqwqvjc.supabase.co
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: (from your .env.local file)
- `SUPABASE_SERVICE_ROLE_KEY`: (from your .env.local file)

## Step 2: Deploy to Render
1. Go to https://render.com and sign in
2. Click "New +" and select "Web Service"
3. Connect your GitHub repository: `sh13y/fm-tire-management`
4. Configure the service:
   - **Name**: `gr-installment-manager`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Branch**: `main`

## Step 3: Add Environment Variables
In the Render dashboard, go to "Environment" and add:

```
NODE_ENV=production
NEXT_PUBLIC_SUPABASE_URL=https://wzycrzruvgblluqwqvjc.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind6eWNyenJ1dmdibGx1cXdxdmpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY4NDA1MTksImV4cCI6MjA3MjQxNjUxOX0.lwmNX4FLK4LeSFeDEEE8OpbTQOnuLcg10FOKSg26oME
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind6eWNyenJ1dmdibGx1cXdxdmpjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Njg0MDUxOSwiZXhwIjoyMDcyNDE2NTE5fQ.RDhXk_gwhfMdUuKI0ILjDhR5BsBZBDnI4A0mdFMol1w
NEXTAUTH_SECRET=generate_a_random_string_here
NEXTAUTH_URL=https://your-app-name.onrender.com
```

**Important**: Replace `your-app-name` with your actual Render app name in the NEXTAUTH_URL.

## Step 4: Deploy
1. Click "Create Web Service"
2. Render will automatically build and deploy your app
3. Monitor the deployment logs for any issues

## Step 5: Test the Deployment
1. Once deployed, visit your Render URL
2. Go to `/debug` page to test Supabase connectivity
3. Test the login with your admin credentials:
   - Email: `eworks.rajapaksha@gmail.com`
   - Password: (the one you set in Supabase)

## Post-Deployment Steps
1. Update your Supabase Authentication settings:
   - Go to Supabase Dashboard → Authentication → URL Configuration
   - Add your Render domain to the "Site URL" and "Redirect URLs"
2. Test all functionality including login, data entry, and reports

## Troubleshooting
- If build fails, check the build logs in Render dashboard
- If authentication issues occur, verify all environment variables are correct
- Use the `/debug` page to test Supabase connectivity
- Check Supabase logs for any database connection issues

Your GR Installment Manager should now be live and accessible worldwide! 🚀
