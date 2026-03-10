module.exports = function normalizeOptions(options) {

  /* -----------------------------
  Backend flags
  ----------------------------- */

  if (options.supabase) options.backend = "supabase"
  if (options.firebase) options.backend = "firebase"
  if (options.appwrite) options.backend = "appwrite"
  if (options.pocketbase) options.backend = "pocketbase"

  options.supabase = options.backend === "supabase"
  options.firebase = options.backend === "firebase"
  options.appwrite = options.backend === "appwrite"
  options.pocketbase = options.backend === "pocketbase"

  /* -----------------------------
  State shortcuts
  ----------------------------- */

  if (options.redux) options["state-mgmt"] = "redux"
  if (options.zustand) options["state-mgmt"] = "zustand"
  if (options.context) options["state-mgmt"] = "context"
  if (options["react-query"]) options["state-mgmt"] = "react-query"
  if (options["rtk-query"]) options["state-mgmt"] = "rtk-query"
  if (options.swr) options["state-mgmt"] = "swr"

  return options

}