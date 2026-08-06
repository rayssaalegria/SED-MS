import type { GovernmentApiClient } from "@/lib/integrations/types";

/** Stub preparado para APIs governamentais futuras. */
export const governmentApiStub: GovernmentApiClient = {
  async healthCheck() {
    return { ok: true, provider: "stub" };
  },
};
