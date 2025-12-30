/* eslint-disable no-console */
const fs = require("fs");
const path = require("path");
const { write, ensure, run: exec } = require("../utils");

async function scaffoldVue(projectDir, answers) {
  const isTs = answers.ts;
  const name = answers.name;
  const cwd = path.dirname(projectDir);
  const tmpDir = path.join(cwd, `.__tmp_vue_${Date.now()}`);

  console.log("🟢 Creating Vue project in temp directory");

  /* -------------------------------------------------
   * 1️⃣ Create Vite project (NON-INTERACTIVE)
   * ------------------------------------------------- */
  await exec(
    "npx",
    [
      "create-vite@latest",
      path.basename(tmpDir),
      "--template",
      isTs ? "vue-ts" : "vue",
      "--force",
    ],
    cwd
  );

  /* -------------------------------------------------
   * 2️⃣ Install dependencies
   * ------------------------------------------------- */
  await exec("npm", ["install"], tmpDir);
  await exec("npm", ["install", "vue-router@latest", "pinia@latest"], tmpDir);
  await exec(
    "npm",
    ["install", "-D", "tailwindcss@3.4.14", "postcss", "autoprefixer"],
    tmpDir
  );

  /* -------------------------------------------------
   * 3️⃣ Nuke default Vite UI
   * ------------------------------------------------- */
  fs.rmSync(path.join(tmpDir, "src/components"), { recursive: true, force: true });
  fs.rmSync(path.join(tmpDir, "src/assets"), { recursive: true, force: true });

  /* -------------------------------------------------
   * 4️⃣ Tailwind core files
   * ------------------------------------------------- */

  // tailwind.config.js
  write(
    path.join(tmpDir, "tailwind.config.js"),
    `
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
`.trim()
  );

  // postcss.config.js
  write(
    path.join(tmpDir, "postcss.config.js"),
    `
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
`.trim()
  );

  // Tailwind entry CSS
  write(
    path.join(tmpDir, "src/style.css"),
    `
@tailwind base;
@tailwind components;
@tailwind utilities;
`.trim()
  );

  /* -------------------------------------------------
   * 5️⃣ Router
   * ------------------------------------------------- */
  ensure(path.join(tmpDir, "src/router"));
  write(
    path.join(tmpDir, `src/router/index.${isTs ? "ts" : "js"}`),
    `
import { createRouter, createWebHistory } from "vue-router";
import Home from "../views/Home.vue";

export const router = createRouter({
  history: createWebHistory(),
  routes: [{ path: "/", component: Home }],
});
`.trim()
  );

  /* -------------------------------------------------
   * 6️⃣ View (YOUR TEMPLATE)
   * ------------------------------------------------- */
  ensure(path.join(tmpDir, "src/views"));
  write(
    path.join(tmpDir, "src/views/Home.vue"),
    `
<template>
  <main class="min-h-screen flex items-center justify-center bg-slate-100">
    <div class="max-w-xl w-full px-6">
      <div class="bg-white border border-slate-200 rounded-2xl p-8 text-center space-y-6">
        <h1 class="text-4xl font-semibold tracking-tight text-slate-900">
          create-bawo-frontend
        </h1>

        <p class="text-slate-600 text-lg">
          A modern frontend scaffolding framework for React, Next.js, and Vue.
        </p>

        <div class="flex justify-center gap-3">
          <a
            href="https://create-bawo-frontend.vercel.app/docs"
            target="_blank"
            class="rounded-md bg-slate-900 px-5 py-3 text-sm text-white hover:bg-slate-800"
          >
            View Documentation →
          </a>
        </div>
      </div>
    </div>
  </main>
</template>
`.trim()
  );

  /* -------------------------------------------------
   * 7️⃣ App + main
   * ------------------------------------------------- */
  write(
    path.join(tmpDir, "src/App.vue"),
    `<template><RouterView /></template>`
  );

  write(
    path.join(tmpDir, `src/main.${isTs ? "ts" : "js"}`),
    `
import { createApp } from "vue";
import { createPinia } from "pinia";
import { router } from "./router";
import App from "./App.vue";
import "./style.css";

createApp(App)
  .use(createPinia())
  .use(router)
  .mount("#app");
`.trim()
  );

  /* -------------------------------------------------
   * 8️⃣ Move temp → final
   * ------------------------------------------------- */
  if (fs.existsSync(projectDir)) {
    fs.rmSync(projectDir, { recursive: true, force: true });
  }

  fs.renameSync(tmpDir, projectDir);

  console.log(`
✅ Vue project ready

Next steps:
  cd ${name}
  npm run dev
`);
}

module.exports = { scaffoldVue };
