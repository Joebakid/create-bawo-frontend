#!/usr/bin/env node
/* eslint-disable no-console */

const prompts = require("prompts");
const { scaffoldVue } = require("./vue");

/**
 * REQUIRED ENTRY POINT
 * bin/index.js → require("../src/vue").run(...)
 */
async function runVue({ projectDir, answers }) {
  /**
   * 🔥 FALLBACK PROMPT
   * If GSAP was never asked in bin/index.js,
   * we ask it HERE so Vue is never skipped.
   */
  if (answers.gsap === undefined) {
    const { gsap } = await prompts({
      type: "confirm",
      name: "gsap",
      message: "Use GSAP animations?",
      initial: false,
    });

    answers.gsap = gsap;
  }

  const vueOptions = {
    ts: Boolean(answers.ts),
    tailwind: answers.tailwind || "v3",

    // Vue NEVER uses React state managers
    stateMgmt: null,

    // GSAP only
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
