#!/usr/bin/env node
/* eslint-disable no-console */
require("../src").run().catch((e) => {
  console.error(e);
  process.exit(1);
});
