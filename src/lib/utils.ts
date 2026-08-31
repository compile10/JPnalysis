import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/** Error passed to a Next.js boundary, with an optional server error digest. */
export type NextJSError = Error & { digest?: string };

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
