const fs = require("fs")
const path = require("path")

async function run(projectDir, options = {}) {

  const framework = options.framework
  const useTS = options.ts

  const ext = useTS ? "ts" : "js"

  /* --------------------------------
  Resolve correct folder
  -------------------------------- */

  const baseDir =
    framework === "next"
      ? path.join(projectDir, "lib")
      : path.join(projectDir, "src", "lib")

  const file = path.join(baseDir, `supabase.${ext}`)

  fs.mkdirSync(baseDir, { recursive: true })

  let content

  /* --------------------------------
  Next.js
  -------------------------------- */

  if (framework === "next") {

    content = `import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)
`

  }

  /* --------------------------------
  Vite frameworks (React, Vue, Svelte)
  -------------------------------- */

  else {

    content = `import { createClient } from "@supabase/supabase-js"

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)
`

  }

  fs.writeFileSync(file, content)

  return {
    deps: ["@supabase/supabase-js"]
  }

}

module.exports = { run }