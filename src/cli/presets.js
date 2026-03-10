function applyPreset(options) {

  const preset = options.preset

  let presetOptions = {}

  switch (preset) {

    case "minimal":
      presetOptions = {
        ts: false,
        framer: false,
        gsap: false,
        ui: "none",
        "state-mgmt": "none"
      }
      break

    case "animation":
      presetOptions = {
        framer: true,
        gsap: true
      }
      break

    case "full":
      presetOptions = {
        ts: true,
        framer: true,
        gsap: true,
        ui: "shadcn",
        "state-mgmt": "redux"
      }
      break

    default:
      presetOptions = {}
  }

  /* --------------------------------
  Do not override CLI flags
  -------------------------------- */

  const result = {}

  for (const key in presetOptions) {
    if (options[key] === undefined) {
      result[key] = presetOptions[key]
    }
  }

  return result

}

module.exports = applyPreset