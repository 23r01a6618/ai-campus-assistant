# Free Deployment Guide - No Billing Required

## **Option 1: Railway.app (BEST for Full Stack)**

Railway gives you **$5/month free credits** - perfect for this project!

### Step 1: Create Account
1. Go to https://railway.app
2. Sign up with GitHub (easiest)
3. Connect your GitHub account

### Step 2: Create New Project
1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Choose your repository (push this project to GitHub first if not already there)
4. Select the repo: `ai-ass-project`

### Step 3: Configure Environment Variables
1. In Railway dashboard, go to "Variables"
2. Add these environment variables:
   - `NODE_ENV` = `production`
   - `PORT` = `5000`
   - `GEMINI_API_KEY` = Your API key
   - `FIREBASE_PROJECT_ID` = Your Firebase project ID
   - `FIREBASE_PRIVATE_KEY` = Your Firebase private key
   - `FIREBASE_CLIENT_EMAIL` = Your Firebase client email

### Step 4: Deploy
- Railway auto-deploys when you push to GitHub
- Your app will be live at a URL like: `https://campus-ai-assistant-production.up.railway.app`

---

## **Option 2: Render.com (Free Tier)**

### Step 1: Create Account
1. Go to https://render.com
2. Sign up with GitHub
3. Connect your GitHub repository

### Step 2: Create Web Service
1. Click "New +" → "Web Service"
2. Select your repository
3. Configure:
   - **Name**: `campus-ai-assistant`
   - **Environment**: `Node`
   - **Build Command**: `npm install && cd frontend && npm install && npm run build`
   - **Start Command**: `npm --prefix backend start`
   - **Plan**: Select "Free"

### Step 3: Add Environment Variables
In the "Environment" section, add:
```
NODE_ENV=production
PORT=5000
GEMINI_API_KEY=your_key_here
FIREBASE_PROJECT_ID=your_id_here
FIREBASE_PRIVATE_KEY=your_key_here
FIREBASE_CLIENT_EMAIL=your_email_here
```

### Step 4: Deploy
- Click "Create Web Service"
- Wait for deployment (5-10 minutes)
- Your URL: `https://campus-ai-assistant.onrender.com`

⚠️ **Note**: Free tier spins down after 15 minutes of inactivity (takes 30 seconds to wake up)

---

## **Option 3: Replit (Easiest for Beginners)**

### Step 1: Create Account
1. Go to https://replit.com
2. Sign up with GitHub
3. Import your repository

### Step 2: Set Up
1. Click "Import from GitHub"
2. Paste your repo URL
3. Replit auto-detects Node.js project

### Step 3: Configure
1. Create `.replit` file with:
```
run = "npm run dev"
```

2. Set environment variables in "Secrets" tab:
   - `GEMINI_API_KEY`
   - `FIREBASE_*` credentials

### Step 4: Run
- Click "Run"
- Replit provides a public URL automatically

---

## **Option 4: Vercel (Frontend) + Railway (Backend)**

### Frontend on Vercel (Static)
1. Go to https://vercel.com
2. Import your GitHub repo
3. Set root directory: `frontend`
4. Deploy (instant, free forever)
5. Get URL: `https://your-project.vercel.app`

### Backend on Railway
- Follow Railway steps above
- In Vercel environment variables, set:
  - `VITE_API_URL=https://your-railway-backend.up.railway.app/api`

---

## **Quick Comparison**

| Platform | Free Tier | Best For | Limitations |
|----------|-----------|----------|------------|
| **Railway** | $5/month | Full stack | May run out of credits |
| **Render** | Yes | Small projects | Spins down after 15 min inactivity |
| **Replit** | Yes | Learning | Limited resources |
| **Vercel** | Forever free | Frontend only | Need separate backend |
| **GitHub Pages** | Forever free | Static sites only | No backend support |

---

## **Step-by-Step: Deploy to Railway (Recommended)**

### 1. Push to GitHub First
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/ai-ass-project.git
git push -u origin main
```

### 2. Create Railway Account
- Go to https://railway.app
- Sign up with GitHub
- Grant access to your repositories

### 3. New Project
- Click "New Project"
- "Deploy from GitHub repo"
- Select your `ai-ass-project` repo

### 4. Add PostgreSQL (Optional, if needed)
- Click "Add Service" → "Add from Marketplace" → "PostgreSQL"
- Railway auto-generates credentials

### 5. Environment Variables
- Click "Variables" tab
- Add your credentials:
  ```
  GEMINI_API_KEY=sk-xxx...
  FIREBASE_PROJECT_ID=your-project
  FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
  FIREBASE_CLIENT_EMAIL=firebase@your-project.iam.gserviceaccount.com
  NODE_ENV=production
  PORT=5000
  ```

### 6. Deploy
- Railway auto-deploys from Git
- Your domain: `https://[your-project]-production.up.railway.app`
- Monitor logs in dashboard

---

## **Testing After Deployment**

Once deployed, test these endpoints:

```bash
# Health check
curl https://your-deployed-url.com/health

# Chat API
curl -X POST https://your-deployed-url.com/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello"}'
```

---

## **Troubleshooting Free Deployments**

### Issue: Build fails
- Check that `package.json` has all dependencies
- Ensure backend `npm start` is configured correctly
- View build logs in platform dashboard

### Issue: App crashes
- Check environment variables are set
- View runtime logs
- Ensure Firebase credentials are valid JSON

### Issue: Slow response
- Free tier has limited resources
- May take 30 seconds on cold start
- Upgrade if needed (Railway $5/month)

---

## **Sharing with Evaluators**

Once deployed:
1. Get your public URL from the platform dashboard
2. Share it directly: `https://your-app.onrender.com` or `https://your-app.up.railway.app`
3. Evaluators can access immediately - no installation needed!
4. Add to your resume/portfolio: "Live Demo: [URL]"

---

## **Which Should You Choose?**

- ✅ **Railway** - Best overall, small costs if you exceed free tier
- ✅ **Render** - Completely free, slightly slower on cold starts
- ✅ **Replit** - Easiest, good for learning
- ✅ **Vercel + Railway** - Best separation, easy frontend updates

**My recommendation: Start with Render.com - it's completely free and takes 5 minutes to set up!**
