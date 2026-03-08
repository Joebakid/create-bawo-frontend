/* eslint-disable no-console */

const fs = require("fs");
const path = require("path");

const { write, ensure, read, run } = require("../../utils");
const { injectTailwind } = require("../../tailwind/inject");
const { SVELTE_APP } = require("../../templates");

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
Svelte Scaffold
------------------------------------------------- */

async function scaffoldSvelte(projectDir, options) {

  const ext = options.ts ? "ts" : "js";

  console.log("🧡 Creating Svelte project...");

  /* -------------------------------------------------
  Structure
  ------------------------------------------------- */

  ensure(projectDir);
  ensure(projectDir, "src");
  ensure(projectDir, "src/components");
  ensure(projectDir, "src/lib");

  /* -------------------------------------------------
  Dependencies (latest versions like React scaffold)
  ------------------------------------------------- */

  const deps = ["svelte"];

  const dev = [
    "vite",
    "@sveltejs/vite-plugin-svelte"
  ];

  if (options.ts) {
    dev.push("typescript", "@tsconfig/svelte");
  }

  console.log("📦 Installing dependencies...");
  await run("npm", ["install", ...deps], projectDir);

  console.log("🛠 Installing dev dependencies...");
  await run("npm", ["install", "-D", ...dev], projectDir);

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
    build: "vite build",
    preview: "vite preview"
  };

  write(pkgPath, JSON.stringify(pkg, null, 2));

  /* -------------------------------------------------
  Vite config
  ------------------------------------------------- */

  const viteConfigName = options.ts
    ? "vite.config.ts"
    : "vite.config.js";

  write(
    path.join(projectDir, viteConfigName),
`import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import path from "path";

export default defineConfig({
  plugins: [svelte()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src")
    }
  }
});`
  );

  /* -------------------------------------------------
  Tailwind
  ------------------------------------------------- */

  const tailwindMeta = injectTailwind({
    projectDir,
    framework: "svelte",
    version: options.tailwind || "v3",
    ui: options.ui
  });

  if (tailwindMeta?.deps?.length) {
    await run("npm", ["install", "-D", ...tailwindMeta.deps], projectDir);
  }

  /* -------------------------------------------------
  HTML
  ------------------------------------------------- */

  write(
    path.join(projectDir, "index.html"),
`<!doctype html>
<html lang="en">

<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${pkg.name}</title>
</head>

<body>

<div id="app"></div>

<script type="module" src="/src/main.${ext}"></script>

</body>
</html>`
  );

  /* -------------------------------------------------
  Main Entry (Svelte 5 mount API)
  ------------------------------------------------- */

  write(
    path.join(projectDir, `src/main.${ext}`),
`import "./styles/fonts.css";
import "../globals.css";
import App from "./App.svelte";
import { mount } from "svelte";

mount(App, {
  target: document.getElementById("app"),
});`
  );

  /* -------------------------------------------------
  App Template
  ------------------------------------------------- */

  write(
    path.join(projectDir, "src/App.svelte"),
    SVELTE_APP
  );

  /* -------------------------------------------------
  Stats
  ------------------------------------------------- */

console.log(`\n📊 Project size : ${formatSize(dirSize(projectDir))}\n`);
}

module.exports = { scaffoldSvelte };