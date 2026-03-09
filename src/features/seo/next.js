const fs = require("fs")
const path = require("path")

const {
  LOGO_URL,
  DEFAULT_TITLE,
  DEFAULT_DESCRIPTION
} = require("./constants")

module.exports = async function (projectDir, options) {

  const layoutPath = path.join(projectDir, "app/layout.tsx")

  if (!fs.existsSync(layoutPath)) return

  let layout = fs.readFileSync(layoutPath, "utf8")

  // prevent duplicate metadata injection
  if (layout.includes("export const metadata")) return

  const title = options.title || DEFAULT_TITLE
  const description = options.description || DEFAULT_DESCRIPTION
  const image = options.image || LOGO_URL

  const siteUrl =
    options["site-url"] ||
    "https://create-bawo-frontend.vercel.app"

  const metadata = `
export const metadata = {
  metadataBase: new URL("${siteUrl}"),

  title: {
    default: "${title}",
    template: "%s | ${title}"
  },

  description: "${description}",

  icons: {
    icon: "${image}",
    shortcut: "${image}",
    apple: "${image}"
  },

  openGraph: {
    title: "${title}",
    description: "${description}",
    url: "${siteUrl}",
    siteName: "${title}",
    images: [
      {
        url: "${image}",
        width: 512,
        height: 512
      }
    ],
    locale: "en_US",
    type: "website"
  },

  twitter: {
    card: "summary_large_image",
    title: "${title}",
    description: "${description}",
    images: ["${image}"]
  }
}
`.trim()

  layout = metadata + "\n\n" + layout

  fs.writeFileSync(layoutPath, layout)

}