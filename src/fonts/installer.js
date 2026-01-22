const fs = require("fs");
const path = require("path");
const registry = require("./registry");
const { ensure } = require("../utils");

async function addFont(projectDir, fontKey) {
  const font = registry[fontKey];

  if (!font) {
    console.warn(`⚠️ Unknown font "${fontKey}", skipping font install`);
    return;
  }

  // Detect framework by folder structure
  const isNext = fs.existsSync(path.join(projectDir, "app"));

  // ✅ Correct styles directory per framework
  const stylesDir = isNext
    ? path.join(projectDir, "app/styles")
    : path.join(projectDir, "src/styles");

  ensure(stylesDir);

  const cssPath = path.join(stylesDir, "fonts.css");

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

  injectFontImport(projectDir, isNext);
}

function injectFontImport(projectDir, isNext) {
  const importLine = `import "./styles/fonts.css";\n`;

  const targets = isNext
    ? ["app/layout.tsx", "app/layout.jsx"]
    : [
        "src/main.tsx",
        "src/main.jsx",
        "src/main.ts",
        "src/main.js",
      ];

  for (const file of targets) {
    const fullPath = path.join(projectDir, file);
    if (!fs.existsSync(fullPath)) continue;

    const content = fs.readFileSync(fullPath, "utf8");
    if (content.includes("fonts.css")) return;

    fs.writeFileSync(fullPath, importLine + content);
    return;
  }
}

module.exports = { addFont };
