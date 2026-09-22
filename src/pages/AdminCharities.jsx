import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Heart,
  Loader2,
  Star,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { supabase } from "../lib/supabase";

function AdminCharities() {
  const navigate = useNavigate();

  const [charities, setCharities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    checkAdminAndLoad();
  }, []);

  const checkAdminAndLoad = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        navigate("/login");
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("admin")
        .eq("id", user.id)
        .single();

      if (profileError) throw profileError;

      if (profile?.admin !== "admin") {
        navigate("/dashboard");
        return;
      }

      await loadCharities();
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadCharities = async () => {
    const { data, error } = await supabase
      .from("charities")
      .select("*")
      .order("featured", { ascending: false })
      .order("name", { ascending: true });

    if (error) throw error;

    setCharities(data || []);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin" />
          Loading charities...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-950">
      <nav className="bg-slate-950 text-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="h-20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-400 flex items-center justify-center">
                <Heart className="w-5 h-5 text-slate-950" />
              </div>

              <div>
                <div className="font-bold text-xl">
                  Charity Management
                </div>
                <div className="text-xs text-slate-400">
                  Digital Heroes Admin
                </div>
              </div>
            </div>

            <button
              onClick={() => navigate("/admin")}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/15 hover:bg-white/10 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              Admin Dashboard
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-10">
        <div className="mb-8">
          <p className="text-sm font-semibold text-rose-600 uppercase tracking-wider">
            Administration
          </p>

          <h1 className="text-4xl font-bold mt-2">
            Charity directory
          </h1>

          <p className="text-slate-500 mt-3">
            Monitor featured and active charities available to subscribers.
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 rounded-2xl px-5 py-4">
            {error}
          </div>
        )}

        <div className="grid sm:grid-cols-3 gap-5 mb-8">
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <div className="text-sm text-slate-500">
              Total charities
            </div>
            <div className="text-3xl font-bold mt-2">
              {charities.length}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <div className="text-sm text-slate-500">
              Active
            </div>
            <div className="text-3xl font-bold mt-2">
              {charities.filter((c) => c.active !== false).length}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <div className="text-sm text-slate-500">
              Featured
            </div>
            <div className="text-3xl font-bold mt-2">
              {charities.filter((c) => c.featured === true).length}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-2xl font-bold">
              Charity organisations
            </h2>
          </div>

          {charities.length === 0 ? (
            <div className="p-10 text-center text-slate-500">
              No charities found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px]">
                <thead className="bg-slate-50">
                  <tr className="text-left text-sm text-slate-500">
                    <th className="px-6 py-4">Charity</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Featured</th>
                    <th className="px-6 py-4">Website</th>
                  </tr>
                </thead>

                <tbody>
                  {charities.map((charity) => (
                    <tr
                      key={charity.id}
                      className="border-t border-slate-100"
                    >
                      <td className="px-6 py-5">
                        <div className="font-semibold">
                          {charity.name}
                        </div>

                        {charity.description && (
                          <div className="text-sm text-slate-500 max-w-md mt-1">
                            {charity.description}
                          </div>
                        )}
                      </td>

                      <td className="px-6 py-5">
                        {charity.category || "General"}
                      </td>

                      <td className="px-6 py-5">
                        {charity.active !== false ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">
                            <CheckCircle2 className="w-3 h-3" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-bold">
                            <XCircle className="w-3 h-3" />
                            Inactive
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-5">
                        {charity.featured ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-bold">
                            <Star className="w-3 h-3" />
                            Featured
                          </span>
                        ) : (
                          <span className="text-slate-400">
                            No
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-5">
                        {charity.website ? (
                          <a
                            href={charity.website}
                            target="_blank"
                            rel="noreferrer"
                            className="text-emerald-600 font-semibold hover:underline"
                          >
                            Visit
                          </a>
                        ) : (
                          "—"
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default AdminCharities;