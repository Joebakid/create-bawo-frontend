// src/fonts/tailwind-patch.js
const fs = require("fs");

function patchTailwindConfig(configPath, fontKey, family) {
  if (!fs.existsSync(configPath)) return;

  const content = fs.readFileSync(configPath, "utf8");

  if (content.includes(fontKey)) return;

  const patch = `
      // ${fontKey}: ["${family}", "sans-serif"],
`;

  fs.writeFileSync(configPath, content.replace(
    "fontFamily: {",
    "fontFamily: {" + patch
  ));
}

module.exports = { patchTailwindConfig };
