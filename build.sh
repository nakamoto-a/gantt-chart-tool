#!/usr/bin/env bash
# exit on error
set -o errexit

# Install Python dependencies
pip install -r requirements.txt

# Install Node.js dependencies and build frontend
cd frontend
npm install
npm run build
cd ..

# Copy built frontend to static folder
rm -rf static
mkdir -p static
cp -r frontend/dist/* static/

