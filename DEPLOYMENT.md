# Deployment Guide for Vercel

## The Problem
Your application works in development but fails on Vercel because:

1. **Hardcoded API URLs**: The API configuration was hardcoded to use production URLs instead of environment variables
2. **Missing Environment Variables**: Vercel needs proper environment variable configuration
3. **SPA Routing**: React Router needs proper configuration for client-side routing

## What Was Fixed

### 1. API Configuration (`src/api/api.ts`)
- ✅ Updated to use `VITE_API_BASE` environment variable
- ✅ Falls back to production URL if environment variable is not set
- ✅ Fixed hardcoded URL in `ClientsList.tsx`

### 2. Environment Files
- ✅ `.env` - Development configuration
- ✅ `.env.production` - Production configuration
- ✅ `vercel.json` - Vercel deployment configuration

### 3. Vercel Configuration (`vercel.json`)
- ✅ SPA routing support (all routes redirect to index.html)
- ✅ CORS headers for API requests
- ✅ Environment variable configuration

## Deployment Steps

### Option 1: Deploy via Vercel Dashboard
1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. In **Environment Variables** section, add:
   ```
   VITE_API_BASE = https://esnad-serevr.onrender.com
   ```
4. Deploy

### Option 2: Deploy via Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Set environment variable
vercel env add VITE_API_BASE
# Enter: https://esnad-serevr.onrender.com

# Redeploy with new environment
vercel --prod
```

## Environment Variables

### Development (`.env`)
```env
VITE_API_BASE=http://localhost:4000
```

### Production (Vercel Dashboard or `.env.production`)
```env
VITE_API_BASE=https://esnad-serevr.onrender.com
```

## Troubleshooting

### If API calls still fail:
1. Check Vercel function logs
2. Verify environment variables in Vercel dashboard
3. Ensure backend server (esnad-serevr.onrender.com) is running
4. Check CORS configuration on backend

### If routing doesn't work:
- The `vercel.json` file handles SPA routing
- All routes redirect to `index.html` for client-side routing

### If environment variables don't work:
1. Make sure they start with `VITE_` (not `REACT_APP_`)
2. Rebuild after adding environment variables
3. Check Vercel dashboard > Project > Settings > Environment Variables

## Backend Considerations

Your backend at `https://esnad-serevr.onrender.com` should:
1. Allow CORS from your Vercel domain
2. Handle preflight OPTIONS requests
3. Be accessible from external domains

## Next Steps

1. **Deploy to Vercel** using the steps above
2. **Test all functionality** on the deployed version
3. **Monitor logs** for any remaining issues
4. **Update backend CORS** if needed to allow your Vercel domain

---

**Note**: The fixes ensure your app will work in both development (localhost:4000) and production (esnad-serevr.onrender.com) environments automatically.