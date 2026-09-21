import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Edit3,
  Loader2,
  Plus,
  Target,
  Trash2,
  X,
} from "lucide-react";
import { supabase } from "../lib/supabase";

function Scores() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [score, setScore] = useState("");
  const [scoreDate, setScoreDate] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadScores();
  }, []);

  const loadScores = async () => {
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        navigate("/login");
        return;
      }

      setUser(user);

      const { data, error: scoresError } = await supabase
        .from("scores")
        .select("*")
        .eq("user_id", user.id)
        .order("score_date", { ascending: false });

      if (scoresError) {
        throw scoresError;
      }

      setScores(data || []);
    } catch (err) {
      console.error(err);
      setError("Unable to load your scores.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setScore("");
    setScoreDate("");
    setEditingId(null);
    setMessage("");
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    const numericScore = Number(score);

    if (!score || numericScore < 1 || numericScore > 45) {
      setError("Stableford score must be between 1 and 45.");
      return;
    }

    if (!scoreDate) {
      setError("Please select a score date.");
      return;
    }

    setSaving(true);

    try {
      if (editingId) {
        const { error: updateError } = await supabase
          .from("scores")
          .update({
            score: numericScore,
            score_date: scoreDate,
          })
          .eq("id", editingId)
          .eq("user_id", user.id);

        if (updateError) {
          if (updateError.code === "23505") {
            setError("You already have a score recorded for this date.");
            return;
          }

          throw updateError;
        }

        setMessage("Score updated successfully.");
      } else {
        const { error: insertError } = await supabase
          .from("scores")
          .insert({
            user_id: user.id,
            score: numericScore,
            score_date: scoreDate,
          });

        if (insertError) {
          if (insertError.code === "23505") {
            setError("You already have a score recorded for this date.");
            return;
          }

          throw insertError;
        }

        setMessage("Score added successfully.");
      }

      resetForm();
      await loadScores();
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setScore(String(item.score));
    setScoreDate(item.score_date);
    setMessage("");
    setError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this score?"
    );

    if (!confirmed) return;

    setError("");
    setMessage("");

    try {
      const { error: deleteError } = await supabase
        .from("scores")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

      if (deleteError) {
        throw deleteError;
      }

      setMessage("Score deleted successfully.");
      await loadScores();
    } catch (err) {
      console.error(err);
      setError("Unable to delete the score.");
    }
  };

  const latestFive = scores.slice(0, 5);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin" />
          Loading scores...
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
            <button
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-400 flex items-center justify-center">
                <Target className="w-5 h-5 text-slate-950" />
              </div>

              <div className="text-left">
                <div className="font-bold text-xl">
                  Digital Heroes
                </div>
                <div className="text-xs text-slate-400">
                  Stableford scores
                </div>
              </div>
            </button>

            <button
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/15 text-sm hover:bg-white/10 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              Dashboard
            </button>
          </div>
        </div>
      </nav>

      {/* MAIN */}
      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-10">
        {/* HEADER */}
        <div className="mb-8">
          <p className="text-sm font-semibold text-emerald-600 uppercase tracking-wider">
            Performance
          </p>

          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mt-2">
            Your Stableford scores
          </h1>

          <p className="text-slate-500 mt-3 text-lg">
            Keep your latest five scores updated and track your performance.
          </p>
        </div>

        {/* FORM + SUMMARY */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* FORM */}
          <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 p-6 md:p-8">
            <div className="flex items-center gap-3 mb-7">
              <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center">
                {editingId ? (
                  <Edit3 className="w-5 h-5 text-emerald-600" />
                ) : (
                  <Plus className="w-5 h-5 text-emerald-600" />
                )}
              </div>

              <div>
                <h2 className="text-xl font-bold">
                  {editingId ? "Edit score" : "Add a score"}
                </h2>

                <p className="text-sm text-slate-500">
                  Stableford scores must be between 1 and 45.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="grid md:grid-cols-2 gap-5">
                {/* SCORE */}
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Stableford score
                  </label>

                  <input
                    type="number"
                    min="1"
                    max="45"
                    value={score}
                    onChange={(e) => setScore(e.target.value)}
                    placeholder="e.g. 36"
                    className="w-full px-4 py-3.5 rounded-xl border border-slate-200 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition"
                  />
                </div>

                {/* DATE */}
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Score date
                  </label>

                  <div className="relative">
                    <CalendarDays className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />

                    <input
                      type="date"
                      value={scoreDate}
                      onChange={(e) => setScoreDate(e.target.value)}
                      className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-slate-200 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition"
                    />
                  </div>
                </div>
              </div>

              {/* MESSAGES */}
              {error && (
                <div className="mt-5 px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm">
                  {error}
                </div>
              )}

              {message && (
                <div className="mt-5 px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  {message}
                </div>
              )}

              {/* BUTTONS */}
              <div className="flex flex-wrap gap-3 mt-6">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-slate-950 text-white font-semibold hover:bg-slate-800 disabled:opacity-60 transition"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : editingId ? (
                    <>
                      <Edit3 className="w-4 h-4" />
                      Update score
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      Add score
                    </>
                  )}
                </button>

                {editingId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl border border-slate-200 font-semibold hover:bg-slate-50 transition"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* SUMMARY */}
          <div className="bg-slate-950 text-white rounded-3xl p-6 md:p-8">
            <div className="w-12 h-12 rounded-2xl bg-emerald-400 flex items-center justify-center">
              <Target className="w-6 h-6 text-slate-950" />
            </div>

            <p className="text-slate-400 text-sm mt-7">
              Score history
            </p>

            <div className="flex items-end gap-2 mt-1">
              <h2 className="text-5xl font-bold">
                {latestFive.length}
              </h2>

              <span className="text-slate-400 mb-2">
                / 5 scores
              </span>
            </div>

            <div className="h-px bg-white/10 my-6" />

            <p className="text-slate-400 text-sm">
              Average score
            </p>

            <p className="text-3xl font-bold mt-1">
              {latestFive.length
                ? (
                    latestFive.reduce(
                      (sum, item) => sum + item.score,
                      0
                    ) / latestFive.length
                  ).toFixed(1)
                : "—"}
            </p>

            <p className="text-sm text-slate-400 mt-5 leading-6">
              Your dashboard always uses your five most recent Stableford
              scores.
            </p>
          </div>
        </div>

        {/* SCORES LIST */}
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden">
          <div className="p-6 md:p-8 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center">
                <CalendarDays className="w-5 h-5 text-emerald-600" />
              </div>

              <div>
                <h2 className="text-xl font-bold">
                  Latest five scores
                </h2>

                <p className="text-sm text-slate-500">
                  Newest scores appear first.
                </p>
              </div>
            </div>
          </div>

          {latestFive.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-100 flex items-center justify-center">
                <Target className="w-7 h-7 text-slate-400" />
              </div>

              <h3 className="text-xl font-bold mt-5">
                No scores recorded
              </h3>

              <p className="text-slate-500 mt-2">
                Add your first Stableford score above.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {latestFive.map((item, index) => (
                <div
                  key={item.id}
                  className="p-5 md:p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-5 hover:bg-slate-50/70 transition"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-xl bg-slate-950 text-white flex items-center justify-center font-bold">
                      {index + 1}
                    </div>

                    <div>
                      <p className="font-semibold">
                        Stableford Score
                      </p>

                      <p className="text-sm text-slate-500 mt-1">
                        {new Date(
                          item.score_date
                        ).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-5">
                    <div className="text-3xl font-bold">
                      {item.score}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(item)}
                        className="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center hover:bg-slate-100 transition"
                        title="Edit score"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleDelete(item.id)}
                        className="w-10 h-10 rounded-xl border border-red-100 text-red-600 flex items-center justify-center hover:bg-red-50 transition"
                        title="Delete score"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* INFO */}
        <div className="mt-6 flex items-start gap-3 text-sm text-slate-500">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <p>
            Only one score can be recorded for each date. Your latest five
            scores are automatically used for your performance history.
          </p>
        </div>
      </main>
    </div>
  );
}

export default Scores;