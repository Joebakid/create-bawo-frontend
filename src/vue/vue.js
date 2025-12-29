/* eslint-disable no-console */
const fs = require("fs");
const path = require("path");
const { write, ensure, run: exec, copyDir } = require("../utils");

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
 * Tailwind Injector (Vue)
 * ------------------------------------------------- */
async function injectTailwindVue(projectDir) {
  console.log("🎨 Injecting Tailwind CSS v3 (Vue)");

  // 1️⃣ Install Tailwind deps (Vue uses v3 only)
  await exec(
    "npm",
    ["install", "-D", "tailwindcss@3.4.14", "postcss", "autoprefixer"],
    projectDir
  );

  // 2️⃣ Copy Tailwind v3 files
  const src = path.join(__dirname, "../tailwind/v3");
  copyDir(src, projectDir);

  /**
   * 🚧 FUTURE: Tailwind v4 for Vue
   *
   * const src = path.join(__dirname, "../tailwind/v4");
   * copyDir(src, projectDir);
   *
   * Vue tooling does not fully support v4 yet.
   * We will enable this when it stabilizes.
   */
}

/* -------------------------------------------------
 * Vue Scaffold
 * ------------------------------------------------- */
async function scaffoldVue(projectDir, answers) {
  const start = Date.now();

  try {
    const isTs = answers.ts;
    const hasGsap = answers.animations?.includes("gsap") || answers.gsap;

    console.log("🟢 Creating Vue 3 + Vite project...");
    console.log("✅ Tailwind CSS v3 (stable)");

    const template = isTs ? "vue-ts" : "vue";

    /* -------------------------------------------------
     * Create Vite project
     * ------------------------------------------------- */
    await exec(
      "npx",
      ["create-vite@latest", answers.name, "--template", template],
      path.dirname(projectDir)
    );

    if (!fs.existsSync(projectDir)) {
      throw new Error("❌ Vite failed to create project directory.");
    }

    /* -------------------------------------------------
     * Install base deps
     * ------------------------------------------------- */
    console.log("📦 Installing base dependencies...");
    await exec("npm", ["install"], projectDir);

    /* -------------------------------------------------
     * Router + Pinia
     * ------------------------------------------------- */
    console.log("📦 Installing vue-router + pinia...");
    await exec(
      "npm",
      ["install", "vue-router@latest", "pinia@latest"],
      projectDir
    );

    /* -------------------------------------------------
     * Optional GSAP
     * ------------------------------------------------- */
    if (hasGsap) {
      console.log("📦 Installing GSAP...");
      await exec("npm", ["install", "gsap@latest"], projectDir);
    }

    /* -------------------------------------------------
     * ✅ Tailwind Injection (SOURCE OF TRUTH)
     * ------------------------------------------------- */
    await injectTailwindVue(projectDir);

    /* -------------------------------------------------
     * Router
     * ------------------------------------------------- */
    ensure(path.join(projectDir, "src/router"));
    write(
      path.join(projectDir, `src/router/index.${isTs ? "ts" : "js"}`),
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
     * Views
     * ------------------------------------------------- */
    ensure(path.join(projectDir, "src/views"));
    write(
      path.join(projectDir, "src/views/Home.vue"),
      `
<template>
  <main class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="text-center space-y-4">
      <h1 class="text-3xl font-bold">create-bawo-frontend</h1>
      <p class="text-gray-500">Vue + Vite starter ready 🚀</p>
      <a
        href="https://create-bawo-frontend.vercel.app"
        class="text-blue-600 underline"
      >
        Documentation →
      </a>
    </div>
  </main>
</template>
`.trim()
    );

    /* -------------------------------------------------
     * Pinia Store
     * ------------------------------------------------- */
    ensure(path.join(projectDir, "src/stores"));
    write(
      path.join(projectDir, `src/stores/counter.${isTs ? "ts" : "js"}`),
      `
import { defineStore } from "pinia";

export const useCounterStore = defineStore("counter", {
  state: () => ({ count: 0 }),
  actions: {
    increment() {
      this.count++;
    },
  },
});
`.trim()
    );

    /* -------------------------------------------------
     * Optional GSAP composable
     * ------------------------------------------------- */
    if (hasGsap) {
      ensure(path.join(projectDir, "src/composables"));
      write(
        path.join(
          projectDir,
          `src/composables/useGsap.${isTs ? "ts" : "js"}`
        ),
        `
import gsap from "gsap";

export function useGsap() {
  const fadeIn = (el${isTs ? ": HTMLElement" : ""}) => {
    gsap.from(el, { opacity: 0, y: 30, duration: 0.6 });
  };
  return { fadeIn };
}
`.trim()
      );
    }

    /* -------------------------------------------------
     * App + main
     * ------------------------------------------------- */
    write(
      path.join(projectDir, "src/App.vue"),
      `<template>
  <RouterView />
</template>`
    );

    write(
      path.join(projectDir, `src/main.${isTs ? "ts" : "js"}`),
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
     * Summary
     * ------------------------------------------------- */
    const elapsed = ((Date.now() - start) / 1000).toFixed(1);
    const size = formatSize(dirSize(projectDir));

    console.log("\n📊 Scaffold Summary");
    console.log("────────────────────────");
    console.log("Framework    : Vue 3 + Vite");
    console.log("Language     :", isTs ? "TypeScript" : "JavaScript");
    console.log("Tailwind     : v3 (stable)");
    console.log("Router       : vue-router");
    console.log("State        : Pinia");
    console.log("Animations   :", hasGsap ? "GSAP" : "None");
    console.log("Project size :", size);
    console.log("Time taken   :", `${elapsed}s`);
    console.log("────────────────────────\n");
  } catch (err) {
    console.error("❌ Vue scaffold failed:", err);
    process.exit(1);
  }
}

module.exports = { scaffoldVue };
