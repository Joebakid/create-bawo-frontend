# create-bawo-frontend

⚡ A zero-config CLI to scaffold modern **React (Vite)** or **Next.js** projects with **Tailwind CSS**, **state management**, **Prettier**, and optional extras like **shadcn/ui**, **Framer Motion**, and **GSAP** — all in one command.

[![npm version](https://badge.fury.io/js/create-bawo-frontend.svg)](https://badge.fury.io/js/create-bawo-frontend)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## ✨ Features

- 🚀 **React (Vite)** or **Next.js** starter templates
- 🎨 **Tailwind CSS v3.4** preconfigured with optimal settings
- 🗂 **State Management Options**: Zustand, Redux Toolkit, RTK Query, React Query, SWR, Context API + useReducer
- 💅 **Prettier + Tailwind plugin** for consistent code formatting
- 🧩 Optional **shadcn/ui** component library setup
- 🎥 Optional **Framer Motion** + **GSAP** with demo components
- 🔥 **Auto-start dev server** for immediate development
- 📦 **Zero configuration** - works out of the box
- 🎯 **TypeScript support** with proper configurations
 

---

## 🚀 Quick Start

You don't need to install globally. Just use `npx`:

```bash
npx create-bawo-frontend my-app -y
cd my-app
npm run dev
```

That's it! Your development server will start automatically.

---

## 📦 Installation & Usage

### Basic Usage

```bash
npx create-bawo-frontend <project-name> [options]
```

### Interactive Mode

```bash
npx create-bawo-frontend my-app
```

The CLI will prompt you to choose your preferred options.

### Quick Mode (Skip Prompts)

```bash
npx create-bawo-frontend my-app -y
```

Uses sensible defaults and starts the dev server automatically.

---

## ⚙️ CLI Options

| Option                                                              | Description                             | Default   |
| ------------------------------------------------------------------- | --------------------------------------- | --------- |
| `--framework react\|next`                                           | Choose framework                        | `react`   |
| `--ts`                                                              | Use TypeScript                          | `false`   |
| `--state-mgmt zustand\|redux\|rtk-query\|react-query\|swr\|context` | Choose state management                 | `zustand` |
| `--ui shadcn`                                                       | Add shadcn/ui preset                    | `false`   |
| `--framer`                                                          | Add Framer Motion + demo                | `false`   |
| `--gsap`                                                            | Add GSAP + demo                         | `false`   |
| `--no-start`                                                        | Prevent auto-start dev server           | `false`   |
| `-y, --yes`                                                         | Skip prompts, use defaults + auto-start | `false`   |
| `-h, --help`                                                        | Show help message                       | -         |
| `-v, --version`                                                     | Show CLI version                        | -         |

---

## 🎯 Usage Examples

### React with TypeScript and Redux Toolkit

```bash
npx create-bawo-frontend my-app --framework react --ts --state-mgmt redux -y
```

### Next.js with React Query and animations

```bash
npx create-bawo-frontend my-app --framework next --state-mgmt react-query --framer --gsap -y
```

### Full-featured setup with RTK Query

```bash
npx create-bawo-frontend my-app --framework next --ts --state-mgmt rtk-query --ui shadcn --framer --gsap -y
```

---

## 🛠 What's Included

### Core Dependencies

- **React 18** or **Next.js 14** (App Router)
- **Vite** (for React projects)
- **Tailwind CSS v3.4** with JIT compilation
- **State Management** (your choice of library)
- **Prettier** with Tailwind CSS plugin

### State Management Options

- **Zustand (lightweight)** - Simple, unopinionated state management
- **Redux Toolkit** - Modern Redux with less boilerplate
- **RTK Query** - Data fetching and caching built on Redux Toolkit
- **React Query** - Powerful data synchronization for React
- **SWR** - Data fetching with caching, revalidation, and more
- **Context API + useReducer** - Built-in React state management

### Pre-configured Features

- ✅ Tailwind CSS with custom configuration
- ✅ State management store with persistence and devtools (where applicable)
- ✅ Prettier formatting rules
- ✅ TypeScript configuration (when enabled)
- ✅ Demo components for animations
- ✅ Responsive design utilities

### State Management Store

The included store template provides:

- State persistence with localStorage (Zustand, Redux)
- DevTools integration (where supported)
- TypeScript support
- Example actions and selectors
- API integration examples (RTK Query, React Query, SWR)

---

## 🧑‍💻 Author

**Joseph Bawo**  
_Scaffolding the future of frontend development_

- GitHub: [@Joebakid](https://github.com/Joebakid)
- npm: [josephbawo](https://www.npmjs.com/~josephbawo)
- Website: [https://www.josephbawo.tech/blog/blog4](https://www.josephbawo.tech/blog/significance-of-npx-create-bawo-frontend)

---

## 🙏 Acknowledgments

- [Vite](https://vitejs.dev/) for the blazing fast build tool
- [Next.js](https://nextjs.org/) for the React framework
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS
- [Zustand](https://github.com/pmndrs/zustand) for simple state management
- [Redux Toolkit](https://redux-toolkit.js.org/) for modern Redux
- [RTK Query](https://redux-toolkit.js.org/rtk-query/overview) for data fetching
- [React Query](https://tanstack.com/query/) for powerful data synchronization
- [SWR](https://swr.vercel.app/) for data fetching with caching
- [shadcn/ui](https://ui.shadcn.com/) for beautiful components

---

<div align="center">
  <p>Made with ❤️ by Joseph Bawo</p>
  <p>⭐ Star this repo if you find it helpful!</p>
</div>
