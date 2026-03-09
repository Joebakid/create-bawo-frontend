async function run(projectDir, options) {

  const framework = options.framework

  if (framework === "react") {
    await require("./react")(projectDir, options)
  }

  if (framework === "next") {
    await require("./next")(projectDir, options)
  }

  if (framework === "vue") {
    await require("./vue")(projectDir, options)
  }

  if (framework === "svelte") {
    await require("./svelte")(projectDir, options)
  }

}

module.exports = { run }