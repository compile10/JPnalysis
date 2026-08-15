import { PROVIDER_MAP } from "@common/providers";
import type { Provider } from "@common/types";
import { withAuth } from "@/lib/api-auth";
import { corsPreflightResponse, jsonResponse } from "@/lib/cors";
import {
  DEFAULT_MODEL,
  DEFAULT_PROVIDER,
  getUserSettings,
  upsertUserSettings,
} from "@/lib/settings";
import { isValidModelId } from "@/lib/validation";

export async function OPTIONS() {
  return corsPreflightResponse();
}

const serverDefaults = { provider: DEFAULT_PROVIDER, model: DEFAULT_MODEL };

export const GET = withAuth("fetch settings", async (_request, session) => {
  const settings = await getUserSettings(session.user.id);

  if (settings) {
    return jsonResponse({ ...settings, defaults: serverDefaults });
  }

  const created = await upsertUserSettings(
    session.user.id,
    DEFAULT_PROVIDER,
    DEFAULT_MODEL,
  );
  return jsonResponse({ ...created, defaults: serverDefaults });
});

export const PUT = withAuth("update settings", async (request, session) => {
  const { provider, model } = await request.json();

  if (
    !provider ||
    typeof provider !== "string" ||
    !(provider in PROVIDER_MAP)
  ) {
    return jsonResponse({ error: "Invalid provider specified" }, 400);
  }

  if (!isValidModelId(model)) {
    return jsonResponse({ error: "Invalid model specified" }, 400);
  }

  const updated = await upsertUserSettings(
    session.user.id,
    provider as Provider,
    model,
  );
  return jsonResponse(updated);
});
