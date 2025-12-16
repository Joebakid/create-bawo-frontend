/* eslint-disable no-console */
const { path, write, ensure, read, run } = require("../utils");
const { setupShadcn } = require("../setup/shadcn");

function scaffoldNext(projectDir, answers) {
  const isTW4 = answers.tailwind === "v4";
  const ext = answers.ts ? "tsx" : "jsx";

  console.log(
    isTW4
      ? "⚡ Using Tailwind CSS v4 (explicit opt-in)"
      : "✅ Using Tailwind CSS v3 (default, stable)"
  );

  /* -------------------------------------------------
   * Dependencies
   * ------------------------------------------------- */
  const deps = ["react", "react-dom", "next"];
  const dev = [];

  // Tailwind
  if (isTW4) {
    dev.push(
      "tailwindcss@latest",
      "postcss",
      "@tailwindcss/postcss" // ✅ REQUIRED FOR NEXT + TW4
    );
  } else {
    dev.push("tailwindcss@3.4.14", "postcss", "autoprefixer");
  }

  // TypeScript
  if (answers.ts) {
    dev.push("typescript", "@types/react", "@types/react-dom", "@types/node");
  }

  // State / data
  if (answers.redux || answers.rtkQuery) deps.push("@reduxjs/toolkit", "react-redux");
  if (answers.reactQuery) deps.push("@tanstack/react-query");
  if (answers.swr) deps.push("swr");
  if (answers.zustand) deps.push("zustand");

  // Animations
  if (answers.framer) deps.push("framer-motion");
  if (answers.gsap) deps.push("gsap");

  run("npm", ["install", ...deps], projectDir);
  run("npm", ["install", "-D", ...dev], projectDir);

  /* -------------------------------------------------
   * package.json scripts
   * ------------------------------------------------- */
  const pkgPath = path.join(projectDir, "package.json");
  const pkg = JSON.parse(read(pkgPath));

  pkg.scripts = {
    ...(pkg.scripts || {}),
    dev: "next dev",
    build: "next build",
    start: "next start",
  };

  write(pkgPath, JSON.stringify(pkg, null, 2));

  /* -------------------------------------------------
   * Next config
   * ------------------------------------------------- */
  if (answers.ts) {
    write(
      path.join(projectDir, "next.config.ts"),
      `import type { NextConfig } from "next";
const nextConfig: NextConfig = {};
export default nextConfig;
`
    );

    write(
      path.join(projectDir, "tsconfig.json"),
      JSON.stringify(
        {
          compilerOptions: {
            target: "ES2022",
            lib: ["ES2022", "DOM", "DOM.Iterable"],
            strict: true,
            noEmit: true,
            module: "ESNext",
            moduleResolution: "Bundler",
            jsx: "react-jsx",
            incremental: true,
            skipLibCheck: true,
          },
          include: ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
          exclude: ["node_modules"],
        },
        null,
        2
      )
    );

    write(
      path.join(projectDir, "next-env.d.ts"),
      `/// <reference types="next" />
/// <reference types="next/image-types/global" />`
    );
  } else {
    write(
      path.join(projectDir, "next.config.mjs"),
      `const nextConfig = {};
export default nextConfig;`
    );
  }

  /* -------------------------------------------------
   * App Router
   * ------------------------------------------------- */
  ensure(path.join(projectDir, "app"));

  /* -------------------------------------------------
   * Tailwind config
   * ------------------------------------------------- */
  if (isTW4) {
    // ✅ REQUIRED FOR NEXT + TAILWIND v4
    write(
      path.join(projectDir, "postcss.config.cjs"),
      `module.exports = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};`
    );
  } else {
    write(
      path.join(projectDir, "tailwind.config.cjs"),
      `module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
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
    path.join(projectDir, "app/globals.css"),
    isTW4
      ? `@import "tailwindcss";`
      : `@tailwind base;
@tailwind components;
@tailwind utilities;`
  );

  /* -------------------------------------------------
   * layout
   * ------------------------------------------------- */
  write(
    path.join(projectDir, "app", `layout.${ext}`),
    `
import "./globals.css";

export const metadata = {
  title: "Next.js App",
  description: "Scaffolded by create-bawo-frontend",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-gray-900">
        {children}
      </body>
    </html>
  );
}
`.trimStart()
  );

  /* -------------------------------------------------
   * Stack summary (SELF-DOCUMENTING TEMPLATE)
   * ------------------------------------------------- */
  const animations =
    answers.framer && answers.gsap
      ? "Framer Motion + GSAP"
      : answers.framer
      ? "Framer Motion"
      : answers.gsap
      ? "GSAP"
      : "None";

  const state =
    answers.redux
      ? "Redux Toolkit"
      : answers.zustand
      ? "Zustand"
      : "None";

  write(
    path.join(projectDir, "app", `page.${ext}`),
    `
export default function Page() {
  return (
    <main className="p-8 max-w-3xl mx-auto space-y-4">
      <h1 className="text-3xl font-bold">create-bawo-frontend</h1>

      <ul className="text-gray-600 list-disc list-inside">
        <li>Framework: Next.js (App Router)</li>
        <li>Language: ${answers.ts ? "TypeScript" : "JavaScript"}</li>
        <li>Styling: Tailwind CSS ${isTW4 ? "v4" : "v3"}</li>
        <li>State Management: ${state}</li>
        <li>Animations: ${animations}</li>
      </ul>
    </main>
  );
}
`.trimStart()
  );

  /* -------------------------------------------------
   * shadcn/ui
   * ------------------------------------------------- */
  if (answers.ui === "shadcn") {
    if (isTW4) {
      console.warn("⚠️ shadcn/ui is not compatible with Tailwind v4 yet. Skipping.");
    } else {
      setupShadcn(projectDir, { isVite: false });
    }
  }
}

module.exports = { scaffoldNext };
