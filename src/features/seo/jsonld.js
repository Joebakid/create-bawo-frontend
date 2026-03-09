module.exports.createJSONLD = function (options) {

  const title = options.title || "Create Bawo Frontend App"
  const description =
    options.description || "Built with Create Bawo Frontend"

  const image =
    options.image ||
    "https://create-bawo-frontend.vercel.app/logo.png"

  const siteUrl =
    options["site-url"] ||
    "https://create-bawo-frontend.vercel.app"

  const author = options.author || "Create Bawo Frontend"

  const json = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: title,
    url: siteUrl,
    description: description,
    image: image,
    publisher: {
      "@type": "Organization",
      name: author,
      logo: {
        "@type": "ImageObject",
        url: image
      }
    }
  }

  return `
<!-- CBF JSON-LD -->
<script type="application/ld+json">
${JSON.stringify(json, null, 2)}
</script>
`.trim()

}