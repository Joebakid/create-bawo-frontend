/* eslint-disable no-console */
const path = require("path");
const { copyDir } = require("../utils");

function injectTailwind({ projectDir, framework, version, ui }) {
  let resolved = version;

  // shadcn always forces v3
  if (ui === "shadcn") {
    resolved = "v3";
  }

  // Vue is v3 only (future v4 commented)
  if (framework === "vue") {
    resolved = "v3";
  }

  const src = path.join(__dirname, resolved);
  copyDir(src, projectDir);

  const deps =
    resolved === "v4"
      ? ["tailwindcss", "postcss", "@tailwindcss/postcss"]
      : ["tailwindcss@3.4.14", "postcss", "autoprefixer"];

  return {
    version: resolved,
    deps,
  };
}

module.exports = { injectTailwind };
