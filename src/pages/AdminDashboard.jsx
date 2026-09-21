import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Loader2,
  Play,
  Send,
  Trophy,
} from "lucide-react";
import { supabase } from "../lib/supabase";

function AdminDashboard() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [draws, setDraws] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [drawMonth, setDrawMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );

  const [prizePool, setPrizePool] = useState("1000");
  const [drawType, setDrawType] = useState("random");

  useEffect(() => {
    checkAdmin();
  }, []);

  const checkAdmin = async () => {
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
        .select("role")
        .eq("id", user.id)
        .single();

      if (profileError) throw profileError;

      if (profile?.role !== "admin") {
        navigate("/dashboard");
        return;
      }

      await loadDraws();
    } catch (err) {
      console.error(err);
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const loadDraws = async () => {
    const { data, error: drawError } = await supabase
      .from("draws")
      .select("*")
      .order("draw_month", { ascending: false });

    if (drawError) {
      setError(drawError.message);
      return;
    }

    setDraws(data || []);
  };

  const generateNumbers = () => {
    const numbers = [];

    while (numbers.length < 5) {
      const number = Math.floor(Math.random() * 45) + 1;

      if (!numbers.includes(number)) {
        numbers.push(number);
      }
    }

    return numbers.sort((a, b) => a - b);
  };

  const createDraw = async () => {
    setSaving(true);
    setMessage("");
    setError("");

    try {
      if (!drawMonth) {
        setError("Please select a draw month.");
        return;
      }

      const pool = Number(prizePool);

      if (!pool || pool <= 0) {
        setError("Prize pool must be greater than 0.");
        return;
      }

      const drawDate = `${drawMonth}-01`;

      const { data: existingDraw } = await supabase
        .from("draws")
        .select("id")
        .eq("draw_month", drawDate)
        .maybeSingle();

      if (existingDraw) {
        setError("A draw already exists for this month.");
        return;
      }

      const numbers = generateNumbers();

      const { error: insertError } = await supabase
        .from("draws")
        .insert({
          draw_month: drawDate,
          numbers,
          draw_type: drawType,
          prize_pool: pool,
          jackpot_rollover: 0,
          status: "draft",
        });

      if (insertError) throw insertError;

      setMessage("Draw created successfully.");
      await loadDraws();
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const simulateDraw = async (draw) => {
    setSaving(true);
    setMessage("");
    setError("");

    try {
      const numbers = generateNumbers();

      const { error: updateError } = await supabase
        .from("draws")
        .update({
          numbers,
          status: "simulated",
        })
        .eq("id", draw.id);

      if (updateError) throw updateError;

      setMessage("Draw simulation completed.");
      await loadDraws();
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const publishDraw = async (draw) => {
    setSaving(true);
    setMessage("");
    setError("");

    try {
      const { error: updateError } = await supabase
        .from("draws")
        .update({
          status: "published",
          published_at: new Date().toISOString(),
        })
        .eq("id", draw.id);

      if (updateError) throw updateError;

      setMessage("Draw published successfully.");
      await loadDraws();
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const formatMonth = (date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      month: "long",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin" />
          Checking admin access...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-950">
      {/* NAVBAR */}
      <nav className="bg-slate-950 text-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="h-20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-400 flex items-center justify-center">
                <Trophy className="w-5 h-5 text-slate-950" />
              </div>

              <div>
                <div className="font-bold text-xl">
                  Admin Panel
                </div>

                <div className="text-xs text-slate-400">
                  Digital Heroes
                </div>
              </div>
            </div>

            <button
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/15 hover:bg-white/10 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              Dashboard
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-10">
        {/* HEADER */}
        <div className="mb-10">
          <p className="text-sm font-semibold text-emerald-600 uppercase tracking-wider">
            Administration
          </p>

          <h1 className="text-4xl md:text-5xl font-bold mt-2">
            Draw management
          </h1>

          <p className="text-slate-500 text-lg mt-3">
            Create, simulate and publish monthly reward draws.
          </p>
        </div>

        {/* MESSAGES */}
        {message && (
          <div className="mb-6 flex items-center gap-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl px-5 py-4">
            <CheckCircle2 className="w-5 h-5" />
            {message}
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 rounded-2xl px-5 py-4">
            {error}
          </div>
        )}

        {/* CREATE DRAW */}
        <section className="bg-slate-950 text-white rounded-3xl p-6 md:p-8 mb-10">
          <div className="flex items-center gap-3 mb-7">
            <div className="w-11 h-11 rounded-xl bg-emerald-400 flex items-center justify-center">
              <CalendarDays className="w-5 h-5 text-slate-950" />
            </div>

            <div>
              <h2 className="text-2xl font-bold">
                Create monthly draw
              </h2>

              <p className="text-slate-400 text-sm">
                Configure the next reward draw.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            <div>
              <label className="block text-sm text-slate-300 mb-2">
                Draw month
              </label>

              <input
                type="month"
                value={drawMonth}
                onChange={(e) => setDrawMonth(e.target.value)}
                className="w-full rounded-xl bg-white text-slate-950 px-4 py-3 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-300 mb-2">
                Prize pool
              </label>

              <input
                type="number"
                min="1"
                value={prizePool}
                onChange={(e) => setPrizePool(e.target.value)}
                className="w-full rounded-xl bg-white text-slate-950 px-4 py-3 outline-none"
                placeholder="1000"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-300 mb-2">
                Draw method
              </label>

              <select
                value={drawType}
                onChange={(e) => setDrawType(e.target.value)}
                className="w-full rounded-xl bg-white text-slate-950 px-4 py-3 outline-none"
              >
                <option value="random">Random</option>
                <option value="algorithmic">Algorithmic</option>
              </select>
            </div>
          </div>

          <button
            onClick={createDraw}
            disabled={saving}
            className="mt-6 bg-emerald-400 text-slate-950 font-bold px-6 py-3 rounded-xl hover:bg-emerald-300 transition disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <CalendarDays className="w-5 h-5" />
            )}

            Create draw
          </button>
        </section>

        {/* DRAW LIST */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-2xl font-bold">
                All draws
              </h2>

              <p className="text-slate-500 text-sm mt-1">
                Manage existing monthly draws.
              </p>
            </div>
          </div>

          {draws.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-10 text-center">
              <CalendarDays className="w-10 h-10 mx-auto text-slate-300" />

              <h3 className="font-bold text-lg mt-4">
                No draws created
              </h3>

              <p className="text-slate-500 mt-1">
                Create your first monthly draw above.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {draws.map((draw) => (
                <div
                  key={draw.id}
                  className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="text-2xl font-bold">
                          {formatMonth(draw.draw_month)}
                        </h3>

                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold ${
                            draw.status === "published"
                              ? "bg-emerald-100 text-emerald-700"
                              : draw.status === "simulated"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {draw.status}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-3 mt-4">
                        {(draw.numbers || []).map(
                          (number, index) => (
                            <span
                              key={`${draw.id}-${index}`}
                              className="w-11 h-11 rounded-xl bg-slate-950 text-white flex items-center justify-center font-bold"
                            >
                              {number}
                            </span>
                          )
                        )}
                      </div>

                      <div className="flex flex-wrap gap-6 mt-5 text-sm text-slate-500">
                        <span>
                          Prize pool:{" "}
                          <strong className="text-slate-900">
                            $
                            {Number(
                              draw.prize_pool || 0
                            ).toLocaleString()}
                          </strong>
                        </span>

                        <span>
                          Method:{" "}
                          <strong className="text-slate-900 capitalize">
                            {draw.draw_type}
                          </strong>
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      {draw.status !== "published" && (
                        <button
                          onClick={() => simulateDraw(draw)}
                          disabled={saving}
                          className="flex items-center gap-2 px-5 py-3 rounded-xl border border-slate-200 font-semibold hover:bg-slate-50 transition disabled:opacity-50"
                        >
                          <Play className="w-4 h-4" />
                          Simulate
                        </button>
                      )}

                      {draw.status !== "published" && (
                        <button
                          onClick={() => publishDraw(draw)}
                          disabled={saving}
                          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-950 text-white font-semibold hover:bg-slate-800 transition disabled:opacity-50"
                        >
                          <Send className="w-4 h-4" />
                          Publish
                        </button>
                      )}

                      {draw.status === "published" && (
                        <div className="flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-50 text-emerald-700 font-semibold">
                          <CheckCircle2 className="w-4 h-4" />
                          Published
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default AdminDashboard;