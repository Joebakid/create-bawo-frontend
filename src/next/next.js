/* eslint-disable no-console */
const fs = require("fs");
const path = require("path");
const { write, ensure, read, run } = require("../utils");

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
  const deps = ["next", "react", "react-dom"];
  const dev = [];

  if (isTW4) {
    dev.push("tailwindcss@latest", "postcss", "@tailwindcss/postcss");
  } else {
    dev.push("tailwindcss@3.4.14", "postcss", "autoprefixer");
  }

  if (answers.ts) {
    dev.push("typescript", "@types/react", "@types/react-dom", "@types/node");
  }

  if (state === "zustand") deps.push("zustand");
  if (answers.framer) deps.push("framer-motion");
  if (answers.gsap) deps.push("gsap");

  console.log("📦 Installing dependencies...");
  run("npm", ["install", ...deps], projectDir);

  console.log("🛠 Installing dev dependencies...");
  run("npm", ["install", "-D", ...dev], projectDir);

  /* -------------------------------------------------
   * package.json (ESM FIX)
   * ------------------------------------------------- */
  const pkgPath = path.join(projectDir, "package.json");
  const pkg = JSON.parse(read(pkgPath));

  delete pkg.type; // REQUIRED FOR NEXT APP ROUTER

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
   * Tailwind
   * ------------------------------------------------- */
  write(
    path.join(projectDir, "postcss.config.cjs"),
    isTW4
      ? `module.exports = { plugins: { "@tailwindcss/postcss": {} } };`
      : `module.exports = { plugins: { tailwindcss: {}, autoprefixer: {} } };`
  );

  write(
    path.join(projectDir, "app/globals.css"),
    isTW4
      ? `@import "tailwindcss";`
      : `@tailwind base;\n@tailwind components;\n@tailwind utilities;`
  );

  /* -------------------------------------------------
   * Zustand store
   * ------------------------------------------------- */
  if (state === "zustand") {
    write(
      path.join(projectDir, "store/useStore.ts"),
      `
import { create } from "zustand";

export const useStore = create((set) => ({
  count: 0,
  inc: () => set((s) => ({ count: s.count + 1 })),
}));
`.trim()
    );
  }

  /* -------------------------------------------------
   * Client Providers
   * ------------------------------------------------- */
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
   * Demo components
   * ------------------------------------------------- */
  if (state === "zustand") {
    write(
      path.join(projectDir, "app/components/Counter.tsx"),
      `
"use client";
import { useStore } from "../../store/useStore";

export default function Counter() {
  const { count, inc } = useStore();
  return (
    <button
      onClick={inc}
      className="px-4 py-2 bg-blue-600 text-white rounded"
    >
      Count: {count}
    </button>
  );
}
`.trim()
    );
  }

  if (answers.framer) {
    write(
      path.join(projectDir, "app/components/MotionDemo.tsx"),
      `
"use client";
import { motion } from "framer-motion";

export default function MotionDemo() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 bg-emerald-500 text-white rounded"
    >
      Framer Motion works 🚀
    </motion.div>
  );
}
`.trim()
    );
  }

  /* -------------------------------------------------
   * layout + page
   * ------------------------------------------------- */
  write(
    path.join(projectDir, "app/layout.tsx"),
    `
import "./globals.css";
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

  write(
    path.join(projectDir, "app/page.tsx"),
    `
import Counter from "./components/Counter";
import MotionDemo from "./components/MotionDemo";

export default function Page() {
  return (
    <main className="p-8 space-y-6">
      <h1 className="text-3xl font-bold">create-bawo-frontend</h1>
      <Counter />
      <MotionDemo />
    </main>
  );
}
`.trim()
  );

  /* -------------------------------------------------
   * Summary
   * ------------------------------------------------- */
  console.log("\n📊 Scaffold Summary");
  console.log("────────────────────────");
  console.log("Framework  : Next.js (App Router)");
  console.log("State Mgmt :", state);
  console.log("Animations :", answers.framer || answers.gsap ? "Enabled" : "None");
  console.log("Project size:", formatSize(dirSize(projectDir)));
  console.log("────────────────────────\n");
}

module.exports = { scaffoldNext };
