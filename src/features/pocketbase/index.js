const fs = require("fs")
const path = require("path")

async function run(projectDir) {

  const file = path.join(projectDir, "src/lib/pocketbase.js")

  fs.mkdirSync(path.dirname(file), { recursive: true })

  fs.writeFileSync(
    file,
`import PocketBase from "pocketbase"

const pb = new PocketBase(import.meta.env.VITE_POCKETBASE_URL)

export default pb
`
  )

  return {
    deps: ["pocketbase"]
  }
}

module.exports = { run }