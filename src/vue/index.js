#!/usr/bin/env node
/* eslint-disable no-console */

const { scaffoldVue } = require("./vue");

/**
 * REQUIRED ENTRY POINT
 * bin/index.js → require("../src/vue").run(...)
 */
async function runVue({ projectDir, answers }) {
  const vueOptions = {
    ts: Boolean(answers.ts),
    tailwind: answers.tailwind || "v3",
    stateMgmt: answers["state-mgmt"] || null,
    animations: answers.animations || [],
    gsap: Boolean(answers.gsap),
  };

  console.log("🚀 Scaffolding Vue project...");
  await scaffoldVue(vueOptions, projectDir);
  console.log("✅ Vue scaffold complete.");

  return projectDir;
}

module.exports = {
  run: runVue,
};
