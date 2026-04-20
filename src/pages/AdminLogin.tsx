import { useState, type JSX } from "react";
import { useNavigate } from "react-router-dom";
import { checkAdminAccess } from "../lib/adminAuth";
import { supabase } from "../lib/supabaseClient";

export default function AdminLogin(): JSX.Element {
  const navigate = useNavigate();

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setLoading(false);
      setErrorMsg(error.message);
      return;
    }

    const access = await checkAdminAccess(supabase, data.session);

    if (!access.allowed) {
      await supabase.auth.signOut();
      setLoading(false);
      setErrorMsg(access.reason);
      return;
    }

    setLoading(false);
    navigate("/admin/dashboard", { replace: true });
  };

  return (
    <div className="min-h-screen px-5 py-10 md:px-8">
      <div className="mx-auto max-w-md overflow-hidden rounded-2xl border bg-white shadow-sm">
        <div className="border-b bg-gray-50 px-5 py-4">
          <h1 className="text-xl font-bold">Admin Login</h1>
          <p className="mt-1 text-xs text-gray-600">
            Sign in with an approved Supabase admin account.
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4 px-5 py-5">
          <div>
            <label className="text-xs font-semibold text-gray-700">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e): void => setEmail(e.target.value)}
              className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
              placeholder="you@email.com"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-700">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e): void => setPassword(e.target.value)}
              className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
              placeholder="Password"
            />
          </div>

          {errorMsg ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
              {errorMsg}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>

          <button
            type="button"
            onClick={(): void => {
              navigate("/");
            }}
            className="w-full rounded-xl border bg-white px-4 py-2 text-sm font-semibold hover:bg-gray-50"
          >
            Back to site
          </button>
        </form>
      </div>
    </div>
  );
}
