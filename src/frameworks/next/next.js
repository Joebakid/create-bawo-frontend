/* eslint-disable no-console */

const fs = require("fs");
const path = require("path");

const { write, ensure, read, run } = require("../../utils");
const { setupShadcnUI } = require("../../features/ui/shadcn/install");
const { injectTailwind } = require("../../tailwind/inject");

/* -------------------------------------------------
Helpers
------------------------------------------------- */

function dirSize(dir) {
  let size = 0;

  for (const file of fs.readdirSync(dir)) {

    const full = path.join(dir, file);
    const stat = fs.statSync(full);

    size += stat.isDirectory()
      ? dirSize(full)
      : stat.size;

  }

  return size;
}

function formatSize(bytes) {

  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;

  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

/* -------------------------------------------------
Next.js Scaffold
------------------------------------------------- */

async function scaffoldNext(projectDir, options) {

  const state = options["state-mgmt"] || "none";

  console.log("🚀 Creating Next.js App Router project...");

  /* -------------------------------------------------
  Dependencies
  ------------------------------------------------- */

  const deps = ["next", "react", "react-dom"];
  const dev = [];

  if (options.ts) {

    dev.push(
      "typescript",
      "@types/react",
      "@types/react-dom",
      "@types/node"
    );

  }

  if (state === "zustand") deps.push("zustand");

  if (options.framer) deps.push("framer-motion");

  if (options.gsap) deps.push("gsap");

  run("npm", ["install", ...deps], projectDir);

  if (dev.length) {
    run("npm", ["install", "-D", ...dev], projectDir);
  }

  /* -------------------------------------------------
  package.json
  ------------------------------------------------- */

  const pkgPath = path.join(projectDir, "package.json");

  const pkg = fs.existsSync(pkgPath)
    ? JSON.parse(read(pkgPath))
    : {};

  delete pkg.type;

  pkg.private = true;

  pkg.scripts = {
    dev: "next dev",
    build: "next build",
    start: "next start"
  };

  write(pkgPath, JSON.stringify(pkg, null, 2));

  /* -------------------------------------------------
  App structure
  ------------------------------------------------- */

  ensure(path.join(projectDir, "app"));
  ensure(path.join(projectDir, "app/components"));
  ensure(path.join(projectDir, "store"));
  ensure(path.join(projectDir, "public"));

  /* -------------------------------------------------
  Tailwind
  ------------------------------------------------- */

  const tailwind = injectTailwind({
    projectDir,
    framework: "next",
    version: options.tailwind,
    ui: options.ui
  });

  if (tailwind?.deps?.length) {
    run("npm", ["install", "-D", ...tailwind.deps], projectDir);
  }

  /* -------------------------------------------------
  Providers
  ------------------------------------------------- */

  write(
    path.join(projectDir, "app/providers.tsx"),
`
"use client";

export default function Providers({ children }) {
  return children;
}
`.trim()
  );

  /* -------------------------------------------------
  Layout (SEO-compatible)
  ------------------------------------------------- */

  write(
    path.join(projectDir, "app/layout.tsx"),
`
import "../globals.css";
import Providers from "./providers";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
`.trim()
  );

  /* -------------------------------------------------
  Starter Page (Template)
  ------------------------------------------------- */

  const template = read(
    path.join(__dirname, "../../templates/starter/next/app/page.tsx")
  );

  write(
    path.join(projectDir, "app/page.tsx"),
    template
  );

  /* -------------------------------------------------
  shadcn/ui
  ------------------------------------------------- */

  if (options.ui === "shadcn") {

    await setupShadcnUI({
      projectDir,
      framework: "next",
      tailwind: "v3"
    });

  }

  /* -------------------------------------------------
  Summary
  ------------------------------------------------- */

  console.log("\n📊 Scaffold Summary");

  console.log("────────────────────────");

  console.log("Framework :", "Next.js (App Router)");
  console.log("Tailwind  :", tailwind.version);
  console.log("State     :", state);

  console.log(
    "Project   :",
    formatSize(dirSize(projectDir))
  );

  console.log("────────────────────────\n");

}

module.exports = { scaffoldNext };