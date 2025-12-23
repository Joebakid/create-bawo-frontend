/* eslint-disable no-console */
const fs = require("fs");
const path = require("path");
const { write, ensure, read, run } = require("../utils");
const { setupShadcn } = require("../setup/shadcn");

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
async function scaffoldNext(projectDir, answers) {
  const start = Date.now();

  const isTW4 = answers.tailwind === "v4";
  const ext = answers.ts ? "tsx" : "jsx";
  const state = answers["state-mgmt"] || "none";

  console.log(
    isTW4
      ? "⚡ Tailwind CSS v4 (experimental)"
      : "✅ Tailwind CSS v3 (stable)"
  );

  /* -------------------------------------------------
   * Dependencies
   * ------------------------------------------------- */
  const deps = ["react", "react-dom", "next"];
  const dev = [];

  if (isTW4) {
    dev.push("tailwindcss@latest", "postcss", "@tailwindcss/postcss");
  } else {
    dev.push("tailwindcss@3.4.14", "postcss", "autoprefixer");
  }

  if (answers.ts) {
    dev.push("typescript", "@types/react", "@types/react-dom", "@types/node");
  }

  // ---- State management ----
  if (state === "redux" || state === "rtk-query") {
    deps.push("@reduxjs/toolkit", "react-redux");
  }
  if (state === "react-query") deps.push("@tanstack/react-query");
  if (state === "swr") deps.push("swr");
  if (state === "zustand") deps.push("zustand");

  // ---- Animations ----
  if (answers.framer) deps.push("framer-motion");
  if (answers.gsap) deps.push("gsap");

  console.log("📦 Installing dependencies...");
  run("npm", ["install", ...deps], projectDir);

  console.log("🛠 Installing dev dependencies...");
  run("npm", ["install", "-D", ...dev], projectDir);

  /* -------------------------------------------------
   * SAFE package.json handling (ESM FIX)
   * ------------------------------------------------- */
  const pkgPath = path.join(projectDir, "package.json");
  let pkg = {};

  try {
    const raw = read(pkgPath);
    pkg = raw ? JSON.parse(raw) : {};
  } catch {
    console.warn("⚠️ package.json invalid — regenerating safely.");
    pkg = {};
  }

  delete pkg.type; // 🔥 REQUIRED for Next.js App Router

  pkg.name = pkg.name || path.basename(projectDir);
  pkg.private = true;
  pkg.scripts = {
    dev: "next dev",
    build: "next build",
    start: "next start",
  };

  write(pkgPath, JSON.stringify(pkg, null, 2));

  /* -------------------------------------------------
   * Config files
   * ------------------------------------------------- */
  if (answers.ts) {
    write(
      path.join(projectDir, "next.config.ts"),
      `import type { NextConfig } from "next";
const nextConfig: NextConfig = {};
export default nextConfig;
`
    );

    write(
      path.join(projectDir, "next-env.d.ts"),
      `/// <reference types="next" />
/// <reference types="next/image-types/global" />`
    );
  } else {
    write(
      path.join(projectDir, "next.config.mjs"),
      `const nextConfig = {};
export default nextConfig;`
    );
  }

  /* -------------------------------------------------
   * App Router structure
   * ------------------------------------------------- */
  ensure(projectDir, "app");

  /* -------------------------------------------------
   * Tailwind
   * ------------------------------------------------- */
  if (isTW4) {
    write(
      path.join(projectDir, "postcss.config.cjs"),
      `module.exports = {
  plugins: { "@tailwindcss/postcss": {} },
};`
    );
  } else {
    write(
      path.join(projectDir, "tailwind.config.cjs"),
      `module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}"],
  theme: { extend: {} },
  plugins: [],
};`
    );

    write(
      path.join(projectDir, "postcss.config.cjs"),
      `module.exports = {
  plugins: { tailwindcss: {}, autoprefixer: {} },
};`
    );
  }

  write(
    path.join(projectDir, "app/globals.css"),
    isTW4
      ? `@import "tailwindcss";`
      : `@tailwind base;
@tailwind components;
@tailwind utilities;`
  );

  /* -------------------------------------------------
   * State Providers
   * ------------------------------------------------- */
  if (state === "redux" || state === "rtk-query") {
    ensure(projectDir, "store");
    write(
      path.join(projectDir, "store/store.ts"),
      `
import { configureStore } from "@reduxjs/toolkit";

export const store = configureStore({
  reducer: {},
});
`.trim()
    );
  }

  if (state === "react-query") {
    ensure(projectDir, "store");
    write(
      path.join(projectDir, "store/queryClient.ts"),
      `
import { QueryClient } from "@tanstack/react-query";
export const queryClient = new QueryClient();
`.trim()
    );
  }

  /* -------------------------------------------------
   * layout + page (PROVIDER AWARE)
   * ------------------------------------------------- */
  write(
    path.join(projectDir, "app", `layout.${ext}`),
    `
import "./globals.css";
${state === "redux" ? 'import { Provider } from "react-redux"; import { store } from "../store/store";' : ""}
${state === "react-query" ? 'import { QueryClientProvider } from "@tanstack/react-query"; import { queryClient } from "../store/queryClient";' : ""}

export default function RootLayout({ children }) {
  const App = ${state === "redux"
      ? "<Provider store={store}>{children}</Provider>"
      : state === "react-query"
      ? "<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>"
      : "children"};

  return (
    <html lang="en">
      <body>{App}</body>
    </html>
  );
}
`.trimStart()
  );

  write(
    path.join(projectDir, "app", `page.${ext}`),
    `
export default function Page() {
  return (
    <main className="p-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold">create-bawo-frontend</h1>
      <p className="text-gray-500">
        Next.js + Tailwind ${isTW4 ? "v4" : "v3"} ready 🚀
      </p>
    </main>
  );
}
`.trimStart()
  );

  /* -------------------------------------------------
   * Summary
   * ------------------------------------------------- */
  const elapsed = ((Date.now() - start) / 1000).toFixed(1);
  const size = formatSize(dirSize(projectDir));

  console.log("\n📊 Scaffold Summary");
  console.log("────────────────────────");
  console.log("Framework      : Next.js (App Router)");
  console.log("Language       :", answers.ts ? "TypeScript" : "JavaScript");
  console.log("Tailwind       :", isTW4 ? "v4 (experimental)" : "v3 (stable)");
  console.log("Animations     :", answers.framer || answers.gsap ? "Enabled" : "None");
  console.log("State Mgmt     :", state);
  console.log("Project size   :", size);
  console.log("Time taken     :", `${elapsed}s`);
  console.log("────────────────────────\n");
}

module.exports = { scaffoldNext };
