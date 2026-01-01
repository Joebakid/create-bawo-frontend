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
   * Create project directory
   * ------------------------------------------------- */
  if (!fs.existsSync(projectDir)) {
    fs.mkdirSync(projectDir, { recursive: true });
  }

  /* -------------------------------------------------
   * Init package.json
   * ------------------------------------------------- */
  const pkgPath = path.join(projectDir, "package.json");
  if (!fs.existsSync(pkgPath)) {
    await run("npm", ["init", "-y"], projectDir);
  }

  /* -------------------------------------------------
   * -y / --yes defaults
   * ------------------------------------------------- */
  if (argv.y || argv.yes) {
    argv.ts ??= true;
    argv.tailwind ??= "v3";
    argv.animations = [];
    argv.gsap = false;
  }

  /* -------------------------------------------------
   * Safety defaults
   * ------------------------------------------------- */
  argv.ts ??= false;
  argv.tailwind ??= "v3";

  /* -------------------------------------------------
   * Normalize options (KEY FIX)
   * ------------------------------------------------- */
  const vueOptions = {
    ts: Boolean(argv.ts),
    tailwind: argv.tailwind,
    stateMgmt: argv["state-mgmt"] || argv.stateMgmt || null,
    animations: argv.animations || [],
    gsap: Boolean(argv.gsap),
  };

  /* -------------------------------------------------
   * Run scaffold
   * ------------------------------------------------- */
  console.log("🚀 Scaffolding Vue 3 + Vite project...");
  await scaffoldVue(projectDir, vueOptions);
  console.log("✅ Vue scaffold complete.");

  return projectDir;
}

module.exports = { run: runVue };
