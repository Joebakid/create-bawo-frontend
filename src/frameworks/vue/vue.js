/* eslint-disable no-console */

const fs = require("fs")
const path = require("path")

const { ensure, copyDir } = require("../../utils")
const { installFont } = require("../../features/fonts")

async function scaffoldVue(projectDir, options) {

  const isTs = Boolean(options.ts)
  const templateDir = path.join(__dirname, "template")

  console.log("🟢 Scaffolding Vue project from internal template")

  /* -------------------------------------------------
  Ensure project directory exists
  ------------------------------------------------- */

  ensure(projectDir)

  /* -------------------------------------------------
  Copy template
  ------------------------------------------------- */

  copyDir(templateDir, projectDir)

  /* -------------------------------------------------
  JS fallback when TypeScript disabled
  ------------------------------------------------- */

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

  /* -------------------------------------------------
  Fonts
  ------------------------------------------------- */

  if (options.font) {

    console.log(`🎨 Installing font: ${options.font}`)

    installFont(options.font, projectDir, "vue")

  }

  /* -------------------------------------------------
  GSAP helpers (feature handles dependency)
  ------------------------------------------------- */

  if (options.gsap) {

    console.log("🎞️ Adding GSAP helpers...")

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

    } else {

      console.warn("⚠️ GSAP helpers not found")

    }

  }

  /* -------------------------------------------------
  Done
  ------------------------------------------------- */

  console.log("✅ Vue scaffold complete")

}

/* ---------------------------------
Helpers
--------------------------------- */

function replaceInFile(file, from, to) {

  if (!fs.existsSync(file)) return

  const content = fs.readFileSync(file, "utf8")

  fs.writeFileSync(file, content.replaceAll(from, to))

}

module.exports = {
  scaffoldVue
}