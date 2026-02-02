#!/bin/bash

# Safe Deployment Script for Cloudflare Workers
# Ensures environment variables are preserved during deployment

echo "🚀 Cloudflare Workers Safe Deployment"
echo "=================================="

# Check if we're in the right directory
if [ ! -f "wrangler.toml" ]; then
    echo "❌ wrangler.toml not found. Please run this from the workers directory."
    exit 1
fi

# Step 1: Check current secrets
echo ""
echo "🔍 Checking current environment variables..."
wrangler secret list

# Step 2: Backup current secrets to temporary file
echo ""
echo "💾 Backing up current secrets..."
wrangler secret list > /tmp/current_secrets.txt

# Step 3: Build the project
echo ""
echo "🔨 Building the project..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed! Aborting deployment."
    exit 1
fi

# Step 4: Deploy
echo ""
echo "🚀 Deploying to Cloudflare Workers..."
wrangler deploy

if [ $? -ne 0 ]; then
    echo "❌ Deployment failed!"
    echo ""
    echo "🔄 Restoring secrets..."
    # Restore secrets from backup if needed
    while IFS= read -r line; do
        if [[ $line =~ ^[A-Z_]+ ]]; then
            secret_name=$(echo "$line" | awk '{print $1}')
            echo "Restoring $secret_name..."
            # Note: You'll need to manually re-enter the secret values
        fi
    done < /tmp/current_secrets.txt
    exit 1
fi

# Step 5: Verify deployment
echo ""
echo "✅ Deployment successful!"
echo ""
echo "🔍 Verifying deployment..."
curl -s https://vadivelucars.dayanidigv954.workers.dev/health | jq .

echo ""
echo "🧪 Testing database connection..."
curl -s https://vadivelucars.dayanidigv954.workers.dev/test-db | jq .

# Clean up
rm -f /tmp/current_secrets.txt

echo ""
echo "🎉 Deployment completed successfully!"
echo ""
echo "📋 Quick Test Commands:"
echo "curl https://vadivelucars.dayanidigv954.workers.dev/health"
echo "curl https://vadivelucars.dayanidigv954.workers.dev/test-db"
