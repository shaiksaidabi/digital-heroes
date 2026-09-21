import { useEffect, useState } from "react";
import { Trophy, CheckCircle, XCircle, DollarSign } from "lucide-react";
import { supabase } from "../lib/supabase";

function AdminWinners() {
  const [winners, setWinners] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWinners();
  }, []);

  const loadWinners = async () => {
    const { data, error } = await supabase
      .from("winners")
      .select(`
        *,
        profiles(full_name,email),
        draws(draw_month)
      `);

    if (!error) {
      setWinners(data || []);
    }

    setLoading(false);
  };

  const updateVerification = async (id, status) => {
    await supabase
      .from("winners")
      .update({
        verification_status: status,
      })
      .eq("id", id);

    loadWinners();
  };

  const updatePayment = async (id) => {
    await supabase
      .from("winners")
      .update({
        payment_status: "paid",
      })
      .eq("id", id);

    loadWinners();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        Loading winners...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 p-8">
      <div className="max-w-7xl mx-auto">

        <div className="flex items-center gap-3 mb-8">
          <div className="bg-emerald-400 p-3 rounded-xl">
            <Trophy className="text-slate-950" />
          </div>

          <div>
            <h1 className="text-3xl font-bold">
              Winner Management
            </h1>

            <p className="text-slate-500">
              Verify winners and manage payouts
            </p>
          </div>
        </div>

        {winners.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 text-center">
            No winners yet
          </div>
        ) : (
          <div className="space-y-5">
            {winners.map((winner) => (
              <div
                key={winner.id}
                className="bg-white rounded-3xl p-6 border"
              >
                <div className="flex justify-between items-center">

                  <div>
                    <h2 className="font-bold text-xl">
                      {winner.profiles?.full_name || "User"}
                    </h2>

                    <p className="text-slate-500">
                      {winner.profiles?.email}
                    </p>

                    <p className="mt-2">
                      Match Count: {winner.match_count}/5
                    </p>

                    <p>
                      Prize: $
                      {winner.prize_amount}
                    </p>

                    <p>
                      Verification:
                      <strong className="ml-2">
                        {winner.verification_status}
                      </strong>
                    </p>

                    <p>
                      Payment:
                      <strong className="ml-2">
                        {winner.payment_status}
                      </strong>
                    </p>
                  </div>

                  <div className="flex gap-3">

                    <button
                      onClick={() =>
                        updateVerification(
                          winner.id,
                          "approved"
                        )
                      }
                      className="bg-emerald-500 text-white p-3 rounded-xl"
                    >
                      <CheckCircle />
                    </button>

                    <button
                      onClick={() =>
                        updateVerification(
                          winner.id,
                          "rejected"
                        )
                      }
                      className="bg-red-500 text-white p-3 rounded-xl"
                    >
                      <XCircle />
                    </button>

                    <button
                      onClick={() =>
                        updatePayment(winner.id)
                      }
                      className="bg-blue-500 text-white p-3 rounded-xl"
                    >
                      <DollarSign />
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