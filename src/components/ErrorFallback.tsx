import logo from "@common/assets/branding/logo.svg";
import Image from "next/image";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface ErrorFallbackProps {
  title: ReactNode;
  description: string;
  reset?: () => void;
  digest?: string;
}

/** No app providers or session access: also used outside the root layout. */
export default function ErrorFallback({
  title,
  description,
  reset,
  digest,
}: ErrorFallbackProps) {
  return (
    <section
      aria-labelledby="error-title"
      className="mx-auto flex w-full max-w-md flex-col items-center text-center"
    >
      <Image
        src={logo}
        alt="Kaitai 解体"
        width={360}
        height={92}
        className="h-auto w-56 sm:w-72"
        priority
      />
      <h1
        id="error-title"
        className="mt-8 text-2xl font-semibold text-foreground"
      >
        {title}
      </h1>
      <p className="mt-3 text-muted-foreground">{description}</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        {reset && (
          <Button type="button" onClick={reset}>
            Try again
          </Button>
        )}
        <Button variant={reset ? "outline" : "default"} asChild>
          {/* A full navigation also recovers from broken client/provider state. */}
          <a href="/">Back to home</a>
        </Button>
      </div>
      {digest && (
        <p className="mt-6 break-all text-xs text-muted-foreground">
          Error reference: {digest}
        </p>
      )}
    </section>
  );
}
