const fs = require("fs")
const path = require("path")

/* --------------------------------
Core features
-------------------------------- */

const core = {
  git: require("./git"),
  env: require("./env"),
  meta: require("./meta"),
  seo: require("./seo")
}

/* --------------------------------
Load optional features
-------------------------------- */

function loadOptionalFeatures() {

  const dir = __dirname
  const features = {}

  const folders = fs.readdirSync(dir)

  for (const folder of folders) {

    const full = path.join(dir, folder)

    if (!fs.statSync(full).isDirectory()) continue
    if (core[folder]) continue

    try {

      const feature = require(`./${folder}`)

      if (feature && typeof feature.run === "function") {
        features[folder] = feature
      }

    } catch (err) {

      console.warn(`⚠ Failed to load feature: ${folder}`)

    }

  }

  return features

}

/* --------------------------------
Export registry
-------------------------------- */

module.exports = {
  ...core,
  ...loadOptionalFeatures()
}