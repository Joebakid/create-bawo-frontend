/* eslint-disable no-console */
const fs = require("fs");
const path = require("path");
const { run, write } = require("../utils");

/**
 * setupShadcnUI
 * Deterministic, SAFE shadcn/ui setup for React + Vite
 * ALWAYS forces Tailwind v3
 */
async function setupShadcnUI({ projectDir }) {
  console.log("✨ Setting up shadcn/ui...");

  /* -------------------------------------------------
   * 🚨 FORCE TAILWIND v3 (NON-NEGOTIABLE)
   * ------------------------------------------------- */
  console.log(
    "⚠️ shadcn/ui requires Tailwind CSS v3 for stability.\n" +
    "→ Downgrading Tailwind to v3 (stable)."
  );

  // Remove v4 packages if present
  run(
    "npm",
    [
      "remove",
      "tailwindcss",
      "@tailwindcss/vite",
      "@tailwindcss/postcss",
      "tw-animate-css",
    ],
    projectDir
  );

  // Install Tailwind v3 stack
  run(
    "npm",
    [
      "install",
      "-D",
      "tailwindcss@3.4.14",
      "postcss",
      "autoprefixer",
    ],
    projectDir
  );

  /* -------------------------------------------------
   * 1️⃣ tsconfig.json (AUTHORITATIVE)
   * ------------------------------------------------- */
  const tsconfigPath = path.join(projectDir, "tsconfig.json");

  write(
    tsconfigPath,
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

  /* -------------------------------------------------
   * 2️⃣ vite.config.ts (AUTHORITATIVE)
   * ------------------------------------------------- */
  const viteConfigPath = path.join(projectDir, "vite.config.ts");

  write(
    viteConfigPath,
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
   * 3️⃣ Tailwind v3 config files
   * ------------------------------------------------- */
  write(
    path.join(projectDir, "tailwind.config.cjs"),
    `
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [],
};
`.trim()
  );

  write(
    path.join(projectDir, "postcss.config.cjs"),
    `
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
`.trim()
  );

  /* -------------------------------------------------
   * 4️⃣ Tailwind entry CSS (REQUIRED)
   * ------------------------------------------------- */
  const stylesDir = path.join(projectDir, "src/styles");
  const stylesPath = path.join(stylesDir, "index.css");

  if (!fs.existsSync(stylesDir)) {
    fs.mkdirSync(stylesDir, { recursive: true });
  }

  write(
    stylesPath,
    `@tailwind base;
@tailwind components;
@tailwind utilities;`
  );

  /* -------------------------------------------------
   * 5️⃣ Initialize shadcn/ui (SAFE MODE)
   * ------------------------------------------------- */
  console.log("✨ Initializing shadcn/ui...");
  run("npx", ["shadcn@latest", "init", "-y"], projectDir);

  console.log("✅ shadcn/ui setup complete (Tailwind v3 locked).");
}

module.exports = { setupShadcnUI };
