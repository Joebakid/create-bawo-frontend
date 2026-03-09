<template>
  <main class="min-h-screen flex items-center justify-center bg-slate-50 text-slate-900 antialiased">
    <div class="w-full max-w-2xl px-6">

      <div class="bg-white rounded-3xl border border-slate-200 shadow-[0_20px_50px_rgba(0,0,0,0.05)] p-10 md:p-16 text-center space-y-8">

        <div class="space-y-4">
          <h1 class="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 uppercase">
            Create-Bawo-Frontend
          </h1>

          <p class="text-slate-600 text-lg max-w-md mx-auto leading-relaxed">
            A zero-config CLI to scaffold modern React (Vite), Next.js, and Vue
            apps with Tailwind CSS and best practices.
          </p>
        </div>

        <div class="flex flex-wrap justify-center gap-4 pt-2">
          <a
            href="https://create-bawo-frontend.vercel.app/docs"
            target="_blank"
            class="inline-flex items-center justify-center rounded-lg bg-slate-900 px-8 py-3 text-sm font-semibold text-white hover:bg-slate-800 transition-all"
          >
            Get Started
          </a>

          <a
            href="https://github.com/Joebakid/create-bawo-frontend"
            target="_blank"
            class="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-8 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all"
          >
            GitHub
          </a>
        </div>

        <div class="pt-6 border-t border-slate-100">
          <p class="text-xs font-mono text-slate-400 uppercase tracking-widest">
            Edit <span class="text-slate-900 font-bold">src/App.vue</span> to get started
          </p>
        </div>

      </div>
    </div>
  </main>
</template>