#!/usr/bin/env node
/* eslint-disable no-console */

const prompts = require("prompts");
const { scaffoldVue } = require("./vue");

async function runVue(projectDir, options) {

/* ---------------------------------------------
GSAP Prompt (safe handling)
--------------------------------------------- */

if (options.gsap === undefined) {

const response = await prompts(
  {
    type: "confirm",
    name: "gsap",
    message: "Use GSAP animations?",
    initial: false
  },
  {
    onCancel: () => {
      console.log("\n⚠️ Setup cancelled.");
      process.exit(1);
    }
  }
);

options.gsap = Boolean(response.gsap);

}

/* ---------------------------------------------
Normalize Vue options
--------------------------------------------- */

const vueOptions = {

ts: Boolean(options.ts),

tailwind: options.tailwind || "v3",

font: options.font || null,

// Vue does not use React state managers
stateMgmt: null,

gsap: Boolean(options.gsap)

};

console.log("🚀 Scaffolding Vue project...");

await scaffoldVue(projectDir, vueOptions);

console.log("✅ Vue scaffold complete.");

return projectDir;

}

module.exports = { run: runVue };