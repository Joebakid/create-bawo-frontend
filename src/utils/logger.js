const kleur = require("kleur")

function create(msg) {
  console.log("\n" + kleur.bold().cyan("◆ " + msg))
}

function success(msg) {
  console.log(kleur.green("✔ " + msg))
}

function error(msg) {
  console.log(kleur.red("✖ " + msg))
}

function info(msg) {
  console.log(kleur.blue("ℹ " + msg))
}

module.exports = {
  create,
  success,
  error,
  info
}