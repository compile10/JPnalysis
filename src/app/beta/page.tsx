import logo from "@common/assets/branding/logo.svg";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import SignInDialog from "@/components/SignInDialog";

export const metadata: Metadata = {
  title: "Invite-only beta — Kaitai (解体)",
  description:
    "Kaitai is in invite-only beta. Sign in, or use an invite code to create an account.",
};

export default function BetaPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <main className="flex w-full max-w-md flex-col items-center text-center">
        <Image
          src={logo}
          alt="Kaitai 解体"
          width={360}
          height={92}
          className="h-auto w-56 sm:w-72"
          priority
        />

        <p className="mt-8 text-lg text-foreground">
          Kaitai is in invite-only beta.
        </p>
        <p className="mt-2 text-muted-foreground">
          You&apos;ll need an invite code to create an account. Already have
          one? Sign up below.
        </p>

        <div className="mt-8 flex items-center gap-2">
          <SignInDialog />
          <Link
            href="/sign-up"
            className="text-sm px-4 py-1.5 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-md transition-colors"
          >
            Sign up
          </Link>
        </div>
      </main>
    </div>
  );
}
