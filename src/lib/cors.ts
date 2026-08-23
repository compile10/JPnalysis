import { NextResponse } from "next/server";

/**
 * Resolve the allowed origin for CORS.
 *
 * - Development: returns "*" (all origins allowed).
 * - Production: returns "" so the browser blocks any cross-origin request.
 *   Same-origin requests (the web app calling its own API) bypass CORS
 *   entirely. The mobile app uses native HTTP and ignores CORS headers.
 */
function getAllowedOrigin(): string {
  if (process.env.NODE_ENV !== "production") {
    return "*";
  }

  return "";
}

const corsHeaders = {
  "Access-Control-Allow-Origin": getAllowedOrigin(),
  "Access-Control-Allow-Methods": "GET, POST, PUT, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Expose-Headers":
    "Retry-After, X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset",
};

/** Convenience: JSON response with CORS headers attached. */
export function jsonResponse(
  data: unknown,
  status = 200,
  responseHeaders?: Record<string, string>,
) {
  return NextResponse.json(data, {
    status,
    headers: { ...corsHeaders, ...responseHeaders },
  });
}

/** Convenience: 204 preflight response with CORS headers. */
export function corsPreflightResponse() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}
