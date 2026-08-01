import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import type { Permissions } from "@/lib/auth-permissions";
import { jsonResponse } from "@/lib/cors";

export type Session = typeof auth.$Infer.Session;

/** The handler a route author writes; `S` says whether a session is guaranteed. */
type Handler<S extends Session | null> = (
  request: NextRequest,
  session: S,
) => Promise<Response>;

/** What a wrapper hands back: the value assigned to `export const GET`. */
type RouteExport = (request: NextRequest) => Promise<Response>;

/**
 * Run `handler`, turning anything it throws into a logged 500.
 *
 * Responses the handler *returns* pass through untouched, so routes keep
 * emitting their own 4xx/5xx (validation failures, upstream errors) directly.
 */
async function catchingErrors(
  label: string,
  handler: () => Promise<Response>,
): Promise<Response> {
  try {
    return await handler();
  } catch (error) {
    console.error(`[api] Failed to ${label}:`, error);
    return jsonResponse({ error: `Failed to ${label}` }, 500);
  }
}

/**
 * Wrap a route that works signed in or signed out; the handler receives the
 * session or null and decides what an anonymous caller gets.
 */
export function withOptionalAuth(
  label: string,
  handler: Handler<Session | null>,
): RouteExport {
  return (request) =>
    catchingErrors(label, async () => {
      const session = await auth.api.getSession({ headers: request.headers });
      return handler(request, session);
    });
}

/** Wrap a route that requires a session, responding 401 when there is none. */
export function withAuth(
  label: string,
  handler: Handler<Session>,
): RouteExport {
  return withOptionalAuth(label, async (request, session) => {
    if (!session) {
      return jsonResponse({ error: "Authentication required" }, 401);
    }
    return handler(request, session);
  });
}

/**
 * Wrap a route that requires a session holding `permissions`, responding 401
 * when signed out and 403 when the session's role lacks them.
 */
export function withPermission(
  label: string,
  permissions: Permissions,
  handler: Handler<Session>,
): RouteExport {
  return withAuth(label, async (request, session) => {
    const { success } = await auth.api.userHasPermission({
      body: { userId: session.user.id, permissions },
    });

    if (!success) {
      return jsonResponse({ error: "Permission denied" }, 403);
    }

    return handler(request, session);
  });
}
