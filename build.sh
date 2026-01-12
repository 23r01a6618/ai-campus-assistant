#!/bin/bash
set -e

echo "Starting build process..."

# Install root dependencies
echo "Installing root dependencies..."
npm install

# Install and build frontend
echo "Installing frontend dependencies..."
cd frontend
npm install

echo "Building frontend with vite..."
./node_modules/.bin/vite build

# Go back to root
cd ..

echo "Build completed successfully!"
