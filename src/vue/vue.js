/* eslint-disable no-console */
const fs = require("fs");
const path = require("path");
const { write, ensure, run: exec } = require("../utils");

async function scaffoldVue({ projectDir, answers }) {
  const isTs = answers.ts;
  const name = answers.name;
  const cwd = path.dirname(projectDir);
  const tmpDir = path.join(cwd, `.__tmp_vue_${Date.now()}`);

  console.log("🟢 Creating Vue project (isolated)");

  // 1️⃣ Create temp project
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

  // 2️⃣ Install deps
  await exec("npm", ["install"], tmpDir);
  await exec("npm", ["install", "vue-router@latest", "pinia@latest"], tmpDir);
  await exec(
    "npm",
    ["install", "-D", "tailwindcss@3.4.14", "postcss", "autoprefixer"],
    tmpDir
  );

  // 3️⃣ Remove Vite UI
  fs.rmSync(path.join(tmpDir, "src/components"), { recursive: true, force: true });
  fs.rmSync(path.join(tmpDir, "src/assets"), { recursive: true, force: true });

  // 4️⃣ Tailwind
  write(
    path.join(tmpDir, "tailwind.config.js"),
    `
export default {
  content: ["./index.html", "./src/**/*.{vue,js,ts}"],
  theme: { extend: {} },
  plugins: [],
};
`.trim()
  );

  write(
    path.join(tmpDir, "postcss.config.js"),
    `
export default {
  plugins: { tailwindcss: {}, autoprefixer: {} },
};
`.trim()
  );

  write(
    path.join(tmpDir, "src/style.css"),
    `@tailwind base;
@tailwind components;
@tailwind utilities;`
  );

  // 5️⃣ Router
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

  // 6️⃣ View
  ensure(path.join(tmpDir, "src/views"));
  write(
    path.join(tmpDir, "src/views/Home.vue"),
    `
<template>
  <main class="min-h-screen flex items-center justify-center bg-slate-100">
    <div class="max-w-xl w-full px-6">
      <div class="bg-white border rounded-2xl p-8 text-center space-y-6">
        <h1 class="text-4xl font-semibold">create-bawo-frontend</h1>
        <p class="text-slate-600">
          A modern frontend scaffolding framework.
        </p>
      </div>
    </div>
  </main>
</template>
`.trim()
  );

  // 7️⃣ App + main
  write(path.join(tmpDir, "src/App.vue"), `<template><RouterView /></template>`);

  write(
    path.join(tmpDir, `src/main.${isTs ? "ts" : "js"}`),
    `
import { createApp } from "vue";
import { createPinia } from "pinia";
import { router } from "./router";
import App from "./App.vue";
import "./style.css";

createApp(App).use(createPinia()).use(router).mount("#app");
`.trim()
  );

  // 8️⃣ FINAL MOVE (Vue owns projectDir)
  fs.rmSync(projectDir, { recursive: true, force: true });
  fs.renameSync(tmpDir, projectDir);

  console.log(`
✅ Vue project created successfully

cd ${name}
npm run dev
`);
}

module.exports = { scaffoldVue };
