/* eslint-disable no-console */

const fs = require("fs");
const path = require("path");

const { write, ensure, read } = require("../../utils");

const { setupShadcn } = require("../../setup/shadcn");
const { injectTailwind } = require("../../tailwind/inject");

const { REACT_APP } = require("../../templates/starter");

/* -------------------------------------------------
Helpers
------------------------------------------------- */

function dirSize(dir) {
  let size = 0;

  if (!fs.existsSync(dir)) return 0;

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
Dependency parser
------------------------------------------------- */

function buildDepObject(list) {

  const obj = {};

  for (const dep of list) {

    if (dep.startsWith("@")) {

      const parts = dep.split("@");

      if (parts.length === 3) {
        obj[`@${parts[1]}`] = parts[2];
      } else {
        obj[dep] = "latest";
      }

    } else if (dep.includes("@")) {

      const [name, version] = dep.split("@");
      obj[name] = version;

    } else {

      obj[dep] = "latest";

    }

  }

  return obj;

}

/* -------------------------------------------------
React + Vite Scaffold
------------------------------------------------- */

async function scaffoldReact(projectDir, options) {

  const state = options["state-mgmt"] || "none";
  const ext = options.ts ? "tsx" : "jsx";

  const useFramer = !!options.framer;
  const useGsap = !!options.gsap;

  console.log("⚛️  Creating React + Vite project...");

  /* -------------------------------------------------
  Structure
  ------------------------------------------------- */

  ensure(projectDir);
  ensure(path.join(projectDir, "src"));
  ensure(path.join(projectDir, "src/components"));
  ensure(path.join(projectDir, "src/store"));

  /* -------------------------------------------------
  Dependencies
  ------------------------------------------------- */

  const deps = ["react", "react-dom"];

  const devDeps = [
    "vite",
    options.ts ? "@vitejs/plugin-react-swc" : "@vitejs/plugin-react"
  ];

  if (options.ts) {
    devDeps.push("typescript", "@types/react", "@types/react-dom");
  }

  if (state === "zustand") deps.push("zustand");

  if (state === "redux" || state === "rtk-query") {
    deps.push("@reduxjs/toolkit", "react-redux");
  }

  if (state === "react-query") deps.push("@tanstack/react-query");

  if (state === "swr") deps.push("swr");

  if (useFramer) deps.push("framer-motion");
  if (useGsap) deps.push("gsap");

  /* -------------------------------------------------
  package.json
  ------------------------------------------------- */

  const pkgPath = path.join(projectDir, "package.json");

  const pkg = fs.existsSync(pkgPath)
    ? JSON.parse(read(pkgPath))
    : {};

  pkg.name = pkg.name || path.basename(projectDir);
  pkg.private = true;
  pkg.type = "module";

  pkg.scripts = {
    dev: "vite",
    build: (options.ts ? "tsc && " : "") + "vite build",
    preview: "vite preview"
  };

  pkg.dependencies = {
    ...(pkg.dependencies || {}),
    ...buildDepObject(deps)
  };

  pkg.devDependencies = {
    ...(pkg.devDependencies || {}),
    ...buildDepObject(devDeps)
  };

  write(pkgPath, JSON.stringify(pkg, null, 2));

  /* -------------------------------------------------
  Vite config
  ------------------------------------------------- */

  const viteConfigName = options.ts
    ? "vite.config.ts"
    : "vite.config.js";

  const pluginImport = options.ts
    ? 'import react from "@vitejs/plugin-react-swc";'
    : 'import react from "@vitejs/plugin-react";';

  write(
    path.join(projectDir, viteConfigName),
`
import { defineConfig } from "vite";
${pluginImport}
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src")
    }
  }
});
`.trim()
  );

  /* -------------------------------------------------
  Tailwind
  ------------------------------------------------- */

  const tailwindMeta = injectTailwind({
    projectDir,
    framework: "react",
    version: options.tailwind || "v3",
    ui: options.ui
  });

  if (tailwindMeta?.deps?.length) {

    pkg.devDependencies = {
      ...(pkg.devDependencies || {}),
      ...buildDepObject(tailwindMeta.deps)
    };

    write(pkgPath, JSON.stringify(pkg, null, 2));

  }

  /* -------------------------------------------------
  HTML
  ------------------------------------------------- */

  write(
    path.join(projectDir, "index.html"),
`
<!doctype html>
<html lang="en">

<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${pkg.name}</title>
</head>

<body>

<div id="root"></div>

<script type="module" src="/src/main.${ext}"></script>

</body>

</html>
`.trim()
  );

  /* -------------------------------------------------
  Main Entry
  ------------------------------------------------- */

  write(
    path.join(projectDir, `src/main.${ext}`),
`
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.${ext}";
import "../globals.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
`.trim()
  );

  /* -------------------------------------------------
  App Template
  ------------------------------------------------- */

  let template = REACT_APP;

  if (!options.ts) {
    template = template
      .replace(/: React\\.FC/g, "")
      .replace(/: \\w+/g, "");
  }

  write(
    path.join(projectDir, `src/App.${ext}`),
    template
  );

  /* -------------------------------------------------
  Shadcn UI
  ------------------------------------------------- */

  if (options.ui === "shadcn") {
    console.log("✨ Setting up shadcn/ui...");
    await setupShadcn(projectDir, { isVite: true });
  }

  /* -------------------------------------------------
  Stats
  ------------------------------------------------- */

  console.log(`\n📊 Project size : ${formatSize(dirSize(projectDir))}\n`);

  /* -------------------------------------------------
  Return dependencies to CLI
  ------------------------------------------------- */

  return {
    deps,
    devDeps
  };

}

module.exports = { scaffoldReact };