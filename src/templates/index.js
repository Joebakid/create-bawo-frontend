const fs = require("fs");
const path = require("path");

function safeRead(file) {
  try {
    if (fs.existsSync(file)) {
      return fs.readFileSync(file, "utf8");
    }
    return "";
  } catch {
    return "";
  }
}

/* -------------------------------------------------
Starter templates
------------------------------------------------- */

const REACT_APP = safeRead(
  path.join(__dirname, "starter/react/src/App.tsx")
);

const VUE_APP = safeRead(
  path.join(__dirname, "starter/vue/src/App.vue")
);

const NEXT_PAGE = safeRead(
  path.join(__dirname, "starter/next/app/page.tsx")
);

const SVELTE_APP = safeRead(
  path.join(__dirname, "starter/svelte/src/App.svelte")
);

/* -------------------------------------------------
Shadcn files
------------------------------------------------- */

const CN_UTIL_TS = safeRead(
  path.join(__dirname, "shadcn/utils.ts")
);

const COMPONENTS_JSON_VITE = safeRead(
  path.join(__dirname, "shadcn/components.vite.json")
);

const COMPONENTS_JSON_NEXT = safeRead(
  path.join(__dirname, "shadcn/components.next.json")
);

module.exports = {
  REACT_APP,
  VUE_APP,
  NEXT_PAGE,
  SVELTE_APP,
  CN_UTIL_TS,
  COMPONENTS_JSON_VITE,
  COMPONENTS_JSON_NEXT
};