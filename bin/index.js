#!/usr/bin/env node
/* eslint-disable no-console */

const { run } = require("../src");
const yargs = require("yargs/yargs");
const { hideBin } = require("yargs/helpers");

const argv = yargs(hideBin(process.argv))
  .option("framework", { type: "string" })
  .option("tailwind", { type: "string" })
  .option("ts", { type: "boolean" })
  .option("js", { type: "boolean" })
  .option("gsap", { type: "boolean" })
  .option("framer", { type: "boolean" })
  .help()
  .parse();

run(argv).catch((e) => {
  console.error(e);
  process.exit(1);
});
