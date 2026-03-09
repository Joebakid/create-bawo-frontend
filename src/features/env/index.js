const fs = require("fs")
const path = require("path")

async function run(projectDir) {

  const envPath = path.join(projectDir, ".env")
  const examplePath = path.join(projectDir, ".env.example")

  const content = `# Environment variables

# API URL
VITE_API_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3000

# App name
VITE_APP_NAME=MyApp
`

  if (!fs.existsSync(envPath)) {
    fs.writeFileSync(envPath, content)
  }

  if (!fs.existsSync(examplePath)) {
    fs.writeFileSync(examplePath, content)
  }

}

module.exports = { run }