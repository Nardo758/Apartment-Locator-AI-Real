#!/bin/bash
# Admin Panel Deployment Script

echo "🚀 Deploying Admin Panel..."

# Step 1: Pull latest from GitHub
echo "📥 Pulling latest code from GitHub..."
git pull origin main

# Step 2: Install dependencies (recharts for charts)
echo "📦 Installing dependencies..."
npm install recharts

# Step 3: Run database migration
echo "🗄️  Running database migration..."
npm run db:push

# Step 4: Restart server
echo "🔄 Restarting server..."
echo "Run: npm run dev"

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📝 MANUAL STEP REQUIRED:"
echo "Add admin routes to App.tsx - see ADMIN_PANEL_INTEGRATION.md"
echo ""
echo "🌐 Admin panel will be at: http://localhost:5000/admin"
