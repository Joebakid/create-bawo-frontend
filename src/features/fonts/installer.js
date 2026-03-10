const fs = require("fs");
const path = require("path");
const registry = require("./registry");

async function addFont(projectDir, fontKey) {

  const font = registry[fontKey];

  if (!font) {
    console.warn(`⚠️ Unknown font "${fontKey}", skipping font install`);
    return;
  }

  const isNext = fs.existsSync(path.join(projectDir, "app"));

  /* -------------------------------------------------
   * Find the globals CSS file
   * ------------------------------------------------- */

  const candidates = isNext
    ? ["app/globals.css", "src/app/globals.css"]
    : ["src/globals.css", "src/index.css", "src/styles/globals.css", "globals.css"];

  let cssPath = null;

  for (const candidate of candidates) {
    const full = path.join(projectDir, candidate);
    if (fs.existsSync(full)) {
      cssPath = full;
      break;
    }
  }

  if (!cssPath) {
    console.warn(`⚠️ Could not find globals CSS file, skipping font inject`);
    return;
  }

  /* -------------------------------------------------
   * Inject font AFTER @import statements
   * ------------------------------------------------- */

  const existing = fs.readFileSync(cssPath, "utf8");

  if (existing.includes(font.url)) return; // already injected

  const fontBlock = `\n@import url("${font.url}");\n\n:root {\n  --font-sans: "${font.family}", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;\n}\n\nbody {\n  font-family: var(--font-sans);\n}\n`;

  // Insert after the last @import line
  const lines = existing.split("\n");
  let lastImportIndex = -1;

  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim().startsWith("@import")) {
      lastImportIndex = i;
    }
  }

  if (lastImportIndex === -1) {
    // No @import found, just prepend
    fs.writeFileSync(cssPath, fontBlock + existing);
  } else {
    // Insert after the last @import line
    lines.splice(lastImportIndex + 1, 0, fontBlock);
    fs.writeFileSync(cssPath, lines.join("\n"));
  }

}

module.exports = { addFont };