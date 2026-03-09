const { LOGO_URL, DEFAULT_TITLE, DEFAULT_DESCRIPTION } = require("./constants")

module.exports.createMeta = function (options) {

  const title = options.title || DEFAULT_TITLE
  const description = options.description || DEFAULT_DESCRIPTION

  const image = options.image || LOGO_URL

  const siteUrl =
    options["site-url"] || "https://create-bawo-frontend.vercel.app"

  const keywords =
    options.keywords || "create bawo frontend, frontend cli, react scaffold"

  const author =
    options.author || "Create Bawo Frontend"

  return `
<!-- CBF SEO -->

<title>${title}</title>

<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />

<meta name="description" content="${description}" />
<meta name="keywords" content="${keywords}" />
<meta name="author" content="${author}" />

<link rel="canonical" href="${siteUrl}" />

<!-- Favicon -->
<link rel="icon" href="${image}" type="image/png" />
<link rel="shortcut icon" href="${image}" type="image/png" />
<link rel="apple-touch-icon" href="${image}" />

<!-- Open Graph -->
<meta property="og:type" content="website" />
<meta property="og:site_name" content="${title}" />
<meta property="og:title" content="${title}" />
<meta property="og:description" content="${description}" />
<meta property="og:url" content="${siteUrl}" />
<meta property="og:image" content="${image}" />

<!-- Twitter -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${title}" />
<meta name="twitter:description" content="${description}" />
<meta name="twitter:image" content="${image}" />

<!-- Theme -->
<meta name="theme-color" content="#000000" />
`.trim()

}