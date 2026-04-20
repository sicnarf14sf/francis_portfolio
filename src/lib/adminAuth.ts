import type { Session, SupabaseClient } from "@supabase/supabase-js";

type AdminAccessResult = {
  allowed: boolean;
  reason: string | null;
};

// Frontend admin access is intentionally delegated to Supabase.
// This keeps route protection aligned with the live DB/storage policies.
export const checkAdminAccess = async (
  supabase: SupabaseClient,
  session: Session | null,
): Promise<AdminAccessResult> => {
  if (!session?.user) {
    return { allowed: false, reason: "No active session." };
  }

  const { data, error } = await supabase.rpc("is_portfolio_admin");

  if (error) {
    return {
      allowed: false,
      reason:
        "Admin access could not be verified against Supabase. Check that the is_portfolio_admin function exists and is accessible.",
    };
  }

  return data
    ? { allowed: true, reason: null }
    : {
        allowed: false,
        reason: "This account is signed in, but it is not authorized by the live Supabase admin policy.",
      };
};
