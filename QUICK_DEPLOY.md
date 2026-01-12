# Deploy Your App for FREE (No Credit Card)

## **Quick Start - 3 Minutes**

### **Step 1: Push to GitHub**
```bash
cd e:\ai-ass-project
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/ai-ass-project.git
git push -u origin main
```

### **Step 2: Deploy to Render (Completely FREE)**

1. Go to **https://render.com**
2. Click **"New +"** → **"Web Service"**
3. **Connect GitHub** and select your `ai-ass-project` repo
4. Fill in:
   - **Name**: `campus-ai-assistant`
   - **Environment**: `Node`
   - **Build Command**: 
     ```
     npm install && cd frontend && npm install && npm run build
     ```
   - **Start Command**: 
     ```
     npm --prefix backend start
     ```
   - **Plan**: Select **"Free"**

5. Click **"Advanced"** and add these **Environment Variables**:
   ```
   GEMINI_API_KEY = your_api_key
   FIREBASE_PROJECT_ID = your_id
   FIREBASE_PRIVATE_KEY = your_private_key
   FIREBASE_CLIENT_EMAIL = your_email
   NODE_ENV = production
   PORT = 5000
   ```

6. Click **"Create Web Service"**

### **Step 3: Wait for Deployment**
- Deployment takes 5-10 minutes
- You'll get a URL like: `https://campus-ai-assistant.onrender.com`
- **Share this with evaluators!** ✅

---

## **Alternative: Railway.app ($5 Free Credit)**

**Better performance, but has small costs after free credits**

1. Go to **https://railway.app**
2. Sign up with GitHub
3. Create **New Project** → **Deploy from GitHub**
4. Select your repo
5. Add variables (same as above)
6. Auto-deploys! ✅

---

## **Alternative: Replit (For Quick Testing)**

1. Go to **https://replit.com**
2. Click **"Create Repl"** → **"Import from GitHub"**
3. Paste your repo URL
4. Click **"Run"** - instant deployment! ✅

---

## **Sharing Your Live App**

Once deployed, you get a **PUBLIC URL** that anyone can visit:
- **Render**: `https://campus-ai-assistant.onrender.com`
- **Railway**: `https://campus-ai-assistant-production.up.railway.app`
- **Replit**: `https://ai-ass-project.YOUR_USERNAME.repl.co`

**Copy this URL and share with evaluators** - they can use it right away! 🎉

---

## **Troubleshooting**

| Problem | Solution |
|---------|----------|
| Build fails | Check GitHub repo is pushed correctly |
| App crashes | Add all environment variables |
| Can't find repo | Grant permissions to Render/Railway for GitHub |
| Slow startup | Free tier is slower - takes 30 seconds first time |

---

## **Costs**

- ✅ **Render** = $0 forever (limited resources)
- ✅ **Railway** = $0 first month ($5 credit), then $8-10/month for this app
- ✅ **Replit** = $0 forever (learning/hobby tier)

**Recommendation**: Start with **Render** (free + simple) or **Railway** (better performance, small cost)
