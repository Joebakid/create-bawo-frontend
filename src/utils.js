/* eslint-disable no-console */

const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

/* ---------------------------------
 * File helpers
 * --------------------------------- */

function write(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content);
}

function ensure(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function read(filePath) {
  return fs.existsSync(filePath) ? fs.readFileSync(filePath, "utf8") : "";
}

/* ---------------------------------
 * Command runner
 * --------------------------------- */

function run(cmd, args = [], cwd = process.cwd()) {

  const result = spawnSync(cmd, args, {
    stdio: "inherit",
    cwd,
    shell: process.platform === "win32",
  });

  if (result.error) {
    console.error("Command failed:", cmd, args.join(" "));
    console.error(result.error);
    process.exit(1);
  }

  if (result.status !== 0) {
    process.exit(result.status || 1);
  }
}

/* ---------------------------------
 * Copy directory recursively
 * --------------------------------- */

function copyDir(src, dest) {

  if (!fs.existsSync(src)) {
    throw new Error(`Source directory not found: ${src}`);
  }

  fs.mkdirSync(dest, { recursive: true });

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {

    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }

  }
}

/* ---------------------------------
 * Package version
 * --------------------------------- */

const pkgVersion = (() => {

  try {
    const pkg = require(path.join(__dirname, "..", "package.json"));
    return pkg.version || "0.0.0";
  } catch {
    return "0.0.0";
  }

})();

/* ---------------------------------
 * Exports
 * --------------------------------- */

module.exports = {
  fs,
  path,
  write,
  ensure,
  read,
  run,
  copyDir,
  pkgVersion,
};