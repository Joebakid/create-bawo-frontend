const fs = require("fs")
const path = require("path")

/* --------------------------------
Core features (always available)
-------------------------------- */

const core = {
  git: require("./git"),
  env: require("./env"),
  meta: require("./meta")
}

/* --------------------------------
Auto-load optional features
-------------------------------- */

function loadOptionalFeatures() {

  const dir = __dirname

  const folders = fs
    .readdirSync(dir)
    .filter(f => {

      const full = path.join(dir, f)

      if (!fs.statSync(full).isDirectory()) return false

      /* ignore core folders already loaded */
      if (["git", "env", "meta"].includes(f)) return false

      return true

    })

  const features = {}

  for (const folder of folders) {

    try {
      features[folder] = require(`./${folder}`)
    } catch (err) {
      console.warn(`⚠️ Failed to load feature: ${folder}`)
    }

  }

  return features
}

/* --------------------------------
Merge core + optional
-------------------------------- */

module.exports = {
  ...core,
  ...loadOptionalFeatures()
}