#!/bin/bash

echo "🔄 RECOVERY SCRIPT: Restoring Working State"
echo "=========================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Not in the project directory"
    exit 1
fi

echo "📋 Current status:"
git status --porcelain

echo ""
echo "🔄 Restoring from backup branch..."
git checkout backup-working-state

echo ""
echo "📦 Installing dependencies..."
npm install

echo ""
echo "🔧 Checking environment..."
if [ ! -f ".env.local" ]; then
    echo "⚠️  Warning: .env.local not found"
    echo "   Please ensure your environment variables are set:"
    echo "   - GROQ_API_KEY"
    echo "   - POSTGRES_URL"
    echo "   - POSTGRES_PRISMA_URL"
    echo "   - POSTGRES_URL_NON_POOLING"
    echo "   - POSTGRES_USER"
    echo "   - POSTGRES_HOST"
    echo "   - POSTGRES_PASSWORD"
    echo "   - POSTGRES_DATABASE"
fi

echo ""
echo "🚀 Starting development server..."
echo "   The app should be available at http://localhost:3000"
echo ""
echo "✅ Recovery complete! Your working state has been restored."
echo ""
echo "📝 If you need to make changes:"
echo "   1. Test the current state first"
echo "   2. Make small, incremental changes"
echo "   3. Test after each change"
echo "   4. If anything breaks, run this script again" 