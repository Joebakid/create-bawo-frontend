#!/usr/bin/env node
/* eslint-disable no-console */

const path = require("path");
const yargs = require("yargs/yargs");
const { hideBin } = require("yargs/helpers");
const prompts = require("prompts");
const { spawn } = require("child_process");

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
  .option("framer", { type: "boolean" })
  .option("gsap", { type: "boolean" })
  .option("preset", { type: "string" })
  .option("no-start", { type: "boolean" })
  .option("yes", { alias: "y", type: "boolean" })
  .help()
  .parse();

/* ---------------------------------
 * Presets
 * --------------------------------- */
function applyPreset(options) {
  switch (options.preset) {
    case "minimal":
      return { ts: false, framer: false, gsap: false, "state-mgmt": "none" };
    case "animation":
      return { framer: true, gsap: true };
    case "full":
      return { ts: true, framer: true, gsap: true, "state-mgmt": "redux" };
    default:
      return {};
  }
}

/* ---------------------------------
 * Interactive Prompts
 * --------------------------------- */
async function promptMissing(options) {
  /* -------- Project name (ONLY if missing) -------- */
  if (!options.name) {
    const { name } = await prompts({
      type: "text",
      name: "name",
      message: "Project name",
      validate: (v) => (v ? true : "Project name is required"),
    });

    if (!name) {
      console.log("❌ Cancelled");
      process.exit(1);
    }

    options.name = name;
  }

  /* -------- Framework -------- */
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

    if (!framework) {
      console.log("❌ Cancelled");
      process.exit(1);
    }

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
    if (options.framework === "vue") {
      questions.push({
        type: "select",
        name: "state-mgmt",
        message: "State management",
        choices: [
          { title: "Pinia (recommended)", value: "pinia" },
          { title: "None", value: "none" },
        ],
      });
    } else {
      questions.push({
        type: "select",
        name: "state-mgmt",
        message: "State management",
        choices: [
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
        console.log("❌ Cancelled");
        process.exit(1);
      },
    });

    Object.assign(options, answers);
  }

  return options;
}

/* ---------------------------------
 * Main
 * --------------------------------- */
async function main() {
  let options = {
    ...argv,
    name: argv._[0], // ✅ SINGLE source of truth
  };

  if (options.preset) {
    Object.assign(options, applyPreset(options));
  }

  /* -------- Quick mode (-y) -------- */
  if (options.y || options.yes) {
    options.name ??= "my-app";
    options.framework ??= "react";
    options.ts ??= true;
    options.tailwind ??= "v3";
    options["state-mgmt"] ??=
      options.framework === "vue" ? "pinia" : "none";
    options.framer ??= false;
    options.gsap ??= false;
    options.start = true;
  } else {
    options = await promptMissing(options);
  }

  /* -------- Route -------- */
  let projectDir;

  switch (options.framework) {
    case "react":
      projectDir = await require("../src/react").run(options);
      break;
    case "next":
      projectDir = await require("../src/next").run(options);
      break;
    case "vue":
      projectDir = await require("../src/vue").run(options);
      break;
    default:
      console.error("❌ Unsupported framework");
      process.exit(1);
  }

  /* -------- Auto start -------- */
  if (options.start !== false && projectDir) {
    console.log("🔥 Starting dev server...");
    spawn("npm", ["run", "dev"], {
      stdio: "inherit",
      cwd: path.resolve(projectDir),
    });
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
