"use client";

import ErrorFallback from "@/components/ErrorFallback";
import type { NextJSError } from "@/lib/utils";

export default function AppError({
  error,
  reset,
}: {
  error: NextJSError;
  reset: () => void;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <ErrorFallback
        title="Something went wrong"
        description="Kaitai couldn’t load this page. Try again, or head home to start over."
        reset={reset}
        digest={error.digest}
      />
    </main>
  );
}
