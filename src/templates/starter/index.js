const fs = require("fs");
const path = require("path");

function read(file) {
  return fs.readFileSync(file, "utf8");
}

const REACT_APP = read(
  path.join(__dirname, "react/src/App.tsx")
);

const VUE_APP = read(
  path.join(__dirname, "vue/src/App.vue")
);

const NEXT_PAGE = read(
  path.join(__dirname, "next/app/page.tsx")
);

const SVELTE_APP = read(
  path.join(__dirname, "svelte/src/App.svelte")
);

module.exports = {
  REACT_APP,
  VUE_APP,
  NEXT_PAGE,
  SVELTE_APP
};