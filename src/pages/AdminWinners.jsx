import { useEffect, useState } from "react";
import {
  Trophy,
  CheckCircle,
  XCircle,
  DollarSign,
} from "lucide-react";
import { supabase } from "../lib/supabase";

function AdminWinners() {
  const [winners, setWinners] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWinners();
  }, []);

  const loadWinners = async () => {
    setLoading(true);

    // Get winner records
    const { data: winnerData, error: winnerError } = await supabase
      .from("winners")
      .select("*")
      .order("created_at", { ascending: false });

    if (winnerError) {
      console.error("Winner loading error:", winnerError);
      setWinners([]);
      setLoading(false);
      return;
    }

    if (!winnerData || winnerData.length === 0) {
      setWinners([]);
      setLoading(false);
      return;
    }

    // Get profile information
    const userIds = [
      ...new Set(winnerData.map((winner) => winner.user_id)),
    ];

    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name, phone")
      .in("id", userIds);

    // Get draw information
    const drawIds = [
      ...new Set(winnerData.map((winner) => winner.draw_id)),
    ];

    const { data: draws } = await supabase
      .from("draws")
      .select("id, draw_month")
      .in("id", drawIds);

    // Combine everything
    const formattedWinners = winnerData.map((winner) => ({
      ...winner,
      profile: profiles?.find(
        (profile) => profile.id === winner.user_id
      ),
      draw: draws?.find(
        (draw) => draw.id === winner.draw_id
      ),
    }));

    setWinners(formattedWinners);
    setLoading(false);
  };

  const updateVerification = async (id, status) => {
    const { error } = await supabase
      .from("winners")
      .update({
        verification_status: status,
      })
      .eq("id", id);

    if (error) {
      console.error("Verification update error:", error);
      alert("Failed to update verification.");
      return;
    }

    await loadWinners();
  };

  const updatePayment = async (id) => {
    const { error } = await supabase
      .from("winners")
      .update({
        payment_status: "paid",
      })
      .eq("id", id);

    if (error) {
      console.error("Payment update error:", error);
      alert("Failed to update payment.");
      return;
    }

    await loadWinners();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex justify-center items-center">
        <p className="text-slate-600">Loading winners...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 p-6 md:p-8">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-emerald-400 p-3 rounded-xl">
            <Trophy className="text-slate-950" />
          </div>

          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Winner Management
            </h1>

            <p className="text-slate-500">
              Verify winners and manage payouts
            </p>
          </div>
        </div>

        {/* No winners */}
        {winners.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 text-center shadow-sm">
            <Trophy className="mx-auto mb-4 text-slate-400" size={40} />

            <h2 className="text-xl font-semibold text-slate-800">
              No winners yet
            </h2>

            <p className="text-slate-500 mt-2">
              Winners will appear here after a draw.
            </p>
          </div>
        ) : (
          <div className="space-y-5">

            {winners.map((winner) => (
              <div
                key={winner.id}
                className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm"
              >
                <div className="flex flex-col md:flex-row justify-between gap-6">

                  {/* Winner information */}
                  <div>
                    <h2 className="font-bold text-xl text-slate-900">
                      {winner.profile?.full_name || "User"}
                    </h2>

                    <p className="text-slate-500">
                      User ID: {winner.user_id}
                    </p>

                    <p className="mt-3 text-slate-700">
                      Draw:{" "}
                      <strong>
                        {winner.draw?.draw_month || "N/A"}
                      </strong>
                    </p>

                    <p className="text-slate-700">
                      Match Count:{" "}
                      <strong>
                        {winner.match_count}/5
                      </strong>
                    </p>

                    <p className="text-slate-700">
                      Prize:{" "}
                      <strong>
                        ${Number(winner.prize_amount).toFixed(2)}
                      </strong>
                    </p>

                    <p className="mt-2 text-slate-700">
                      Verification:
                      <strong className="ml-2">
                        {winner.verification_status}
                      </strong>
                    </p>

                    <p className="text-slate-700">
                      Payment:
                      <strong className="ml-2">
                        {winner.payment_status}
                      </strong>
                    </p>

                    {winner.proof_url && (
                      <p className="mt-2 text-emerald-600 font-medium">
                        ✓ Proof submitted
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-start gap-3">

                    <button
                      onClick={() =>
                        updateVerification(
                          winner.id,
                          "approved"
                        )
                      }
                      title="Approve winner"
                      className="bg-emerald-500 hover:bg-emerald-600 text-white p-3 rounded-xl transition"
                    >
                      <CheckCircle size={22} />
                    </button>

                    <button
                      onClick={() =>
                        updateVerification(
                          winner.id,
                          "rejected"
                        )
                      }
                      title="Reject winner"
                      className="bg-red-500 hover:bg-red-600 text-white p-3 rounded-xl transition"
                    >
                      <XCircle size={22} />
                    </button>

                    <button
                      onClick={() =>
                        updatePayment(winner.id)
                      }
                      title="Mark as paid"
                      className="bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-xl transition"
                    >
                      <DollarSign size={22} />
                    </button>

                  </div>
                </div>
              </div>
            ))}

          </div>
        )}
      </div>
    </div>
  );
}

export default AdminWinners;