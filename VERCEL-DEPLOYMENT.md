# Vercel Deployment Guide for GR Installment Manager

## Why Vercel is Perfect for This Project
- ✅ **Native Next.js support** - Built by the Next.js team
- ✅ **No sleeping** - Apps don't go offline like Render free tier
- ✅ **Global CDN** - Fast worldwide performance
- ✅ **Automatic deployments** - Deploys on every git push
- ✅ **Free tier** - Generous limits for small projects

## Prerequisites
1. Your code is pushed to GitHub ✅
2. A Vercel account (https://vercel.com)
3. Your Supabase project running ✅

## Step 1: Deploy to Vercel

### Option A: Via Vercel Dashboard (Recommended)
1. Go to https://vercel.com and sign up/sign in
2. Click "New Project"
3. Import your GitHub repository: `sh13y/fm-tire-management`
4. Vercel will auto-detect it's a Next.js project
5. Configure settings:
   - **Project Name**: `gr-installment-manager`
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `.` (or leave blank)
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `.next` (auto-detected)
   - **Install Command**: `npm install` (auto-detected)

### Option B: Via Vercel CLI
```bash
npm i -g vercel
vercel login
vercel --prod
```

## Step 2: Configure Environment Variables

In Vercel Dashboard → Settings → Environment Variables, add:

```
NODE_ENV=production
NEXT_PUBLIC_SUPABASE_URL=https://wzycrzruvgblluqwqvjc.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind6eWNyenJ1dmdibGx1cXdxdmpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY4NDA1MTksImV4cCI6MjA3MjQxNjUxOX0.lwmNX4FLK4LeSFeDEEE8OpbTQOnuLcg10FOKSg26oME
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind6eWNyenJ1dmdibGx1cXdxdmpjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Njg0MDUxOSwiZXhwIjoyMDcyNDE2NTE5fQ.RDhXk_gwhfMdUuKI0ILjDhR5BsBZBDnI4A0mdFMol1w
NEXTAUTH_SECRET=your_secure_random_string_here
```

**Note**: For NEXTAUTH_URL, Vercel automatically sets this based on your domain, so you don't need to add it manually.

## Step 3: Deploy
1. Click "Deploy" in Vercel dashboard
2. Vercel will build and deploy automatically
3. You'll get a live URL like: `https://gr-installment-manager.vercel.app`

## Step 4: Update Supabase Settings
1. Go to Supabase Dashboard → Authentication → URL Configuration
2. Update **Site URL** to: `https://gr-installment-manager.vercel.app`
3. Add to **Redirect URLs**:
   - `https://gr-installment-manager.vercel.app/auth/callback`
   - `https://gr-installment-manager.vercel.app`

## Step 5: Test Your Deployment
1. Visit your live URL
2. Test `/api/ping` endpoint: `https://gr-installment-manager.vercel.app/api/ping`
3. Test `/api/health` endpoint: `https://gr-installment-manager.vercel.app/api/health`
4. Test login with: `eworks.rajapaksha@gmail.com`
5. Check `/debug` page for Supabase connectivity

## Advantages of Vercel vs Render
- ⚡ **Instant cold starts** - No waiting for app to wake up
- 🌍 **Edge functions** - API routes run globally
- 🔄 **Automatic deployments** - Every push to main branch deploys
- 📊 **Built-in analytics** - Performance monitoring included
- 🆓 **Better free tier** - No sleeping, more bandwidth

## Custom Domain (Optional)
If you have a domain, you can add it in Vercel Dashboard → Settings → Domains

## Monitoring
Since Vercel apps don't sleep, you don't need Uptime Robot, but the `/api/ping` and `/api/health` endpoints are still useful for monitoring and health checks.

## Automatic Deployments
Every time you push to GitHub, Vercel will automatically:
1. Build your app
2. Run tests (if any)
3. Deploy to production
4. Give you a preview URL

Your GR Installment Manager will be live and fast worldwide! 🚀
