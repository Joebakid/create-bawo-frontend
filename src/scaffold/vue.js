// scaffoldVue.js

/**
 * scaffoldVue
 * Programmatically scaffolds a Vue 3 + Vite project with optional TypeScript, Tailwind CSS (v3 or v4), Pinia, Vue Router, and GSAP.
 * Uses npm (not degit), ensures reliable folder creation, dependency installation, and file structure generation.
 * The generated HelloWorld.vue demonstrates all installed features.
 *
 * @param {Object} options
 * @param {string} options.projectName - Name of the project directory to create.
 * @param {boolean} [options.useTypeScript=false] - Whether to use TypeScript.
 * @param {boolean} [options.useTailwind=false] - Whether to include Tailwind CSS.
 * @param {'v3'|'v4'} [options.tailwindVersion='v4'] - Tailwind CSS version.
 * @param {boolean} [options.usePinia=false] - Whether to include Pinia.
 * @param {boolean} [options.useRouter=false] - Whether to include Vue Router.
 * @param {boolean} [options.useGSAP=false] - Whether to include GSAP.
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function scaffoldVue({
  projectName,
  useTypeScript = false,
  useTailwind = false,
  tailwindVersion = 'v4',
  usePinia = false,
  useRouter = false,
  useGSAP = false,
}) {
  // --- Section 1: Directory Creation and Cleanup ---
  const projectPath = path.resolve(process.cwd(), projectName);
  if (fs.existsSync(projectPath)) {
    throw new Error(`Directory "${projectName}" already exists. Please choose a different name or remove the existing directory.`);
  }
  try {
    fs.mkdirSync(projectPath, { recursive: true });
    console.log(`Created project directory: ${projectPath}`);

    // --- Section 2: Scaffold Base Project with npm create vue@latest ---
    const template = useTypeScript ? 'vue-ts' : 'vue';
    execSync(
      `npm create vite@latest "${projectName}" -- --template ${template} --no-git --no-install --no-interactive`,
      { stdio: 'inherit' }
    );

    // --- Section 3: Install Core Dependencies ---
    process.chdir(projectPath);
    console.log('Installing core dependencies...');
    execSync('npm install', { stdio: 'inherit' });

    // --- Section 4: Install Optional Features ---
    // Prepare dependency lists
    const runtimeDeps = [];
    const devDeps = [];
    if (useRouter) runtimeDeps.push('vue-router@^4.2.5');
    if (usePinia) runtimeDeps.push('pinia@^2.1.6');
    if (useGSAP) runtimeDeps.push('gsap@^3.12.5');
    if (useTailwind) {
      if (tailwindVersion === 'v4') {
        devDeps.push('tailwindcss@^4.0.0', '@tailwindcss/vite@^1.0.0');
      } else {
        devDeps.push('tailwindcss@^3.3.5', 'postcss@^8.4.30', 'autoprefixer@^10.4.14');
      }
    }

    if (runtimeDeps.length > 0) {
      console.log(`Installing runtime dependencies: ${runtimeDeps.join(', ')}`);
      execSync(`npm install ${runtimeDeps.join(' ')}`, { stdio: 'inherit' });
    }
    if (devDeps.length > 0) {
      console.log(`Installing dev dependencies: ${devDeps.join(', ')}`);
      execSync(`npm install -D ${devDeps.join(' ')}`, { stdio: 'inherit' });
    }

    // --- Section 5: Tailwind CSS Setup ---
    if (useTailwind) {
      if (tailwindVersion === 'v4') {
        // Create src/assets/main.css with Tailwind import
        const assetsDir = path.join('src', 'assets');
        if (!fs.existsSync(assetsDir)) fs.mkdirSync(assetsDir, { recursive: true });
        fs.writeFileSync(
          path.join(assetsDir, 'main.css'),
          '@import "tailwindcss";\n'
        );
        // Update vite.config.js to include Tailwind plugin
        const viteConfigPath = fs.existsSync('vite.config.ts') ? 'vite.config.ts' : 'vite.config.js';
        let viteConfig = fs.readFileSync(viteConfigPath, 'utf-8');
        if (!viteConfig.includes('@tailwindcss/vite')) {
          viteConfig =
            `import tailwindcss from '@tailwindcss/vite';\n` +
            viteConfig.replace(
              /(plugins:\s*\[)([^\]]*)\]/,
              (match, p1, p2) => `${p1}${p2 ? p2 + ',' : ''} tailwindcss()]`
            );
          fs.writeFileSync(viteConfigPath, viteConfig);
        }
      } else {
        // Tailwind v3: init config files and update content globs
        execSync('npx tailwindcss init -p', { stdio: 'inherit' });
        // Update tailwind.config.js content array
        const tailwindConfigPath = fs.existsSync('tailwind.config.cjs')
          ? 'tailwind.config.cjs'
          : 'tailwind.config.js';
        let tailwindConfig = fs.readFileSync(tailwindConfigPath, 'utf-8');
        tailwindConfig = tailwindConfig.replace(
          /content:\s*\[.*?\]/s,
          `content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"]`
        );
        fs.writeFileSync(tailwindConfigPath, tailwindConfig);
        // Create src/assets/main.css with Tailwind directives
        const assetsDir = path.join('src', 'assets');
        if (!fs.existsSync(assetsDir)) fs.mkdirSync(assetsDir, { recursive: true });
        fs.writeFileSync(
          path.join(assetsDir, 'main.css'),
          '@tailwind base;\n@tailwind components;\n@tailwind utilities;\n'
        );
      }
    }

    // --- Section 6: Generate Pinia Store ---
    if (usePinia) {
      const storesDir = path.join('src', 'stores');
      if (!fs.existsSync(storesDir)) fs.mkdirSync(storesDir, { recursive: true });
      const counterStorePath = path.join(storesDir, `counter.${useTypeScript ? 'ts' : 'js'}`);
      fs.writeFileSync(
        counterStorePath,
        useTypeScript
          ? `import { defineStore } from 'pinia'

export const useCounterStore = defineStore('counter', {
  state: () => ({ count: 0 }),
  actions: {
    increment() { this.count++ }
  }
})
`
          : `import { defineStore } from 'pinia'

export const useCounterStore = defineStore('counter', {
  state: () => ({ count: 0 }),
  actions: {
    increment() { this.count++ }
  }
})
`
      );
    }

    // --- Section 7: Generate Router ---
    if (useRouter) {
      const routerPath = path.join('src', `router.${useTypeScript ? 'ts' : 'js'}`);
      fs.writeFileSync(
        routerPath,
        useTypeScript
          ? `import { createRouter, createWebHistory } from 'vue-router'
import Home from './views/Home.vue'
import About from './views/About.vue'

const routes = [
  { path: '/', component: Home },
  { path: '/about', component: About }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
`
          : `import { createRouter, createWebHistory } from 'vue-router'
import Home from './views/Home.vue'
import About from './views/About.vue'

const routes = [
  { path: '/', component: Home },
  { path: '/about', component: About }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
`
      );
      // Create minimal Home.vue and About.vue
      const viewsDir = path.join('src', 'views');
      if (!fs.existsSync(viewsDir)) fs.mkdirSync(viewsDir, { recursive: true });
      fs.writeFileSync(
        path.join(viewsDir, 'Home.vue'),
        `<template><div class="text-2xl font-bold">Home Page</div></template>`
      );
      fs.writeFileSync(
        path.join(viewsDir, 'About.vue'),
        `<template><div class="text-2xl font-bold">About Page</div></template>`
      );
    }

    // --- Section 8: Update main.js/ts for Pinia, Router, and Tailwind ---
    const mainPath = path.join('src', `main.${useTypeScript ? 'ts' : 'js'}`);
    let mainContent = fs.readFileSync(mainPath, 'utf-8');
    // Import main.css
    if (useTailwind && !mainContent.includes("import './assets/main.css'")) {
      mainContent = `import './assets/main.css'\n` + mainContent;
    }
    // Import and use Pinia
    if (usePinia && !mainContent.includes('createPinia')) {
      mainContent = mainContent.replace(
        /(import\s+{[^}]*createApp[^}]*}\s+from\s+['"]vue['"];?)/,
        `$1\nimport { createPinia } from 'pinia';`
      );
      mainContent = mainContent.replace(
        /(const\s+app\s*=\s*createApp\(App\);?)/,
        `$1\napp.use(createPinia());`
      );
    }
    // Import and use Router
    if (useRouter && !mainContent.includes('router')) {
      mainContent = mainContent.replace(
        /(import\s+App\s+from\s+['"].\/App.vue['"];?)/,
        `$1\nimport router from './router';`
      );
      mainContent = mainContent.replace(
        /(const\s+app\s*=\s*createApp\(App\);?)/,
        `$1\napp.use(router);`
      );
    }
    fs.writeFileSync(mainPath, mainContent);

    // --- Section 9: Generate HelloWorld.vue Demonstrating Features ---
    const helloWorldPath = path.join('src', 'components', 'HelloWorld.vue');
    let helloWorldContent = `<template>
  <div class="p-8 bg-gradient-to-br from-blue-100 to-purple-100 min-h-screen flex flex-col items-center">
    <h1 ref="animatedTitle" class="text-4xl font-bold text-blue-700 mb-4">Hello, Vue + Vite${useTailwind ? ' + Tailwind' : ''}${usePinia ? ' + Pinia' : ''}${useRouter ? ' + Router' : ''}${useGSAP ? ' + GSAP' : ''}!</h1>
    ${usePinia ? `<p class="mb-4 text-lg">Pinia count: <span class="font-mono text-green-600">{{ counter.count }}</span></p>
    <button @click="counter.increment()" class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition">Increment Pinia</button>` : ''}
    ${useRouter ? `<div class="mt-6">
      <RouterLink to="/" class="text-blue-700 underline mr-4">Home</RouterLink>
      <RouterLink to="/about" class="text-purple-700 underline">About</RouterLink>
    </div>` : ''}
  </div>
</template>

<script setup${useTypeScript ? ' lang="ts"' : ''}>
import { ref, onMounted } from 'vue'
${usePinia ? `import { useCounterStore } from '../stores/counter'` : ''}
${useGSAP ? `import gsap from 'gsap'` : ''}
${useRouter ? `import { RouterLink } from 'vue-router'` : ''}

${usePinia ? 'const counter = useCounterStore()' : ''}
const animatedTitle = ref(null)

onMounted(() => {
  if (animatedTitle.value) {
    ${useGSAP ? `gsap.fromTo(animatedTitle.value, { y: -50, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: 'bounce.out' })` : ''}
  }
})
</script>
`;
    fs.writeFileSync(helloWorldPath, helloWorldContent);

    // --- Section 10: Update App.vue to Use HelloWorld.vue ---
    const appVuePath = path.join('src', 'App.vue');
    let appVueContent = `<template>
  <HelloWorld />
</template>

<script setup${useTypeScript ? ' lang="ts"' : ''}>
import HelloWorld from './components/HelloWorld.vue'
</script>
`;
    fs.writeFileSync(appVuePath, appVueContent);

    // --- Section 11: Final Output ---
    console.log('\n✅ Project scaffolded successfully!');
    console.log(`\nNext steps:
  cd ${projectName}
  npm run dev
`);
  } catch (err) {
    // Cleanup on failure
    if (fs.existsSync(projectPath)) {
      fs.rmSync(projectPath, { recursive: true, force: true });
    }
    throw err;
  }
}

module.exports = { scaffoldVue };