module.exports.run = async function (projectDir, options) {

  if (!options.ui || options.ui === "none") return

  if (options.ui === "shadcn") {
    const shadcn = require("./shadcn")
    await shadcn.install({ projectDir })
  }

}