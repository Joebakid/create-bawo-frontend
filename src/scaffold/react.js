/* eslint-disable no-console */
const { path, write, ensure, read, run } = require("../utils");
const { setupShadcn } = require("../setup/shadcn");

function scaffoldReact(projectDir, answers) {
  const isTW4 = answers.tailwind === "v4";

  console.log(
    isTW4
      ? "⚡ Using Tailwind CSS v4 (explicit opt-in)"
      : "✅ Using Tailwind CSS v3 (default, stable)"
  );

  // --------------------
  // Dependencies
  // --------------------
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

  // State management
  if (answers.redux || answers.rtkQuery) {
    deps.push("@reduxjs/toolkit", "react-redux");
  }

  // Data fetching
  if (answers.reactQuery) deps.push("@tanstack/react-query");
  if (answers.swr) deps.push("swr");

  // Router
  if (answers.router) deps.push("react-router-dom");

  // ✅ Animation libraries (FIXED)
  if (answers.framer) deps.push("framer-motion");
  if (answers.gsap) deps.push("gsap");

  // Install deps
  run("npm", ["install", ...deps], projectDir);
  run("npm", ["install", "-D", ...dev], projectDir);

  // --------------------
  // Vite config
  // --------------------
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

  // --------------------
  // package.json scripts
  // --------------------
  const pkgPath = path.join(projectDir, "package.json");
  const pkg = JSON.parse(read(pkgPath));

  pkg.scripts = {
    ...(pkg.scripts || {}),
    dev: "vite",
    build: "vite build",
    preview: "vite preview",
    lint: 'echo "(add eslint if you want)" && exit 0',
    format: 'echo "(add prettier if you want)" && exit 0',
  };

  write(pkgPath, JSON.stringify(pkg, null, 2));

  // --------------------
  // index.html
  // --------------------
  write(
    path.join(projectDir, "index.html"),
    `
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Vite + React + Tailwind</title>
  </head>
  <body class="min-h-screen bg-white text-gray-900">
    <div id="root"></div>
    <script type="module" src="/src/main.${answers.ts ? "tsx" : "jsx"}"></script>
  </body>
</html>
`.trimStart()
  );

  // --------------------
  // Tailwind setup
  // --------------------
  ensure(path.join(projectDir, "src", "styles"));

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

  // --------------------
  // main.jsx / tsx
  // --------------------
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

  if (answers.context) {
    main += `
import { ThemeProvider } from "./components/demo/ContextDemo";
`;
  }

  main += `
const root = createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
`;

  if (answers.redux || answers.rtkQuery) main += `    <Provider store={store}>\n`;
  if (answers.reactQuery) main += `      <QueryClientProvider client={queryClient}>\n`;
  if (answers.context) main += `        <ThemeProvider>\n`;

  main += `          <App />\n`;

  if (answers.context) main += `        </ThemeProvider>\n`;
  if (answers.reactQuery) main += `      </QueryClientProvider>\n`;
  if (answers.redux || answers.rtkQuery) main += `    </Provider>\n`;

  main += `  </React.StrictMode>
);
`;

  write(path.join(projectDir, "src", `main.${answers.ts ? "tsx" : "jsx"}`), main.trimStart());

  // --------------------
  // App.jsx / tsx
  // --------------------
  write(
    path.join(projectDir, "src", `App.${answers.ts ? "tsx" : "jsx"}`),
    `
export default function App() {
  return (
    <main className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold">
        Hello 👋 React + Vite + Tailwind (${answers.ts ? "TS" : "JS"})
      </h1>
      <p className="mt-3 text-gray-600">
        Tailwind version: ${isTW4 ? "v4" : "v3"}
      </p>
    </main>
  );
}
`.trimStart()
  );

  // --------------------
  // shadcn/ui guard
  // --------------------
  if (answers.ui === "shadcn") {
    if (isTW4) {
      console.warn("⚠️ shadcn/ui is not compatible with Tailwind v4 yet. Skipping.");
    } else {
      setupShadcn(projectDir, { isVite: true });
    }
  }
}

module.exports = { scaffoldReact };
