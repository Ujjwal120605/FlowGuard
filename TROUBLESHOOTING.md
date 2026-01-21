# Troubleshooting MongoDB Connection Issues

## Quick Diagnostic

Visit this URL to check your MongoDB connection status:
```
https://flow-guard-one.vercel.app/api/health
```

This will show you:
- ✅ If MongoDB URL is configured
- ✅ Connection state
- ✅ Any error messages

## Common Issues & Solutions

### Issue 1: "MongoDB connection string not configured"

**Solution:**
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add `MONGODB_URL` with your MongoDB Atlas connection string
3. Make sure to select **Production** environment
4. **Redeploy** your application

### Issue 2: "Connection timeout" or "Cannot connect to MongoDB"

**Most Common Cause:** MongoDB Atlas Network Access is blocking Vercel

**Solution:**
1. Go to MongoDB Atlas Dashboard
2. Click **"Network Access"** in the left sidebar
3. Click **"Add IP Address"**
4. Click **"Allow Access from Anywhere"** (or add `0.0.0.0/0`)
5. Click **"Confirm"**
6. Wait 1-2 minutes for changes to propagate
7. Try again

### Issue 3: "Authentication failed"

**Solution:**
1. Verify your connection string format:
   ```
   mongodb+srv://username:password@cluster.mongodb.net/flowguard
   ```
2. Make sure:
   - Username is correct (no extra spaces)
   - Password is correct (URL-encode special characters if needed)
   - Database name is at the end (`/flowguard`)

### Issue 4: Connection string format issues

**Correct Format:**
```
mongodb+srv://bajpaiujjwal3_db_user:XhiNWcCgPYQzsJLN@cluster0.xxxxx.mongodb.net/flowguard?retryWrites=true&w=majority
```

**Common Mistakes:**
- ❌ Missing `/flowguard` at the end
- ❌ Using `<password>` placeholder instead of actual password
- ❌ Extra spaces
- ❌ Wrong cluster URL

## Step-by-Step Verification

### Step 1: Verify Environment Variable in Vercel

1. Go to: https://vercel.com/dashboard
2. Select your project
3. Go to: **Settings** → **Environment Variables**
4. Check if `MONGODB_URL` exists
5. Verify it's set for **Production** environment

### Step 2: Verify MongoDB Atlas Network Access

1. Go to: https://cloud.mongodb.com
2. Select your project
3. Click **"Network Access"** (left sidebar)
4. You should see `0.0.0.0/0` (Allow from anywhere) or specific IPs
5. If not, add `0.0.0.0/0` and wait 1-2 minutes

### Step 3: Verify Connection String Format

Your connection string should look like:
```
mongodb+srv://bajpaiujjwal3_db_user:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/flowguard
```

To get it:
1. MongoDB Atlas → Your Cluster → **"Connect"**
2. Choose **"Connect your application"**
3. Select **"Node.js"** driver
4. Copy the connection string
5. Replace `<password>` with your actual password
6. Add `/flowguard` at the end

### Step 4: Test the Connection

1. Visit: `https://flow-guard-one.vercel.app/api/health`
2. Check the response:
   - ✅ `"status": "ok"` = Working!
   - ❌ `"status": "error"` = Check the error message

### Step 5: Check Vercel Logs

1. Go to Vercel Dashboard → Your Project → **Deployments**
2. Click on the latest deployment
3. Click **"Functions"** tab
4. Click on `/api/index.js`
5. View **"Logs"** to see detailed error messages

## Still Not Working?

### Check Vercel Function Logs

Run this command to see real-time logs:
```bash
vercel logs [your-deployment-url] --follow
```

Or view in Vercel Dashboard:
1. Go to **Deployments**
2. Click on your deployment
3. Click **"Functions"** → **"api/index.js"**
4. View **"Logs"**

### Common Error Messages

| Error | Solution |
|-------|----------|
| `buffering timed out` | MongoDB URL not set or Network Access blocking |
| `authentication failed` | Wrong username/password in connection string |
| `ENOTFOUND` | Wrong cluster URL in connection string |
| `not configured` | MONGODB_URL not set in Vercel |

## Need More Help?

1. Check the health endpoint: `/api/health`
2. Check Vercel function logs
3. Verify all steps above
4. Make sure you **redeployed** after adding environment variables

