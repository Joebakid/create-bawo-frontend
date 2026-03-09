/* eslint-disable no-console */

const { path, fs, write, read, run } = require("../utils");
const templates = require("../templates");

const {
  CN_UTIL_TS,
  COMPONENTS_JSON_VITE,
  COMPONENTS_JSON_NEXT,
} = templates;

async function setupShadcn(projectDir, { isVite }) {

  const componentsJsonPath = path.join(projectDir, "components.json");
  const hasComponentsJson = fs.existsSync(componentsJsonPath);

  /* -------------------------------------------------
  Ensure path aliases
  ------------------------------------------------- */

  const tsconfigPath = path.join(projectDir, "tsconfig.json");
  const jsconfigPath = path.join(projectDir, "jsconfig.json");

  const cfgPath = fs.existsSync(tsconfigPath)
    ? tsconfigPath
    : fs.existsSync(jsconfigPath)
    ? jsconfigPath
    : tsconfigPath;

  const cfg = fs.existsSync(cfgPath)
    ? JSON.parse(read(cfgPath))
    : { compilerOptions: {} };

  cfg.compilerOptions = cfg.compilerOptions || {};
  cfg.compilerOptions.baseUrl = ".";

  cfg.compilerOptions.paths = isVite
    ? {
        ...(cfg.compilerOptions.paths || {}),
        "@/*": ["src/*"],
        "@/components/*": ["src/components/*"],
        "@/lib/*": ["src/lib/*"],
      }
    : {
        ...(cfg.compilerOptions.paths || {}),
        "@/*": ["./*"],
        "@/components/*": ["components/*"],
        "@/lib/*": ["lib/*"],
      };

  write(cfgPath, JSON.stringify(cfg, null, 2));

  /* -------------------------------------------------
  Dependencies
  ------------------------------------------------- */

  console.log("📦 Installing shadcn dependencies...");

  await run(
    "npm",
    [
      "install",
      "class-variance-authority",
      "clsx",
      "tailwind-merge",
      "lucide-react",
    ],
    projectDir
  );

  await run(
    "npm",
    ["install", "-D", "tailwindcss-animate"],
    projectDir
  );

  /* -------------------------------------------------
  utils.ts
  ------------------------------------------------- */

  const libDir = isVite
    ? path.join(projectDir, "src", "lib")
    : path.join(projectDir, "lib");

  fs.mkdirSync(libDir, { recursive: true });

  write(path.join(libDir, "utils.ts"), CN_UTIL_TS);

  /* -------------------------------------------------
  Initialize shadcn
  ------------------------------------------------- */

  if (!hasComponentsJson) {

    console.log("✨ Initializing shadcn/ui...");

    await run(
      "npx",
      ["shadcn@latest", "init", "-y"],
      projectDir
    );

    if (!fs.existsSync(componentsJsonPath)) {
      write(
        componentsJsonPath,
        isVite
          ? COMPONENTS_JSON_VITE
          : COMPONENTS_JSON_NEXT
      );
    }

  } else {

    console.log("• shadcn/ui already initialized — skipping init.");

  }

  /* -------------------------------------------------
  Tailwind plugin
  ------------------------------------------------- */

  const twCfgPath = path.join(projectDir, "tailwind.config.cjs");

  if (fs.existsSync(twCfgPath)) {

    const tw = read(twCfgPath);

    if (!/tailwindcss-animate/.test(tw)) {

      write(
        twCfgPath,
        tw.replace(
          /plugins:\s*\[[^\]]*\]/,
          (m) =>
            m.includes("tailwindcss-animate")
              ? m
              : m.replace(
                  /\]$/,
                  `${m.trim().endsWith("[") ? "" : ","}require("tailwindcss-animate")]`
                )
        )
      );

    }

  }

  /* -------------------------------------------------
  Done
  ------------------------------------------------- */

  console.log("\n✨ shadcn/ui initialized successfully.");
  console.log("You can now add components with:");
  console.log("   npx shadcn add button\n");
}

module.exports = {
  setupShadcn,
};