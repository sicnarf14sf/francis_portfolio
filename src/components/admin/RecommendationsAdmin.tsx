import { useEffect, useState, type JSX } from "react";
import { supabase } from "../../lib/supabaseClient";

type DbRecommendation = {
  id: string;
  name: string;
  role: string | null;
  organization: string | null;
  recommendation: string;
  sort_order: number;
  created_at?: string;
};

const getErrorMessage = (error: unknown, fallback: string): string => {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  if (typeof error === "object" && error !== null && "message" in error) {
    const maybe = error as { message?: unknown };
    if (typeof maybe.message === "string" && maybe.message.trim()) {
      return maybe.message;
    }
  }

  return fallback;
};

export default function RecommendationsAdmin(): JSX.Element {
  const [items, setItems] = useState<DbRecommendation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [name, setName] = useState<string>("");
  const [role, setRole] = useState<string>("");
  const [organization, setOrganization] = useState<string>("");
  const [recommendation, setRecommendation] = useState<string>("");
  const [sortOrder, setSortOrder] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [busy, setBusy] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const loadRecommendations = async (): Promise<void> => {
    setLoading(true);
    setErrorMsg(null);

    const { data, error } = await supabase
      .from("recommendations")
      .select("id, name, role, organization, recommendation, sort_order, created_at")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });

    setLoading(false);

    if (error) {
      setErrorMsg(error.message);
      return;
    }

    setItems((data ?? []) as DbRecommendation[]);
  };

  useEffect((): void => {
    void loadRecommendations();
  }, []);

  const clearForm = (): void => {
    setSelectedId(null);
    setName("");
    setRole("");
    setOrganization("");
    setRecommendation("");
    setSortOrder(0);
    setSuccessMsg(null);
  };

  const loadIntoForm = (item: DbRecommendation): void => {
    setSelectedId(item.id);
    setName(item.name);
    setRole(item.role ?? "");
    setOrganization(item.organization ?? "");
    setRecommendation(item.recommendation);
    setSortOrder(item.sort_order);
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  const onSave = async (): Promise<void> => {
    if (!name.trim() || !recommendation.trim()) {
      setErrorMsg("Name and recommendation are required.");
      return;
    }

    setBusy(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const payload = {
        name: name.trim(),
        role: role.trim() || null,
        organization: organization.trim() || null,
        recommendation: recommendation.trim(),
        sort_order: sortOrder,
      };

      if (selectedId) {
        const { error } = await supabase
          .from("recommendations")
          .update(payload)
          .eq("id", selectedId);
        if (error) throw error;
        setSuccessMsg("Recommendation updated.");
      } else {
        const { error } = await supabase.from("recommendations").insert(payload);
        if (error) throw error;
        setSuccessMsg("Recommendation added.");
      }

      clearForm();
      await loadRecommendations();
    } catch (error) {
      setErrorMsg(getErrorMessage(error, "Recommendation save failed."));
    } finally {
      setBusy(false);
    }
  };

  const onDelete = async (item: DbRecommendation): Promise<void> => {
    const confirmed = window.confirm(
      `Delete this recommendation?\n\n"${item.name}"\n\nThis action cannot be undone.`,
    );
    if (!confirmed) return;

    setBusy(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const { error } = await supabase
        .from("recommendations")
        .delete()
        .eq("id", item.id);
      if (error) throw error;

      if (selectedId === item.id) clearForm();
      await loadRecommendations();
      setSuccessMsg("Recommendation deleted.");
    } catch (error) {
      setErrorMsg(getErrorMessage(error, "Delete failed."));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h2 className="text-base font-semibold text-gray-900">Recommendations</h2>
          <p className="mt-1 text-xs text-gray-500">
            Manage homepage recommendations and keep the section concise.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={(): void => void loadRecommendations()}
            className="rounded-lg border bg-white px-3 py-2 text-xs font-semibold hover:bg-gray-50"
          >
            Refresh
          </button>
          <button
            type="button"
            onClick={clearForm}
            className="rounded-lg border bg-white px-3 py-2 text-xs font-semibold hover:bg-gray-50"
          >
            New recommendation
          </button>
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <div className="rounded-xl border bg-gray-50 p-3">
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500">
            Total
          </div>
          <div className="mt-2 text-2xl font-bold text-gray-900">{items.length}</div>
        </div>
        <div className="rounded-xl border bg-gray-50 p-3">
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500">
            Editing
          </div>
          <div className="mt-2 text-sm font-semibold text-gray-900">
            {selectedId ? name || "Selected recommendation" : "No item selected"}
          </div>
        </div>
        <div className="rounded-xl border bg-gray-50 p-3">
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500">
            Tip
          </div>
          <p className="mt-2 text-sm text-gray-700">
            Lower sort order values appear earlier on the homepage.
          </p>
        </div>
      </div>

      {errorMsg ? (
        <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {errorMsg}
        </div>
      ) : null}

      {successMsg ? (
        <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          {successMsg}
        </div>
      ) : null}

      <div className="mt-4 grid grid-cols-1 gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-3 rounded-xl border bg-gray-50/70 p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm font-semibold text-gray-900">
              {selectedId ? "Edit recommendation" : "Create recommendation"}
            </div>
            {selectedId ? (
              <span className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-700">
                Editing existing item
              </span>
            ) : null}
          </div>

          <input
            className="w-full rounded-lg border bg-white px-3 py-2 text-sm"
            placeholder="Name"
            value={name}
            onChange={(e): void => setName(e.target.value)}
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              className="w-full rounded-lg border bg-white px-3 py-2 text-sm"
              placeholder="Role"
              value={role}
              onChange={(e): void => setRole(e.target.value)}
            />
            <input
              className="w-full rounded-lg border bg-white px-3 py-2 text-sm"
              placeholder="Organization"
              value={organization}
              onChange={(e): void => setOrganization(e.target.value)}
            />
          </div>
          <textarea
            className="w-full rounded-lg border bg-white px-3 py-2 text-sm"
            rows={5}
            placeholder="Recommendation"
            value={recommendation}
            onChange={(e): void => setRecommendation(e.target.value)}
          />
          <div className="flex items-center justify-between gap-3">
            <input
              className="w-full rounded-lg border bg-white px-3 py-2 text-sm"
              type="number"
              placeholder="Sort order"
              value={sortOrder}
              onChange={(e): void => setSortOrder(Number(e.target.value))}
            />
            <div className="min-w-fit text-xs text-gray-500">
              {recommendation.trim().length} chars
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={(): void => void onSave()}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                busy
                  ? "cursor-not-allowed bg-gray-200 text-gray-500"
                  : "bg-gray-900 text-white hover:opacity-90"
              }`}
            >
              {selectedId ? "Update recommendation" : "Add recommendation"}
            </button>
            <button
              type="button"
              onClick={clearForm}
              className="rounded-lg border bg-white px-4 py-2 text-sm font-semibold hover:bg-gray-50"
            >
              Clear
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {loading ? (
            <div className="rounded-lg border bg-gray-50 p-4 text-sm text-gray-600">
              Loading recommendations...
            </div>
          ) : items.length === 0 ? (
            <div className="rounded-lg border bg-gray-50 p-4 text-sm text-gray-600">
              No recommendations saved yet.
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className={`rounded-xl border p-3 transition ${
                  selectedId === item.id ? "border-gray-900 bg-gray-50" : "bg-white"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="font-semibold">{item.name}</div>
                      <span className="rounded-full border bg-white px-2 py-0.5 text-[11px] font-medium text-gray-600">
                        order {item.sort_order}
                      </span>
                    </div>
                    <div className="mt-1 text-xs text-gray-500">
                      {[item.role, item.organization].filter(Boolean).join(" | ")}
                    </div>
                    <p className="mt-2 text-sm text-gray-700">{item.recommendation}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={(): void => loadIntoForm(item)}
                      className="rounded-lg border bg-white px-2.5 py-1 text-xs font-semibold hover:bg-gray-50"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={(): void => void onDelete(item)}
                      className="rounded-lg border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700 hover:bg-red-100"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
