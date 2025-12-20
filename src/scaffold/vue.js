/* eslint-disable no-console */
const fs = require("fs");
const { run: exec, write, path } = require("../utils");

async function scaffoldVue(projectDir, answers) {
  try {
    console.log("🟢 Creating Vue 3 + Vite project...");

    /* ---------------- CREATE APP ---------------- */
    const viteArgs = ["create", "vite@latest", answers.name];
    if (answers.ts) {
      viteArgs.push("--", "--template", "vue-ts");
    } else {
      viteArgs.push("--", "--template", "vue");
    }

    console.log("⏳ Running Vite project creation...");
    await exec("npm", viteArgs, path.dirname(projectDir));
    console.log("✅ Vite project created.");

    console.log("⏳ Installing base dependencies...");
    await exec("npm", ["install"], projectDir);
    console.log("✅ Base dependencies installed.");

    /* ---------------- CORE LIBS ---------------- */
    console.log("⏳ Installing Vue Router & Pinia...");
    await exec("npm", ["install", "vue-router", "pinia"], projectDir);
    console.log("✅ Vue Router & Pinia installed.");

    if (answers.gsap) {
      console.log("⏳ Installing GSAP...");
      await exec("npm", ["install", "gsap"], projectDir);
      console.log("✅ GSAP installed.");
    }

    /* ---------------- TAILWIND ---------------- */
    if (answers.tailwind === "v4") {
      console.log("⏳ Installing Tailwind CSS v4...");
      await exec(
        "npm",
        ["install", "-D", "tailwindcss@^4", "postcss", "autoprefixer"],
        projectDir
      );
      console.log("✅ Tailwind CSS v4 installed.");
    } else {
      console.log("⏳ Installing Tailwind CSS v3...");
      await exec(
        "npm",
        ["install", "-D", "tailwindcss@^3", "postcss", "autoprefixer"],
        projectDir
      );
      console.log("✅ Tailwind CSS v3 installed.");
    }

    // Remove default style if exists
    const defaultStylePath = path.join(projectDir, "src/style.css");
    if (fs.existsSync(defaultStylePath)) fs.unlinkSync(defaultStylePath);

    // PostCSS config
    write(
      path.join(projectDir, "postcss.config.js"),
      `export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};`
    );

    // Tailwind config
    write(
      path.join(projectDir, "tailwind.config.js"),
      `/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [],
};`
    );

    // Tailwind base styles
    write(
      path.join(projectDir, "src/style.css"),
      `@tailwind base;
@tailwind components;
@tailwind utilities;`
    );

    /* ---------------- ROUTER ---------------- */
    const routerDir = path.join(projectDir, "src/router");
    fs.mkdirSync(routerDir, { recursive: true });
    write(
      path.join(routerDir, answers.ts ? "index.ts" : "index.js"),
      `
import { createRouter, createWebHistory } from "vue-router";
import Home from "../views/Home.vue";

export const router = createRouter({
  history: createWebHistory(),
  routes: [{ path: "/", component: Home }],
});
`.trim()
    );

    /* ---------------- PINIA STORE ---------------- */
    const storeDir = path.join(projectDir, "src/stores");
    fs.mkdirSync(storeDir, { recursive: true });
    write(
      path.join(storeDir, answers.ts ? "counter.ts" : "counter.js"),
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

    /* ---------------- GSAP COMPOSABLE ---------------- */
    if (answers.gsap) {
      const composablesDir = path.join(projectDir, "src/composables");
      fs.mkdirSync(composablesDir, { recursive: true });

      write(
        path.join(composablesDir, answers.ts ? "useGsap.ts" : "useGsap.js"),
        answers.ts
          ? `
import gsap from "gsap";

export function useGsap() {
  const fadeIn = (el: HTMLElement) => {
    gsap.from(el, { opacity: 0, y: 30, duration: 0.6 });
  };

  return { fadeIn };
}
`.trim()
          : `
import gsap from "gsap";

export function useGsap() {
  const fadeIn = (el) => {
    gsap.from(el, { opacity: 0, y: 30, duration: 0.6 });
  };

  return { fadeIn };
}
`.trim()
      );
    }

    /* ---------------- VIEW ---------------- */
    const viewsDir = path.join(projectDir, "src/views");
    fs.mkdirSync(viewsDir, { recursive: true });

    write(
      path.join(viewsDir, "Home.vue"),
      `
<script setup${answers.ts ? ' lang="ts"' : ""}>
import { useCounterStore } from "../stores/counter";
${answers.gsap ? 'import { useGsap } from "../composables/useGsap";' : ""}
import { onMounted } from "vue";

const store = useCounterStore();
${answers.gsap ? "const { fadeIn } = useGsap();" : ""}

onMounted(() => {
  ${answers.gsap ? "fadeIn(document.body);" : ""}
});
</script>

<template>
  <div class="min-h-screen flex flex-col items-center justify-center bg-black text-white">
    <h1 class="text-4xl font-bold mb-4">
      Vue + Tailwind + Pinia 🚀
    </h1>

    <p class="mb-4">Count: {{ store.count }}</p>

    <button
      class="px-4 py-2 bg-white text-black rounded"
      @click="store.increment"
    >
      Increment
    </button>
  </div>
</template>
`.trim()
    );

    /* ---------------- APP + MAIN ---------------- */
    write(
      path.join(projectDir, "src/App.vue"),
      `<template>
  <RouterView />
</template>`
    );

    write(
      path.join(projectDir, answers.ts ? "src/main.ts" : "src/main.js"),
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

    console.log(
      "✅ Vue + Tailwind " +
        (answers.tailwind === "v4" ? "v4" : "v3") +
        " + Router + Pinia" +
        (answers.gsap ? " + GSAP" : "") +
        " ready!"
    );
  } catch (error) {
    console.error("❌ Scaffold failed:", error);
    process.exit(1);
  }
}

module.exports = { scaffoldVue };