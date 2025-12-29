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

/* ---------------------------------
 * SUBCOMMAND: add font
 * --------------------------------- */
const rawArgs = hideBin(process.argv);

if (rawArgs[0] === "add" && rawArgs[1] === "font") {
  const fontKey = rawArgs[2];

  if (!fontKey) {
    console.error("❌ Please specify a font.");
    console.log("\nAvailable fonts:");
    Object.keys(registry).forEach((f) => console.log(" -", f));
    process.exit(1);
  }

  const projectDir = process.cwd();

  if (!fs.existsSync(path.join(projectDir, "package.json"))) {
    console.error("❌ Run this inside a project directory.");
    process.exit(1);
  }

  if (!registry[fontKey]) {
    console.error(`❌ Unknown font: ${fontKey}`);
    console.log("\nAvailable fonts:");
    Object.keys(registry).forEach((f) => console.log(" -", f));
    process.exit(1);
  }

  console.log(`🔤 Installing font: ${fontKey}...\n`);

  addFont(projectDir, fontKey)
    .then(() => {
      console.log(`✅ Font "${fontKey}" installed successfully.`);
    })
    .catch((err) => {
      console.error("❌ Font installation failed:", err.message);
      process.exit(1);
    });

  return;
}

/* ---------------------------------
 * CLI FLAGS
 * --------------------------------- */
const argv = yargs(rawArgs)
  .scriptName("create-bawo-frontend")
  .usage("$0 [project-name] [options]")
  .option("framework", { type: "string" })
  .option("ts", { type: "boolean" })
  .option("tailwind", { type: "string" })
  .option("state-mgmt", { type: "string" })
  .option("ui", { type: "string" })
  .option("framer", { type: "boolean" })
  .option("gsap", { type: "boolean" })
  .option("font", {
    type: "string",
    describe: "Install a font (e.g. inter, poppins)",
  })
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
  switch (options.preset) {
    case "minimal":
      return {
        ts: false,
        framer: false,
        gsap: false,
        ui: "none",
        "state-mgmt": "none",
      };
    case "animation":
      return { framer: true, gsap: true };
    case "full":
      return {
        ts: true,
        framer: true,
        gsap: true,
        ui: "shadcn",
        "state-mgmt": "redux",
      };
    default:
      return {};
  }
}

/* ---------------------------------
 * Interactive Prompts
 * --------------------------------- */
async function promptMissing(options) {
  if (!options.name) {
    const { name } = await prompts({
      type: "text",
      name: "name",
      message: "Project name",
      validate: (v) => (v ? true : "Project name is required"),
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

  const questions = [];

  if (options.ts === undefined) {
    questions.push({
      type: "confirm",
      name: "ts",
      message: "Use TypeScript?",
      initial: true,
    });
  }

  if (!options.tailwind) {
    questions.push({
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
  }

  if (!options["state-mgmt"]) {
    questions.push({
      type: "select",
      name: "state-mgmt",
      message: "State management",
      choices:
        options.framework === "vue"
          ? [
              { title: "Pinia (recommended)", value: "pinia" },
              { title: "None", value: "none" },
            ]
          : [
              { title: "Zustand", value: "zustand" },
              { title: "Redux Toolkit", value: "redux" },
              { title: "RTK Query", value: "rtk-query" },
              { title: "React Query", value: "react-query" },
              { title: "SWR", value: "swr" },
              { title: "Context API", value: "context" },
              { title: "None", value: "none" },
            ],
    });
  }

  if (!options.ui && options.framework !== "vue") {
    questions.push({
      type: "select",
      name: "ui",
      message: "UI library",
      choices: [
        { title: "None", value: "none" },
        { title: "shadcn/ui", value: "shadcn" },
      ],
    });
  }

  if (options.framework !== "vue" && options.framer === undefined) {
    questions.push({
      type: "confirm",
      name: "framer",
      message: "Add Framer Motion?",
      initial: false,
    });
  }

  if (options.gsap === undefined) {
    questions.push({
      type: "confirm",
      name: "gsap",
      message: "Add GSAP animations?",
      initial: false,
    });
  }

  if (!options["no-start"]) {
    questions.push({
      type: "confirm",
      name: "start",
      message: "Start dev server after setup?",
      initial: true,
    });
  }

  if (questions.length) {
    const answers = await prompts(questions, {
      onCancel() {
        process.exit(1);
      },
    });
    Object.assign(options, answers);
  }

  return options;
}

/* ---------------------------------
 * 🚨 Vue + Tailwind v4 Guard
 * --------------------------------- */
async function guardVueTailwind(options) {
  if (options.framework === "vue" && options.tailwind === "v4") {
    console.log("\n⚠️  Tailwind v4 is not supported for Vue yet.");

    const { confirm } = await prompts({
      type: "confirm",
      name: "confirm",
      message: "Switch to Tailwind v3 instead?",
      initial: true,
    });

    if (!confirm) {
      console.log("❌ Aborted. Vue currently supports Tailwind v3 only.");
      process.exit(1);
    }

    options.tailwind = "v3";
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
    options["state-mgmt"] ??=
      options.framework === "vue" ? "pinia" : "none";
    options.ui ??= "none";
    options.framer ??= false;
    options.gsap ??= false;
    options.start = true;
  } else {
    options = await promptMissing(options);
  }

  await guardVueTailwind(options);

  const projectDir = path.resolve(process.cwd(), options.name);

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
   * 🔤 Font (during install)
   * --------------------------------- */
  if (options.font) {
    if (!registry[options.font]) {
      console.error(`❌ Unknown font: ${options.font}`);
      console.log("\nAvailable fonts:");
      Object.keys(registry).forEach((f) => console.log(" -", f));
      process.exit(1);
    }

    console.log(`🔤 Installing font: ${options.font}`);
    await addFont(projectDir, options.font);
  }

  /* ---------------------------------
   * 📚 Docs
   * --------------------------------- */
  if (!options["skip-docs"]) {
    const docsSrc = path.join(__dirname, "../src/templates/docs");
    const docsDest = path.join(projectDir, "docs");

    console.log("📚 Adding documentation...");
    copyDir(docsSrc, docsDest);
  }

  /* ---------------------------------
   * Auto start
   * --------------------------------- */
  if (options.start !== false) {
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
