const path = require("path")
const copyDir = require("../../utils").copyDir

module.exports.run = async function(projectDir, options){

if (!options.gsap && !options.framer) return

const animationsDest = path.join(projectDir, "src/animations")

if (options.gsap) {
copyDir(
path.join(__dirname, "gsap"),
path.join(animationsDest, "gsap")
)
}

if (options.framer) {
copyDir(
path.join(__dirname, "framer"),
path.join(animationsDest, "framer")
)
}

}
