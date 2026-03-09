const path = require("path")
const fs = require("fs")

const { createMeta } = require("./files")
const { createJSONLD } = require("./jsonld")
const { injectBlock } = require("./shared")

module.exports = async function (projectDir, options) {

  const htmlPath = path.join(projectDir, "index.html")

  if (!fs.existsSync(htmlPath)) return

  let html = fs.readFileSync(htmlPath, "utf8")

  const meta = createMeta(options)
  const jsonld = createJSONLD(options)

  html = injectBlock(html, meta)
  html = injectBlock(html, jsonld)

  fs.writeFileSync(htmlPath, html)

}