# Ensure we are inside create-bawo-frontend root
Write-Host "📦 Linking create-bawo-frontend locally..."

# Link package globally
npm link

# Create a temporary test app
Write-Host "🛠 Creating test app..."
create-bawo-frontend test-app -y --no-start

# Go into the test app
Set-Location test-app

# Check files
Write-Host "📂 Contents of test-app/src"
Get-ChildItem -Recurse .\src | Select-Object FullName

# Run build (to make sure it compiles)
Write-Host "⚡ Running build..."
npm run build

Write-Host "✅ Test complete. Now you can try:"
Write-Host "   cd test-app"
Write-Host "   npm run dev"

#