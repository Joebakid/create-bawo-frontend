const fs = require("fs")
const path = require("path")

// Pass 'options' in so we can read the chosen backend
async function run(projectDir, options) {

  const envPath = path.join(projectDir, ".env")
  const examplePath = path.join(projectDir, ".env.example")

  // Base environment variables
  let content = `# Environment variables

# API URL
VITE_API_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3000

# App name
VITE_APP_NAME=MyApp
`

  // Dynamically append backend credentials based on user selection
  if (options && options.backend) {
    switch (options.backend) {
      case "supabase":
        content += `
# Supabase
VITE_SUPABASE_URL=""
VITE_SUPABASE_ANON_KEY=""
NEXT_PUBLIC_SUPABASE_URL=""
NEXT_PUBLIC_SUPABASE_ANON_KEY=""
`
        break

      case "firebase":
        content += `
# Firebase
VITE_FIREBASE_API_KEY=""
VITE_FIREBASE_AUTH_DOMAIN=""
VITE_FIREBASE_PROJECT_ID=""
VITE_FIREBASE_STORAGE_BUCKET=""
VITE_FIREBASE_MESSAGING_SENDER_ID=""
VITE_FIREBASE_APP_ID=""

NEXT_PUBLIC_FIREBASE_API_KEY=""
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=""
NEXT_PUBLIC_FIREBASE_PROJECT_ID=""
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=""
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=""
NEXT_PUBLIC_FIREBASE_APP_ID=""
`
        break

      case "appwrite":
        content += `
# Appwrite
VITE_APPWRITE_ENDPOINT="https://cloud.appwrite.io/v1"
VITE_APPWRITE_PROJECT=""

NEXT_PUBLIC_APPWRITE_ENDPOINT="https://cloud.appwrite.io/v1"
NEXT_PUBLIC_APPWRITE_PROJECT=""
`
        break

      case "pocketbase":
        content += `
# PocketBase
VITE_POCKETBASE_URL="http://127.0.0.1:8090"
NEXT_PUBLIC_POCKETBASE_URL="http://127.0.0.1:8090"
`
        break

      case "neon":
        content += `
# Neon Database Connection String
DATABASE_URL="postgresql://user:password@project-name.neon.tech/dbname"
VITE_DATABASE_URL="postgresql://user:password@project-name.neon.tech/dbname"
`
        break
    }
  }

  // Write files if they don't exist
  if (!fs.existsSync(envPath)) {
    fs.writeFileSync(envPath, content)
  }

  if (!fs.existsSync(examplePath)) {
    fs.writeFileSync(examplePath, content)
  }

  return {
    deps: [], // No dependencies needed for just creating an env file
  }
}

module.exports = { run }