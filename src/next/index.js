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
    argv.ui ??= "none";

    // state
    argv.redux = false;
    argv.rtkQuery = false;
    argv.zustand = false;
    argv.reactQuery = false;
    argv.swr = false;

    // animations
    argv.framer = false;
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
  console.log("🚀 Scaffolding Next.js project...");
  await scaffoldNext(projectDir, argv);
  console.log("✅ Next.js scaffold complete.");
}

module.exports = { run: runNext };
