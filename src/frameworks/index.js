const react = require("./react");
const next = require("./next");
const vue = require("./vue");
const svelte = require("./svelte");

module.exports = async function runFramework(projectDir, options) {

  const framework = options.framework;

  if (!framework) {
    throw new Error("No framework specified");
  }

  /* ---------------------------------
  React
  --------------------------------- */

  if (framework === "react") {
    return react.run(projectDir, options);
  }

  /* ---------------------------------
  Next.js
  --------------------------------- */

  if (framework === "next") {
    return next.run(projectDir, options);
  }

  /* ---------------------------------
  Vue
  --------------------------------- */

  if (framework === "vue") {
    return vue.run(projectDir, options);
  }

  /* ---------------------------------
  Svelte
  --------------------------------- */

  if (framework === "svelte") {
    return svelte.run(projectDir, options);
  }

  /* ---------------------------------
  Unsupported
  --------------------------------- */

  throw new Error(`Unsupported framework: ${framework}`);

};