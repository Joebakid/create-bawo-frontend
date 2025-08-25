# create-bawo-frontend

⚡ A zero-config CLI to scaffold modern **React (Vite)** or **Next.js** projects with **Tailwind CSS**, **Zustand**, **Prettier**, and optional extras like **shadcn/ui**, **Framer Motion**, and **GSAP** — all in one command.

---

## ✨ Features

- 🚀 **React (Vite)** or **Next.js** starter templates
- 🎨 **Tailwind CSS v3.4** preconfigured
- 🗂 **Zustand** state management (with persist + devtools)
- 💅 **Prettier + Tailwind plugin** by default
- 🧩 Optional **shadcn/ui** setup
- 🎥 Optional **Framer Motion** + **GSAP** demo components
- 🔥 **Auto-start dev server** when using `-y`

---

## 📦 Installation

You don’t need to install globally. Just use `npx`:

```bash
npx create-bawo-frontend my-app
```

## ⚙️ CLI Options

```text
--framework react|next   Choose framework (default: react)
--ts                     Use TypeScript (default: JavaScript)
--ui shadcn              Add shadcn/ui preset
--framer                 Add framer-motion + demo
--gsap                   Add GSAP + demo
--no-start               Prevent auto-start (useful in CI)
-y, --yes                Skip prompts; defaults + auto-start dev server
-h, --help               Show this help
-v, --version            Show CLI version
```

🚀 Quick Start
Default (React + Vite + JS)

```bash
npx create-bawo-frontend my-app -y
```

```bash
cd my-app
```

```bash
npm run dev
```

Next.js + TypeScript + shadcn/ui

```bash
npx create-bawo-frontend my-next -y --framework next --ts --ui shadcn
```

React + TS + Framer + GSAP

```bash
npx create-bawo-frontend motion-lab -y --ts --framer --gsap
```

## 🗂 Project Structure (React Example)

```text
my-app/
├── index.html
├── package.json
├── postcss.config.cjs
├── tailwind.config.cjs
├── tsconfig.json (if TS)
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── styles/
│   │   └── index.css
│   ├── stores/
│   │   └── useAppStore.ts
│   └── components/demo/
│       ├── FramerDemo.tsx
│       └── GsapDemo.tsx




```

🧑‍💻 Author

Joseph Bawo
Scaffolding the future of frontend 🚀

GitHub: [joebakid](https://github.com/Joebakid/create-bawo-frontend)

npm: [josephbawo](https://www.npmjs.com/~josephbawo)
