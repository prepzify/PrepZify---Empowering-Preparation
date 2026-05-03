#!/bin/bash
# Install dependencies
npm install

# Build the frontend
npm run build

# Check if dist folder was created successfully
if [ -d "dist" ]; then
  echo "Build successful: dist directory exists."
  ls -la dist
else
  echo "Build failed: dist directory NOT found."
  exit 1
fi
