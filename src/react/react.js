/* eslint-disable no-console */
const fs = require("fs");
const path = require("path");
const { write, ensure, read, run } = require("../utils");

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
 * React Scaffold
 * ------------------------------------------------- */
async function scaffoldReact(projectDir, options) {
  const start = Date.now();

  const isTW4 = options.tailwind === "v4";
  const state = options["state-mgmt"] || "none";
  const ext = options.ts ? "tsx" : "jsx";

  const useFramer = !!options.framer;
  const useGsap = !!options.gsap;

  console.log(
    isTW4
      ? "⚡ Tailwind CSS v4 (experimental)"
      : "✅ Tailwind CSS v3 (stable)"
  );

  /* -------------------------------------------------
   * Base structure
   * ------------------------------------------------- */
  ensure(projectDir, "src");
  ensure(projectDir, "src/styles");
  ensure(projectDir, "src/components/demo");
  ensure(projectDir, "src/store");

  /* -------------------------------------------------
   * Dependencies
   * ------------------------------------------------- */
  const deps = ["react", "react-dom"];
  const dev = ["vite", "@vitejs/plugin-react"];

  if (isTW4) {
    dev.push("tailwindcss", "@tailwindcss/vite", "postcss");
  } else {
    dev.push("tailwindcss@3.4.14", "postcss", "autoprefixer");
  }

  if (options.ts) {
    dev.push("typescript", "@types/react", "@types/react-dom");
  }

  // ---- state management ----
  if (state === "zustand") deps.push("zustand");

  if (state === "redux" || state === "rtk-query") {
    deps.push("@reduxjs/toolkit", "react-redux");
  }

  if (state === "react-query") {
    deps.push("@tanstack/react-query");
  }

  if (state === "swr") {
    deps.push("swr");
  }

  // ---- animations ----
  if (useFramer) deps.push("framer-motion");
  if (useGsap) deps.push("gsap");

  console.log("📦 Installing dependencies...");
  run("npm", ["install", ...deps], projectDir);

  console.log("🛠 Installing dev dependencies...");
  run("npm", ["install", "-D", ...dev], projectDir);

  /* -------------------------------------------------
   * package.json (SAFE MERGE)
   * ------------------------------------------------- */
  const pkgPath = path.join(projectDir, "package.json");
  const pkg = fs.existsSync(pkgPath)
    ? JSON.parse(read(pkgPath))
    : {};

  pkg.name = pkg.name || path.basename(projectDir);
  pkg.private = true;
  pkg.scripts = {
    ...(pkg.scripts || {}),
    dev: "vite",
    build: "vite build",
    preview: "vite preview",
  };

  write(pkgPath, JSON.stringify(pkg, null, 2));

  /* -------------------------------------------------
   * Vite config
   * ------------------------------------------------- */
  write(
    path.join(projectDir, "vite.config.ts"),
    `
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
${isTW4 ? 'import tailwindcss from "@tailwindcss/vite";' : ""}

export default defineConfig({
  plugins: [react()${isTW4 ? ", tailwindcss()" : ""}],
});
`.trim()
  );

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
    <script type="module" src="/src/main.${ext}"></script>
  </body>
</html>
`.trim()
  );

  /* -------------------------------------------------
   * Tailwind
   * ------------------------------------------------- */
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
  plugins: { tailwindcss: {}, autoprefixer: {} },
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
   * State management files
   * ------------------------------------------------- */
  if (state === "zustand") {
    write(
      path.join(projectDir, `src/store/useStore.${ext}`),
      `
import { create } from "zustand";

export const useStore = create((set) => ({
  count: 0,
  inc: () => set((s) => ({ count: s.count + 1 })),
}));
`.trim()
    );
  }

  if (state === "redux" || state === "rtk-query") {
    write(
      path.join(projectDir, `src/store/store.${ext}`),
      `
import { configureStore } from "@reduxjs/toolkit";
import counter from "./counterSlice";

export const store = configureStore({
  reducer: { counter },
});
`.trim()
    );

    write(
      path.join(projectDir, `src/store/counterSlice.${ext}`),
      `
import { createSlice } from "@reduxjs/toolkit";

const slice = createSlice({
  name: "counter",
  initialState: { value: 0 },
  reducers: {
    inc: (state) => { state.value++; },
  },
});

export const { inc } = slice.actions;
export default slice.reducer;
`.trim()
    );
  }

  if (state === "react-query") {
    write(
      path.join(projectDir, `src/store/queryClient.${ext}`),
      `
import { QueryClient } from "@tanstack/react-query";
export const queryClient = new QueryClient();
`.trim()
    );
  }

  if (state === "context") {
    write(
      path.join(projectDir, `src/store/context.${ext}`),
      `
import { createContext, useContext, useState } from "react";

const Ctx = createContext(null);

export const Provider = ({ children }) => {
  const [count, setCount] = useState(0);
  return (
    <Ctx.Provider value={{ count, setCount }}>
      {children}
    </Ctx.Provider>
  );
};

export const useCtx = () => useContext(Ctx);
`.trim()
    );
  }

  /* -------------------------------------------------
   * App + entry
   * ------------------------------------------------- */
  write(
    path.join(projectDir, `src/App.${ext}`),
    `
export default function App() {
  return (
    <main className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold">create-bawo-frontend</h1>
      <p className="text-gray-500">React + Vite ready 🚀</p>
    </main>
  );
}
`.trim()
  );

  write(
    path.join(projectDir, `src/main.${ext}`),
    `
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles/index.css";
${state === "redux" ? 'import { Provider } from "react-redux"; import { store } from "./store/store";' : ""}
${state === "react-query" ? 'import { QueryClientProvider } from "@tanstack/react-query"; import { queryClient } from "./store/queryClient";' : ""}
${state === "context" ? 'import { Provider } from "./store/context";' : ""}

const Root = (
  ${state === "redux"
    ? "<Provider store={store}><App /></Provider>"
    : state === "react-query"
    ? "<QueryClientProvider client={queryClient}><App /></QueryClientProvider>"
    : state === "context"
    ? "<Provider><App /></Provider>"
    : "<App />"}
);

createRoot(document.getElementById("root")).render(
  <React.StrictMode>{Root}</React.StrictMode>
);
`.trim()
  );

  /* -------------------------------------------------
   * Summary
   * ------------------------------------------------- */
  console.log("\n📊 Scaffold Summary");
  console.log("────────────────────────");
  console.log("Framework      : React + Vite");
  console.log("State Mgmt     :", state);
  console.log("Animations     :", useFramer || useGsap ? "Enabled" : "None");
  console.log("Project size   :", formatSize(dirSize(projectDir)));
  console.log("────────────────────────\n");
}

module.exports = { scaffoldReact };
