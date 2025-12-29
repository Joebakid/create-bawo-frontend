#!/usr/bin/env node
/* eslint-disable no-console */

const fs = require("fs");
const path = require("path");
const { run } = require("../utils");
const { scaffoldVue } = require("./vue");

async function runVue(argv) {
  const projectName = argv._?.[0] || argv.name || "vue-app";
  const projectDir = path.resolve(process.cwd(), projectName);

  /* -------------------------------------------------
   * Create project directory (ONCE)
   * ------------------------------------------------- */
  if (!fs.existsSync(projectDir)) {
    fs.mkdirSync(projectDir, { recursive: true });
  }

  /* -------------------------------------------------
   * Init package.json (SAFE)
   * ------------------------------------------------- */
  const pkgPath = path.join(projectDir, "package.json");
  if (!fs.existsSync(pkgPath)) {
    await run("npm", ["init", "-y"], projectDir);
  }

  /* -------------------------------------------------
   * -y / --yes defaults (NO PROMPTS)
   * ------------------------------------------------- */
  if (argv.y || argv.yes) {
    argv.ts ??= true;
    argv.tailwind ??= "v3";

    // Vue template defaults
    argv.animations = [];
    argv.gsap = false;
  }

  /* -------------------------------------------------
   * Safety defaults (non -y runs)
   * ------------------------------------------------- */
  argv.ts ??= false;
  argv.tailwind ??= "v3";

  /* -------------------------------------------------
   * Run scaffold
   * ------------------------------------------------- */
  console.log("🚀 Scaffolding Vue 3 + Vite project...");
  await scaffoldVue(projectDir, argv);
  console.log("✅ Vue scaffold complete.");

  return projectDir;
}

module.exports = { run: runVue };
