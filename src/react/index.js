#!/usr/bin/env node
/* eslint-disable no-console */

const fs = require("fs");
const path = require("path");
const { run } = require("../utils");
const { scaffoldReact } = require("./react");

async function runReact(argv) {
  const projectName = argv.name || "react-app";
  const projectDir = path.join(process.cwd(), projectName);

  /* -------------------------------------------------
   * Create project directory
   * ------------------------------------------------- */
  if (!fs.existsSync(projectDir)) {
    fs.mkdirSync(projectDir, { recursive: true });
  }

  /* -------------------------------------------------
   * Init package.json (once)
   * ------------------------------------------------- */
  const pkgPath = path.join(projectDir, "package.json");
  if (!fs.existsSync(pkgPath)) {
    await run("npm", ["init", "-y"], projectDir);
  }

  /* -------------------------------------------------
   * Defaults for -y / --yes
   * ------------------------------------------------- */
  if (argv.y || argv.yes) {
    argv.ts ??= true;
    argv.tailwind ??= "v3";
    argv["state-mgmt"] ??= "zustand";

    // 🚫 Do not override explicit flags
    argv.framer ??= false;
    argv.gsap ??= false;
  }

  /* -------------------------------------------------
   * Safety defaults (only if still undefined)
   * ------------------------------------------------- */
  argv.ts ??= false;
  argv.tailwind ??= "v3";

  /* -------------------------------------------------
   * Run scaffold
   * ------------------------------------------------- */
  console.log("🚀 Scaffolding React + Vite project...");
  await scaffoldReact(projectDir, argv);
  console.log("✅ React scaffold complete.");

  return projectDir;
}

module.exports = { run: runReact };
