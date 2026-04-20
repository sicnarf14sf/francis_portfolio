import { lazy, Suspense, type JSX } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import RequireAdmin from "./components/admin/RequireAdmin";
import HomePage from "./pages/HomePage";

// Route map:
// - "/" stays in the main bundle for the fastest first load
// - secondary pages are lazy-loaded to keep the homepage lighter
// - see docs/CODEBASE_GUIDE.md for the fuller project tree and data flow

const AboutPage = lazy(() => import("./pages/AboutPage"));
const ExperienceDetailsPage = lazy(() => import("./pages/ExperienceDetailsPage"));
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));

function RouteFallback(): JSX.Element {
  return (
    <div className="min-h-screen px-5 py-10 md:px-8">
      <div className="mx-auto max-w-6xl text-sm text-foreground/70">Loading...</div>
    </div>
  );
}

export default function App(): JSX.Element {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />

        <Route path="/experience/:id" element={<ExperienceDetailsPage />} />

        <Route path="/admin" element={<AdminLogin />} />
        <Route
          path="/admin/dashboard"
          element={
            <RequireAdmin>
              <AdminDashboard />
            </RequireAdmin>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
