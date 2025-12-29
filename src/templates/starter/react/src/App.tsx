export default function App() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
      <div className="max-w-xl text-center space-y-6 px-6">
        <h1 className="text-4xl font-bold">Create Bawo Frontend</h1>

        <p className="text-slate-400 text-lg">
          A zero-config frontend framework for modern developers.
        </p>

        <div className="flex justify-center gap-4 pt-2">
          <a
            href="/docs"
            className="rounded-md bg-indigo-600 px-4 py-2"
          >
            Documentation
          </a>

          <a
            href="https://github.com/Joebakid/create-bawo-frontend"
            target="_blank"
            className="rounded-md border border-slate-700 px-4 py-2"
          >
            GitHub
          </a>
        </div>

        <p className="pt-6 text-xs text-slate-500">
          Edit <code className="font-mono">src/App.tsx</code> to get started
        </p>
      </div>
    </main>
  );
}
