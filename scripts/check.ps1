# Checking in PowerShell; avoid non-ASCII to prevent encoding issues
Write-Host "Checking TypeScript errors..."
# Use npx tsc because there is no npm "typecheck" script
npx tsc -p tsconfig.app.json --noEmit
Write-Host "`nChecking ESLint errors..."
npm run lint

Write-Host "`nBuilding project..."
npm run build
