/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",

    // App directories (Next / future frameworks)
    "./app/**/*.{js,ts,jsx,tsx,vue,svelte}",

    // Source files
    "./src/**/*.{js,ts,jsx,tsx,vue,svelte}",

    // Reusable components
    "./components/**/*.{js,ts,jsx,tsx,vue,svelte}",
  ],

  theme: {
    extend: {},
  },

  plugins: [],
};