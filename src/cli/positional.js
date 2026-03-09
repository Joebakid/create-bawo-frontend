/* eslint-disable no-console */

module.exports = function applyPositional(options, logger) {

  const positional = options._ || []

  const nameArg = positional[0]
  const frameworkArg = positional[1]
  const backendArg = positional[2]

  if (nameArg) {
    options.name = nameArg
  }

  if (frameworkArg) {
    options.framework = frameworkArg
  }

  if (backendArg) {
    options.backend = backendArg
  }

  /* --------------------------------
  Validation
  -------------------------------- */

  const frameworks = ["react", "next", "vue", "svelte"]
  const backends = ["supabase", "firebase", "appwrite", "pocketbase"]

  if (frameworkArg && !frameworks.includes(frameworkArg)) {
    logger.error(`Unknown framework: ${frameworkArg}`)
    process.exit(1)
  }

  if (backendArg && !backends.includes(backendArg)) {
    logger.error(`Unknown backend: ${backendArg}`)
    process.exit(1)
  }

  /* --------------------------------
  Backend flags
  -------------------------------- */

  options.supabase = backendArg === "supabase"
  options.firebase = backendArg === "firebase"
  options.appwrite = backendArg === "appwrite"
  options.pocketbase = backendArg === "pocketbase"

  return options

}