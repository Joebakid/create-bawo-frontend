#!/usr/bin/env node
/* eslint-disable no-console */

const { scaffoldSvelte } = require("./svelte");

async function runSvelte(projectDir, options) {

  console.log(" Scaffolding Svelte + Vite project...");

  await scaffoldSvelte(projectDir, options);

  console.log("✅ Svelte scaffold complete.");

  return projectDir;

}

module.exports = {
  run: runSvelte
};