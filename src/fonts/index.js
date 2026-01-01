// src/fonts/index.js
const path = require("path");
const registry = require("./registry");
const { installFont } = require("./installer");
const { generateFontCSS } = require("./css-generator");
const { patchTailwindConfig } = require("./tailwind-patch");

async function addFont(projectDir, fontKey) {
  const font = registry[fontKey];
  if (!font) throw new Error(`Unknown font: ${fontKey}`);

  await installFont(projectDir, fontKey);
  generateFontCSS(projectDir, fontKey, font);

  const tailwindConfig = path.join(projectDir, "tailwind.config.js");
  patchTailwindConfig(tailwindConfig, fontKey, font.family);
}

module.exports = {
  addFont,
  registry,
};
