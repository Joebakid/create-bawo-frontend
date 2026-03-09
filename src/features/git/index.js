const fs = require("fs")
const path = require("path")

function run(projectDir) {

  const gitignorePath = path.join(projectDir, ".gitignore")

  const content = `
# dependencies
node_modules

# build output
dist
build
.next
.svelte-kit

# environment variables
.env
.env.local
.env.*.local

# logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# system files
.DS_Store
Thumbs.db

# IDE
.vscode
.idea

# docs (generated docs can be large)
docs/node_modules
docs/.vitepress/cache
docs/.vitepress/dist
`

  if (!fs.existsSync(gitignorePath)) {
    fs.writeFileSync(gitignorePath, content.trim() + "\n")
  }

}

module.exports = { run }