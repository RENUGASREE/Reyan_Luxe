# Reyan Luxe - Deployment Guide

This guide walks you through deploying Reyan Luxe to production using MongoDB Atlas (database) and Render (frontend + backend).

## Prerequisites

- MongoDB Atlas account (free tier available)
- Render account (free tier available)
- Git repository (GitHub, GitLab, or Bitbucket)
- Razorpay account (for payments)

## Step 1: MongoDB Atlas Setup

1. **Create MongoDB Atlas Account**
   - Go to https://www.mongodb.com/cloud/atlas
   - Sign up for a free account

2. **Create a Cluster**
   - Click "Build a Database"
   - Choose "M0 Sandbox" (free tier)
   - Select a region closest to your users
   - Name your cluster (e.g., "reyan-luxe")
   - Click "Create"

3. **Configure Network Access**
   - Go to "Network Access" → "IP Access"
   - Add IP: `0.0.0.0/0` (allows all IPs - for Render)
   - Click "Confirm"

4. **Create Database User**
   - Go to "Database Access" → "MongoDB Users"
   - Click "Create New User"
   - Username: Choose a username (e.g., "reyan_admin")
   - Password: Generate a strong password (save this!)
   - Database User Privileges: "Read and write to any database"
   - Click "Create User"

5. **Get Connection String**
   - Go to "Database" → "Connect"
   - Click "Connect your application"
   - Driver: Node.js
   - Version: Select latest
   - Copy the connection string
   - Replace `<password>` with your actual password
   - Example: `mongodb+srv://reyan_admin:your_password@reyan-luxe.xxxxx.mongodb.net/reyan_luxe?retryWrites=true&w=majority`

## Step 2: Push Code to Git Repository

1. **Initialize Git (if not already done)**
   ```bash
   cd g:\my works\reyan
   git init
   ```

2. **Create .gitignore**
   - Ensure `.env` is in .gitignore (already should be)
   - Ensure `node_modules/` is in .gitignore
   - Ensure `dist/` is in .gitignore

3. **Commit and Push**
   ```bash
   git add .
   git commit -m "Production ready - Reyan Luxe"
   git remote add origin <your-git-repo-url>
   git push -u origin main
   ```

## Step 3: Deploy Backend to Render

1. **Create New Web Service**
   - Go to https://dashboard.render.com
   - Click "New +" → "Web Service"
   - Connect your Git repository
   - Select the `reyan` repository
   - Root directory: `server`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`

2. **Configure Environment Variables**
   Add the following environment variables in Render:

   | Key | Value |
   |-----|-------|
   | NODE_ENV | production |
   | PORT | 8000 |
   | API_PREFIX | /api/v1 |
   | MONGODB_URI | Your MongoDB Atlas connection string |
   | CORS_ORIGINS | https://your-frontend-domain.onrender.com |
   | JWT_ACCESS_SECRET | Generate a 32+ character random string |
   | JWT_REFRESH_SECRET | Generate a different 32+ character random string |
   | JWT_ACCESS_EXPIRES_IN | 15m |
   | JWT_REFRESH_EXPIRES_IN | 7d |
   | RAZORPAY_KEY_ID | Your Razorpay Key ID |
   | RAZORPAY_KEY_SECRET | Your Razorpay Key Secret |
   | RAZORPAY_WEBHOOK_SECRET | Your Razorpay Webhook Secret |
   | GOOGLE_CLIENT_ID | Your Google OAuth Client ID (optional) |
   | GOOGLE_CLIENT_SECRET | Your Google OAuth Client Secret (optional) |
   | SMTP_HOST | smtp.gmail.com |
   | SMTP_PORT | 587 |
   | SMTP_USER | Your Gmail address |
   | SMTP_PASS | Your Gmail App Password |
   | EMAIL_FROM | noreply@reyanluxe.com |
   | FRONTEND_URL | https://your-frontend-domain.onrender.com |
   | FRONTEND_BASE_PATH | / |
   | ADMIN_API_KEY | Generate a strong random string |
   | ADMIN_SEED_EMAIL | admin@reyanluxe.com |

3. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment to complete
   - Copy the backend URL (e.g., `https://reyan-luxe-backend.onrender.com`)

## Step 4: Deploy Frontend to Render

1. **Create New Static Site**
   - Go to Render Dashboard
   - Click "New +" → "Static Site"
   - Connect your Git repository
   - Select the `reyan` repository
   - Root directory: `frontend`
   - Build Command: `npm install && npm run build`
   - Publish Directory: `dist`

2. **Configure Environment Variables**
   Add the following environment variable:

   | Key | Value |
   |-----|-------|
   | VITE_API_BASE_URL | Your backend URL from Step 3 |

3. **Deploy**
   - Click "Create Static Site"
   - Wait for deployment to complete
   - Copy the frontend URL (e.g., `https://reyan-luxe-frontend.onrender.com`)

## Step 5: Update Backend CORS

After deploying the frontend, update the backend CORS origins:

1. Go to your backend service on Render
2. Click "Environment"
3. Update `CORS_ORIGINS` to include your frontend URL
4. Redeploy the backend

## Step 6: Configure Razorpay Webhook

1. **Get Webhook URL**
   - Your webhook URL will be: `https://your-backend-url.onrender.com/api/v1/webhooks/razorpay`

2. **Configure in Razorpay Dashboard**
   - Go to Razorpay Dashboard → Settings → Webhooks
   - Add new webhook
   - Webhook URL: Your backend webhook URL
   - Secret: Generate and save this (add to Render env vars)
   - Events: `payment.captured`, `payment.failed`, `refund.processed`

## Step 7: Seed Initial Data

1. **Access Backend**
   - Your backend will automatically seed an admin user
   - Email: `admin@reyanluxe.com` (or whatever you set in ADMIN_SEED_EMAIL)
   - Password: Check backend logs for initial password

2. **Create Categories and Products**
   - Log in to admin dashboard at `https://your-backend-url.onrender.com/admin/`
   - Create categories: Crystal Bead Bracelets, Kundan Stone Earrings, Kundan Stone Bangles
   - Add products with images and customization options

## Step 8: Test the Live Application

1. **Frontend Testing**
   - Open your frontend URL
   - Test registration
   - Test login
   - Test product browsing
   - Test product customization
   - Test add to cart
   - Test checkout
   - Test Razorpay payment (test mode)
   - Test COD
   - Test order history
   - Test wishlist

2. **Backend Testing**
   - Test admin dashboard
   - Test product management
   - Test category management
   - Test inventory management
   - Test order management

## Step 9: Monitor and Maintain

1. **Check Logs**
   - Monitor Render logs for errors
   - Check MongoDB Atlas metrics

2. **Backups**
   - MongoDB Atlas has automatic backups on paid tiers
   - Consider upgrading for production backup needs

3. **SSL**
   - Render provides automatic SSL certificates
   - No additional configuration needed

## Troubleshooting

### Backend fails to start
- Check environment variables are set correctly
- Verify MongoDB connection string is valid
- Check Render logs for specific errors

### Frontend shows blank page
- Check VITE_API_BASE_URL is correct
- Verify build completed successfully
- Check browser console for errors

### CORS errors
- Ensure CORS_ORIGINS includes your frontend URL
- Verify backend is running
- Check that API calls use correct URL

### MongoDB connection fails
- Verify IP whitelist includes 0.0.0.0/0
- Check username/password are correct
- Ensure connection string format is correct

### Payment verification fails
- Verify Razorpay credentials are correct
- Check webhook secret matches
- Ensure webhook is receiving events

## Security Notes

- **Never commit .env files** to git
- **Use strong secrets** for JWT, API keys, and passwords
- **Rotate secrets** periodically
- **Enable 2FA** on all accounts (MongoDB, Render, Razorpay)
- **Monitor logs** for suspicious activity
- **Keep dependencies** updated

## Cost Estimates

### MongoDB Atlas
- M0 Sandbox: Free (512 MB storage)
- M2: $9/month (2 GB storage) - recommended for production

### Render
- Free tier: Limited hours, spins down after inactivity
- Starter ($7/month): Recommended for backend
- Starter ($7/month): Recommended for frontend

### Razorpay
- No monthly fees
- Pay per transaction (2% per payment)

## Next Steps

After successful deployment:

1. Set up custom domain (optional)
2. Configure email templates
3. Set up analytics (Google Analytics, etc.)
4. Configure CDN for static assets
5. Set up monitoring (Sentry, etc.)
6. Implement automated backups
7. Set up CI/CD pipeline

## Support

For issues with:
- **MongoDB Atlas**: https://docs.atlas.mongodb.com/
- **Render**: https://render.com/docs
- **Razorpay**: https://razorpay.com/docs
