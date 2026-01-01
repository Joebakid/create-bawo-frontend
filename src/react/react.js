/* eslint-disable no-console */
const fs = require("fs");
const path = require("path");
const { write, ensure, read, run } = require("../utils");
const { setupShadcnUI } = require("../ui/shadcn");
const { injectTailwind } = require("../tailwind/inject");

/* -------------------------------------------------
 * Helpers
 * ------------------------------------------------- */
function dirSize(dir) {
  let size = 0;
  for (const file of fs.readdirSync(dir)) {
    const full = path.join(dir, file);
    const stat = fs.statSync(full);
    size += stat.isDirectory() ? dirSize(full) : stat.size;
  }
  return size;
}

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

/* -------------------------------------------------
 * React + Vite Scaffold
 * ------------------------------------------------- */
async function scaffoldReact(projectDir, options) {
  const state = options["state-mgmt"] || "none";
  const ext = options.ts ? "tsx" : "jsx";

  const useFramer = !!options.framer;
  const useGsap = !!options.gsap;

  console.log("⚛️  Creating React + Vite project...");

  /* -------------------------------------------------
   * Structure
   * ------------------------------------------------- */
  ensure(projectDir, "src");
  ensure(projectDir, "src/styles");
  ensure(projectDir, "src/components");
  ensure(projectDir, "src/store");

  /* -------------------------------------------------
   * Dependencies (NON-TAILWIND)
   * ------------------------------------------------- */
  const deps = ["react", "react-dom"];
  const dev = ["vite", "@vitejs/plugin-react"];

  if (options.ts) {
    dev.push("typescript", "@types/react", "@types/react-dom");
  }

  if (state === "zustand") deps.push("zustand");
  if (state === "redux" || state === "rtk-query") {
    deps.push("@reduxjs/toolkit", "react-redux");
  }
  if (state === "react-query") deps.push("@tanstack/react-query");
  if (state === "swr") deps.push("swr");

  if (useFramer) deps.push("framer-motion");
  if (useGsap) deps.push("gsap");

  console.log("📦 Installing dependencies...");
  run("npm", ["install", ...deps], projectDir);

  console.log("🛠 Installing dev dependencies...");
  run("npm", ["install", "-D", ...dev], projectDir);

  /* -------------------------------------------------
   * package.json
   * ------------------------------------------------- */
  const pkgPath = path.join(projectDir, "package.json");
  const pkg = fs.existsSync(pkgPath)
    ? JSON.parse(read(pkgPath))
    : {};

  pkg.name = pkg.name || path.basename(projectDir);
  pkg.private = true;
  pkg.scripts = {
    dev: "vite",
    build: "vite build",
    preview: "vite preview",
  };

  write(pkgPath, JSON.stringify(pkg, null, 2));

  /* -------------------------------------------------
   * Vite config
   * ------------------------------------------------- */
  write(
    path.join(projectDir, "vite.config.ts"),
    `
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});
`.trim()
  );

  /* -------------------------------------------------
   * ✅ Tailwind Injection (SOURCE OF TRUTH)
   * ------------------------------------------------- */
  const tailwindMeta = injectTailwind({
    projectDir,
    framework: "react",
    version: options.tailwind,
    ui: options.ui,
  });

  // install tailwind deps returned by injector
  if (tailwindMeta?.deps?.length) {
    run("npm", ["install", "-D", ...tailwindMeta.deps], projectDir);
  }

  /* -------------------------------------------------
   * tsconfig.json
   * ------------------------------------------------- */
  if (options.ts) {
    write(
      path.join(projectDir, "tsconfig.json"),
      JSON.stringify(
        {
          compilerOptions: {
            target: "ESNext",
            lib: ["DOM", "DOM.Iterable", "ESNext"],
            jsx: "react-jsx",
            module: "ESNext",
            moduleResolution: "Bundler",
            strict: true,
            skipLibCheck: true,
            noEmit: true,
            baseUrl: ".",
            paths: {
              "@/*": ["src/*"],
            },
          },
          include: ["src"],
        },
        null,
        2
      )
    );
  }

  /* -------------------------------------------------
   * index.html
   * ------------------------------------------------- */
  write(
    path.join(projectDir, "index.html"),
    `
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Create Bawo Frontend</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.${ext}"></script>
  </body>
</html>
`.trim()
  );

  /* -------------------------------------------------
   * Starter App
   * ------------------------------------------------- */
  write(
    path.join(projectDir, `src/App.${ext}`),
    `
export default function Page() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="w-full max-w-xl px-6">
        <div className="rounded-2xl bg-white shadow-sm border border-slate-200 p-8 text-center space-y-6">
          <h1 className="text-4xl font-semibold tracking-tight text-slate-900">
            create-bawo-frontend
          </h1>

          <p className="text-slate-600 text-lg leading-relaxed">
            A modern frontend scaffolding framework for React, Next.js, and Vue —
            built for speed, consistency, and scalability.
          </p>

          <div className="flex flex-wrap gap-3 items-center justify-center pt-2">
            <a
              href="https://create-bawo-frontend.vercel.app/docs"
               target="_blank"
              className="inline-flex items-center gap-2 rounded-md bg-slate-900 px-5 py-3 text-sm font-medium text-white hover:bg-slate-800 transition focus:outline-none focus:ring-2 focus:ring-slate-400"
            >
              View Documentation
              <span aria-hidden>→</span>
            </a>

            <a
              href="https://github.com/Joebakid/create-bawo-frontend"
              target="_blank"
              className="inline-flex items-center gap-2 rounded-md px-5 py-3 text-sm font-medium text-slate-800 border border-slate-300 hover:bg-slate-100 transition focus:outline-none focus:ring-2 focus:ring-slate-300"
            >
              {/* GitHub Icon */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-4 w-4"
                aria-hidden="true"
              >
                <path d="M12 2C6.477 2 2 6.484 2 12.02c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.009-.868-.014-1.703-2.782.605-3.369-1.344-3.369-1.344-.454-1.158-1.11-1.467-1.11-1.467-.908-.62.069-.608.069-.608 1.004.071 1.532 1.032 1.532 1.032.892 1.53 2.341 1.088 2.91.832.091-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.27.098-2.647 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844a9.56 9.56 0 012.504.337c1.909-1.296 2.748-1.026 2.748-1.026.546 1.377.203 2.394.1 2.647.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.944.36.31.68.923.68 1.86 0 1.343-.012 2.427-.012 2.757 0 .268.18.58.688.481A10.02 10.02 0 0022 12.02C22 6.484 17.523 2 12 2z" />
              </svg>

              GitHub
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
`.trim()
  );

  write(
    path.join(projectDir, `src/main.${ext}`),
    `
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "../globals.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
`.trim()
  );

  /* -------------------------------------------------
   * shadcn/ui (MUST BE LAST)
   * ------------------------------------------------- */
  if (options.ui === "shadcn") {
    console.log("✨ Setting up shadcn/ui...");
    await setupShadcnUI({
      projectDir,
      framework: "react",
      tailwind: "v3",
    });
  }

  /* -------------------------------------------------
   * Summary
   * ------------------------------------------------- */
  console.log("\n📊 Scaffold Summary");
  console.log("────────────────────────");
  console.log("Framework    : React + Vite");
  console.log("Tailwind     :", tailwindMeta.version);
  console.log("State Mgmt   :", state);
  console.log("Animations   :", useFramer || useGsap ? "Enabled" : "None");
  console.log("Project size :", formatSize(dirSize(projectDir)));
  console.log("────────────────────────\n");
}

module.exports = { scaffoldReact };
