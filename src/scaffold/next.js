/* eslint-disable no-console */
const { path, write, ensure, read, run } = require("../utils");
const T = require("../templates");
const { setupShadcn } = require("../setup/shadcn");

function scaffoldNext(projectDir, answers) {
  const deps = ["react", "react-dom", "next"];
  const dev = ["tailwindcss@3.4.14", "postcss", "autoprefixer"];
  if (answers.ts) dev.push("typescript", "@types/react", "@types/react-dom");
  if (answers.redux || answers.rtkQuery) deps.push("@reduxjs/toolkit", "react-redux");
  if (answers.reactQuery) deps.push("@tanstack/react-query");
  if (answers.swr) deps.push("swr");

  run("npm", ["i", ...deps], projectDir);
  run("npm", ["i", "-D", ...dev], projectDir);

  const pkgPath = path.join(projectDir, "package.json");
  const pkg = JSON.parse(read(pkgPath));
  pkg.scripts = { ...(pkg.scripts || {}), dev: "next dev", build: "next build", start: "next start", lint: 'echo "(add eslint if you want)" && exit 0', format: 'echo "(add prettier if you want)" && exit 0' };
  write(pkgPath, JSON.stringify(pkg, null, 2));

  // next config + ts
  if (answers.ts) {
    write(path.join(projectDir, "next.config.ts"), `import type { NextConfig } from "next";\nconst nextConfig: NextConfig = {};\nexport default nextConfig;\n`);
    write(path.join(projectDir, "tsconfig.json"), JSON.stringify({
      compilerOptions: { target: "ES2022", lib: ["ES2022","DOM","DOM.Iterable"], allowJs: false, skipLibCheck: true, strict: true, noEmit: true, esModuleInterop: true, module: "ESNext", moduleResolution: "Bundler", resolveJsonModule: true, isolatedModules: true, jsx: "preserve", incremental: true },
      include: ["next-env.d.ts","**/*.ts","**/*.tsx",".next/types/**/*.ts"], exclude: ["node_modules"]
    }, null, 2));
    write(path.join(projectDir, "next-env.d.ts"), `/// <reference types="next" />\n/// <reference types="next/image-types/global" />\n`);
  } else {
    write(path.join(projectDir, "next.config.mjs"), `const nextConfig = {};\nexport default nextConfig;\n`);
  }

  // Tailwind
  write(path.join(projectDir, "tailwind.config.cjs"), `module.exports = { content: ["./app/**/*.{js,ts,jsx,tsx}","./components/**/*.{js,ts,jsx,tsx}"], theme: { extend: {} }, plugins: [] };`);
  write(path.join(projectDir, "postcss.config.cjs"), `module.exports = { plugins: { tailwindcss: {}, autoprefixer: {} } };`);
  write(path.join(projectDir, "app", "globals.css"), `@tailwind base;\n@tailwind components;\n@tailwind utilities;`);

  const layoutExt = answers.ts ? "tsx" : "jsx";
  const layout = answers.ts
    ? `
export const metadata = { title: "Next + Tailwind", description: "Scaffolded by create-bawo-frontend" };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (<html lang="en"><body className="min-h-screen bg-white text-gray-900">{children}</body></html>);
}
`.trimStart()
    : `
export const metadata = { title: "Next + Tailwind", description: "Scaffolded by create-bawo-frontend" };
export default function RootLayout({ children }) {
  return (<html lang="en"><body className="min-h-screen bg-white text-gray-900">{children}</body></html>);
}
`.trimStart();
  write(path.join(projectDir, "app", `layout.${layoutExt}`), layout);

  const pageExt = answers.ts ? "tsx" : "jsx";
  write(path.join(projectDir, "app", `page.${pageExt}`), `
export default function Page() {
  return (
    <main className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold">Hello 👋 Next.js + Tailwind (${answers.ts ? "TS" : "JS"})</h1>
      <p className="mt-3 text-gray-600">Edit <code className="px-1 rounded bg-gray-200">app/page.${pageExt}</code>.</p>
    </main>
  );
}
`.trimStart());

  // Zustand (optional)
  if (answers.zustand) {
    run("npm", ["i", "zustand"], projectDir);
    ensure(path.join(projectDir, "store"));
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
    write(path.join(projectDir, "store", `useAppStore.${storeExt}`), zustand);
  }

  if (answers.pt) {
    run("npm", ["i", "-D", "prettier", "prettier-plugin-tailwindcss"], projectDir);
    write(path.join(projectDir, ".prettierrc"), JSON.stringify({ plugins: ["prettier-plugin-tailwindcss"] }, null, 2));
    write(path.join(projectDir, ".prettierignore"), "node_modules\n.next\nbuild\ndist\n");
  }

  if (answers.ui === "shadcn") setupShadcn(projectDir, { isVite: false });

  // Optional demos for Next (keep minimal)
  ensure(path.join(projectDir, "components", "demo"));
  if (answers.framer) { run("npm", ["i", "framer-motion"], projectDir); write(path.join(projectDir, "components", "demo", `FramerDemo.${answers.ts ? "tsx" : "jsx"}`), T.FRAMER_DEMO_NEXT); }
  if (answers.gsap)    { run("npm", ["i", "gsap"], projectDir); write(path.join(projectDir, "components", "demo", `GsapDemo.${answers.ts ? "tsx" : "jsx"}`), answers.ts ? T.GSAP_DEMO_NEXT : T.GSAP_DEMO_NEXT_JS); }
}

module.exports = { scaffoldNext };
