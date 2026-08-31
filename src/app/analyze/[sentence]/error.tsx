"use client";

import ErrorFallback from "@/components/ErrorFallback";
import type { NextJSError } from "@/lib/utils";

export default function AnalysisError({
  error,
  reset,
}: {
  error: NextJSError;
  reset: () => void;
}) {
  return (
    <div className="w-full py-12">
      <ErrorFallback
        title="We couldn’t display this analysis"
        description="Try loading the analysis again, or head home to try another sentence."
        reset={reset}
        digest={error.digest}
      />
    </div>
  );
}
