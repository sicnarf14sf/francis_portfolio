import { type JSX } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import HomeAdmin from "../components/admin/HomeAdmin";
import ExperienceAdmin from "../components/admin/ExperienceAdmin";
import AboutAdmin from "../components/admin/AboutAdmin";
import RecommendationsAdmin from "../components/admin/RecommendationsAdmin";

const sectionLinks = [
  { href: "#admin-home", label: "Home" },
  { href: "#admin-about", label: "About" },
  { href: "#admin-recommendations", label: "Recommendations" },
  { href: "#admin-experience", label: "Experience" },
];

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
            <div className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-700">
              Supabase-protected admin session
            </div>
            <h1 className="mt-3 text-2xl font-bold">Admin Dashboard</h1>
            <p className="mt-1 text-sm text-gray-600">
              Manage your portfolio content for the public site without touching the
              database manually.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={(): void => {
                navigate("/");
              }}
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

        <div className="mt-6 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-900">How this admin works</h2>
            <div className="mt-3 grid gap-3 md:grid-cols-3">
              <div className="rounded-xl border bg-gray-50 p-3">
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500">
                  Auth
                </div>
                <p className="mt-2 text-sm text-gray-700">
                  Login is verified against Supabase, not just hidden frontend routes.
                </p>
              </div>
              <div className="rounded-xl border bg-gray-50 p-3">
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500">
                  Data
                </div>
                <p className="mt-2 text-sm text-gray-700">
                  Changes here update the live portfolio content shown to visitors.
                </p>
              </div>
              <div className="rounded-xl border bg-gray-50 p-3">
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500">
                  Safety
                </div>
                <p className="mt-2 text-sm text-gray-700">
                  Upload checks run in the UI, then Supabase policies enforce the real rules.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-900">Quick jump</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {sectionLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="rounded-xl border bg-white px-3 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                >
                  {link.label}
                </a>
              ))}
            </div>
            <p className="mt-4 text-xs leading-5 text-gray-500">
              Tip: update content in small batches so it is easier to confirm what
              changed on the public site.
            </p>
          </div>
        </div>

        <div className="mt-6 space-y-6">
          <section id="admin-home" className="scroll-mt-24">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Home</h2>
                <p className="text-sm text-gray-500">
                  Homepage hero image and first-impression content controls.
                </p>
              </div>
            </div>
            <HomeAdmin />
          </section>

          <section id="admin-about" className="scroll-mt-24">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">About Content</h2>
                <p className="text-sm text-gray-500">
                  About page text, photos, certificates, and sample outputs.
                </p>
              </div>
            </div>
            <AboutAdmin />
          </section>

          <section id="admin-recommendations" className="scroll-mt-24">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Recommendations
                </h2>
                <p className="text-sm text-gray-500">
                  Short endorsements displayed on the homepage.
                </p>
              </div>
            </div>
            <RecommendationsAdmin />
          </section>

          <section id="admin-experience" className="scroll-mt-24">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Experience</h2>
                <p className="text-sm text-gray-500">
                  Experience entries, thumbnails, and gallery images.
                </p>
              </div>
            </div>
            <ExperienceAdmin />
          </section>
        </div>
      </div>
    </div>
  );
}
