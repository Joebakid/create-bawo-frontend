/* eslint-disable no-console */
const fs = require("fs");
const prompts = require("prompts");
const { path, write, ensure, run: exec, pkgVersion } = require("./utils");
const { scaffoldReact } = require("./scaffold/react");
const { scaffoldNext } = require("./scaffold/next");
const { scaffoldVue } = require("./scaffold/vue");

/* ---------------- HELP ---------------- */
const HELP = (v) => `
create-bawo-frontend v${v}

USAGE:
  create-bawo-frontend <project-name> [options]

OPTIONS:
  --framework react|next|vue
  --tailwind v3|v4
  --ts
  --js
  --redux
  --zustand
  --router
  --ui shadcn
  --framer
  --gsap
  --no-start
  -y, --yes
  -h, --help
  -v, --version
`;

/* ---------------- FLAG PARSER ---------------- */
function parseFlags(args) {
  const nameArg = args.find((a) => !a.startsWith("-")) || ".";
  const yes = args.includes("--yes") || args.includes("-y");

  let framework = "react";
  const fwIdx = args.indexOf("--framework");
  if (fwIdx >= 0 && args[fwIdx + 1]) framework = args[fwIdx + 1];
  if (args.includes("--next")) framework = "next";

  let tailwind = "v3";
  const twIdx = args.indexOf("--tailwind");
  if (twIdx >= 0 && args[twIdx + 1]) tailwind = args[twIdx + 1];

  const hasTs = args.includes("--ts");
  const hasJs = args.includes("--js");
  const tsFlag = hasTs && !hasJs ? true : hasJs ? false : null;

  return {
    nameArg,
    yes,
    framework,
    tailwind,
    ts: tsFlag,
    redux: args.includes("--redux"),
    zustand: args.includes("--zustand"),
    router: args.includes("--router"),
    ui: args.includes("--ui") ? args[args.indexOf("--ui") + 1] : "none",
    framer: args.includes("--framer"),
    gsap: args.includes("--gsap"),
    noStart: args.includes("--no-start"),
  };
}

/* ---------------- INTERACTIVE ---------------- */
async function getAnswersFromUser(flags) {
  const animationsFromFlags = [];
  if (flags.framer) animationsFromFlags.push("framer");
  if (flags.gsap) animationsFromFlags.push("gsap");

  const questions = [
    flags.nameArg === "."
      ? { type: "text", name: "name", message: "Project name", initial: "my-app" }
      : null,

    flags.ts === null
      ? {
          type: "toggle",
          name: "ts",
          message: "Use TypeScript?",
          initial: false,
          active: "yes",
          inactive: "no",
        }
      : null,

    flags.framework === "react"
      ? {
          type: "select",
          name: "state",
          message: "Primary state management?",
          choices: [
            { title: "None", value: "none" },
            { title: "Redux Toolkit", value: "redux" },
            { title: "Zustand", value: "zustand" },
          ],
        }
      : null,

    flags.framework === "react"
      ? { type: "toggle", name: "router", message: "Add React Router?" }
      : null,

    flags.framework === "react"
      ? {
          type: "select",
          name: "ui",
          message: "UI preset?",
          choices: [
            { title: "None", value: "none" },
            { title: "shadcn/ui", value: "shadcn" },
          ],
        }
      : null,

    // 🔥 ONLY ASK IF FLAGS DID NOT SET ANIMATIONS
    flags.framework === "react" && animationsFromFlags.length === 0
      ? {
          type: "multiselect",
          name: "animations",
          message: "Animation libraries?",
          choices: [
            { title: "Framer Motion", value: "framer" },
            { title: "GSAP", value: "gsap" },
          ],
        }
      : null,

    { type: "toggle", name: "autoStart", message: "Start dev server after install?", initial: false },
  ].filter(Boolean);

  const resp = await prompts(questions, { onCancel: () => process.exit(1) });

  return {
    name: flags.nameArg !== "." ? flags.nameArg : resp.name,
    framework: flags.framework,
    tailwind: flags.framework === "vue" ? "v3" : flags.tailwind,
    ts: flags.ts !== null ? flags.ts : resp.ts,

    redux: flags.framework === "react" && resp.state === "redux",
    zustand: flags.framework === "react" && resp.state === "zustand",
    router: flags.framework === "react" && resp.router,
    ui: flags.framework === "react" ? resp.ui : "none",

    // ✅ SINGLE SOURCE OF TRUTH
    animations:
      animationsFromFlags.length > 0 ? animationsFromFlags : resp.animations || [],

    autoStart: resp.autoStart,
  };
}

/* ---------------- NON-INTERACTIVE ---------------- */
function getAnswersFromFlags(flags) {
  const animations = [];
  if (flags.framer) animations.push("framer");
  if (flags.gsap) animations.push("gsap");

  return {
    name: flags.nameArg,
    framework: flags.framework,
    tailwind: flags.framework === "vue" ? "v3" : flags.tailwind,
    ts: flags.ts !== null ? flags.ts : false,

    redux: flags.framework === "react" && flags.redux,
    zustand: flags.framework === "react" && flags.zustand,
    router: flags.framework === "react" && (flags.router || flags.yes),
    ui: flags.framework === "react" && flags.ui === "shadcn" ? "shadcn" : "none",

    animations,
    autoStart: !flags.noStart,
  };
}

/* ---------------- RUN ---------------- */
async function run() {
  const args = process.argv.slice(2);
  if (args.includes("--help")) return console.log(HELP(pkgVersion));
  if (args.includes("--version")) return console.log(pkgVersion);

  const flags = parseFlags(args);
  const answers = flags.yes
    ? getAnswersFromFlags(flags)
    : await getAnswersFromUser(flags);

  const projectDir = path.resolve(process.cwd(), answers.name);

  if (answers.framework !== "vue") {
    ensure(projectDir);
    write(
      path.join(projectDir, "package.json"),
      JSON.stringify({ name: answers.name, private: true, version: "0.0.0" }, null, 2)
    );
  }

  console.log("FINAL ANSWERS →", answers);

  if (answers.framework === "react") scaffoldReact(projectDir, answers);
  else if (answers.framework === "vue") scaffoldVue(projectDir, answers);
  else scaffoldNext(projectDir, answers);

  console.log("\n📦 Finalizing install...");
  exec("npm", ["install"], projectDir);

  if (answers.autoStart) exec("npm", ["run", "dev"], projectDir);
  else {
    console.log("\n✅ Scaffold complete.");
    console.log(`  cd ${answers.name}`);
    console.log("  npm run dev");
  }
}

module.exports = { run };
