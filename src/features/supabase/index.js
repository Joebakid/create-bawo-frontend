const fs = require("fs")
const path = require("path")

async function run(projectDir) {

  const file = path.join(projectDir, "src/lib/supabase.js")

  fs.mkdirSync(path.dirname(file), { recursive: true })

  fs.writeFileSync(
    file,
`import { createClient } from "@supabase/supabase-js"

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)
`
  )

  return {
    deps: ["@supabase/supabase-js"]
  }
}

module.exports = { run }