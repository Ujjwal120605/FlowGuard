# MongoDB Setup for Vercel Deployment

## ⚠️ Important: Set MongoDB Connection String

Your FlowGuard app requires a MongoDB connection string to work properly. The error you're seeing ("buffering timed out") means the MongoDB URL is not configured in Vercel.

## Quick Setup Steps

### 1. Get a MongoDB Connection String

#### Option A: MongoDB Atlas (Recommended - Free Tier Available)
1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up or log in
3. Create a new cluster (choose FREE tier)
4. Wait for cluster to be created (2-3 minutes)
5. Click **"Connect"** button
6. Choose **"Connect your application"**
7. Copy the connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/`)
8. Replace `<password>` with your database user password
9. Add database name at the end: `mongodb+srv://username:password@cluster.mongodb.net/flowguard`

#### Option B: Use Existing MongoDB
- If you have a MongoDB instance, use its connection string

### 2. Add Environment Variable in Vercel

1. Go to your Vercel Dashboard: https://vercel.com/dashboard
2. Select your project: **flow-guard** (or your project name)
3. Go to **Settings** → **Environment Variables**
4. Click **"Add New"**
5. Add the following:
   - **Key**: `MONGODB_URL`
   - **Value**: Your MongoDB connection string (from step 1)
   - **Environment**: Select **Production**, **Preview**, and **Development** (or at least Production)
6. Click **"Save"**

### 3. Redeploy Your Application

After adding the environment variable, you need to redeploy:

**Option A: Via Vercel Dashboard**
1. Go to **Deployments** tab
2. Click the **"..."** menu on the latest deployment
3. Click **"Redeploy"**

**Option B: Via CLI**
```bash
vercel --prod
```

## Verify It's Working

1. After redeployment, visit your site
2. Try to register a vehicle again
3. The error should be gone if MongoDB is properly configured

## Troubleshooting

### Still seeing timeout errors?
- ✅ Check that `MONGODB_URL` is set in Vercel (Settings → Environment Variables)
- ✅ Verify the connection string is correct (no extra spaces, correct password)
- ✅ Make sure MongoDB Atlas allows connections from anywhere (Network Access → Add IP: `0.0.0.0/0`)
- ✅ Check Vercel deployment logs for MongoDB connection errors

### Connection string format
- ✅ Correct: `mongodb+srv://user:pass@cluster.mongodb.net/flowguard`
- ❌ Wrong: Missing database name
- ❌ Wrong: Has `<password>` placeholder instead of actual password

## Need Help?

Check the Vercel deployment logs:
```bash
vercel logs [deployment-url]
```

Or view logs in Vercel Dashboard → Deployments → Click on deployment → View Function Logs

