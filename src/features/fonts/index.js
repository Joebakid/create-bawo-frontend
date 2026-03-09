const { addFont } = require("./installer")

module.exports.run = async function(projectDir, options){

if (!options.font) return

await addFont(projectDir, options.font)

}
