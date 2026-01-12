#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Campus AI Assistant - Google Cloud Deployment ===${NC}\n"

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo -e "${YELLOW}Google Cloud SDK not found. Please install it first:${NC}"
    echo "https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Get inputs
read -p "Enter your Google Cloud Project ID: " PROJECT_ID
read -p "Enter Gemini API Key: " GEMINI_API_KEY
read -p "Enter Firebase Credentials file path (JSON): " FIREBASE_CREDS

# Validate inputs
if [ -z "$PROJECT_ID" ] || [ -z "$GEMINI_API_KEY" ]; then
    echo -e "${YELLOW}Error: Missing required inputs${NC}"
    exit 1
fi

if [ ! -f "$FIREBASE_CREDS" ]; then
    echo -e "${YELLOW}Error: Firebase credentials file not found${NC}"
    exit 1
fi

echo -e "${GREEN}✓ All inputs provided${NC}\n"

# Setup Google Cloud
echo -e "${BLUE}Step 1: Setting up Google Cloud Project...${NC}"
gcloud config set project $PROJECT_ID

echo -e "${GREEN}✓ Project set${NC}\n"

# Enable APIs
echo -e "${BLUE}Step 2: Enabling required APIs...${NC}"
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable containerregistry.googleapis.com
gcloud services enable secretmanager.googleapis.com

echo -e "${GREEN}✓ APIs enabled${NC}\n"

# Create secrets
echo -e "${BLUE}Step 3: Creating secrets in Secret Manager...${NC}"
echo -n "$GEMINI_API_KEY" | gcloud secrets create gemini-api-key --data-file=- --quiet 2>/dev/null || echo "Secret already exists"

gcloud secrets create firebase-config --data-file="$FIREBASE_CREDS" --quiet 2>/dev/null || echo "Secret already exists"

echo -e "${GREEN}✓ Secrets created${NC}\n"

# Deploy to Cloud Run
echo -e "${BLUE}Step 4: Deploying to Google Cloud Run...${NC}"
gcloud run deploy campus-ai-assistant \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --memory 512Mi \
  --cpu 1 \
  --timeout 3600 \
  --set-env-vars "NODE_ENV=production,PORT=5000,GEMINI_API_KEY=$GEMINI_API_KEY"

echo -e "${GREEN}✓ Deployment complete!${NC}\n"

# Get the service URL
SERVICE_URL=$(gcloud run services describe campus-ai-assistant --region us-central1 --format='value(status.url)')

echo -e "${GREEN}=== Deployment Summary ===${NC}"
echo -e "${GREEN}✓ Your app is live at: ${BLUE}$SERVICE_URL${NC}"
echo -e "${GREEN}✓ Share this URL with evaluators${NC}\n"

echo "Testing deployment..."
curl -s "$SERVICE_URL/health" | jq . || echo "Health check endpoint"

echo -e "\n${YELLOW}Next steps:${NC}"
echo "1. Share the URL above with evaluators"
echo "2. Monitor logs: gcloud run logs read campus-ai-assistant --follow"
echo "3. View in console: https://console.cloud.google.com/run"
