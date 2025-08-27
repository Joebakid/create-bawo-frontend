/* eslint-disable no-console */
const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const write = (p, c) => {
  fs.mkdirSync(require("path").dirname(p), { recursive: true });
  fs.writeFileSync(p, c);
};
const ensure = (p) => fs.mkdirSync(p, { recursive: true });
const read = (p) => (fs.existsSync(p) ? fs.readFileSync(p, "utf8") : "");
const run = (cmd, args, cwd) => {
  const r = spawnSync(cmd, args, { stdio: "inherit", cwd, shell: process.platform === "win32" });
  if (r.status !== 0) process.exit(r.status || 1);
};
const pkgVersion = (() => {
  try {
    return require(require("path").join(__dirname, "..", "package.json")).version || "0.0.0";
  } catch {
    return "0.0.0";
  }
})();

module.exports = { fs, path, write, ensure, read, run, pkgVersion };
