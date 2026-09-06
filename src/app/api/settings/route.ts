import type { UserSettings } from "@common/types";
import { withAuth } from "@/lib/api-auth";
import { corsPreflightResponse, jsonResponse } from "@/lib/cors";
import { RATE_LIMIT_POLICIES } from "@/lib/rate-limit";
import { resolveSettings, upsertUserSettings } from "@/lib/settings";

export async function OPTIONS() {
  return corsPreflightResponse();
}

export const GET = withAuth(
  { name: "fetch settings", rateLimit: RATE_LIMIT_POLICIES.settings },
  async (_request, session) => {
    return jsonResponse(await resolveSettings(session));
  },
);

export const PUT = withAuth(
  { name: "update settings", rateLimit: RATE_LIMIT_POLICIES.settings },
  async (request, session) => {
    const settings: unknown = await request.json();
    // Accept only fields supported by the account settings API.
    if (
      !settings ||
      typeof settings !== "object" ||
      Array.isArray(settings) ||
      Object.keys(settings).length > 0
    ) {
      return jsonResponse(
        {
          error:
            "No account settings can be changed. Send an empty JSON object ({}).",
        },
        400,
      );
    }
    return jsonResponse(
      await upsertUserSettings(session.user.id, settings as UserSettings),
    );
  },
);
