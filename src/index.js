/* eslint-disable no-console */
const prompts = require("prompts");
const { path, write, ensure, run: exec, pkgVersion } = require("./utils");
const { scaffoldReact } = require("./scaffold/react");
const { scaffoldNext } = require("./scaffold/next");

const HELP = (v) => `
create-bawo-frontend v${v}

USAGE:
  create-bawo-frontend <project-name> [options]

OPTIONS:
  --framework react|next   Choose framework (default: react)
  --ts                     Use TypeScript (default: JavaScript)
  --zustand                Include Zustand (skips prompt). If --redux is also set, Redux wins unless --zustand is given.
  --no-zustand             Do not include Zustand (useful with -y).
  --ui shadcn              Add shadcn/ui preset
  --framer                 Add framer-motion + demo
  --gsap                   Add GSAP + demo
  --redux                  Add Redux Toolkit + demo
  --rtk-query              Add RTK Query + demo
  --react-query            Add React Query + demo
  --swr                    Add SWR + demo
  --router                 Add React Router + demo
  --context                Add Context API + useReducer demo
  --no-start               Prevent auto-start (useful in CI)
  -y, --yes                Skip prompts; defaults + auto-start dev server
  -h, --help               Show this help
  -v, --version            Show CLI version
`;

function parseFlags(args) {
  const nameArg = args.find((a) => !a.startsWith("-")) || ".";
  const yes = args.includes("--yes") || args.includes("-y");

  // framework
  const frameworkIdx = args.findIndex((a) => a === "--framework");
  let framework = "react";
  if (frameworkIdx >= 0 && args[frameworkIdx + 1]) framework = args[frameworkIdx + 1];
  if (args.includes("--next")) framework = "next";

  const tsFlag = args.includes("--ts");
  const noStartFlag = args.includes("--no-start");

  // state lib toggles
  const explicitZustand = args.includes("--zustand");
  const noZustand = args.includes("--no-zustand");
  const wantRedux = args.includes("--redux");
  // In -y mode: Redux wins unless --zustand explicitly passed
  const zustandDefault = explicitZustand ? true : (wantRedux ? false : !noZustand);

  const ptFlag = !args.includes("--no-prettier-tailwind");
  const uiIdx = args.findIndex((a) => a === "--ui");
  const uiPreset = uiIdx >= 0 && args[uiIdx + 1] ? args[uiIdx + 1] : null;
  const wantShadcn = uiPreset === "shadcn" || args.includes("--shadcn");
  const wantFramer = args.includes("--framer");
  const wantGsap = args.includes("--gsap");
  const wantRTKQuery = args.includes("--rtk-query");
  const wantReactQuery = args.includes("--react-query");
  const wantSWR = args.includes("--swr");
  const wantRouter = args.includes("--router");
  const wantContext = args.includes("--context");

  return {
    nameArg, yes, framework, tsFlag, noStartFlag,
    wantRedux, zustandDefault,
    ptFlag, wantShadcn, wantFramer, wantGsap,
    wantRTKQuery, wantReactQuery, wantSWR, wantRouter, wantContext,
  };
}

async function getAnswersFromUser(flags) {
  const {
    nameArg, framework, tsFlag, zustandDefault, wantRedux,
    wantRTKQuery, wantReactQuery, wantSWR, wantRouter, wantContext,
    ptFlag, wantShadcn, wantFramer, wantGsap
  } = flags;

  const resp = await prompts(
    [
      nameArg === "."
        ? { type: "text", name: "name", message: "Project name", initial: "my-frontend-app" }
        : null,
      {
        type: "select",
        name: "framework",
        message: "Framework",
        choices: [
          { title: "React + Vite", value: "react" },
          { title: "Next.js (App Router)", value: "next" },
        ],
        initial: framework === "next" ? 1 : 0,
      },
      { type: "toggle", name: "ts", message: "Use TypeScript?", initial: tsFlag, active: "yes", inactive: "no" },
      {
        type: "multiselect",
        name: "stateLibs",
        message: "State Management & Data Fetching?",
        hint: "Space to select",
        choices: [
          // Zustand preselected ONLY if Redux wasn't hinted via CLI
          { title: "Zustand (lightweight)", value: "zustand", selected: !wantRedux && zustandDefault },
          { title: "Redux Toolkit", value: "redux", selected: wantRedux },
          { title: "RTK Query", value: "rtkQuery", selected: wantRTKQuery },
          { title: "React Query", value: "reactQuery", selected: wantReactQuery },
          { title: "SWR", value: "swr", selected: wantSWR },
          { title: "Context API + useReducer", value: "context", selected: wantContext },
        ],
      },
      { type: "toggle", name: "router", message: "Add React Router?", initial: wantRouter, active: "yes", inactive: "no" },
      { type: "toggle", name: "pt", message: "Add Prettier + Tailwind plugin?", initial: ptFlag, active: "yes", inactive: "no" },
      {
        type: "select",
        name: "ui",
        message: "UI preset?",
        choices: [{ title: "None", value: "none" }, { title: "shadcn/ui", value: "shadcn" }],
        initial: wantShadcn ? 1 : 0,
      },
      {
        type: "multiselect",
        name: "anim",
        message: "Animation libraries?",
        hint: "Space to select",
        choices: [
          { title: "Framer Motion", value: "framer", selected: wantFramer },
          { title: "GSAP", value: "gsap", selected: wantGsap },
        ],
      },
      { type: "toggle", name: "autoStart", message: "Start dev server after install?", initial: false, active: "yes", inactive: "no" },
    ].filter(Boolean),
    { onCancel: () => process.exit(1) },
  );

  // --- ROBUST EXCLUSIVITY ---
  const selected = new Set(resp.stateLibs || []);
  if (selected.has("redux")) selected.delete("zustand"); // Redux wins, always

  const pickedRedux = selected.has("redux");
  const pickedZustand = selected.has("zustand");

  return {
    name: flags.nameArg !== "." ? flags.nameArg : resp.name || "my-frontend-app",
    framework: resp.framework || flags.framework,
    ts: !!resp.ts,
    zustand: pickedZustand,
    redux: pickedRedux,
    rtkQuery: selected.has("rtkQuery"),
    reactQuery: selected.has("reactQuery"),
    swr: selected.has("swr"),
    context: selected.has("context"),
    router: !!resp.router,
    pt: !!resp.pt,
    ui: resp.ui || "none",
    framer: (resp.anim || []).includes("framer"),
    gsap: (resp.anim || []).includes("gsap"),
    autoStart: !!resp.autoStart,
  };
}

function getAnswersFromFlags(flags) {
  const a = {
    name: flags.nameArg,
    framework: flags.framework || "react",
    ts: flags.tsFlag || false,
    zustand: flags.zustandDefault,
    redux: flags.wantRedux,
    rtkQuery: flags.wantRTKQuery,
    reactQuery: flags.wantReactQuery,
    swr: flags.wantSWR,
    context: flags.wantContext,
    router: flags.wantRouter,
    pt: flags.ptFlag,
    ui: flags.wantShadcn ? "shadcn" : "none",
    framer: flags.wantFramer,
    gsap: flags.wantGsap,
    autoStart: !flags.noStartFlag,
  };
  // --- SAFETY: flags path too ---
  if (a.redux) a.zustand = false;
  return a;
}

async function run() {
  const args = process.argv.slice(2);
  if (args.includes("--help") || args.includes("-h")) { console.log(HELP(pkgVersion)); return; }
  if (args.includes("--version") || args.includes("-v")) { console.log(pkgVersion); return; }

  const flags = parseFlags(args);
  const answers = flags.yes ? getAnswersFromFlags(flags) : await getAnswersFromUser(flags);

  // Final safety net: never scaffold Zustand when Redux is on
  if (answers.redux && answers.zustand) answers.zustand = false;

  const projectDir = path.resolve(process.cwd(), answers.name);
  ensure(projectDir);

  // base package.json
  const pkgPath = path.join(projectDir, "package.json");
  if (!require("fs").existsSync(pkgPath)) {
    write(pkgPath, JSON.stringify({ name: path.basename(projectDir), private: true, version: "0.0.0" }, null, 2));
  }

  // scaffold
  if (answers.framework === "react") scaffoldReact(projectDir, answers);
  else scaffoldNext(projectDir, answers);

  // finalize
  write(path.join(projectDir, ".gitignore"), "node_modules\ndist\n.next\n.env\n.DS_Store\nbuild\n");

  console.log("\n📦 Finalizing install...");
  exec("npm", ["install"], projectDir);

  if (answers.autoStart) {
    console.log("\n🚀 Starting dev server...");
    exec("npm", ["run", "dev"], projectDir);
  } else {
    console.log("\n✅ Scaffold complete.");
    console.log(`  cd ${path.basename(projectDir)}`);
    console.log("  npm run dev");
  }
}

module.exports = { run };
