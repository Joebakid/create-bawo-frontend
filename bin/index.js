#!/usr/bin/env node
/* eslint-disable no-console */

const fs = require("fs")
const path = require("path")

const getFlags = require("../src/cli/flags")
const applyPreset = require("../src/cli/presets")
const { promptMissing } = require("../src/cli/prompts")
const applyPositional = require("../src/cli/positional")
const normalizeOptions = require("../src/cli/normalize")

const runFramework = require("../src/frameworks")
const runFeatures = require("../src/features")

const { run } = require("../src/utils")

/* -------------------------------
Handle Ctrl+C
-------------------------------- */

process.on("SIGINT", () => {
  console.log("\nSetup cancelled.")
  process.exit(1)
})

/* -------------------------------
Main
-------------------------------- */

async function main() {

  let options = getFlags()

  /* -------------------------------
  Positional args
  -------------------------------- */

  options = applyPositional(options)

  /* -------------------------------
  Normalize flags early
  -------------------------------- */

  options = normalizeOptions(options)

  /* -------------------------------
  Apply preset
  -------------------------------- */

  if (options.preset) {
    Object.assign(options, applyPreset(options))
  }

  /* -------------------------------
  Normalize again (preset safety)
  -------------------------------- */

  options = normalizeOptions(options)

  /* -------------------------------
  Prompts
  -------------------------------- */

  if (!(options.y || options.yes)) {

    options = await promptMissing(options)

  } else {

    options.name ??= "my-app"
    options.framework ??= "react"
    options.ts ??= true
    options.tailwind ??= "v3"
    options["state-mgmt"] ??= "none"
    options.font ??= "inter"
    options.start ??= true

  }

  /* -------------------------------
  Final normalization
  -------------------------------- */

  options = normalizeOptions(options)

  /* -------------------------------
  Project directory
  -------------------------------- */

  const projectDir = path.resolve(process.cwd(), options.name)

  if (fs.existsSync(projectDir)) {
    console.error(`Directory "${options.name}" already exists.`)
    process.exit(1)
  }

  console.log(`\nCreating ${options.framework} project: ${options.name}\n`)

  /* -------------------------------
  Framework scaffold
  -------------------------------- */

  console.log("Scaffolding project...")

  await runFramework(projectDir, options)

  /* -------------------------------
  Install framework deps
  -------------------------------- */

  console.log("Installing framework dependencies...")

  await run("npm", ["install"], projectDir)

  /* -------------------------------
  Run features
  -------------------------------- */

  console.log("Installing features...")

  const result = await runFeatures(projectDir, options)

  /* -------------------------------
  Install feature deps
  -------------------------------- */

  if (result?.deps?.length) {
    await run("npm", ["install", ...result.deps], projectDir)
  }

  if (result?.devDeps?.length) {
    await run("npm", ["install", "-D", ...result.devDeps], projectDir)
  }

  /* -------------------------------
  Done
  -------------------------------- */

  console.log("\nProject ready\n")

  console.log(`cd ${options.name}`)

  if (options.start) {

    console.log("\nStarting dev server...\n")

    await run("npm", ["run", "dev"], projectDir)

  } else {

    console.log("npm run dev\n")

  }

}

/* -------------------------------
Error handler
-------------------------------- */

main().catch((err) => {

  console.error("\nError creating project")
  console.error(err)

  process.exit(1)

})