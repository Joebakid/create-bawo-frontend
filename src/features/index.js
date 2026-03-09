const path = require("path")
const { execSync } = require("child_process")
const { copyDir } = require("../utils")

const features = require("./registry")

module.exports = async function runFeatures(projectDir, options) {

  const deps = new Set()
  const devDeps = new Set()

  function collect(result) {
    if (!result) return

    if (result.deps) {
      result.deps.forEach(d => deps.add(d))
    }

    if (result.devDeps) {
      result.devDeps.forEach(d => devDeps.add(d))
    }
  }

  /* --------------------------------
  CORE FEATURES (always run)
  -------------------------------- */

  const core = [
    "git",
    "env",
    "meta",
    "seo"
  ]

  for (const name of core) {

    const feature = features[name]

    if (feature && typeof feature.run === "function") {
      console.log(`⚙️  Running ${name}...`)
      const result = await feature.run(projectDir, options)
      collect(result)
    }

  }

  /* --------------------------------
  OPTIONAL FEATURES
  -------------------------------- */

  for (const name of Object.keys(features)) {

    if (core.includes(name)) continue

    const feature = features[name]

    if (options[name] && feature && typeof feature.run === "function") {
      console.log(`⚡ Adding ${name}...`)
      const result = await feature.run(projectDir, options)
      collect(result)
    }

  }

  /* --------------------------------
  Install dependencies
  -------------------------------- */

  if (deps.size) {
    console.log("\n📦 Installing dependencies...\n")

    execSync(
      `npm install ${[...deps].join(" ")}`,
      {
        cwd: projectDir,
        stdio: "inherit"
      }
    )
  }

  if (devDeps.size) {
    console.log("\n🛠 Installing dev dependencies...\n")

    execSync(
      `npm install -D ${[...devDeps].join(" ")}`,
      {
        cwd: projectDir,
        stdio: "inherit"
      }
    )
  }

  /* --------------------------------
  Docs
  -------------------------------- */

  if (!options["skip-docs"]) {

    copyDir(
      path.join(__dirname, "../templates/docs"),
      path.join(projectDir, "docs")
    )

  }

}