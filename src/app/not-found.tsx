import type { Metadata } from "next";
import ErrorFallback from "@/components/ErrorFallback";

export const metadata: Metadata = {
  title: "404 - Page not found — Kaitai (解体)",
};

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <ErrorFallback
        title={
          <>
            <span className="text-orange-600 dark:text-orange-400">404</span> -
            Page not found
          </>
        }
        description="We couldn't find a page with this link."
      />
    </main>
  );
}
