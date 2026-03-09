export default function Page() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-900 antialiased font-sans">
      <div className="w-full max-w-2xl px-6">
        
        {/* The Premium Elevated Card */}
        <div className="bg-white rounded-[2rem] border border-slate-200/60 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.08)] p-12 md:p-20 text-center space-y-10">
          
          <div className="space-y-4">
            <h1 className="text-4xl md:text-3xl font-black tracking-tighter text-slate-900 uppercase">
              Create-Bawo-Frontend
            </h1>
            <p className="text-slate-500 text-lg md:text-xl max-w-md mx-auto leading-relaxed font-medium">
              A zero-config CLI to scaffold modern frontend apps with elite-tier defaults.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="https://create-bawo-frontend.vercel.app/docs"
              target="_blank"
              className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-10 py-4 text-sm font-bold text-white hover:bg-slate-800 hover:-translate-y-0.5 transition-all duration-200 shadow-lg active:scale-95"
            >
              Get Started
            </a>

            <a
              href="https://github.com/Joebakid/create-bawo-frontend"
              target="_blank"
              className="inline-flex items-center justify-center rounded-xl border-2 border-slate-200 bg-transparent px-10 py-4 text-sm font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 active:scale-95"
            >
              GitHub
            </a>
          </div>

          <div className="pt-10 border-t border-slate-100/80">
            <p className="text-[10px] font-mono text-slate-400 uppercase tracking-[0.3em] font-bold">
              Build starts here — edit <span className="text-slate-900">app/page</span>
            </p>
          </div>

        </div>
      </div>
    </main>
  );
}