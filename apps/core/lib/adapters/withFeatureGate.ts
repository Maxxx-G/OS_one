import { isEnabled, Tier } from "@/apps/core/lib/profit/matrix";

type Handler = (req: Request) => Promise<Response> | Response;

export function withFeatureGate(tier: Tier, featureId: string, next: Handler): Handler {
  return async (req: Request) => {
    if (!isEnabled(tier, featureId)) {
      const message = { ok: false, error: `Feature ${featureId} not available for tier ${tier}` };
      return new Response(JSON.stringify(message), {
        status: 403,
        headers: { "content-type": "application/json" }
      });
    }
    return next(req);
  };
}
