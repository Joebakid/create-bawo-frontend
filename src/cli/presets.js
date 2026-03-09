function applyPreset(options) {

  switch (options.preset) {

    case "minimal":
      return {
        ts: false,
        framer: false,
        gsap: false,
        ui: "none",
        "state-mgmt": "none"
      }

    case "animation":
      return {
        framer: true,
        gsap: true
      }

    case "full":
      return {
        ts: true,
        framer: true,
        gsap: true,
        ui: "shadcn",
        "state-mgmt": "redux"
      }

    default:
      return {}

  }

}

module.exports = applyPreset