// src/fonts/installer.js
const fs = require("fs");
const path = require("path");
const https = require("https");
const registry = require("./registry");

function download(url, dest) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      res.pipe(fs.createWriteStream(dest));
      res.on("end", resolve);
      res.on("error", reject);
    });
  });
}

async function installFont(projectDir, fontKey) {
  const font = registry[fontKey];
  if (!font) throw new Error("Font not found");

  const baseDir = path.join(projectDir, "src/fonts", fontKey);
  fs.mkdirSync(baseDir, { recursive: true });

  const cssUrl = `https://fonts.googleapis.com/css2?family=${font.family.replace(
    / /g,
    "+"
  )}:wght@${font.weights.join(";")}`;

  https.get(cssUrl, (res) => {
    let css = "";
    res.on("data", (d) => (css += d));
    res.on("end", async () => {
      const urls = css.match(/https:\/\/[^)]+\.woff2/g) || [];

      for (const url of urls) {
        const fileName = path.basename(url.split("?")[0]);
        const dest = path.join(baseDir, fileName);
        await download(url, dest);
      }
    });
  });
}

module.exports = { installFont };
