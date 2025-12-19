/* eslint-disable no-console */
const { path, write, ensure, read, run } = require("../utils");
const { setupShadcn } = require("../setup/shadcn");

/* -------------------------------------------------
 * Helpers
 * ------------------------------------------------- */
function normalizeAnimations(answers) {
  const animations = Array.isArray(answers.animations)
    ? answers.animations
    : [];

  return {
    useFramer: animations.includes("framer") || answers.framer,
    useGsap: animations.includes("gsap") || answers.gsap,
  };
}

/* -------------------------------------------------
 * React Scaffold
 * ------------------------------------------------- */
function scaffoldReact(projectDir, answers) {
  const isTW4 = answers.tailwind === "v4";
  const { useFramer, useGsap } = normalizeAnimations(answers);

  console.log(
    isTW4
      ? "⚡ Using Tailwind CSS v4 (explicit opt-in)"
      : "✅ Using Tailwind CSS v3 (default, stable)"
  );

  /* -------------------------------------------------
   * Dependencies
   * ------------------------------------------------- */
  const deps = ["react", "react-dom"];
  const dev = ["vite", "@vitejs/plugin-react"];

  // Tailwind
  if (isTW4) {
    dev.push("tailwindcss@latest", "@tailwindcss/vite", "postcss");
  } else {
    dev.push("tailwindcss@3.4.14", "postcss", "autoprefixer");
  }

  // TypeScript
  if (answers.ts) {
    dev.push("typescript", "@types/react", "@types/react-dom");
  }

  // State / data
  if (answers.redux || answers.rtkQuery)
    deps.push("@reduxjs/toolkit", "react-redux");
  if (answers.reactQuery) deps.push("@tanstack/react-query");
  if (answers.swr) deps.push("swr");
  if (answers.router) deps.push("react-router-dom");

  // Animations
  if (useFramer) deps.push("framer-motion");
  if (useGsap) deps.push("gsap");

  console.log("📦 Installing dependencies:", deps);
  run("npm", ["install", ...deps], projectDir);

  console.log("🛠 Installing dev dependencies:", dev);
  run("npm", ["install", "-D", ...dev], projectDir);

  /* -------------------------------------------------
   * Vite config
   * ------------------------------------------------- */
  write(
    path.join(projectDir, "vite.config.ts"),
    isTW4
      ? `
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
});
`.trimStart()
      : `
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
});
`.trimStart()
  );

  /* -------------------------------------------------
   * package.json scripts
   * ------------------------------------------------- */
  const pkgPath = path.join(projectDir, "package.json");
  const pkg = JSON.parse(read(pkgPath));

  pkg.scripts = {
    ...(pkg.scripts || {}),
    dev: "vite",
    build: "vite build",
    preview: "vite preview",
  };

  write(pkgPath, JSON.stringify(pkg, null, 2));

  /* -------------------------------------------------
   * index.html
   * ------------------------------------------------- */
  write(
    path.join(projectDir, "index.html"),
    `
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>React + Vite</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.${answers.ts ? "tsx" : "jsx"}"></script>
  </body>
</html>
`.trimStart()
  );

  /* -------------------------------------------------
   * Tailwind
   * ------------------------------------------------- */
  ensure(path.join(projectDir, "src/styles"));

  if (!isTW4) {
    write(
      path.join(projectDir, "tailwind.config.cjs"),
      `module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: { extend: {} },
  plugins: [],
};`
    );

    write(
      path.join(projectDir, "postcss.config.cjs"),
      `module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};`
    );
  }

  write(
    path.join(projectDir, "src/styles/index.css"),
    isTW4
      ? `@import "tailwindcss";`
      : `@tailwind base;
@tailwind components;
@tailwind utilities;`
  );

  /* -------------------------------------------------
   * Animation demos
   * ------------------------------------------------- */
  ensure(path.join(projectDir, "src/components/demo"));

  if (useFramer) {
    write(
      path.join(projectDir, "src/components/demo/FramerDemo.jsx"),
      `
import { motion } from "framer-motion";

export function FramerDemo() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-4 mt-6 bg-black text-white rounded-lg"
    >
      Framer Motion is working 🚀
    </motion.div>
  );
}
`.trimStart()
    );
  }

  if (useGsap) {
    write(
      path.join(projectDir, "src/components/demo/GsapDemo.jsx"),
      `
import { useEffect, useRef } from "react";
import gsap from "gsap";

export function GsapDemo() {
  const box = useRef(null);

  useEffect(() => {
    gsap.fromTo(
      box.current,
      { opacity: 0, x: -40 },
      { opacity: 1, x: 0, duration: 0.6 }
    );
  }, []);

  return (
    <div ref={box} className="p-4 mt-6 bg-green-600 text-white rounded-lg">
      GSAP is working 🎯
    </div>
  );
}
`.trimStart()
    );
  }

  /* -------------------------------------------------
   * main.jsx / tsx
   * ------------------------------------------------- */
  let main = `
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles/index.css";
`;

  if (answers.redux || answers.rtkQuery) {
    main += `
import { Provider } from "react-redux";
import { store } from "./store/store";
`;
  }

  if (answers.reactQuery) {
    main += `
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
const queryClient = new QueryClient();
`;
  }

  main += `
const root = createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
`;

  if (answers.redux || answers.rtkQuery)
    main += `    <Provider store={store}>\n`;
  if (answers.reactQuery)
    main += `      <QueryClientProvider client={queryClient}>\n`;

  main += `        <App />\n`;

  if (answers.reactQuery)
    main += `      </QueryClientProvider>\n`;
  if (answers.redux || answers.rtkQuery)
    main += `    </Provider>\n`;

  main += `  </React.StrictMode>
);
`;

  write(
    path.join(projectDir, "src", `main.${answers.ts ? "tsx" : "jsx"}`),
    main.trimStart()
  );

  /* -------------------------------------------------
   * App.jsx / tsx
   * ------------------------------------------------- */
  let app = `
${useFramer ? 'import { FramerDemo } from "./components/demo/FramerDemo";' : ""}
${useGsap ? 'import { GsapDemo } from "./components/demo/GsapDemo";' : ""}

export default function App() {
  return (
    <main className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold">create-bawo-frontend</h1>
      <p className="mt-2 text-gray-500">
        Tailwind ${isTW4 ? "v4" : "v3"}
      </p>

      ${useFramer ? "<FramerDemo />" : ""}
      ${useGsap ? "<GsapDemo />" : ""}
    </main>
  );
}
`;

  write(
    path.join(projectDir, "src", `App.${answers.ts ? "tsx" : "jsx"}`),
    app.trimStart()
  );

  /* -------------------------------------------------
   * shadcn/ui
   * ------------------------------------------------- */
  if (answers.ui === "shadcn") {
    if (isTW4) {
      console.warn("⚠️ shadcn/ui not supported on Tailwind v4 yet. Skipping.");
    } else {
      setupShadcn(projectDir, { isVite: true });
    }
  }
}

module.exports = { scaffoldReact };
