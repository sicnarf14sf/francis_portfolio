import { useEffect, useState, type JSX } from "react";
import { Navigate } from "react-router-dom";
import { checkAdminAccess } from "../../lib/adminAuth";
import { supabase } from "../../lib/supabaseClient";

type RequireAdminProps = { children: JSX.Element };

export default function RequireAdmin({ children }: RequireAdminProps): JSX.Element {
  const [loading, setLoading] = useState<boolean>(true);
  const [allowed, setAllowed] = useState<boolean>(false);

  useEffect((): (() => void) => {
    let mounted = true;

    const check = async (): Promise<void> => {
      // Always re-check against Supabase so stale sessions do not bypass the gate.
      const { data } = await supabase.auth.getSession();
      const access = await checkAdminAccess(supabase, data.session);

      if (!access.allowed && data.session) {
        await supabase.auth.signOut();
      }

      if (!mounted) return;
      setAllowed(access.allowed);
      setLoading(false);
    };

    void check();

    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      void check();
    });

    return (): void => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen px-5 py-10 md:px-8">
        <div className="mx-auto max-w-3xl text-sm text-gray-600">
          Checking admin access...
        </div>
      </div>
    );
  }

  if (!allowed) return <Navigate to="/admin" replace />;

  return children;
}
