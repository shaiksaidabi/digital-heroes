import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  CircleDollarSign,
  Loader2,
  Trophy,
  Upload,
  CheckCircle2,
} from "lucide-react";
import { supabase } from "../lib/supabase";

function Draws() {
  const navigate = useNavigate();

  const [draws, setDraws] = useState([]);
  const [entries, setEntries] = useState([]);
  const [winners, setWinners] = useState([]);
  const [selectedNumbers, setSelectedNumbers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadDraws();
  }, []);

  const loadDraws = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        navigate("/login");
        return;
      }

      const { data: drawData, error: drawError } = await supabase
        .from("draws")
        .select("*")
        .eq("status", "published")
        .order("draw_month", { ascending: false });

      if (drawError) throw drawError;

      setDraws(drawData || []);

      if (drawData?.length) {
        const ids = drawData.map((draw) => draw.id);

        const { data: entryData, error: entryError } = await supabase
          .from("draw_entries")
          .select("*")
          .eq("user_id", user.id)
          .in("draw_id", ids);

        if (entryError) throw entryError;

        setEntries(entryData || []);

        const { data: winnerData, error: winnerError } = await supabase
          .from("winners")
          .select("*")
          .eq("user_id", user.id)
          .in("draw_id", ids);

        if (winnerError) throw winnerError;

        setWinners(winnerData || []);
      }
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleNumber = (number) => {
    setMessage("");
    setError("");

    if (selectedNumbers.includes(number)) {
      setSelectedNumbers(
        selectedNumbers.filter((n) => n !== number)
      );
      return;
    }

    if (selectedNumbers.length >= 5) {
      setError("You can select exactly 5 numbers.");
      return;
    }

    setSelectedNumbers(
      [...selectedNumbers, number].sort((a, b) => a - b)
    );
  };

  const submitEntry = async (draw) => {
    setMessage("");
    setError("");

    if (selectedNumbers.length !== 5) {
      setError("Please select exactly 5 numbers.");
      return;
    }

    setSaving(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { data: existing } = await supabase
        .from("draw_entries")
        .select("id")
        .eq("draw_id", draw.id)
        .eq("user_id", user.id)
        .maybeSingle();

      if (existing) {
        setError("You already entered this draw.");
        return;
      }

      const { error: insertError } = await supabase
        .from("draw_entries")
        .insert({
          draw_id: draw.id,
          user_id: user.id,
          numbers: selectedNumbers,
          match_count: 0,
        });

      if (insertError) throw insertError;

      setMessage("Your draw entry was submitted successfully.");
      setSelectedNumbers([]);

      await loadDraws();
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const createWinner = async (drawId) => {
    const { data, error } = await supabase.rpc(
      "create_winner_for_entry",
      {
        p_draw_id: drawId,
      }
    );

    if (error) throw error;

    return data;
  };

  const uploadProof = async (draw) => {
    setMessage("");
    setError("");

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        navigate("/login");
        return;
      }

      setUploading(true);

      const winnerId = await createWinner(draw.id);

      const input = document.getElementById(
        `proof-${draw.id}`
      );

      if (!input?.files?.length) {
        setError("Please select a proof image.");
        return;
      }

      const file = input.files[0];

      if (!file.type.startsWith("image/")) {
        setError("Please upload an image file.");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setError("Image must be smaller than 5MB.");
        return;
      }

      const extension = file.name.split(".").pop();

      const filePath =
        `${user.id}/${winnerId}-${Date.now()}.${extension}`;

      const { error: uploadError } = await supabase.storage
        .from("winner-proofs")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { error: updateError } = await supabase
        .from("winners")
        .update({
          proof_url: filePath,
        })
        .eq("id", winnerId)
        .eq("user_id", user.id);

      if (updateError) throw updateError;

      setMessage(
        "Proof uploaded successfully. Your winner verification is now pending."
      );

      await loadDraws();
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const getEntry = (drawId) =>
    entries.find((entry) => entry.draw_id === drawId);

  const getWinner = (drawId) =>
    winners.find((winner) => winner.draw_id === drawId);

  const formatMonth = (date) =>
    new Date(date).toLocaleDateString("en-IN", {
      month: "long",
      year: "numeric",
    });

  const getPrize = (pool, matches) => {
    if (matches === 5) return Number(pool) * 0.4;
    if (matches === 4) return Number(pool) * 0.35;
    if (matches === 3) return Number(pool) * 0.25;
    return 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-950">
      <nav className="bg-slate-950 text-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="h-20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-400 flex items-center justify-center">
                <Trophy className="w-5 h-5 text-slate-950" />
              </div>

              <div>
                <div className="font-bold text-xl">
                  Digital Heroes
                </div>
                <div className="text-xs text-slate-400">
                  Monthly draws
                </div>
              </div>
            </div>

            <button
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/15"
            >
              <ArrowLeft className="w-4 h-4" />
              Dashboard
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-10">
        <p className="text-sm font-semibold text-emerald-600 uppercase">
          Monthly rewards
        </p>

        <h1 className="text-4xl font-bold mt-2">
          Draws & winnings
        </h1>

        <p className="text-slate-500 mt-3">
          Enter monthly draws and track your results.
        </p>

        {message && (
          <div className="mt-6 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl p-4 flex gap-3 items-center">
            <CheckCircle2 className="w-5 h-5" />
            {message}
          </div>
        )}

        {error && (
          <div className="mt-6 bg-red-50 border border-red-200 text-red-700 rounded-2xl p-4">
            {error}
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-5 my-8">
          {[
            ["5 matches", "40%"],
            ["4 matches", "35%"],
            ["3 matches", "25%"],
          ].map(([title, value]) => (
            <div
              key={title}
              className="bg-white rounded-3xl border border-slate-200 p-6"
            >
              <Trophy className="w-6 h-6 text-emerald-600" />
              <p className="text-slate-500 mt-5">{title}</p>
              <h2 className="text-3xl font-bold">{value}</h2>
            </div>
          ))}
        </div>

        {draws.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 text-center">
            No published draws yet.
          </div>
        ) : (
          <div className="space-y-6">
            {draws.map((draw) => {
              const entry = getEntry(draw.id);
              const winner = getWinner(draw.id);

              return (
                <div
                  key={draw.id}
                  className="bg-white rounded-3xl border border-slate-200 overflow-hidden"
                >
                  <div className="bg-slate-950 text-white p-6">
                    <div className="text-emerald-400 text-sm font-semibold">
                      <CalendarDays className="inline w-4 h-4 mr-2" />
                      {formatMonth(draw.draw_month)}
                    </div>

                    <h2 className="text-3xl font-bold mt-2">
                      Monthly Draw
                    </h2>

                    <p className="text-slate-400 mt-2">
                      Prize pool: $
                      {Number(draw.prize_pool || 0).toLocaleString()}
                    </p>
                  </div>

                  <div className="p-6">
                    <p className="font-semibold text-slate-500">
                      Winning numbers
                    </p>

                    <div className="flex gap-3 mt-4 flex-wrap">
                      {draw.numbers.map((number, index) => (
                        <div
                          key={index}
                          className="w-12 h-12 rounded-xl bg-emerald-400 text-slate-950 flex items-center justify-center font-bold"
                        >
                          {number}
                        </div>
                      ))}
                    </div>

                    {!entry ? (
                      <div className="mt-8">
                        <h3 className="text-xl font-bold">
                          Enter this draw
                        </h3>

                        <p className="text-sm text-slate-500 mt-1">
                          Select exactly 5 numbers.
                        </p>

                        <div className="grid grid-cols-5 sm:grid-cols-9 md:grid-cols-15 gap-2 mt-5">
                          {Array.from(
                            { length: 45 },
                            (_, i) => i + 1
                          ).map((number) => {
                            const selected =
                              selectedNumbers.includes(number);

                            return (
                              <button
                                key={number}
                                onClick={() => toggleNumber(number)}
                                className={`h-10 rounded-lg font-semibold transition ${
                                  selected
                                    ? "bg-emerald-400 text-slate-950"
                                    : "bg-slate-100 hover:bg-slate-200"
                                }`}
                              >
                                {number}
                              </button>
                            );
                          })}
                        </div>

                        <div className="flex items-center justify-between mt-5">
                          <span className="text-sm text-slate-500">
                            Selected:{" "}
                            <strong>
                              {selectedNumbers.length}/5
                            </strong>
                          </span>

                          <button
                            onClick={() => submitEntry(draw)}
                            disabled={saving}
                            className="bg-slate-950 text-white px-6 py-3 rounded-xl font-semibold disabled:opacity-50"
                          >
                            {saving
                              ? "Submitting..."
                              : "Submit Entry"}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-8 p-6 rounded-2xl bg-emerald-50 border border-emerald-100">
                        <p className="font-semibold text-emerald-700">
                          Your entry
                        </p>

                        <div className="flex gap-2 mt-3 flex-wrap">
                          {entry.numbers.map((number, index) => (
                            <span
                              key={index}
                              className="w-10 h-10 rounded-xl bg-white border flex items-center justify-center font-bold"
                            >
                              {number}
                            </span>
                          ))}
                        </div>

                        <p className="mt-4 font-bold">
                          Matches: {entry.match_count}/5
                        </p>

                        {entry.match_count >= 3 && (
                          <div className="mt-5">
                            <p className="text-emerald-700 font-semibold">
                              Potential prize: $
                              {getPrize(
                                draw.prize_pool,
                                entry.match_count
                              ).toLocaleString()}
                            </p>

                            {!winner ? (
                              <div className="mt-5">
                                <label className="block text-sm font-semibold mb-2">
                                  Upload winning proof
                                </label>

                                <input
                                  id={`proof-${draw.id}`}
                                  type="file"
                                  accept="image/*"
                                  className="block w-full text-sm border border-slate-300 rounded-xl p-3 bg-white"
                                />

                                <button
                                  onClick={() =>
                                    uploadProof(draw)
                                  }
                                  disabled={uploading}
                                  className="mt-3 flex items-center gap-2 bg-slate-950 text-white px-5 py-3 rounded-xl font-semibold disabled:opacity-50"
                                >
                                  <Upload className="w-4 h-4" />
                                  {uploading
                                    ? "Uploading..."
                                    : "Upload Proof"}
                                </button>
                              </div>
                            ) : (
                              <div className="mt-5 p-4 rounded-xl bg-white border border-emerald-200">
                                <p className="font-semibold text-slate-900">
                                  Proof submitted
                                </p>

                                <p className="text-sm text-slate-500 mt-1">
                                  Verification:{" "}
                                  <strong>
                                    {winner.verification_status}
                                  </strong>
                                </p>

                                <p className="text-sm text-slate-500">
                                  Payment:{" "}
                                  <strong>
                                    {winner.payment_status}
                                  </strong>
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    <div className="mt-6 text-sm text-slate-500 flex gap-2">
                      <CircleDollarSign className="w-5 h-5 text-emerald-600" />
                      40% / 35% / 25% prize distribution across
                      winning tiers.
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

export default Draws;