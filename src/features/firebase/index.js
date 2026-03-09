const fs = require("fs")
const path = require("path")

async function run(projectDir) {

  const file = path.join(projectDir, "src/lib/firebase.js")

  fs.mkdirSync(path.dirname(file), { recursive: true })

  fs.writeFileSync(
    file,
`import { initializeApp } from "firebase/app"

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
}

export const app = initializeApp(firebaseConfig)
`
  )

  return {
    deps: ["firebase"]
  }
}

module.exports = { run }