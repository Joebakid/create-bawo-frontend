#!/usr/bin/env node
/* eslint-disable no-console */

const fs = require("fs");
const path = require("path");

const getFlags = require("../src/cli/flags");
const applyPreset = require("../src/cli/presets");
const { promptMissing } = require("../src/cli/prompts");

const runFramework = require("../src/frameworks");
const runFeatures = require("../src/features");

const { run } = require("../src/utils");

const logger = require("../src/utils/logger");
const spinner = require("../src/utils/spinner");
const progress = require("../src/utils/progress");

/* -------------------------------
Handle Ctrl+C
-------------------------------- */

process.on("SIGINT", () => {
  console.log("\n");
  logger.error("Setup cancelled.");
  process.exit(1);
});

/* -------------------------------
Main
-------------------------------- */

async function main() {

  console.clear();

  let options = getFlags();
  options.name = options._?.[0] || options.name;

  if (options.preset) {
    Object.assign(options, applyPreset(options));
  }

  if (!(options.y || options.yes)) {

    options = await promptMissing(options);

  } else {

    options.name ??= "my-app";
    options.framework ??= "react";
    options.ts ??= true;
    options.tailwind ??= "v3";
    options["state-mgmt"] ??= "none";
    options.font ??= "inter";

  }

  const projectDir = path.resolve(process.cwd(), options.name);

  if (fs.existsSync(projectDir)) {
    logger.error(`Directory "${options.name}" already exists.`);
    process.exit(1);
  }

  logger.create(
    `Creating ${options.framework.toUpperCase()} project: ${options.name}`
  );

  const steps = 3;
  const bar = progress.create(steps);

  /* -------------------------------
  Framework
  -------------------------------- */

  const frameworkSpinner = spinner.start("Scaffolding framework");

  try {

    await runFramework(projectDir, options);

    spinner.succeed(frameworkSpinner, "Framework scaffolded");

  } catch (err) {

    spinner.fail(frameworkSpinner, "Framework setup failed");

    throw err;

  }

  progress.step(bar);

  /* -------------------------------
  Features
  -------------------------------- */

  const featureSpinner = spinner.start("Installing project features");

  try {

    await runFeatures(projectDir, options);

    spinner.succeed(featureSpinner, "Features installed");

  } catch (err) {

    spinner.fail(featureSpinner, "Feature installation failed");

    throw err;

  }

  progress.step(bar);

  /* -------------------------------
  Install Dependencies (ONE TIME)
  -------------------------------- */

  const installSpinner = spinner.start("Installing dependencies");

  try {

    await run("npm", ["install"], projectDir);

    spinner.succeed(installSpinner, "Dependencies installed");

  } catch (err) {

    spinner.fail(installSpinner, "Dependency installation failed");

    throw err;

  }

  progress.step(bar);

  progress.done(bar);

  console.log("");

  logger.success("Project ready!\n");

  console.log(`📁 Location`);
  console.log(`   ${projectDir}\n`);

  console.log(`Next steps:\n`);

  console.log(`   cd ${options.name}`);
  console.log(`   npm run dev\n`);

  console.log(`Happy coding 🚀\n`);

}

main().catch((err) => {

  console.log("");

  logger.error("Error creating project");

  console.error(err);

  process.exit(1);

});