import { type JSX } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import ExperienceAdmin from "../components/admin/ExperienceAdmin";
import AboutAdmin from "../components/admin/AboutAdmin";
import RecommendationsAdmin from "../components/admin/RecommendationsAdmin";

export default function AdminDashboard(): JSX.Element {
  const navigate = useNavigate();

  const onLogout = async (): Promise<void> => {
    await supabase.auth.signOut();
    navigate("/admin", { replace: true });
  };

  return (
    <div className="min-h-screen px-5 py-10 md:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <p className="mt-1 text-sm text-gray-600">
              Manage your portfolio content for the home and About sections.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={(): void => {navigate("/")}}
              className="rounded-xl border bg-white px-4 py-2 text-sm font-semibold hover:bg-gray-50"
            >
              View site
            </button>
            <button
              onClick={(): void => void onLogout()}
              className="rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="mt-6 space-y-6">
          <AboutAdmin />
          <RecommendationsAdmin />
          <ExperienceAdmin />
        </div>
      </div>
    </div>
  );
}
