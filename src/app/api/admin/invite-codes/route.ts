import { withPermission } from "@/lib/api-auth";
import { corsPreflightResponse, jsonResponse } from "@/lib/cors";
import { createInviteCode, serializeInviteCode } from "@/lib/invites";

export async function OPTIONS() {
  return corsPreflightResponse();
}

export const POST = withPermission(
  "generate invite code",
  { invite: ["create"] },
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
