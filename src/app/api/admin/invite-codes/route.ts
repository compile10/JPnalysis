import { withPermission } from "@/lib/api-auth";
import { corsPreflightResponse, jsonResponse } from "@/lib/cors";
import { createInviteCode, serializeInviteCode } from "@/lib/invites";
import { RATE_LIMIT_POLICIES } from "@/lib/rate-limit";

export async function OPTIONS() {
  return corsPreflightResponse();
}

export const POST = withPermission(
  {
    name: "generate invite code",
    permissions: { invite: ["create"] },
    rateLimit: RATE_LIMIT_POLICIES.inviteCodes,
  },
  async (_request, session) => {
    const inviteCode = await createInviteCode(session.user.id);

    return jsonResponse(
      {
        inviteCode: serializeInviteCode(inviteCode),
      },
      201,
    );
  },
);
