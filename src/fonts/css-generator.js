const fs = require("fs");
const path = require("path");
const { ensure } = require("../utils");
const registry = require("./registry");

function generateFontCSS(fontKey, projectDir) {
  const font = registry[fontKey];
  if (!font) return;

  const stylesDir = path.join(projectDir, "src/styles");
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
}

module.exports = { generateFontCSS };
