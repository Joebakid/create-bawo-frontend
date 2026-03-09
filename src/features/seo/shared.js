const fs = require("fs")

function injectBlock(html, block, tag = "<head>") {

  if (html.includes("CBF JSON-LD") || html.includes("CBF SEO")) {
    return html
  }

  return html.replace(tag, `${tag}\n${block}`)
}

function readFile(file) {
  return fs.readFileSync(file, "utf8")
}

function writeFile(file, content) {
  fs.writeFileSync(file, content)
}

module.exports = {
  injectBlock,
  readFile,
  writeFile
}