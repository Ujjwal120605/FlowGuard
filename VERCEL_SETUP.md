# Vercel Deployment Setup Guide

## Environment Variables Required

To connect your backend to MongoDB on Vercel, you need to set the following environment variables in your Vercel project:

### Required Environment Variables

1. **MONGODB_URL** or **MONGODB_URI**
   - Your MongoDB connection string
   - Format: `mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority`
   - Or: `mongodb://username:password@host:port/database`

### How to Set Environment Variables in Vercel

1. Go to your Vercel Dashboard: https://vercel.com/dashboard
2. Select your project: **flow-guard**
3. Go to **Settings** → **Environment Variables**
4. Add the following variable:
   - **Key**: `MONGODB_URL`
   - **Value**: Your MongoDB connection string
   - **Environment**: Select all (Production, Preview, Development)
5. Click **Save**
6. **Redeploy** your application for changes to take effect

### Getting a MongoDB Connection String

#### Option 1: MongoDB Atlas (Recommended for Production)
1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free account or sign in
3. Create a new cluster (free tier available)
4. Go to **Database Access** → Create a database user
5. Go to **Network Access** → Add your IP (or `0.0.0.0/0` for all IPs)
6. Go to **Database** → Click **Connect** → Choose **Connect your application**
7. Copy the connection string and replace `<password>` with your database user password

#### Option 2: Local MongoDB (Development Only)
- Not recommended for Vercel deployment
- Use MongoDB Atlas or another cloud MongoDB service

### Optional Environment Variables

- **AI_SERVICE_URL**: URL for your AI service (if using external service)
- **NODE_ENV**: Set to `production` for production deployments

### After Setting Environment Variables

1. Redeploy your application:
   ```bash
   vercel --prod
   ```

2. Or trigger a redeploy from Vercel Dashboard:
   - Go to **Deployments**
   - Click the three dots on the latest deployment
   - Select **Redeploy**

### Testing the Connection

After redeploying, test your vehicle registration endpoint:
- The error "Operation `vehicles.findOne()` buffering timed out" should be resolved
- Vehicle registration should work successfully

### Troubleshooting

If you still see connection errors:
1. Verify your MongoDB connection string is correct
2. Check that your MongoDB cluster allows connections from Vercel IPs
3. Verify the environment variable is set for all environments (Production, Preview, Development)
4. Check Vercel function logs: `vercel logs <deployment-url>`

