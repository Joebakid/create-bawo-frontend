/* eslint-disable no-console */

const path = require("path");
const { scaffoldVue } = require("./vue");

async function runVue(projectDir, options = {}) {

  console.log("🔧 Starting Vue framework setup...");
  console.log("📁 Project directory:", projectDir);

  if (!projectDir) {
    throw new Error("Project directory is required for Vue scaffold.");
  }

  const resolvedDir = path.resolve(projectDir);
  console.log("📂 Resolved directory:", resolvedDir);

  const vueOptions = {
    ts: Boolean(options.ts),
    tailwind: options.tailwind || "v3",
    font: options.font || null,
    stateMgmt: null,
    gsap: Boolean(options.gsap)
  };

  console.log("📦 Vue options:", vueOptions);

  try {

    console.log("🚀 Running Vue scaffold...");

    await scaffoldVue(resolvedDir, vueOptions);

    console.log("✅ Vue scaffold complete.");

  } catch (err) {

    console.error("❌ Vue scaffold failed.");
    console.error(err);
    process.exit(1);

  }

  return resolvedDir;
}

module.exports = { run: runVue };