#!/usr/bin/env node
/* eslint-disable no-console */

const fs = require("fs");
const path = require("path");
const { run } = require("../utils");
const { scaffoldNext } = require("./next");

async function runNext(argv) {
  const projectName = argv._?.[0] || argv.name || "next-app";
  const projectDir = path.resolve(process.cwd(), projectName);

  /* -------------------------------------------------
   * Create project directory
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
   * -y / --yes MODE (RESPECT FLAGS)
   * ------------------------------------------------- */
  if (argv.y || argv.yes) {
    argv.ts ??= true;
    argv.tailwind ??= "v3";
    argv["state-mgmt"] ??= "zustand";

    // 🚫 DO NOT OVERRIDE FLAGS
    argv.framer ??= false;
    argv.gsap ??= false;
  }

  /* -------------------------------------------------
   * Safety defaults
   * ------------------------------------------------- */
  argv.ts ??= false;
  argv.tailwind ??= "v3";
  argv["state-mgmt"] ??= "none";

  /* -------------------------------------------------
   * Run scaffold
   * ------------------------------------------------- */
  console.log("🚀 Scaffolding Next.js project...");
  await scaffoldNext(projectDir, argv);
  console.log("✅ Next.js scaffold complete.");
}

module.exports = { run: runNext };
