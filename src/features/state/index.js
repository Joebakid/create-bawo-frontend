const path = require("path");
const fs = require("fs");

/* ---------------------------------
Copy helper
--------------------------------- */

function copyDir(src, dest) {

  if (!fs.existsSync(src)) return;

  fs.mkdirSync(dest, { recursive: true });

  for (const file of fs.readdirSync(src)) {

    const srcPath = path.join(src, file);
    const destPath = path.join(dest, file);

    if (fs.statSync(srcPath).isDirectory()) {

      copyDir(srcPath, destPath);

    } else {

      fs.copyFileSync(srcPath, destPath);

    }

  }

}

/* ---------------------------------
State Feature
--------------------------------- */

async function run(projectDir, options) {

  const state = options["state-mgmt"];

  if (!state || state === "none") return;

  const stateDir = path.join(__dirname, state);

  if (!fs.existsSync(stateDir)) {
    throw new Error(`State manager not found: ${state}`);
  }

  const destDir = path.join(projectDir, "src/state");

  copyDir(stateDir, destDir);

}

/* ---------------------------------
Export
--------------------------------- */

module.exports = {
  run
};