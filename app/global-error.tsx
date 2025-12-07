"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to console in development
    console.error("Global error:", error);
  }, [error]);

  return (
    <html lang="en" className="dark">
      <body className="bg-[rgb(3,7,18)] text-white font-mono min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold">Something went wrong</h1>
            <p className="text-gray-400">
              An unexpected error occurred. We&apos;ve been notified and are looking into it.
            </p>
          </div>

          {error.digest && (
            <p className="text-xs text-gray-500">Error ID: {error.digest}</p>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={reset}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-md transition-colors"
            >
              Try again
            </button>
            <a
              href="/"
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors"
            >
              Go home
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
