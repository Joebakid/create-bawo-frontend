const yargs = require("yargs/yargs")
const { hideBin } = require("yargs/helpers")

function getFlags() {

  return yargs(hideBin(process.argv))

    .scriptName("create-bawo-frontend")

    .usage("$0 [project-name] [options]")

    /* Framework */

    .option("framework", {
      type: "string",
      describe: "Framework to use (react, next, vue, svelte)"
    })

    /* Language */

    .option("ts", {
      type: "boolean",
      describe: "Use TypeScript"
    })

    /* Styling */

    .option("tailwind", {
      type: "string",
      describe: "Tailwind version (v3 or v4)"
    })

    .option("ui", {
      type: "string",
      describe: "UI library (shadcn)"
    })

    /* State Management */

    .option("state-mgmt", {
      type: "string",
      describe: "State management (redux, rtk-query, react-query, swr, zustand, context)"
    })

    .option("redux", {
      type: "boolean",
      describe: "Use Redux"
    })

    .option("zustand", {
      type: "boolean",
      describe: "Use Zustand"
    })

    .option("context", {
      type: "boolean",
      describe: "Use Context API"
    })

    .option("react-query", {
      type: "boolean",
      describe: "Use React Query"
    })

    .option("rtk-query", {
      type: "boolean",
      describe: "Use RTK Query"
    })

    .option("swr", {
      type: "boolean",
      describe: "Use SWR"
    })

    /* Animations */

    .option("framer", {
      type: "boolean",
      describe: "Install Framer Motion"
    })

    .option("gsap", {
      type: "boolean",
      describe: "Install GSAP animations"
    })

    /* Backend Services */

    .option("supabase", {
      type: "boolean",
      describe: "Install Supabase backend"
    })

    .option("firebase", {
      type: "boolean",
      describe: "Install Firebase backend"
    })

    .option("appwrite", {
      type: "boolean",
      describe: "Install Appwrite backend"
    })

    .option("pocketbase", {
      type: "boolean",
      describe: "Install PocketBase backend"
    })

    /* Fonts */

    .option("font", {
      type: "string",
      describe: "Install Google Font"
    })

    /* Presets */

    .option("preset", {
      type: "string",
      describe: "Starter preset (minimal, animation, full)"
    })

    /* SEO */

    .option("title", {
      type: "string",
      describe: "SEO title"
    })

    .option("description", {
      type: "string",
      describe: "SEO description"
    })

    .option("keywords", {
      type: "string",
      describe: "SEO keywords"
    })

    .option("author", {
      type: "string",
      describe: "SEO author"
    })

    .option("image", {
      type: "string",
      describe: "SEO preview image"
    })

    .option("site-url", {
      type: "string",
      describe: "Production site URL"
    })

    /* Misc */

    .option("skip-docs", {
      type: "boolean",
      describe: "Skip docs"
    })

    .option("yes", {
      alias: "y",
      type: "boolean",
      describe: "Skip prompts"
    })

    .strict(false)
    .help()
    .parse()

}

module.exports = getFlags