const { setupShadcnUI } = require("./install")

module.exports.install = async function ({ projectDir }) {
  await setupShadcnUI({ projectDir })
}