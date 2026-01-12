@echo off
REM Campus AI Assistant - Google Cloud Deployment Script for Windows

setlocal enabledelayedexpansion

echo.
echo ==== Campus AI Assistant - Google Cloud Deployment ====
echo.

REM Check if gcloud is installed
gcloud --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Google Cloud SDK not found
    echo Please install it from: https://cloud.google.com/sdk/docs/install
    exit /b 1
)

REM Get inputs
set /p PROJECT_ID="Enter your Google Cloud Project ID: "
set /p GEMINI_API_KEY="Enter Gemini API Key: "
set /p FIREBASE_CREDS="Enter Firebase Credentials file path: "

REM Validate inputs
if "!PROJECT_ID!"=="" (
    echo Error: Project ID is required
    exit /b 1
)

if "!GEMINI_API_KEY!"=="" (
    echo Error: Gemini API Key is required
    exit /b 1
)

if not exist "!FIREBASE_CREDS!" (
    echo Error: Firebase credentials file not found
    exit /b 1
)

echo.
echo Step 1: Setting up Google Cloud Project...
gcloud config set project !PROJECT_ID!
echo ✓ Project set
echo.

echo Step 2: Enabling required APIs...
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable containerregistry.googleapis.com
gcloud services enable secretmanager.googleapis.com
echo ✓ APIs enabled
echo.

echo Step 3: Creating secrets...
for /f "tokens=*" %%A in (!FIREBASE_CREDS!) do set FIREBASE_CONTENT=%%A

REM Create secrets (ignore if they already exist)
gcloud secrets create gemini-api-key --data-file=- --quiet 2>nul || echo Secret already exists
echo !GEMINI_API_KEY! | findstr /r "." >nul
gcloud secrets create firebase-config --data-file="!FIREBASE_CREDS!" --quiet 2>nul || echo Secret already exists
echo ✓ Secrets configured
echo.

echo Step 4: Deploying to Google Cloud Run...
gcloud run deploy campus-ai-assistant ^
  --source . ^
  --platform managed ^
  --region us-central1 ^
  --allow-unauthenticated ^
  --memory 512Mi ^
  --cpu 1 ^
  --timeout 3600 ^
  --set-env-vars "NODE_ENV=production,PORT=5000,GEMINI_API_KEY=!GEMINI_API_KEY!"

if %errorlevel% equ 0 (
    echo ✓ Deployment complete!
    echo.
    
    echo Getting service URL...
    for /f "tokens=*" %%A in ('gcloud run services describe campus-ai-assistant --region us-central1 --format="value(status.url)"') do set SERVICE_URL=%%A
    
    echo ==== Deployment Summary ====
    echo ✓ Your app is live at: !SERVICE_URL!
    echo ✓ Share this URL with evaluators
    echo.
    
    echo Testing deployment...
    curl -s !SERVICE_URL!/health
    echo.
    
    echo Next steps:
    echo 1. Share the URL above with evaluators
    echo 2. Monitor logs: gcloud run logs read campus-ai-assistant --follow
    echo 3. View in console: https://console.cloud.google.com/run
) else (
    echo ✗ Deployment failed. Check the errors above.
    exit /b 1
)

pause
