const fs = require("fs")
const path = require("path")
const { copyDir } = require("../utils")

const features = require("./registry")

module.exports = async function runFeatures(projectDir, options) {

  const deps = new Set()
  const devDeps = new Set()

  function collect(result) {
    if (!result) return

    if (result.deps) result.deps.forEach(d => deps.add(d))
    if (result.devDeps) result.devDeps.forEach(d => devDeps.add(d))
  }

  function runFeature(name) {
    const feature = features[name]
    if (!feature || typeof feature.run !== "function") return null
    return feature.run(projectDir, options)
  }

  /* --------------------------------
  CORE FEATURES
  -------------------------------- */

  const core = ["git", "env", "meta", "seo"]

  for (const name of core) {

    try {

      const result = await runFeature(name)

      collect(result)

    } catch (err) {

      throw new Error(`Feature failed: ${name}\n${err.message}`)

    }

  }

  /* --------------------------------
  OPTIONAL FEATURES
  -------------------------------- */

  for (const [name, feature] of Object.entries(features)) {

    if (core.includes(name)) continue
    if (!options[name]) continue
    if (!feature || typeof feature.run !== "function") continue

    try {

      const result = await feature.run(projectDir, options)

      collect(result)

    } catch (err) {

      throw new Error(`Feature failed: ${name}\n${err.message}`)

    }

  }

  /* --------------------------------
  Docs
  -------------------------------- */

  if (!options["skip-docs"]) {

    const docsSrc = path.join(__dirname, "../templates/docs")
    const docsDest = path.join(projectDir, "docs")

    if (fs.existsSync(docsSrc)) {
      copyDir(docsSrc, docsDest)
    }

  }

  return {
    deps: [...deps],
    devDeps: [...devDeps]
  }

}