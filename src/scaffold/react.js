/* eslint-disable no-console */
const { path, write, ensure, read, run } = require("../utils");
const T = require("../templates");
const { setupShadcn } = require("../setup/shadcn");

function scaffoldReact(projectDir, answers) {
  const deps = ["react", "react-dom"];
  const dev = ["vite", "@vitejs/plugin-react", "tailwindcss@3.4.14", "postcss", "autoprefixer"];
  if (answers.ts) dev.push("typescript", "@types/react", "@types/react-dom");
  if (answers.redux || answers.rtkQuery) deps.push("@reduxjs/toolkit", "react-redux");
  if (answers.reactQuery) deps.push("@tanstack/react-query");
  if (answers.swr) deps.push("swr");
  if (answers.router) deps.push("react-router-dom");

  run("npm", ["i", ...deps], projectDir);
  run("npm", ["i", "-D", ...dev], projectDir);

  write(path.join(projectDir, "vite.config.ts"), `
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({ plugins: [react()] });
`.trimStart());

  const pkgPath = path.join(projectDir, "package.json");
  const pkg = JSON.parse(read(pkgPath));
  pkg.scripts = { ...(pkg.scripts || {}), dev: "vite", build: "vite build", preview: "vite preview", lint: 'echo "(add eslint if you want)" && exit 0', format: 'echo "(add prettier if you want)" && exit 0' };
  write(pkgPath, JSON.stringify(pkg, null, 2));

  write(path.join(projectDir, "index.html"), `
<!doctype html>
<html lang="en">
  <head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /><title>Vite + React + Tailwind</title></head>
  <body class="min-h-screen bg-white text-gray-900"><div id="root"></div><script type="module" src="/src/main.${answers.ts ? "tsx" : "jsx"}"></script></body>
</html>
`.trimStart());

  // Tailwind
  write(path.join(projectDir, "tailwind.config.cjs"), `module.exports = { content: ["./index.html","./src/**/*.{js,ts,jsx,tsx}"], theme: { extend: {} }, plugins: [] };`);
  write(path.join(projectDir, "postcss.config.cjs"), `module.exports = { plugins: { tailwindcss: {}, autoprefixer: {} } };`);
  write(path.join(projectDir, "src/styles/index.css"), `@tailwind base;\n@tailwind components;\n@tailwind utilities;`);

  // main.jsx(x)
  let main = `
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles/index.css";
`;
  if (answers.redux || answers.rtkQuery) main += `import { Provider } from "react-redux";\nimport { store } from "./store/store";\n`;
  if (answers.reactQuery) main += `import { QueryClient, QueryClientProvider } from "@tanstack/react-query";\nconst queryClient = new QueryClient();\n`;
  if (answers.context) main += `import { ThemeProvider } from "./components/demo/ContextDemo";\n`;
  main += `
const root = createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>`;
  if (answers.redux || answers.rtkQuery) main += `\n    <Provider store={store}>`;
  if (answers.reactQuery) main += `\n      <QueryClientProvider client={queryClient}>`;
  if (answers.context) main += `\n        <ThemeProvider>`;
  main += `\n          <App />`;
  if (answers.context) main += `\n        </ThemeProvider>`;
  if (answers.reactQuery) main += `\n      </QueryClientProvider>`;
  if (answers.redux || answers.rtkQuery) main += `\n    </Provider>`;
  main += `\n  </React.StrictMode>\n);`;
  write(path.join(projectDir, "src", `main.${answers.ts ? "tsx" : "jsx"}`), main.trimStart());

  // App.jsx(x)
  let appImports = `${answers.ts ? "import type {} from 'react';" : ""}`;
  const demos = [];
  if (answers.redux) { appImports += `\nimport ReduxDemo from "./components/demo/ReduxDemo";`; demos.push("<ReduxDemo />"); }
  if (answers.rtkQuery) { appImports += `\nimport RTKQueryDemo from "./components/demo/RTKQueryDemo";`; demos.push("<RTKQueryDemo />"); }
  if (answers.reactQuery) { appImports += `\nimport ReactQueryDemo from "./components/demo/ReactQueryDemo";`; demos.push("<ReactQueryDemo />"); }
  if (answers.swr) { appImports += `\nimport SWRDemo from "./components/demo/SWRDemo";`; demos.push("<SWRDemo />"); }
  if (answers.router) { appImports += `\nimport RouterDemo from "./components/demo/RouterDemo";`; demos.push("<RouterDemo />"); }
  if (answers.context) { appImports += `\nimport ContextDemo from "./components/demo/ContextDemo";`; demos.push("<ContextDemo />"); }
  appImports += `\nimport UseStateDemo from "./components/demo/UseStateDemo";`; demos.push("<UseStateDemo />");

  write(path.join(projectDir, "src", `App.${answers.ts ? "tsx" : "jsx"}`), `
${appImports}
export default function App() {
  return (
    <main className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold">Hello 👋 React + Vite + Tailwind (${answers.ts ? "TS" : "JS"})</h1>
      <p className="mt-3 text-gray-600">Edit <code className="px-1 rounded bg-gray-200">src/App.${answers.ts ? "tsx" : "jsx"}</code>.</p>
      <div className="space-y-4">
        ${demos.join("\n        ")}
      </div>
    </main>
  );
}
`.trimStart());

  // tsconfig
  if (answers.ts) {
    write(path.join(projectDir, "tsconfig.json"), JSON.stringify({
      compilerOptions: { target: "ES2022", lib: ["ES2022", "DOM", "DOM.Iterable"], module: "ESNext", jsx: "react-jsx", moduleResolution: "Bundler", strict: true, skipLibCheck: true, esModuleInterop: true, noEmit: true },
      include: ["src"],
    }, null, 2));
  }

  // Redux & RTK Query wires
  if (answers.redux || answers.rtkQuery) {
    ensure(path.join(projectDir, "src", "store"));
    let storeContent = T.REDUX_STORE_JS;
    if (answers.rtkQuery) storeContent += `\nimport { api } from './api';\n`;
    const apiReducer = answers.rtkQuery ? `\n    [api.reducerPath]: api.reducer,` : "";
    const apiMiddleware = answers.rtkQuery ? `\n  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(api.middleware),` : "";
    storeContent += "\n" + T.REDUX_STORE_JS_TAIL.replace("{{API_REDUCER}}", apiReducer).replace("{{API_MIDDLEWARE}}", apiMiddleware);
    write(path.join(projectDir, "src", "store", "store.js"), storeContent.trim());
    write(path.join(projectDir, "src", "store", "counterSlice.js"), T.COUNTER_SLICE_JS);
    if (answers.rtkQuery) write(path.join(projectDir, "src", "store", "api.js"), T.RTK_API_JS);
  }

  // Zustand
  if (answers.zustand) {
    run("npm", ["i", "zustand"], projectDir);
    ensure(path.join(projectDir, "src", "stores"));
    const storeExt = answers.ts ? "ts" : "js";
    const zustand = answers.ts
      ? `
import { create } from "zustand";
import { devtools, persist, createJSONStorage } from "zustand/middleware";
type Theme = "light" | "dark";
interface AppState { theme: Theme; count: number; setTheme: (t: Theme) => void; inc: () => void; dec: () => void; reset: () => void; }
export const useAppStore = create<AppState>()(devtools(persist((set)=>({
  theme:"light", count:0, setTheme:(t)=>set({theme:t}), inc:()=>set(s=>({count:s.count+1})), dec:()=>set(s=>({count:s.count-1})), reset:()=>set({count:0})
}),{ name:"app-store", storage: createJSONStorage(()=>localStorage)})));
`.trim()
      : `
import { create } from "zustand";
import { devtools, persist, createJSONStorage } from "zustand/middleware";
export const useAppStore = create()(devtools(persist((set)=>({
  theme:"light", count:0, setTheme:(t)=>set({theme:t}), inc:()=>set(s=>({count:s.count+1})), dec:()=>set(s=>({count:s.count-1})), reset:()=>set({count:0})
}),{ name:"app-store", storage: createJSONStorage(()=>localStorage)})));
`.trim();
    write(path.join(projectDir, "src", "stores", `useAppStore.${storeExt}`), zustand);
  }

  // Prettier
  if (answers.pt) {
    run("npm", ["i", "-D", "prettier", "prettier-plugin-tailwindcss"], projectDir);
    write(path.join(projectDir, ".prettierrc"), JSON.stringify({ plugins: ["prettier-plugin-tailwindcss"] }, null, 2));
    write(path.join(projectDir, ".prettierignore"), "node_modules\ndist\n.next\nbuild\n");
  }

  // shadcn
  if (answers.ui === "shadcn") setupShadcn(projectDir, { isVite: true });

  // demos
  ensure(path.join(projectDir, "src", "components", "demo"));
  if (answers.redux) write(path.join(projectDir, "src", "components", "demo", "ReduxDemo.jsx"), T.REDUX_DEMO_JS);
  if (answers.rtkQuery) write(path.join(projectDir, "src", "components", "demo", "RTKQueryDemo.jsx"), T.RTK_QUERY_DEMO_JS);
  if (answers.reactQuery) write(path.join(projectDir, "src", "components", "demo", "ReactQueryDemo.jsx"), T.REACT_QUERY_DEMO_JS);
  if (answers.swr) write(path.join(projectDir, "src", "components", "demo", "SWRDemo.jsx"), T.SWR_DEMO_JS);
  if (answers.router) write(path.join(projectDir, "src", "components", "demo", "RouterDemo.jsx"), T.ROUTER_DEMO_JS);
  if (answers.context) write(path.join(projectDir, "src", "components", "demo", "ContextDemo.jsx"), T.CONTEXT_DEMO_JS);
  write(path.join(projectDir, "src", "components", "demo", "UseStateDemo.jsx"), T.USESTATE_DEMO_JS);

  if (answers.framer) { run("npm", ["i", "framer-motion"], projectDir); write(path.join(projectDir, "src", "components", "demo", `FramerDemo.${answers.ts ? "tsx" : "jsx"}`), T.FRAMER_DEMO_REACT); }
  if (answers.gsap) { run("npm", ["i", "gsap"], projectDir); write(path.join(projectDir, "src", "components", "demo", `GsapDemo.${answers.ts ? "tsx" : "jsx"}`), answers.ts ? T.GSAP_DEMO_REACT_TS : T.GSAP_DEMO_REACT_JS); }
}

module.exports = { scaffoldReact };
