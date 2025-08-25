#!/usr/bin/env node
/* eslint-disable no-console */

const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");
const prompts = require("prompts");

// ---------- tiny helpers ----------
const write = (p, c) => {
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, c);
};
const ensure = (p) => fs.mkdirSync(p, { recursive: true });
const read = (p) => (fs.existsSync(p) ? fs.readFileSync(p, "utf8") : "");
const run = (cmd, args, cwd) => {
  const r = spawnSync(cmd, args, {
    stdio: "inherit",
    cwd,
    shell: process.platform === "win32",
  });
  if (r.status !== 0) process.exit(r.status || 1);
};
const pkgVersion = (() => {
  try {
    return (
      require(path.join(__dirname, "..", "package.json")).version || "0.0.0"
    );
  } catch {
    return "0.0.0";
  }
})();

// ---------- constants (shadcn + demos) ----------
const CN_UTIL_TS = `
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }
`.trim();

const COMPONENTS_JSON_VITE = `
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": false,
  "tsx": true,
  "tailwind": { "config": "tailwind.config.cjs", "css": "src/styles/index.css", "baseColor": "slate", "cssVariables": true },
  "aliases": { "components": "@/components", "utils": "@/lib/utils" }
}
`.trim();

const COMPONENTS_JSON_NEXT = `
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": true,
  "tsx": true,
  "tailwind": { "config": "tailwind.config.cjs", "css": "app/globals.css", "baseColor": "slate", "cssVariables": true },
  "aliases": { "components": "@/components", "utils": "@/lib/utils" }
}
`.trim();

const FRAMER_DEMO_REACT = `
import { motion } from "framer-motion";
export default function FramerDemo() {
  return (
    <div className="mt-6 flex gap-4">
      <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: "spring", stiffness: 120 }} className="h-12 w-12 rounded-lg bg-blue-500" />
      <motion.button whileTap={{ scale: 0.95 }} whileHover={{ scale: 1.03 }} className="rounded border px-3 py-1">Framer Motion</motion.button>
    </div>
  );
}
`.trim();

const GSAP_DEMO_REACT_TS = `
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
export default function GsapDemo() {
  const boxRef = useRef<HTMLDivElement>(null);
  useEffect(() => { if (boxRef.current) { gsap.from(boxRef.current, { y: -30, opacity: 0, duration: 0.6, ease: "power2.out" }); } }, []);
  return <div className="mt-6"><div ref={boxRef} className="h-12 w-12 rounded-lg bg-emerald-500" /></div>;
}
`.trim();

const GSAP_DEMO_REACT_JS = `
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
export default function GsapDemo() {
  const boxRef = useRef(null);
  useEffect(() => { if (boxRef.current) { gsap.from(boxRef.current, { y: -30, opacity: 0, duration: 0.6, ease: "power2.out" }); } }, []);
  return <div className="mt-6"><div ref={boxRef} className="h-12 w-12 rounded-lg bg-emerald-500" /></div>;
}
`.trim();

const FRAMER_DEMO_NEXT = `
"use client";
import { motion } from "framer-motion";
export default function FramerDemo() {
  return (
    <div className="mt-6 flex gap-4">
      <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: "spring", stiffness: 120 }} className="h-12 w-12 rounded-lg bg-blue-500" />
      <motion.button whileTap={{ scale: 0.95 }} whileHover={{ scale: 1.03 }} className="rounded border px-3 py-1">Framer Motion</motion.button>
    </div>
  );
}
`.trim();

const GSAP_DEMO_NEXT = `
"use client";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
export default function GsapDemo() {
  const boxRef = useRef<HTMLDivElement>(null);
  useEffect(() => { if (boxRef.current) { gsap.from(boxRef.current, { y: -30, opacity: 0, duration: 0.6, ease: "power2.out" }); } }, []);
  return <div className="mt-6"><div ref={boxRef} className="h-12 w-12 rounded-lg bg-emerald-500" /></div>;
}
`.trim();

// ---------- shadcn helper (idempotent + alias-first) ----------
function setupShadcn(projectDir, { isVite }) {
  const componentsJsonPath = path.join(projectDir, "components.json");
  const hasComponentsJson = fs.existsSync(componentsJsonPath);

  // (1) Ensure import alias BEFORE init (shadcn validates this)
  if (isVite) {
    // Vite/React: prefer @/* -> src/*
    const tsconfigPath = path.join(projectDir, "tsconfig.json");
    const jsconfigPath = path.join(projectDir, "jsconfig.json");
    const cfgPath = fs.existsSync(tsconfigPath)
      ? tsconfigPath
      : jsconfigPath || tsconfigPath;
    const cfg = fs.existsSync(cfgPath)
      ? JSON.parse(read(cfgPath))
      : { compilerOptions: {} };
    cfg.compilerOptions = cfg.compilerOptions || {};
    cfg.compilerOptions.baseUrl = ".";
    cfg.compilerOptions.paths = {
      ...(cfg.compilerOptions.paths || {}),
      "@/*": ["src/*"],
      "@/components/*": ["src/components/*"],
      "@/lib/*": ["src/lib/*"],
    };
    write(cfgPath, JSON.stringify(cfg, null, 2));
  } else {
    // Next.js: @/* -> project root
    const tsconfigPath = path.join(projectDir, "tsconfig.json");
    const jsconfigPath = path.join(projectDir, "jsconfig.json");
    const cfgPath = fs.existsSync(tsconfigPath)
      ? tsconfigPath
      : jsconfigPath || tsconfigPath;
    const cfg = fs.existsSync(cfgPath)
      ? JSON.parse(read(cfgPath))
      : { compilerOptions: {} };
    cfg.compilerOptions = cfg.compilerOptions || {};
    cfg.compilerOptions.baseUrl = ".";
    cfg.compilerOptions.paths = {
      ...(cfg.compilerOptions.paths || {}),
      "@/*": ["./*"],
    };
    write(cfgPath, JSON.stringify(cfg, null, 2));
  }

  // (2) Dependencies (safe to re-run)
  run(
    "npm",
    ["i", "class-variance-authority", "clsx", "tailwind-merge", "lucide-react"],
    projectDir
  );
  run("npm", ["i", "-D", "tailwindcss-animate"], projectDir);

  // (3) utils.ts (idempotent)
  const libDir = isVite
    ? path.join(projectDir, "src", "lib")
    : path.join(projectDir, "lib");
  fs.mkdirSync(libDir, { recursive: true });
  write(path.join(libDir, "utils.ts"), CN_UTIL_TS);

  // (4) Init only if components.json missing
  if (!hasComponentsJson) {
    console.log("• shadcn/ui: initializing…");
    run("npx", ["shadcn@latest", "init", "-y"], projectDir);
    // Fallback: if init didn't create it, write our default template
    if (!fs.existsSync(componentsJsonPath)) {
      write(
        componentsJsonPath,
        isVite ? COMPONENTS_JSON_VITE : COMPONENTS_JSON_NEXT
      );
    }
  } else {
    console.log(
      "• shadcn/ui already initialized (components.json found) — skipping init."
    );
  }

  // (5) Ensure tailwindcss-animate plugin in tailwind config (CJS)
  const twCfgPath = path.join(projectDir, "tailwind.config.cjs");
  if (fs.existsSync(twCfgPath)) {
    const tw = read(twCfgPath);
    if (!/tailwindcss-animate/.test(tw)) {
      write(
        twCfgPath,
        tw.replace(
          /plugins:\s*\[\s*\]/,
          `plugins: [require("tailwindcss-animate")]`
        )
      );
    }
  }

  // (6) Add default components (safe to re-run)
  console.log("• Adding shadcn/ui components (idempotent)...");
  run(
    "npx",
    [
      "shadcn@latest",
      "add",
      "-y",
      "button",
      "card",
      "input",
      "label",
      "dialog",
      "dropdown-menu",
      "sheet",
      "toast",
    ],
    projectDir
  );
}

// ---------- argv + help ----------
const args = process.argv.slice(2);

const HELP = `
create-bawo-frontend v${pkgVersion}

USAGE:
  create-bawo-frontend <project-name> [options]

OPTIONS:
  --framework react|next   Choose framework (default: react)
  --ts                     Use TypeScript (default: JavaScript)
  --ui shadcn              Add shadcn/ui preset
  --framer                 Add framer-motion + demo
  --gsap                   Add GSAP + demo
  --no-start               Prevent auto-start (useful in CI)
  -y, --yes                Skip prompts; defaults + auto-start dev server
  -h, --help               Show this help
  -v, --version            Show CLI version

EXAMPLES:
  npx create-bawo-frontend my-app -y
  npx create-bawo-frontend my-next -y --framework next --ts --ui shadcn --framer
`;

if (args.includes("--help") || args.includes("-h")) {
  console.log(HELP);
  process.exit(0);
}
if (args.includes("--version") || args.includes("-v")) {
  console.log(pkgVersion);
  process.exit(0);
}

// ---------- main ----------
(async () => {
  const nameArg = args.find((a) => !a.startsWith("-")) || ".";
  const yes = args.includes("--yes") || args.includes("-y");

  // framework
  const frameworkIdx = args.findIndex((a) => a === "--framework");
  let framework = "react";
  if (frameworkIdx >= 0 && args[frameworkIdx + 1])
    framework = args[frameworkIdx + 1];
  if (args.includes("--next")) framework = "next"; // alias

  // flags
  const tsFlag = args.includes("--ts");
  const noStartFlag = args.includes("--no-start");
  const zustandOn = !args.includes("--no-zustand"); // default ON
  const ptFlag = !args.includes("--no-prettier-tailwind"); // default ON
  const uiIdx = args.findIndex((a) => a === "--ui");
  const uiPreset = uiIdx >= 0 && args[uiIdx + 1] ? args[uiIdx + 1] : null;
  const wantShadcn = uiPreset === "shadcn" || args.includes("--shadcn");
  const wantFramer = args.includes("--framer");
  const wantGsap = args.includes("--gsap");

  let answers;

  if (yes) {
    answers = {
      name: nameArg,
      framework: framework || "react",
      ts: tsFlag || false, // default JS
      zustand: zustandOn, // ON
      pt: ptFlag, // Prettier ON
      ui: wantShadcn ? "shadcn" : "none",
      framer: wantFramer,
      gsap: wantGsap,
      autoStart: !noStartFlag, // auto-start unless --no-start
    };
  } else {
    const resp = await prompts(
      [
        nameArg === "."
          ? {
              type: "text",
              name: "name",
              message: "Project name",
              initial: "my-frontend-app",
            }
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
        {
          type: "toggle",
          name: "ts",
          message: "Use TypeScript?",
          initial: tsFlag,
          active: "yes",
          inactive: "no",
        },
        {
          type: "toggle",
          name: "zustand",
          message: "Add Zustand?",
          initial: zustandOn,
          active: "yes",
          inactive: "no",
        },
        {
          type: "toggle",
          name: "pt",
          message: "Add Prettier + Tailwind plugin?",
          initial: ptFlag,
          active: "yes",
          inactive: "no",
        },
        {
          type: "select",
          name: "ui",
          message: "UI preset?",
          choices: [
            { title: "None", value: "none" },
            { title: "shadcn/ui", value: "shadcn" },
          ],
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
        {
          type: "toggle",
          name: "autoStart",
          message: "Start dev server after install?",
          initial: false,
          active: "yes",
          inactive: "no",
        },
      ].filter(Boolean),
      { onCancel: () => process.exit(1) }
    );

    answers = {
      name: nameArg !== "." ? nameArg : resp.name || "my-frontend-app",
      framework: resp.framework || framework,
      ts: !!resp.ts,
      zustand: !!resp.zustand,
      pt: !!resp.pt,
      ui: resp.ui || "none",
      framer: (resp.anim || []).includes("framer"),
      gsap: (resp.anim || []).includes("gsap"),
      autoStart: !!resp.autoStart,
    };
  }

  const projectDir = path.resolve(process.cwd(), answers.name);
  ensure(projectDir);

  // base package.json
  const pkgPath = path.join(projectDir, "package.json");
  if (!fs.existsSync(pkgPath))
    write(
      pkgPath,
      JSON.stringify(
        { name: path.basename(projectDir), private: true, version: "0.0.0" },
        null,
        2
      )
    );

  // ---------- Scaffold ----------
  if (answers.framework === "react") {
    // React + Vite + Tailwind v3.4.14 (stable)
    const deps = ["react", "react-dom"];
    const dev = [
      "vite",
      "@vitejs/plugin-react",
      "tailwindcss@3.4.14",
      "postcss",
      "autoprefixer",
    ];
    if (answers.ts) dev.push("typescript", "@types/react", "@types/react-dom");

    run("npm", ["i", ...deps], projectDir);
    run("npm", ["i", "-D", ...dev], projectDir);

    write(
      path.join(projectDir, "vite.config.ts"),
      `
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({ plugins: [react()] });
`.trimStart()
    );

    const pkg = JSON.parse(read(pkgPath));
    pkg.scripts = {
      ...(pkg.scripts || {}),
      dev: "vite",
      build: "vite build",
      preview: "vite preview",
      lint: 'echo "(add eslint if you want)" && exit 0',
      format: 'echo "(add prettier if you want)" && exit 0',
    };
    write(pkgPath, JSON.stringify(pkg, null, 2));

    write(
      path.join(projectDir, "index.html"),
      `
<!doctype html>
<html lang="en">
  <head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /><title>Vite + React + Tailwind</title></head>
  <body class="min-h-screen bg-white text-gray-900"><div id="root"></div><script type="module" src="/src/main.${
    answers.ts ? "tsx" : "jsx"
  }"></script></body>
</html>
`.trimStart()
    );

    // Tailwind v3 config (CJS)
    write(
      path.join(projectDir, "tailwind.config.cjs"),
      `module.exports = { content: ["./index.html","./src/**/*.{js,ts,jsx,tsx}"], theme: { extend: {} }, plugins: [] };`
    );
    write(
      path.join(projectDir, "postcss.config.cjs"),
      `module.exports = { plugins: { tailwindcss: {}, autoprefixer: {} } };`
    );
    write(
      path.join(projectDir, "src/styles/index.css"),
      `@tailwind base;\n@tailwind components;\n@tailwind utilities;`
    );

    // React entry
    write(
      path.join(projectDir, "src", `main.${answers.ts ? "tsx" : "jsx"}`),
      `
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles/index.css";
createRoot(document.getElementById("root")).render(<React.StrictMode><App /></React.StrictMode>);
`.trimStart()
    );
    write(
      path.join(projectDir, "src", `App.${answers.ts ? "tsx" : "jsx"}`),
      `
${answers.ts ? "import type {} from 'react';" : ""}
export default function App() {
  return (
    <main className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold">Hello 👋 React + Vite + Tailwind (${
        answers.ts ? "TS" : "JS"
      })</h1>
      <p className="mt-3 text-gray-600">Edit <code className="px-1 rounded bg-gray-200">src/App.${
        answers.ts ? "tsx" : "jsx"
      }</code>.</p>
    </main>
  );
}
`.trimStart()
    );

    if (answers.ts) {
      write(
        path.join(projectDir, "tsconfig.json"),
        JSON.stringify(
          {
            compilerOptions: {
              target: "ES2022",
              lib: ["ES2022", "DOM", "DOM.Iterable"],
              module: "ESNext",
              jsx: "react-jsx",
              moduleResolution: "Bundler",
              strict: true,
              skipLibCheck: true,
              esModuleInterop: true,
              noEmit: true,
            },
            include: ["src"],
          },
          null,
          2
        )
      );
    }

    // Zustand
    if (answers.zustand) {
      run("npm", ["i", "zustand"], projectDir);
      ensure(path.join(projectDir, "src", "stores"));
      write(
        path.join(projectDir, "src", "stores", "useAppStore.ts"),
        `
import { create } from "zustand";
import { devtools, persist, createJSONStorage } from "zustand/middleware";
type Theme = "light" | "dark";
interface AppState { theme: Theme; count: number; setTheme: (t: Theme) => void; inc: () => void; dec: () => void; reset: () => void; }
export const useAppStore = create<AppState>()(devtools(persist((set)=>({
  theme:"light", count:0, setTheme:(t)=>set({theme:t}), inc:()=>set(s=>({count:s.count+1})), dec:()=>set(s=>({count:s.count-1})), reset:()=>set({count:0})
}),{ name:"app-store", storage: createJSONStorage(()=>localStorage)})));
`.trim()
      );
    }

    // Prettier
    if (answers.pt) {
      run(
        "npm",
        ["i", "-D", "prettier", "prettier-plugin-tailwindcss"],
        projectDir
      );
      write(
        path.join(projectDir, ".prettierrc"),
        JSON.stringify({ plugins: ["prettier-plugin-tailwindcss"] }, null, 2)
      );
      write(
        path.join(projectDir, ".prettierignore"),
        "node_modules\ndist\n.next\nbuild\n"
      );
    }

    // shadcn/ui (idempotent)
    if (answers.ui === "shadcn") {
      setupShadcn(projectDir, { isVite: true });
    }

    // Framer / GSAP demos
    ensure(path.join(projectDir, "src", "components", "demo"));
    if (answers.framer) {
      run("npm", ["i", "framer-motion"], projectDir);
      write(
        path.join(projectDir, "src", "components", "demo", "FramerDemo.tsx"),
        FRAMER_DEMO_REACT
      );
    }
    if (answers.gsap) {
      run("npm", ["i", "gsap"], projectDir);
      write(
        path.join(
          projectDir,
          "src",
          "components",
          "demo",
          "GsapDemo." + (answers.ts ? "tsx" : "jsx")
        ),
        answers.ts ? GSAP_DEMO_REACT_TS : GSAP_DEMO_REACT_JS
      );
    }
  } else {
    // Next.js + Tailwind v3.4.14 (stable)
    const deps = ["react", "react-dom", "next"];
    const dev = ["tailwindcss@3.4.14", "postcss", "autoprefixer"];
    if (answers.ts) dev.push("typescript", "@types/react", "@types/react-dom");

    run("npm", ["i", ...deps], projectDir);
    run("npm", ["i", "-D", ...dev], projectDir);

    const pkg = JSON.parse(read(pkgPath));
    pkg.scripts = {
      ...(pkg.scripts || {}),
      dev: "next dev",
      build: "next build",
      start: "next start",
      lint: 'echo "(add eslint if you want)" && exit 0',
      format: 'echo "(add prettier if you want)" && exit 0',
    };
    write(pkgPath, JSON.stringify(pkg, null, 2));

    write(
      path.join(projectDir, "next.config.ts"),
      `import type { NextConfig } from "next"; const nextConfig: NextConfig = {}; export default nextConfig;`
    );
    if (answers.ts) {
      write(
        path.join(projectDir, "tsconfig.json"),
        JSON.stringify(
          {
            compilerOptions: {
              target: "ES2022",
              lib: ["ES2022", "DOM", "DOM.Iterable"],
              allowJs: false,
              skipLibCheck: true,
              strict: true,
              noEmit: true,
              esModuleInterop: true,
              module: "ESNext",
              moduleResolution: "Bundler",
              resolveJsonModule: true,
              isolatedModules: true,
              jsx: "preserve",
              incremental: true,
            },
            include: [
              "next-env.d.ts",
              "**/*.ts",
              "**/*.tsx",
              ".next/types/**/*.ts",
            ],
            exclude: ["node_modules"],
          },
          null,
          2
        )
      );
      write(
        path.join(projectDir, "next-env.d.ts"),
        `/// <reference types="next" />\n/// <reference types="next/image-types/global" />\n`
      );
    }

    // Tailwind v3 config (CJS)
    write(
      path.join(projectDir, "tailwind.config.cjs"),
      `module.exports = { content: ["./app/**/*.{js,ts,jsx,tsx}","./components/**/*.{js,ts,jsx,tsx}"], theme: { extend: {} }, plugins: [] };`
    );
    write(
      path.join(projectDir, "postcss.config.cjs"),
      `module.exports = { plugins: { tailwindcss: {}, autoprefixer: {} } };`
    );
    write(
      path.join(projectDir, "app", "globals.css"),
      `@tailwind base;\n@tailwind components;\n@tailwind utilities;`
    );

    write(
      path.join(projectDir, "app", "layout.tsx"),
      `
export const metadata = { title: "Next + Tailwind", description: "Scaffolded by create-bawo-frontend" };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (<html lang="en"><body className="min-h-screen bg-white text-gray-900">{children}</body></html>);
}
`.trimStart()
    );
    write(
      path.join(projectDir, "app", "page.tsx"),
      `
export default function Page() {
  return (
    <main className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold">Hello 👋 Next.js + Tailwind (${
        answers.ts ? "TS" : "JS"
      })</h1>
      <p className="mt-3 text-gray-600">Edit <code className="px-1 rounded bg-gray-200">app/page.tsx</code>.</p>
    </main>
  );
}
`.trimStart()
    );

    // Zustand
    if (answers.zustand) {
      run("npm", ["i", "zustand"], projectDir);
      ensure(path.join(projectDir, "store"));
      write(
        path.join(projectDir, "store", "useAppStore.ts"),
        `
import { create } from "zustand";
import { devtools, persist, createJSONStorage } from "zustand/middleware";
type Theme = "light" | "dark";
interface AppState { theme: Theme; count: number; setTheme: (t: Theme) => void; inc: () => void; dec: () => void; reset: () => void; }
export const useAppStore = create<AppState>()(devtools(persist((set)=>({
  theme:"light", count:0, setTheme:(t)=>set({theme:t}), inc:()=>set(s=>({count:s.count+1})), dec:()=>set(s=>({count:s.count-1})), reset:()=>set({count:0})
}),{ name:"app-store", storage: createJSONStorage(()=>localStorage)})));
`.trim()
      );
    }

    // Prettier
    if (answers.pt) {
      run(
        "npm",
        ["i", "-D", "prettier", "prettier-plugin-tailwindcss"],
        projectDir
      );
      write(
        path.join(projectDir, ".prettierrc"),
        JSON.stringify({ plugins: ["prettier-plugin-tailwindcss"] }, null, 2)
      );
      write(
        path.join(projectDir, ".prettierignore"),
        "node_modules\n.next\nbuild\ndist\n"
      );
    }

    // shadcn/ui (idempotent + alias-first)
    if (answers.ui === "shadcn") {
      setupShadcn(projectDir, { isVite: false });
    }

    // Framer / GSAP demos
    ensure(path.join(projectDir, "components", "demo"));
    if (answers.framer) {
      run("npm", ["i", "framer-motion"], projectDir);
      write(
        path.join(projectDir, "components", "demo", "FramerDemo.tsx"),
        FRAMER_DEMO_NEXT
      );
    }
    if (answers.gsap) {
      run("npm", ["i", "gsap"], projectDir);
      write(
        path.join(projectDir, "components", "demo", "GsapDemo.tsx"),
        GSAP_DEMO_NEXT
      );
    }
  }

  // root ignores
  write(
    path.join(projectDir, ".gitignore"),
    "node_modules\ndist\n.next\n.env\n.DS_Store\nbuild\n"
  );

  console.log("\n📦 Finalizing install...");
  run("npm", ["install"], projectDir);

  if (answers.autoStart) {
    console.log("\n🚀 Starting dev server...");
    run("npm", ["run", "dev"], projectDir);
  } else {
    console.log("\n✅ Scaffold complete.");
    console.log(`  cd ${path.basename(projectDir)}`);
    console.log("  npm run dev");
  }
})();
