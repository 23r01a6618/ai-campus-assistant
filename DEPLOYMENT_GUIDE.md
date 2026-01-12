# Google Cloud Run Deployment Guide

## Prerequisites
1. Google Cloud Account with **billing enabled**
2. [Google Cloud SDK](https://cloud.google.com/sdk/docs/install) installed
3. Firebase credentials (.json file)
4. Gemini API Key
5. GitHub account (optional, for CI/CD)

---

## Step 1: Setup Google Cloud Project

```bash
# Authenticate with Google Cloud
gcloud auth login

# Create a new project
gcloud projects create campus-ai-assistant --name="Campus AI Assistant"

# Set as default project
gcloud config set project campus-ai-assistant

# Enable required APIs
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable containerregistry.googleapis.com
gcloud services enable secretmanager.googleapis.com
```

---

## Step 2: Create Secrets in Google Secret Manager

```bash
# Store Gemini API Key
echo -n "YOUR_GEMINI_API_KEY" | gcloud secrets create gemini-api-key --data-file=-

# Store Firebase credentials (entire JSON content)
gcloud secrets create firebase-config --data-file=path/to/your-firebase-key.json

# Verify secrets created
gcloud secrets list
```

---

## Step 3: Deploy to Google Cloud Run

### Option A: Using Cloud Run directly (Recommended)

```bash
# Navigate to project root
cd e:\ai-ass-project

# Deploy to Cloud Run
gcloud run deploy campus-ai-assistant \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --memory 512Mi \
  --cpu 1 \
  --timeout 3600 \
  --set-env-vars "NODE_ENV=production,PORT=5000"
```

### Option B: Using Docker (if above fails)

```bash
# Build Docker image
docker build -t campus-ai-assistant:latest .

# Tag for Google Container Registry
docker tag campus-ai-assistant:latest gcr.io/campus-ai-assistant/campus-ai-assistant:latest

# Configure Docker authentication
gcloud auth configure-docker

# Push to Container Registry
docker push gcr.io/campus-ai-assistant/campus-ai-assistant:latest

# Deploy from container
gcloud run deploy campus-ai-assistant \
  --image gcr.io/campus-ai-assistant/campus-ai-assistant:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --memory 512Mi \
  --set-env-vars "NODE_ENV=production,PORT=5000"
```

---

## Step 4: Add Secrets to Cloud Run Service

After deployment, update the service to use secrets:

```bash
# Get the service account email
gcloud run services describe campus-ai-assistant \
  --region us-central1 \
  --format='value(serviceAccountEmail)'

# Grant Secret Accessor role to the service account
gcloud secrets add-iam-policy-binding gemini-api-key \
  --member=serviceAccount:YOUR_SERVICE_ACCOUNT_EMAIL \
  --role=roles/secretmanager.secretAccessor

gcloud secrets add-iam-policy-binding firebase-config \
  --member=serviceAccount:YOUR_SERVICE_ACCOUNT_EMAIL \
  --role=roles/secretmanager.secretAccessor

# Update service to use secrets
gcloud run services update campus-ai-assistant \
  --region us-central1 \
  --update-secrets GEMINI_API_KEY=gemini-api-key:latest \
  --update-secrets FIREBASE_CONFIG=firebase-config:latest
```

---

## Step 5: Update Backend to Use Secrets

Modify `backend/src/server.js` to read secrets from environment (already done - just ensure env vars are set).

Update the `Dockerfile` to pass secrets as environment variables:

```bash
gcloud run deploy campus-ai-assistant \
  --image gcr.io/campus-ai-assistant/campus-ai-assistant:latest \
  --region us-central1 \
  --set-env-vars GEMINI_API_KEY=$(gcloud secrets versions access latest --secret=gemini-api-key) \
  --allow-unauthenticated
```

---

## Step 6: Configure Custom Domain (Optional)

```bash
# Map custom domain
gcloud run domain-mappings create \
  --service campus-ai-assistant \
  --domain yourdomain.com \
  --region us-central1
```

---

## Step 7: Test Your Deployment

Once deployed, you'll get a URL like: `https://campus-ai-assistant-xxxxx.run.app`

```bash
# Test health endpoint
curl https://campus-ai-assistant-xxxxx.run.app/health

# Test chat endpoint
curl -X POST https://campus-ai-assistant-xxxxx.run.app/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello"}'
```

---

## Step 8: View Logs

```bash
# Stream logs
gcloud run logs read campus-ai-assistant --limit 100 --follow

# Or use Cloud Console
# https://console.cloud.google.com/run
```

---

## Troubleshooting

### Issue: "Cloud Run API not enabled"
```bash
gcloud services enable run.googleapis.com
```

### Issue: "Permission denied" for secrets
- Ensure service account has `secretmanager.secretAccessor` role
- Check IAM settings in Cloud Console

### Issue: Application crashes on startup
- Check logs: `gcloud run logs read campus-ai-assistant --limit 50`
- Verify environment variables are set
- Ensure Firebase credentials are valid

### Issue: CORS errors
- Update `FRONTEND_URL` environment variable to your Cloud Run URL
- Ensure backend CORS middleware includes your frontend domain

---

## Cost Optimization

1. **Cloud Run** (used by default):
   - First 2M requests/month free
   - ~$0.40 per million requests
   - Great for variable workloads

2. **To reduce costs:**
   - Set `min_instances: 0` to scale down when unused
   - Use smaller memory allocation (256Mi instead of 512Mi)
   - Implement caching strategies

---

## CI/CD Setup (Optional - Automated Deployment)

### Using GitHub Actions:

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Cloud Run

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to Cloud Run
        run: |
          gcloud auth configure-docker
          gcloud run deploy campus-ai-assistant \
            --source . \
            --platform managed \
            --region us-central1 \
            --allow-unauthenticated
        env:
          GCLOUD_SERVICE_KEY: ${{ secrets.GCLOUD_SERVICE_KEY }}
          PROJECT_ID: campus-ai-assistant
```

---

## Final Verification

Your app is live when:
✅ `gcloud run services list` shows your service  
✅ Health check returns: `{ "status": "Server is running" }`  
✅ Frontend loads at the Cloud Run URL  
✅ Chat API responds correctly  

Share the Cloud Run URL with evaluators!
