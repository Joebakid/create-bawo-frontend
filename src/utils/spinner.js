const ora = require("ora").default;

function start(text) {
  const spinner = ora({
    text,
    spinner: "dots",
  }).start();

  return spinner;
}

function succeed(spinner, text) {
  spinner.succeed(text);
}

function fail(spinner, text) {
  spinner.fail(text);
}

module.exports = {
  start,
  succeed,
  fail,
};