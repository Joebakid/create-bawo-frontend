const cliProgress = require("cli-progress")

function create(total) {
  const bar = new cliProgress.SingleBar({
    format: "Progress |{bar}| {percentage}%"
  })

  bar.start(total, 0)

  return {
    bar,
    current: 0
  }
}

function step(p) {
  p.current++
  p.bar.update(p.current)
}

function done(p) {
  p.bar.stop()
}

module.exports = {
  create,
  step,
  done
}