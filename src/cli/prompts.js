const prompts = require("prompts")

async function pickFontPaginated(fontKeys, pageSize = 5) {

  let page = 0

  while (true) {

    const start = page * pageSize
    const end = start + pageSize

    const slice = fontKeys.slice(start, end)

    const choices = slice.map((key) => ({
      title: key
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, c => c.toUpperCase()),
      value: key
    }))

    if (end < fontKeys.length) {
      choices.push({ title: "More…", value: "__more" })
    }

    if (page > 0) {
      choices.push({ title: "Back", value: "__back" })
    }

    choices.push({ title: "System default", value: null })

    const { font } = await prompts({
      type: "select",
      name: "font",
      message: "Choose a font",
      choices
    })

    if (font === "__more") {
      page++
      continue
    }

    if (font === "__back") {
      page--
      continue
    }

    return font
  }

}

async function promptMissing(options) {

  /* -------------------------------------------------
  Project name
  ------------------------------------------------- */

  if (!options.name) {

    const { name } = await prompts({
      type: "text",
      name: "name",
      message: "Project name"
    })

    if (!name) process.exit(1)

    options.name = name
  }

  /* -------------------------------------------------
  Framework
  ------------------------------------------------- */

  if (!options.framework) {

    const { framework } = await prompts({
      type: "select",
      name: "framework",
      message: "Choose a framework",
      choices: [
        { title: "React (Vite)", value: "react" },
        { title: "Next.js", value: "next" },
        { title: "Vue", value: "vue" },
        { title: "Svelte", value: "svelte" }
      ]
    })

    options.framework = framework
  }

  /* -------------------------------------------------
  TypeScript
  ------------------------------------------------- */

  if (options.ts === undefined) {

    const { ts } = await prompts({
      type: "confirm",
      name: "ts",
      message: "Use TypeScript?",
      initial: true
    })

    options.ts = ts
  }

  /* -------------------------------------------------
  Tailwind
  ------------------------------------------------- */

  if (!options.tailwind) {

    const isVue = options.framework === "vue"

    const choices = [
      { title: "v3", value: "v3" }
    ]

    if (!isVue) {
      choices.push({ title: "v4", value: "v4" })
    }

    const { tailwind } = await prompts({
      type: "select",
      name: "tailwind",
      message: "Tailwind version",
      choices
    })

    options.tailwind = tailwind
  }

  /* -------------------------------------------------
  UI framework (React / Next only)
  ------------------------------------------------- */

  if (
    !options.ui &&
    (options.framework === "react" || options.framework === "next")
  ) {

    const { ui } = await prompts({
      type: "select",
      name: "ui",
      message: "UI framework",
      choices: [
        { title: "None", value: null },
        { title: "shadcn/ui", value: "shadcn" }
      ]
    })

    options.ui = ui
  }

  /* -------------------------------------------------
  Fonts
  ------------------------------------------------- */

  if (!options.font) {

    const registry = require("../features/fonts/registry")
    const fontKeys = Object.keys(registry)

    options.font = await pickFontPaginated(fontKeys, 5)

  }

  /* -------------------------------------------------
  State management (React / Next only)
  ------------------------------------------------- */

  if (
    !options["state-mgmt"] &&
    (options.framework === "react" || options.framework === "next")
  ) {

    const { state } = await prompts({
      type: "select",
      name: "state",
      message: "State management",
      choices: [
        { title: "Redux", value: "redux" },
        { title: "RTK Query", value: "rtk-query" },
        { title: "React Query", value: "react-query" },
        { title: "SWR", value: "swr" },
        { title: "Zustand", value: "zustand" },
        { title: "Context API", value: "context" },
        { title: "None", value: "none" }
      ]
    })

    options["state-mgmt"] = state
  }

  /* -------------------------------------------------
  Backend Services
  ------------------------------------------------- */

  if (!options.backend) {

    const { backend } = await prompts({
      type: "select",
      name: "backend",
      message: "Choose backend service",
      choices: [
        { title: "None", value: "none" },
        { title: "Supabase", value: "supabase" },
        { title: "Firebase", value: "firebase" },
        { title: "Appwrite", value: "appwrite" },
        { title: "PocketBase", value: "pocketbase" }
      ]
    })

    options.backend = backend

    options.supabase = backend === "supabase"
    options.firebase = backend === "firebase"
    options.appwrite = backend === "appwrite"
    options.pocketbase = backend === "pocketbase"
  }

  /* -------------------------------------------------
  Auto start dev server
  ------------------------------------------------- */

  if (options.start === undefined) {

    const { start } = await prompts({
      type: "confirm",
      name: "start",
      message: "Start dev server automatically?",
      initial: true
    })

    options.start = start
  }

  return options
}

module.exports = { promptMissing }