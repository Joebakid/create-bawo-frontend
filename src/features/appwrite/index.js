const fs = require("fs")
const path = require("path")

async function run(projectDir) {

  const file = path.join(projectDir, "src/lib/appwrite.js")

  fs.mkdirSync(path.dirname(file), { recursive: true })

  fs.writeFileSync(
    file,
`import { Client, Account, Databases } from "appwrite"

const client = new Client()

client
  .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT)
  .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID)

export const account = new Account(client)
export const databases = new Databases(client)

export default client
`
  )

  return {
    deps: ["appwrite"]
  }
}

module.exports = { run }