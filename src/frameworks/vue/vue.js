/* eslint-disable no-console */

const fs = require("fs")
const path = require("path")

const { ensure, copyDir } = require("../../utils")
const fontsInstaller = require("../../features/fonts/installer")

async function scaffoldVue(projectDir, options = {}) {

  const isTs = Boolean(options.ts)

  const templateDir = path.join(__dirname, "template")

  console.log("Creating Vue project from template...")

  /* ---------------------------------
  Ensure project directory exists
  --------------------------------- */

  ensure(projectDir)

  /* ---------------------------------
  Copy base Vue template
  --------------------------------- */

  copyDir(templateDir, projectDir)

  /* ---------------------------------
  Convert TypeScript → JavaScript
  --------------------------------- */

  if (!isTs) {

    const tsMain = path.join(projectDir, "src/main.ts")
    const jsMain = path.join(projectDir, "src/main.js")

    if (fs.existsSync(tsMain)) {
      fs.renameSync(tsMain, jsMain)
    }

    replaceInFile(
      path.join(projectDir, "index.html"),
      "/src/main.ts",
      "/src/main.js"
    )

    const viteTs = path.join(projectDir, "vite.config.ts")
    const viteJs = path.join(projectDir, "vite.config.js")

    if (fs.existsSync(viteTs)) {
      fs.renameSync(viteTs, viteJs)
    }

  }

  /* ---------------------------------
  Fonts
  --------------------------------- */

  if (options.font && fontsInstaller?.addFont) {

    console.log("Installing font:", options.font)

    await fontsInstaller.addFont(projectDir, options.font)

  }

  /* ---------------------------------
  Optional GSAP helpers
  --------------------------------- */

  if (options.gsap) {

    console.log("Adding GSAP helpers...")

    const gsapSrc = path.join(
      __dirname,
      "../../features/animations/gsap"
    )

    const gsapDest = path.join(
      projectDir,
      "src/animations/gsap"
    )

    if (fs.existsSync(gsapSrc)) {
      copyDir(gsapSrc, gsapDest)
    }

  }

  console.log("Vue scaffold complete")

  return projectDir

}

/* ---------------------------------
Helpers
--------------------------------- */

function replaceInFile(file, from, to) {

  if (!fs.existsSync(file)) return

  const content = fs.readFileSync(file, "utf8")

  fs.writeFileSync(
    file,
    content.replaceAll(from, to)
  )

}

module.exports = {
  scaffoldVue
}