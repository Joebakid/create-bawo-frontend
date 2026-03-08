#!/usr/bin/env node
/* eslint-disable no-console */

const fs = require("fs");
const path = require("path");

const { run } = require("../../utils");
const { scaffoldNext } = require("./next");

async function runNext(projectDir, options) {

  /* -------------------------------------------------
   * Ensure project directory exists
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
   * YES MODE
   * ------------------------------------------------- */

  if (options.y || options.yes) {

    options.ts ??= true;
    options.tailwind ??= "v3";
    options["state-mgmt"] ??= "zustand";

    options.framer ??= false;
    options.gsap ??= false;

  }

  /* -------------------------------------------------
   * Safety defaults
   * ------------------------------------------------- */

  options.ts ??= false;
  options.tailwind ??= "v3";
  options["state-mgmt"] ??= "none";

  /* -------------------------------------------------
   * Run scaffold
   * ------------------------------------------------- */

  console.log("🚀 Scaffolding Next.js project...");

  await scaffoldNext(projectDir, options);

  console.log("✅ Next.js scaffold complete.");

  return projectDir;

}

module.exports = { run: runNext };