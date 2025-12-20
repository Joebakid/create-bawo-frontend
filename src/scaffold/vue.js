/* eslint-disable no-console */
const fs = require("fs");
const { run: exec, write, path } = require("../utils");

async function scaffoldVue(projectDir, answers) {
  try {
    console.log("🟢 Creating Vue 3 + Vite project (manual control)...");

    // 1. Initialize empty project
    await exec("npm", ["init", "-y"], projectDir);

    // 2. Install core Vue deps
    console.log("⏳ Installing Vue core...");
    await exec("npm", ["install", "vue"], projectDir);
    await exec("npm", ["install", "-D", "vite", "@vitejs/plugin-vue"], projectDir);
    if (answers.ts) {
      await exec("npm", ["install", "-D", "typescript", "vue-tsc", "@types/node"], projectDir);
    }
    console.log("✅ Vue core installed.");

    // 3. Install state management + router
    console.log("⏳ Installing Vue Router & Pinia...");
    await exec("npm", ["install", "vue-router", "pinia"], projectDir);
    console.log("✅ Vue Router & Pinia installed.");

    // 4. Install GSAP if requested
    if (answers.gsap) {
      console.log("⏳ Installing GSAP...");
      await exec("npm", ["install", "gsap"], projectDir);
      console.log("✅ GSAP installed.");
    }

    // 5. Install Tailwind
    const tailwindVersion = answers.tailwind === "v4" ? "^4" : "^3";
    console.log(`⏳ Installing Tailwind CSS ${answers.tailwind}...`);
    await exec(
      "npm",
      ["install", "-D", `tailwindcss@${tailwindVersion}`, "postcss", "autoprefixer"],
      projectDir
    );
    console.log(`✅ Tailwind CSS ${answers.tailwind} installed.`);

    // 6. Config files
    write(
      path.join(projectDir, "postcss.config.js"),
      `export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};`
    );

    write(
      path.join(projectDir, "tailwind.config.js"),
      `/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: { extend: {} },
  plugins: [],
};`
    );

    write(
      path.join(projectDir, "src/style.css"),
      `@tailwind base;
@tailwind components;
@tailwind utilities;`
    );

    // 7. Router setup
    const routerDir = path.join(projectDir, "src/router");
    fs.mkdirSync(routerDir, { recursive: true });
    write(
      path.join(routerDir, answers.ts ? "index.ts" : "index.js"),
      `
import { createRouter, createWebHistory } from "vue-router";
import HelloWorld from "../views/HelloWorld.vue";

export const router = createRouter({
  history: createWebHistory(),
  routes: [{ path: "/", component: HelloWorld }],
});
`.trim()
    );

    // 8. Pinia store
    const storeDir = path.join(projectDir, "src/stores");
    fs.mkdirSync(storeDir, { recursive: true });
    write(
      path.join(storeDir, answers.ts ? "counter.ts" : "counter.js"),
      `
import { defineStore } from "pinia";

export const useCounterStore = defineStore("counter", {
  state: () => ({ count: 0 }),
  actions: { increment() { this.count++; } },
});
`.trim()
    );

    // 9. GSAP composable
    if (answers.gsap) {
      const composablesDir = path.join(projectDir, "src/composables");
      fs.mkdirSync(composablesDir, { recursive: true });
      write(
        path.join(composablesDir, answers.ts ? "useGsap.ts" : "useGsap.js"),
        `
import gsap from "gsap";

export function useGsap() {
  const fadeIn = (el${answers.ts ? ": HTMLElement" : ""}) => {
    gsap.from(el, { opacity: 0, y: 30, duration: 0.6 });
  };
  return { fadeIn };
}
`.trim()
      );
    }

    // 10. HelloWorld.vue showing everything
    const viewsDir = path.join(projectDir, "src/views");
    fs.mkdirSync(viewsDir, { recursive: true });
    write(
      path.join(viewsDir, "HelloWorld.vue"),
      `
<script setup${answers.ts ? ' lang="ts"' : ""}>
import { useCounterStore } from "../stores/counter";
${answers.gsap ? 'import { useGsap } from "../composables/useGsap";' : ""}
import { onMounted } from "vue";

const store = useCounterStore();
${answers.gsap ? "const { fadeIn } = useGsap();" : ""}

onMounted(() => {
  ${answers.gsap ? "fadeIn(document.querySelector('h1'));" : ""}
});
</script>

<template>
  <div class="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-8">
    <h1 class="text-4xl font-bold mb-6">Vue + Pinia + Tailwind ${answers.gsap ? "+ GSAP" : ""} 🚀</h1>
    <p class="mb-4">Count: {{ store.count }}</p>
    <button
      class="px-4 py-2 bg-white text-black rounded hover:bg-gray-200 transition"
      @click="store.increment"
    >
      Increment
    </button>
  </div>
</template>
`.trim()
    );

    // 11. App + main
    write(
      path.join(projectDir, "src/App.vue"),
      `<template><RouterView /></template>`
    );

    write(
      path.join(projectDir, answers.ts ? "src/main.ts" : "src/main.js"),
      `
import { createApp } from "vue";
import { createPinia } from "pinia";
import { router } from "./router";
import App from "./App.vue";
import "./style.css";

createApp(App).use(createPinia()).use(router).mount("#app");
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