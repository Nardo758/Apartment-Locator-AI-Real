#!/bin/bash
echo "🔍 Checking TypeScript errors..."
# Use npx tsc here because this repo doesn't define an npm "typecheck" script
npx tsc -p tsconfig.app.json --noEmit

echo "\n🔍 Checking ESLint errors..."
npm run lint

echo "\n🔍 Building project..."
npm run build
