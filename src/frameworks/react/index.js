#!/usr/bin/env node
/* eslint-disable no-console */

const { scaffoldReact } = require("./react");

async function runReact(projectDir, options) {

  console.log("🚀 Scaffolding React + Vite project...");

  await scaffoldReact(projectDir, options);

  console.log("✅ React scaffold complete.");

  return projectDir;

}

module.exports = {
  run: runReact
};