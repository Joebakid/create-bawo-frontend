/* eslint-disable no-console */

const fs = require("fs")
const path = require("path")
const { run, write } = require("../../../utils")

/**

* setupShadcnUI
* Deterministic shadcn/ui setup for React + Vite
* Forces Tailwind CSS v3 (required by shadcn)
  */

async function setupShadcnUI({ projectDir }) {

console.log("✨ Setting up shadcn/ui...")

/* ---------------------------------------------
Force Tailwind v3 (required for stability)
--------------------------------------------- */

console.log(
"⚠️ shadcn/ui requires Tailwind CSS v3.\n" +
"→ Installing Tailwind v3 stack."
)

run(
"npm",
[
"remove",
"tailwindcss",
"@tailwindcss/vite",
"@tailwindcss/postcss",
"tw-animate-css"
],
projectDir
)

run(
"npm",
[
"install",
"-D",
"tailwindcss@3.4.14",
"postcss",
"autoprefixer"
],
projectDir
)

/* ---------------------------------------------
tsconfig.json
--------------------------------------------- */

const tsconfigPath = path.join(projectDir, "tsconfig.json")

write(
tsconfigPath,
JSON.stringify(
{
compilerOptions: {
target: "ESNext",
lib: ["DOM", "DOM.Iterable", "ESNext"],
jsx: "react-jsx",
module: "ESNext",
moduleResolution: "Bundler",
strict: true,
skipLibCheck: true,
noEmit: true,
baseUrl: ".",
paths: {
"@/*": ["src/*"]
}
},
include: ["src"]
},
null,
2
)
)

/* ---------------------------------------------
vite.config.ts
--------------------------------------------- */

const viteConfigPath = path.join(projectDir, "vite.config.ts")

write(
viteConfigPath,
`
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import path from "path"

export default defineConfig({
plugins: [react()],
resolve: {
alias: {
"@": path.resolve(__dirname, "src")
}
}
})
`.trim()
)

/* ---------------------------------------------
Tailwind config
--------------------------------------------- */

write(
path.join(projectDir, "tailwind.config.cjs"),
`module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [],
}`.trim()
)

write(
path.join(projectDir, "postcss.config.cjs"),
`module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}`.trim()
)

/* ---------------------------------------------
Tailwind entry CSS
--------------------------------------------- */

const stylesDir = path.join(projectDir, "src/styles")
const stylesPath = path.join(stylesDir, "index.css")

if (!fs.existsSync(stylesDir)) {
fs.mkdirSync(stylesDir, { recursive: true })
}

write(
stylesPath,
`@tailwind base;
@tailwind components;
@tailwind utilities;`
)

/* ---------------------------------------------
Initialize shadcn
--------------------------------------------- */

console.log("✨ Initializing shadcn/ui...")

run(
"npx",
["shadcn-ui@latest", "init", "-y"],
projectDir
)

console.log("✅ shadcn/ui setup complete (Tailwind v3 locked).")

}

module.exports = { setupShadcnUI }
