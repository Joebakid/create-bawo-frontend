/* eslint-disable no-console */
const { path, fs, write, read, run } = require("../utils");
const { CN_UTIL_TS, COMPONENTS_JSON_VITE, COMPONENTS_JSON_NEXT } = require("../templates");

function setupShadcn(projectDir, { isVite }) {
  const componentsJsonPath = path.join(projectDir, "components.json");
  const hasComponentsJson = fs.existsSync(componentsJsonPath);

  // Ensure alias before init
  const tsconfigPath = path.join(projectDir, "tsconfig.json");
  const jsconfigPath = path.join(projectDir, "jsconfig.json");
  const cfgPath = fs.existsSync(tsconfigPath) ? tsconfigPath : (fs.existsSync(jsconfigPath) ? jsconfigPath : tsconfigPath);
  const cfg = fs.existsSync(cfgPath) ? JSON.parse(read(cfgPath)) : { compilerOptions: {} };
  cfg.compilerOptions = cfg.compilerOptions || {};
  cfg.compilerOptions.baseUrl = ".";
  cfg.compilerOptions.paths = isVite
    ? { ...(cfg.compilerOptions.paths || {}), "@/*": ["src/*"], "@/components/*": ["src/components/*"], "@/lib/*": ["src/lib/*"] }
    : { ...(cfg.compilerOptions.paths || {}), "@/*": ["./*"], "@/components/*": ["components/*"], "@/lib/*": ["lib/*"] };
  write(cfgPath, JSON.stringify(cfg, null, 2));

  // deps
  run("npm", ["i", "class-variance-authority", "clsx", "tailwind-merge", "lucide-react"], projectDir);
  run("npm", ["i", "-D", "tailwindcss-animate"], projectDir);

  // utils.ts
  const libDir = isVite ? path.join(projectDir, "src", "lib") : path.join(projectDir, "lib");
  fs.mkdirSync(libDir, { recursive: true });
  write(path.join(libDir, "utils.ts"), CN_UTIL_TS);

  // init components.json if missing
  if (!hasComponentsJson) {
    console.log("• shadcn/ui: initializing…");
    run("npx", ["shadcn@latest", "init", "-y"], projectDir);
    if (!fs.existsSync(componentsJsonPath)) {
      write(componentsJsonPath, isVite ? COMPONENTS_JSON_VITE : COMPONENTS_JSON_NEXT);
    }
  } else {
    console.log("• shadcn/ui already initialized — skipping init.");
  }

  // plugin ensure
  const twCfgPath = path.join(projectDir, "tailwind.config.cjs");
  if (fs.existsSync(twCfgPath)) {
    const tw = read(twCfgPath);
    if (!/tailwindcss-animate/.test(tw)) {
      write(
        twCfgPath,
        tw.replace(/plugins:\s*\[[^\]]*\]/, (m) =>
          m.includes("tailwindcss-animate")
            ? m
            : m.replace(/\]$/, `${m.trim().endsWith("[") ? "" : ","}require("tailwindcss-animate")]`),
        ),
      );
    }
  }

  // add a few base components
  console.log("• Adding shadcn/ui components (idempotent)...");
  run("npx", ["shadcn@latest", "add", "-y", "button", "card", "input", "label", "dialog", "dropdown-menu", "sheet", "toast"], projectDir);
}

module.exports = { setupShadcn };
