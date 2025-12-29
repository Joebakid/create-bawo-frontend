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
 * Next.js Scaffold
 * ------------------------------------------------- */
async function scaffoldNext(projectDir, options) {
  const state = options["state-mgmt"] || "none";

  console.log("🚀 Creating Next.js App Router project...");

  /* -------------------------------------------------
   * Base deps (NO Tailwind here)
   * ------------------------------------------------- */
  const deps = ["next", "react", "react-dom"];
  const dev = [];

  if (options.ts) {
    dev.push("typescript", "@types/react", "@types/react-dom", "@types/node");
  }

  if (state === "zustand") deps.push("zustand");
  if (options.framer) deps.push("framer-motion");
  if (options.gsap) deps.push("gsap");

  run("npm", ["install", ...deps], projectDir);
  if (dev.length) run("npm", ["install", "-D", ...dev], projectDir);

  /* -------------------------------------------------
   * package.json
   * ------------------------------------------------- */
  const pkgPath = path.join(projectDir, "package.json");
  const pkg = fs.existsSync(pkgPath)
    ? JSON.parse(read(pkgPath))
    : {};

  delete pkg.type; // REQUIRED
  pkg.private = true;
  pkg.scripts = {
    dev: "next dev",
    build: "next build",
    start: "next start",
  };

  write(pkgPath, JSON.stringify(pkg, null, 2));

  /* -------------------------------------------------
   * App structure
   * ------------------------------------------------- */
  ensure(projectDir, "app");
  ensure(projectDir, "app/components");
  ensure(projectDir, "store");

  /* -------------------------------------------------
   * ✅ Tailwind Injection
   * ------------------------------------------------- */
  const tailwind = injectTailwind({
    projectDir,
    framework: "next",
    version: options.tailwind,
    ui: options.ui,
  });

  run("npm", ["install", "-D", ...tailwind.deps], projectDir);

  /* -------------------------------------------------
   * Providers
   * ------------------------------------------------- */
  write(
    path.join(projectDir, "app/providers.tsx"),
    `"use client";
export default function Providers({ children }) {
  return children;
}`
  );

  /* -------------------------------------------------
   * Layout
   * ------------------------------------------------- */
write(
  path.join(projectDir, "app/layout.tsx"),
  `
import "../globals.css";
import Providers from "./providers";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
`.trim()
);

  /* -------------------------------------------------
   * Starter Page
   * ------------------------------------------------- */
  write(
    path.join(projectDir, "app/page.tsx"),
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

  /* -------------------------------------------------
   * shadcn (LAST)
   * ------------------------------------------------- */
  if (options.ui === "shadcn") {
    await setupShadcnUI({
      projectDir,
      framework: "next",
      tailwind: "v3",
    });
  }

  /* -------------------------------------------------
   * Summary
   * ------------------------------------------------- */
  console.log("\n📊 Scaffold Summary");
  console.log("────────────────────────");
  console.log("Framework :", "Next.js (App Router)");
  console.log("Tailwind  :", tailwind.version);
  console.log("State     :", state);
  console.log("Project   :", formatSize(dirSize(projectDir)));
  console.log("────────────────────────\n");
}

module.exports = { scaffoldNext };
