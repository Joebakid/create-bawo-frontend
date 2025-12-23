/* eslint-disable no-console */

const { run: runReact } = require("./react");
const { run: runVue } = require("./vue");
const { run: runNext } = require("./next");

async function run(argv) {
  const framework = argv.framework;

  if (!framework) {
    console.error("❌ Missing --framework flag (react | vue | next)");
    process.exit(1);
  }

  switch (framework) {
    case "react":
      return runReact(argv);

    case "vue":
      return runVue(argv);

    case "next":
      return runNext(argv);

    default:
      console.error(`❌ Unknown framework: ${framework}`);
      process.exit(1);
  }
}

module.exports = { run };
