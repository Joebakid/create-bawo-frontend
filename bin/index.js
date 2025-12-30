#!/usr/bin/env node
/* eslint-disable no-console */

const path = require("path");
const fs = require("fs");
const yargs = require("yargs/yargs");
const { hideBin } = require("yargs/helpers");
const prompts = require("prompts");
const { spawn } = require("child_process");

// 🔤 Font system
const { addFont, registry } = require("../src/fonts");

/* ---------------------------------
 * Helpers
 * --------------------------------- */
function copyDir(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });

  for (const entry of fs.readdirSync(src)) {
    const srcPath = path.join(src, entry);
    const destPath = path.join(dest, entry);
    if (fs.statSync(srcPath).isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function emptyDir(dir) {
  if (!fs.existsSync(dir)) return;
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
}

/* ---------------------------------
 * CLI FLAGS
 * --------------------------------- */
const argv = yargs(hideBin(process.argv))
  .scriptName("create-bawo-frontend")
  .usage("$0 [project-name] [options]")
  .option("framework", { type: "string" })
  .option("ts", { type: "boolean" })
  .option("tailwind", { type: "string" })
  .option("state-mgmt", { type: "string" })
  .option("ui", { type: "string" })
  .option("framer", { type: "boolean" })
  .option("gsap", { type: "boolean" })
  .option("font", { type: "string" })
  .option("preset", { type: "string" })
  .option("no-start", { type: "boolean" })
  .option("skip-docs", { type: "boolean" })
  .option("yes", { alias: "y", type: "boolean" })
  .help()
  .parse();

/* ---------------------------------
 * Presets
 * --------------------------------- */
function applyPreset(options) {
  if (options.preset === "minimal") {
    return { ts: false, framer: false, gsap: false, ui: "none", "state-mgmt": "none" };
  }
  if (options.preset === "animation") {
    return { framer: true, gsap: true };
  }
  if (options.preset === "full") {
    return { ts: true, framer: true, gsap: true, ui: "shadcn", "state-mgmt": "redux" };
  }
  return {};
}

/* ---------------------------------
 * Prompt Missing Options
 * --------------------------------- */
async function promptMissing(options) {
  if (!options.name) {
    const { name } = await prompts({
      type: "text",
      name: "name",
      message: "Project name",
    });
    if (!name) process.exit(1);
    options.name = name;
  }

  if (!options.framework) {
    const { framework } = await prompts({
      type: "select",
      name: "framework",
      message: "Choose a framework",
      choices: [
        { title: "React (Vite)", value: "react" },
        { title: "Next.js (App Router)", value: "next" },
        { title: "Vue 3 (Vite)", value: "vue" },
      ],
    });
    if (!framework) process.exit(1);
    options.framework = framework;
  }

  if (options.ts === undefined) {
    const { ts } = await prompts({
      type: "confirm",
      name: "ts",
      message: "Use TypeScript?",
      initial: true,
    });
    options.ts = ts;
  }

  if (!options.tailwind) {
    const { tailwind } = await prompts({
      type: "select",
      name: "tailwind",
      message: "Tailwind CSS version",
      choices:
        options.framework === "vue"
          ? [{ title: "v3 (stable)", value: "v3" }]
          : [
              { title: "v3 (stable)", value: "v3" },
              { title: "v4 (experimental)", value: "v4" },
            ],
    });
    options.tailwind = tailwind;
  }

  if (!options["state-mgmt"]) {
    const { state } = await prompts({
      type: "select",
      name: "state",
      message: "State management",
      choices:
        options.framework === "vue"
          ? [{ title: "Pinia", value: "pinia" }]
          : [
              { title: "Redux", value: "redux" },
              { title: "Zustand", value: "zustand" },
              { title: "None", value: "none" },
            ],
    });
    options["state-mgmt"] = state;
  }

  if (!options["no-start"]) {
    const { start } = await prompts({
      type: "confirm",
      name: "start",
      message: "Start dev server after setup?",
      initial: true,
    });
    options.start = start;
  }

  return options;
}

/* ---------------------------------
 * 🚨 Vue Guard (CRITICAL)
 * --------------------------------- */
async function guardVue(options, projectDir) {
  if (options.framework !== "vue") return;

  // 🔒 Disable ALL auto-start logic
  options.start = false;
  options.__noViteStart = true;

  // 🔒 Force non-interactive create-vite
  process.env.CREATE_VITE_FORCE = "true";
  process.env.NUXT_TELEMETRY_DISABLED = "1";

  // 🔒 Prevent directory conflict prompt
  if (fs.existsSync(projectDir)) {
    emptyDir(projectDir);
  }
}

/* ---------------------------------
 * Main
 * --------------------------------- */
async function main() {
  let options = {
    ...argv,
    name: argv._[0],
  };

  if (options.preset) {
    Object.assign(options, applyPreset(options));
  }

  if (options.y || options.yes) {
    options.name ??= "my-app";
    options.framework ??= "react";
    options.ts ??= true;
    options.tailwind ??= "v3";
    options["state-mgmt"] ??= "none";
    options.start = true;
  } else {
    options = await promptMissing(options);
  }

  const projectDir = path.resolve(process.cwd(), options.name);

  // 🚨 MUST run BEFORE scaffold
  await guardVue(options, projectDir);

  console.log(
    `\n🚀 Creating ${options.framework.toUpperCase()} project: ${options.name}\n`
  );

  switch (options.framework) {
    case "react":
      await require("../src/react").run(options);
      break;
    case "next":
      await require("../src/next").run(options);
      break;
    case "vue":
      await require("../src/vue").run(options);
      break;
    default:
      console.error("❌ Unsupported framework");
      process.exit(1);
  }

  /* ---------------------------------
   * Fonts
   * --------------------------------- */
  if (options.font && registry[options.font]) {
    await addFont(projectDir, options.font);
  }

  /* ---------------------------------
   * Docs
   * --------------------------------- */
  if (!options["skip-docs"]) {
    copyDir(
      path.join(__dirname, "../src/templates/docs"),
      path.join(projectDir, "docs")
    );
  }

  /* ---------------------------------
   * Auto start (NOT FOR VUE)
   * --------------------------------- */
  if (options.start !== false && options.framework !== "vue") {
    console.log("🔥 Starting dev server...");
    spawn("npm", ["run", "dev"], {
      stdio: "inherit",
      cwd: projectDir,
    });
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
