const fs = require("fs");
const path = require("path");

const registry = require("./registry");
const { ensure } = require("../../utils");

/**
 * Install selected font
 */

async function addFont(projectDir, fontKey) {

  const font = registry[fontKey];

  if (!font) {
    console.warn(`⚠️ Unknown font "${fontKey}", skipping font install`);
    return;
  }

  /* -------------------------------------------------
   * Detect framework
   * ------------------------------------------------- */

  const isNext = fs.existsSync(path.join(projectDir, "app"));
  const isVue = fs.existsSync(path.join(projectDir, "src/main.ts")) ||
                fs.existsSync(path.join(projectDir, "src/main.js"));

  /* -------------------------------------------------
   * Determine styles directory
   * ------------------------------------------------- */

  const stylesDir = isNext
    ? path.join(projectDir, "app/styles")
    : path.join(projectDir, "src/styles");

  ensure(stylesDir);

  const cssPath = path.join(stylesDir, "fonts.css");

  /* -------------------------------------------------
   * CSS
   * ------------------------------------------------- */

  const css = `
@import url("${font.url}");

:root {
  --font-sans: "${font.family}", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

body {
  font-family: var(--font-sans);
}
`;

  fs.writeFileSync(cssPath, css.trim() + "\n");

  /* -------------------------------------------------
   * Inject import
   * ------------------------------------------------- */

  injectFontImport(projectDir, isNext, isVue);

}

/* -------------------------------------------------
 * Inject CSS import into entry file
 * ------------------------------------------------- */

function injectFontImport(projectDir, isNext, isVue) {

  const importLine = `import "./styles/fonts.css";\n`;

  let targets;

  if (isNext) {

    targets = [
      "app/layout.tsx",
      "app/layout.jsx"
    ];

  } else if (isVue) {

    targets = [
      "src/main.ts",
      "src/main.js"
    ];

  } else {

    // React
    targets = [
      "src/main.tsx",
      "src/main.jsx",
      "src/main.ts",
      "src/main.js"
    ];

  }

  for (const file of targets) {

    const fullPath = path.join(projectDir, file);

    if (!fs.existsSync(fullPath)) continue;

    const content = fs.readFileSync(fullPath, "utf8");

    if (content.includes("fonts.css")) return;

    fs.writeFileSync(fullPath, importLine + content);

    return;

  }

}

module.exports = {
  addFont
};