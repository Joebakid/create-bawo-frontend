/* eslint-disable no-console */
const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

/* ---------------------------------
 * File helpers
 * --------------------------------- */
const write = (p, c) => {
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, c);
};

const ensure = (p) => fs.mkdirSync(p, { recursive: true });

const read = (p) => (fs.existsSync(p) ? fs.readFileSync(p, "utf8") : "");

/* ---------------------------------
 * Command runner
 * --------------------------------- */
const run = (cmd, args, cwd) => {
  const r = spawnSync(cmd, args, {
    stdio: "inherit",
    cwd,
    shell: process.platform === "win32",
  });

  if (r.status !== 0) process.exit(r.status || 1);
};

/* ---------------------------------
 * ✅ COPY DIRECTORY (REQUIRED)
 * --------------------------------- */
const copyDir = (src, dest) => {
  if (!fs.existsSync(src)) return;

  fs.mkdirSync(dest, { recursive: true });

  for (const entry of fs.readdirSync(src)) {
    const srcPath = path.join(src, entry);
    const destPath = path.join(dest, entry);

    if (fs.statSync(srcPath).isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
};

/* ---------------------------------
 * Package version
 * --------------------------------- */
const pkgVersion = (() => {
  try {
    return require(path.join(__dirname, "..", "package.json")).version || "0.0.0";
  } catch {
    return "0.0.0";
  }
})();

module.exports = {
  fs,
  path,
  write,
  ensure,
  read,
  run,
  copyDir,      // ✅ EXPORT
  pkgVersion,
};
