/* eslint-disable no-console */
const fs = require("fs");
const path = require("path");
const { write, ensure, run: exec } = require("../utils");

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
 * Vue Scaffold
 * ------------------------------------------------- */
async function scaffoldVue(projectDir, answers) {
  const start = Date.now();

  try {
    const hasGsap = answers.animations?.includes("gsap") || answers.gsap;
    const isTs = answers.ts;

    console.log("🟢 Creating Vue 3 + Vite project...");
    console.log("✅ Tailwind CSS v3 (stable)");

    const template = isTs ? "vue-ts" : "vue";

    /* -------------------------------------------------
     * Create project
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
     * Install deps
     * ------------------------------------------------- */
    console.log("📦 Installing base dependencies...");
    await exec("npm", ["install"], projectDir);

    console.log("📦 Installing Vue Router + Pinia...");
    await exec(
      "npm",
      ["install", "vue-router@latest", "pinia@latest"],
      projectDir
    );

    if (hasGsap) {
      console.log("📦 Installing GSAP...");
      await exec("npm", ["install", "gsap@latest"], projectDir);
    }

    console.log("📦 Installing Tailwind CSS stack...");
    await exec(
      "npm",
      [
        "install",
        "-D",
        "tailwindcss@^3",
        "postcss@latest",
        "autoprefixer@latest",
      ],
      projectDir
    );

    /* -------------------------------------------------
     * Tailwind setup
     * ------------------------------------------------- */
    await exec("npx", ["tailwindcss", "init", "-p"], projectDir);

    write(
      path.join(projectDir, "tailwind.config.js"),
      `/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: { extend: {} },
  plugins: [],
};
`
    );

    write(
      path.join(projectDir, "src/style.css"),
      `@tailwind base;
@tailwind components;
@tailwind utilities;
`
    );

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
      `<template>
  <main class="p-8">
    <h1 class="text-3xl font-bold">Vue + Tailwind ready 🚀</h1>
  </main>
</template>`
    );

    /* -------------------------------------------------
     * Pinia store
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
     * GSAP composable
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

createApp(App).use(createPinia()).use(router).mount("#app");
`.trim()
    );

    /* -------------------------------------------------
     * Summary
     * ------------------------------------------------- */
    const elapsed = ((Date.now() - start) / 1000).toFixed(1);
    const size = formatSize(dirSize(projectDir));

    console.log("\n📊 Scaffold Summary");
    console.log("────────────────────────");
    console.log("Framework      : Vue 3 + Vite");
    console.log("Language       :", isTs ? "TypeScript" : "JavaScript");
    console.log("Tailwind       : v3 (stable)");
    console.log("Router         : vue-router");
    console.log("State          : Pinia");
    console.log("Animations     :", hasGsap ? "GSAP" : "None");
    console.log("Project size   :", size);
    console.log("Time taken     :", `${elapsed}s`);
    console.log("────────────────────────\n");
  } catch (err) {
    console.error("❌ Vue scaffold failed:", err);
    process.exit(1);
  }
}

module.exports = { scaffoldVue };
