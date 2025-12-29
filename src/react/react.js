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
export default function App() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">create-bawo-frontend</h1>
        <p className="text-gray-500">React + Vite starter ready 🚀</p>
        <a
          href="https://create-bawo-frontend.vercel.app"
          className="text-blue-600 underline"
        >
          Documentation →
        </a>
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
import "./styles/index.css";

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
