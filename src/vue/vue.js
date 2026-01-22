/* eslint-disable no-console */
const fs = require("fs");
const path = require("path");
const { ensure, run } = require("../utils");
const { installFont } = require("../fonts");


/**
 * Vue scaffold using INTERNAL TEMPLATE (no create-vite)
 * Automatically installs dependencies
 */
async function scaffoldVue(options, projectDir) {
  const isTs = Boolean(options.ts);
  const templateDir = path.join(__dirname, "template");

  console.log("🟢 Scaffolding Vue project from internal template");

  /* -------------------------------------------------
   * 1️⃣ Copy template
   * ------------------------------------------------- */
  copyDir(templateDir, projectDir);

  /* -------------------------------------------------
   * 2️⃣ Handle JS fallback when TS is disabled
   * ------------------------------------------------- */
  if (!isTs) {
    const tsMain = path.join(projectDir, "src/main.ts");
    const jsMain = path.join(projectDir, "src/main.js");

    if (fs.existsSync(tsMain)) {
      fs.renameSync(tsMain, jsMain);
    }

    // Fix index.html entry
    replaceInFile(
      path.join(projectDir, "index.html"),
      "/src/main.ts",
      "/src/main.js"
    );

    // Rename vite config if present
    const viteTs = path.join(projectDir, "vite.config.ts");
    const viteJs = path.join(projectDir, "vite.config.js");

    if (fs.existsSync(viteTs)) {
      fs.renameSync(viteTs, viteJs);
    }
  }


   /* -------------------------------------------------
   * 2.5️⃣ Fonts (Vue)
   * ------------------------------------------------- */
  if (options.font) {
    console.log(`🎨 Installing font: ${options.font}`);
    installFont(options.font, projectDir, "vue");
  }

  /* -------------------------------------------------
   * 3️⃣ GSAP (Vue – optional)
   * ------------------------------------------------- */
  if (options.gsap) {
    console.log("🎞️ Adding GSAP to Vue project...");

    // Install GSAP
    await run("npm", ["install", "gsap"], projectDir);

    // Copy GSAP helpers from framework repo
    const gsapSrc = path.join(__dirname, "../animations/gsap");
    const gsapDest = path.join(projectDir, "src/animations/gsap");

    if (fs.existsSync(gsapSrc)) {
      copyDir(gsapSrc, gsapDest);
    } else {
      console.warn("⚠️ GSAP helpers not found, skipping copy");
    }
  }

  /* -------------------------------------------------
   * 4️⃣ Install remaining dependencies
   * ------------------------------------------------- */
  console.log("📦 Installing dependencies...");
  await run("npm", ["install"], projectDir);

  /* -------------------------------------------------
   * 5️⃣ Done
   * ------------------------------------------------- */
  console.log(`
✅ Vue project ready

cd ${path.basename(projectDir)}
npm run dev
`);
}

/* ---------------------------------
 * Helpers
 * --------------------------------- */
function copyDir(src, dest) {
  ensure(dest);
  for (const entry of fs.readdirSync(src)) {
    const srcPath = path.join(src, entry);
    const destPath = path.join(dest, entry);

    if (fs.statSync(srcPath).isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function replaceInFile(file, from, to) {
  if (!fs.existsSync(file)) return;
  const content = fs.readFileSync(file, "utf8");
  fs.writeFileSync(file, content.replaceAll(from, to));
}

module.exports = {
  scaffoldVue,
};
