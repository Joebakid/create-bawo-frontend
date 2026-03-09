const fs = require("fs")
const path = require("path")

module.exports = function generateSitemap(projectDir, options) {

const siteUrl =
options["site-url"] ||
"https://create-bawo-frontend.vercel.app"

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>

<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">

<url>
<loc>${siteUrl}</loc>
<changefreq>weekly</changefreq>
<priority>1.0</priority>
</url>

</urlset>
`

fs.writeFileSync(
path.join(projectDir, "public/sitemap.xml"),
sitemap
)

const robots = `
User-agent: *
Allow: /

Sitemap: ${siteUrl}/sitemap.xml
`

fs.writeFileSync(
path.join(projectDir, "public/robots.txt"),
robots
)

}