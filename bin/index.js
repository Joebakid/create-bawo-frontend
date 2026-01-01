#!/usr/bin/env node
/* eslint-disable no-console */

const path = require("path");
const fs = require("fs");
const yargs = require("yargs/yargs");
const { hideBin } = require("yargs/helpers");
const prompts = require("prompts");

// 🔤 Font system
const { addFont, registry } = require("../src/fonts");

/* ---------------------------------
 * State Managers (React only)
 * --------------------------------- */
const STATE_MANAGERS = {
  redux: "redux",
  "rtk-query": "rtk-query",
  "react-query": "react-query",
  swr: "swr",
  zustand: "zustand",
  context: "context",
};

/* ---------------------------------
 * Helpers
 * --------------------------------- */
function copyDir(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });

  for (const entry of fs.readdirSync(src)) {
    const srcPath = path.join(src, entry);
    const destPath = path.join(dest, entry);

    if (fs.statSync(srcPath).isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

/* ---------------------------------
 * CLI FLAGS
 * --------------------------------- */
const argv = yargs(hideBin(process.argv))
  .scriptName("create-bawo-frontend")
  .usage("$0 [project-name] [options]")
  .option("framework", { type: "string" })
  .option("ts", { type: "boolean" })
  .option("tailwind", { type: "string" })
  .option("state-mgmt", { type: "string" })
  .option("ui", { type: "string" })
  .option("framer", { type: "boolean" })
  .option("gsap", { type: "boolean" })
  .option("font", { type: "string" })
  .option("preset", { type: "string" })
  .option("skip-docs", { type: "boolean" })
  .option("yes", { alias: "y", type: "boolean" })
  .help()
  .parse();

/* ---------------------------------
 * Presets
 * --------------------------------- */
function applyPreset(options) {
  switch (options.preset) {
    case "minimal":
      return {
        ts: false,
        framer: false,
        gsap: false,
        ui: "none",
        "state-mgmt": "none",
      };
    case "animation":
      return { framer: true, gsap: true };
    case "full":
      return {
        ts: true,
        framer: true,
        gsap: true,
        ui: "shadcn",
        "state-mgmt": "redux",
      };
    default:
      return {};
  }
}

/* ---------------------------------
 * Prompt Missing Options
 * --------------------------------- */
async function promptMissing(options) {
  if (!options.name) {
    const { name } = await prompts({
      type: "text",
      name: "name",
      message: "Project name",
    });
    if (!name) process.exit(1);
    options.name = name;
  }

  if (!options.framework) {
    const { framework } = await prompts({
      type: "select",
      name: "framework",
      message: "Choose a framework",
      choices: [
        { title: "React (Vite)", value: "react" },
        { title: "Next.js (App Router)", value: "next" },
        { title: "Vue 3 (Vite)", value: "vue" },
      ],
    });
    options.framework = framework;
  }

  if (options.ts === undefined) {
    const { ts } = await prompts({
      type: "confirm",
      name: "ts",
      message: "Use TypeScript?",
      initial: true,
    });
    options.ts = ts;
  }

  if (!options.tailwind) {
    const { tailwind } = await prompts({
      type: "select",
      name: "tailwind",
      message: "Tailwind CSS version",
      choices:
        options.framework === "vue"
          ? [{ title: "v3 (stable)", value: "v3" }]
          : [
              { title: "v3 (stable)", value: "v3" },
              { title: "v4 (experimental)", value: "v4" },
            ],
    });
    options.tailwind = tailwind;
  }

  if (!options["state-mgmt"] && options.framework !== "vue") {
    const { state } = await prompts({
      type: "select",
      name: "state",
      message: "State management",
      choices: [
        { title: "Redux", value: "redux" },
        { title: "RTK Query", value: "rtk-query" },
        { title: "React Query", value: "react-query" },
        { title: "SWR", value: "swr" },
        { title: "Zustand", value: "zustand" },
        { title: "Context API", value: "context" },
        { title: "None", value: "none" },
      ],
    });
    options["state-mgmt"] = state;
  }

  return options;
}

/* ---------------------------------
 * Main
 * --------------------------------- */
async function main() {
  let options = {
    ...argv,
    name: argv._[0],
  };

  if (options.preset) {
    Object.assign(options, applyPreset(options));
  }

  if (options.y || options.yes) {
    options.name ??= "my-app";
    options.framework ??= "react";
    options.ts ??= true;
    options.tailwind ??= "v3";
    options["state-mgmt"] ??= "none";
  } else {
    options = await promptMissing(options);
  }

  const projectDir = path.resolve(process.cwd(), options.name);

  console.log(
    `\n🚀 Creating ${options.framework.toUpperCase()} project: ${options.name}\n`
  );

  /* ---------------------------------
   * Scaffold Framework
   * --------------------------------- */
  switch (options.framework) {
    case "react":
      await require("../src/react").run(options);
      break;
    case "next":
      await require("../src/next").run(options);
      break;
    case "vue":
      await require("../src/vue").run({
        projectDir,
        answers: options,
      });
      break;
    default:
      console.error("❌ Unsupported framework");
      process.exit(1);
  }

  /* ---------------------------------
   * State Management (React / Next ONLY)
   * --------------------------------- */
  const state = options["state-mgmt"];

  if (
    state &&
    state !== "none" &&
    options.framework !== "vue"
  ) {
    const stateSrc = path.join(
      __dirname,
      `../src/state/${STATE_MANAGERS[state]}`
    );

    const stateDest = path.join(projectDir, "src/state");

    copyDir(stateSrc, stateDest);

    const providerMap = {
      redux: "ReduxProvider",
      "rtk-query": "RTKQueryProvider",
      "react-query": "ReactQueryProvider",
      swr: "SWRProvider",
      zustand: null,
      context: "AppProvider",
    };

    const providerName = providerMap[state];

    const providerContent = providerName
      ? `
import ${providerName} from "./${STATE_MANAGERS[state]}/provider";

export default function StateProvider({ children }) {
  return <${providerName}>{children}</${providerName}>;
}
`
      : `
export default function StateProvider({ children }) {
  return <>{children}</>;
}
`;

    fs.writeFileSync(
      path.join(projectDir, "src/state/provider.jsx"),
      providerContent.trim()
    );
  }

  /* ---------------------------------
   * Animations (GSAP / Framer)
   * --------------------------------- */
  if (options.gsap || options.framer) {
    const animationsDest = path.join(projectDir, "src/animations");

    // GSAP (React, Next, Vue)
    if (options.gsap) {
      copyDir(
        path.join(__dirname, "../src/animations/gsap"),
        path.join(animationsDest, "gsap")
      );
    }

    // Framer Motion (React / Next ONLY)
    if (options.framer && options.framework !== "vue") {
      copyDir(
        path.join(__dirname, "../src/animations/framer"),
        path.join(animationsDest, "framer")
      );

      const animationProvider = `
import { MotionConfig } from "framer-motion";

export default function AnimationProvider({ children }) {
  return (
    <MotionConfig reducedMotion="user">
      {children}
    </MotionConfig>
  );
}
`.trim();

      fs.writeFileSync(
        path.join(animationsDest, "provider.jsx"),
        animationProvider
      );
    }
  }

  /* ---------------------------------
   * Fonts
   * --------------------------------- */
  if (options.font && registry[options.font]) {
    await addFont(projectDir, options.font);
  }

  /* ---------------------------------
   * Docs
   * --------------------------------- */
  if (!options["skip-docs"]) {
    copyDir(
      path.join(__dirname, "../src/templates/docs"),
      path.join(projectDir, "docs")
    );
  }

  console.log("\n✅ Project ready!");
  console.log("👉 cd", options.name);
  console.log("👉 npm run dev\n");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
