/* eslint-disable no-console */
const fs = require("fs");
const prompts = require("prompts");
const { path, write, ensure, run: exec, pkgVersion } = require("./utils");
const { scaffoldReact } = require("./scaffold/react");
const { scaffoldNext } = require("./scaffold/next");

/* ---------------- HELP ---------------- */
const HELP = (v) => `
create-bawo-frontend v${v}

USAGE:
  create-bawo-frontend <project-name> [options]

OPTIONS:
  --framework react|next
  --tailwind v3|v4        Tailwind CSS version (default: v3)
  --ts
  --zustand
  --no-zustand
  --ui shadcn
  --framer
  --gsap
  --redux
  --rtk-query
  --react-query
  --swr
  --router
  --context
  --no-start
  -y, --yes
  -h, --help
  -v, --version
`;

/* ---------------- FLAG PARSER ---------------- */
function parseFlags(args) {
  const nameArg = args.find((a) => !a.startsWith("-")) || ".";
  const yes = args.includes("--yes") || args.includes("-y");

  // framework
  let framework = "react";
  const fwIdx = args.indexOf("--framework");
  if (fwIdx >= 0 && args[fwIdx + 1]) framework = args[fwIdx + 1];
  if (args.includes("--next")) framework = "next";

  // tailwind
  let tailwind = "v3";
  const twIdx = args.indexOf("--tailwind");
  if (twIdx >= 0 && args[twIdx + 1]) tailwind = args[twIdx + 1];
  if (!["v3", "v4"].includes(tailwind)) {
    console.error("❌ Invalid Tailwind version. Use v3 or v4");
    process.exit(1);
  }

  return {
    nameArg,
    yes,
    framework,
    tailwind,
    ts: args.includes("--ts"),
    noStart: args.includes("--no-start"),

    redux: args.includes("--redux"),
    zustand: args.includes("--zustand"),
    rtkQuery: args.includes("--rtk-query"),
    reactQuery: args.includes("--react-query"),
    swr: args.includes("--swr"),
    context: args.includes("--context"),
    router: args.includes("--router"),

    pt: !args.includes("--no-prettier-tailwind"),
    ui: args.includes("--ui") ? args[args.indexOf("--ui") + 1] : "none",

    framer: args.includes("--framer"),
    gsap: args.includes("--gsap"),
  };
}

/* ---------------- INTERACTIVE ---------------- */
async function getAnswersFromUser(flags) {
  const resp = await prompts(
    [
      flags.nameArg === "."
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
        initial: flags.framework === "next" ? 1 : 0,
      },
      { type: "toggle", name: "ts", message: "Use TypeScript?", initial: flags.ts, active: "yes", inactive: "no" },
      {
        type: "select",
        name: "state",
        message: "Primary state management?",
        choices: [
          { title: "None", value: "none" },
          { title: "Redux Toolkit", value: "redux" },
          { title: "Zustand", value: "zustand" },
        ],
        initial: flags.redux ? 1 : flags.zustand ? 2 : 0,
      },
      {
        type: "multiselect",
        name: "data",
        message: "Data fetching & extras?",
        choices: [
          { title: "RTK Query", value: "rtkQuery", selected: flags.rtkQuery },
          { title: "React Query", value: "reactQuery", selected: flags.reactQuery },
          { title: "SWR", value: "swr", selected: flags.swr },
          { title: "Context API", value: "context", selected: flags.context },
        ],
      },
      { type: "toggle", name: "router", message: "Add React Router?", initial: flags.router },
      { type: "toggle", name: "pt", message: "Add Prettier + Tailwind plugin?", initial: flags.pt },
      {
        type: "select",
        name: "ui",
        message: "UI preset?",
        choices: [{ title: "None", value: "none" }, { title: "shadcn/ui", value: "shadcn" }],
        initial: flags.ui === "shadcn" ? 1 : 0,
      },
      {
        type: "multiselect",
        name: "anim",
        message: "Animation libraries?",
        choices: [
          { title: "Framer Motion", value: "framer", selected: flags.framer },
          { title: "GSAP", value: "gsap", selected: flags.gsap },
        ],
      },
      { type: "toggle", name: "autoStart", message: "Start dev server after install?", initial: false },
    ].filter(Boolean),
    { onCancel: () => process.exit(1) }
  );

  const data = new Set(resp.data || []);

  return {
    name: flags.nameArg !== "." ? flags.nameArg : resp.name,
    framework: resp.framework,
    tailwind: flags.tailwind,
    ts: resp.ts,

    redux: resp.state === "redux",
    zustand: resp.state === "zustand",

    rtkQuery: data.has("rtkQuery"),
    reactQuery: data.has("reactQuery"),
    swr: data.has("swr"),
    context: data.has("context"),

    router: resp.router,
    pt: resp.pt,
    ui: resp.ui,
    framer: resp.anim?.includes("framer"),
    gsap: resp.anim?.includes("gsap"),
    autoStart: resp.autoStart,
  };
}

/* ---------------- NON-INTERACTIVE ---------------- */
function getAnswersFromFlags(flags) {
  return {
    name: flags.nameArg,
    framework: flags.framework,
    tailwind: flags.tailwind,
    ts: flags.ts,

    redux: flags.redux,
    zustand: flags.zustand && !flags.redux,

    rtkQuery: flags.rtkQuery,
    reactQuery: flags.reactQuery,
    swr: flags.swr,
    context: flags.context,

    router: flags.router,
    pt: flags.pt,
    ui: flags.ui === "shadcn" ? "shadcn" : "none",
    framer: flags.framer,
    gsap: flags.gsap,
    autoStart: !flags.noStart,
  };
}

/* ---------------- CLEANUP ---------------- */
function removeZustandArtifacts(projectDir) {
  const targets = [
    ["src", "stores"],
    ["store", "useAppStore.ts"],
    ["store", "useAppStore.js"],
  ];
  for (const t of targets) {
    const p = path.join(projectDir, ...t);
    if (fs.existsSync(p)) fs.rmSync(p, { recursive: true, force: true });
  }
}

/* ---------------- RUN ---------------- */
async function run() {
  const args = process.argv.slice(2);
  if (args.includes("--help") || args.includes("-h")) return console.log(HELP(pkgVersion));
  if (args.includes("--version") || args.includes("-v")) return console.log(pkgVersion);

  const flags = parseFlags(args);
  const answers = flags.yes ? getAnswersFromFlags(flags) : await getAnswersFromUser(flags);

  if (answers.redux) answers.zustand = false;

  const projectDir = path.resolve(process.cwd(), answers.name);
  ensure(projectDir);

  const pkgPath = path.join(projectDir, "package.json");
  if (!fs.existsSync(pkgPath)) {
    write(pkgPath, JSON.stringify({ name: answers.name, private: true, version: "0.0.0" }, null, 2));
  }

  console.log(`🎨 Tailwind CSS: ${answers.tailwind}`);

  if (answers.framework === "react") scaffoldReact(projectDir, answers);
  else scaffoldNext(projectDir, answers);

  if (answers.redux) removeZustandArtifacts(projectDir);

  write(path.join(projectDir, ".gitignore"), "node_modules\ndist\n.next\n.env\n.DS_Store\nbuild\n");

  console.log("\n📦 Finalizing install...");
  exec("npm", ["install"], projectDir);

  if (answers.autoStart) {
    console.log("\n🚀 Starting dev server...");
    exec("npm", ["run", "dev"], projectDir);
  } else {
    console.log("\n✅ Scaffold complete.");
    console.log(`  cd ${answers.name}`);
    console.log("  npm run dev");
  }
}

module.exports = { run };
