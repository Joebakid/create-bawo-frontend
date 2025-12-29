export default function Page() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-background text-foreground">
      <div className="max-w-xl text-center space-y-6 px-6">
        <h1 className="text-4xl font-bold tracking-tight">
          Create Bawo Frontend
        </h1>

        <p className="text-lg text-muted-foreground">
          A zero-config frontend framework for modern developers.
        </p>

        <div className="flex justify-center gap-4 pt-2">
          <a
            href="/docs"
            className="rounded-md bg-primary px-4 py-2 text-primary-foreground"
          >
            Documentation
          </a>

          <a
            href="https://github.com/Joebakid/create-bawo-frontend"
            target="_blank"
            className="rounded-md border px-4 py-2"
          >
            GitHub
          </a>
        </div>

        <p className="pt-6 text-xs text-muted-foreground">
          Edit <code className="font-mono">app/page.tsx</code> to get started
        </p>
      </div>
    </main>
  );
}
