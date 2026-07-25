const fs = require("fs")
const path = require("path")

async function run(projectDir) {
  // Mirrors the placement of your firebase integration
  const file = path.join(projectDir, "src/lib/neon.js")

  fs.mkdirSync(path.dirname(file), { recursive: true })

  fs.writeFileSync(
    file,
`import { neon } from "@neondatabase/serverless"

// Note: Use process.env.DATABASE_URL for Next.js/Node environments
// Use import.meta.env.VITE_DATABASE_URL for Vite environments 
// (Warning: Be careful not to expose your Postgres credentials to the client in a SPA!)
const connectionString = process.env.DATABASE_URL || import.meta.env.VITE_DATABASE_URL

if (!connectionString) {
  throw new Error("Neon connection string is missing. Please check your environment variables.")
}

export const sql = neon(connectionString)
`
  )

  return {
    deps: ["@neondatabase/serverless"]
  }
}

module.exports = { run }