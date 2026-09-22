import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Heart,
  Trophy,
  Target,
  CalendarDays,
  LogOut,
  Plus,
  ArrowRight,
  Loader2,
  Ticket,
  IndianRupee,
} from "lucide-react";
import { supabase } from "../lib/supabase";

function Dashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [scores, setScores] = useState([]);
  const [subscription, setSubscription] = useState(null);
  const [charity, setCharity] = useState(null);
  const [drawEntries, setDrawEntries] = useState([]);
  const [winners, setWinners] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const handleCancelSubscription = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to cancel your subscription?"
    );

    if (!confirmed) return;

    const { error } = await supabase.rpc("cancel_my_subscription");

    if (error) {
      alert(error.message);
      return;
    }

    alert("Subscription cancelled successfully.");
    await loadDashboard();
  };

  const loadDashboard = async () => {
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

      // PROFILE
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      setProfile(profileData);

      // LATEST 5 SCORES
      const { data: scoresData } = await supabase
        .from("scores")
        .select("*")
        .eq("user_id", user.id)
        .order("score_date", { ascending: false })
        .limit(5);

      setScores(scoresData || []);

      // LATEST SUBSCRIPTION
      const { data: subscriptionData, error: subscriptionError } =
        await supabase
          .from("subscriptions")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

      if (subscriptionError) {
        console.error("Subscription error:", subscriptionError);
      }

      setSubscription(subscriptionData || null);

      // SELECTED CHARITY
      if (subscriptionData?.charity_id) {
        const { data: charityData, error: charityError } = await supabase
          .from("charities")
          .select("*")
          .eq("id", subscriptionData.charity_id)
          .maybeSingle();

        if (charityError) {
          console.error("Charity error:", charityError);
        }

        setCharity(charityData || null);
      } else {
        setCharity(null);
      }

      // DRAW ENTRIES
      const { data: entriesData, error: entriesError } = await supabase
        .from("draw_entries")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (entriesError) {
        console.error("Draw entries error:", entriesError);
      }

      setDrawEntries(entriesData || []);

      // WINNINGS
      const { data: winnersData, error: winnersError } = await supabase
        .from("winners")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (winnersError) {
        console.error("Winners error:", winnersError);
      }

      setWinners(winnersData || []);
    } catch (error) {
      console.error("Dashboard error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-emerald-400" />
          Loading dashboard...
        </div>
      </div>
    );
  }

  const displayName =
    profile?.full_name ||
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "Hero";

  const averageScore =
    scores.length > 0
      ? (
          scores.reduce((sum, item) => sum + Number(item.score), 0) /
          scores.length
        ).toFixed(1)
      : "—";

  const isActive =
    subscription?.status === "active" &&
    (!subscription?.renewal_date ||
      new Date(subscription.renewal_date) >= new Date());

  const totalWinnings = winners.reduce(
    (sum, winner) => sum + Number(winner.prize_amount || 0),
    0
  );

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* NAVBAR */}
      <nav className="bg-slate-950 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="h-20 flex items-center justify-between">
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center">
                <Heart className="w-5 h-5 text-slate-950 fill-slate-950" />
              </div>

              <div className="text-left">
                <div className="font-bold text-xl">
                  Digital <span className="text-emerald-400">Heroes</span>
                </div>

                <div className="text-xs text-slate-400">
                  Your dashboard
                </div>
              </div>
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 text-sm hover:bg-emerald-500/10 hover:border-emerald-500/40 transition"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* MAIN */}
      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-10">
        {/* WELCOME */}
        <div className="mb-10">
          <p className="text-sm font-semibold text-emerald-400 uppercase tracking-wider">
            Member dashboard
          </p>

          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mt-2">
            Welcome,{" "}
            <span className="text-emerald-400">
              {displayName.split(" ")[0]}
            </span>{" "}
            👋
          </h1>

          <p className="text-slate-400 mt-3 text-lg">
            Track your game, support your cause, and follow your journey.
          </p>
        </div>

        {/* TOP CARDS */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* SUBSCRIPTION */}
          <div className="bg-white text-slate-950 rounded-3xl p-6 shadow-xl shadow-black/20">
            <div className="flex items-center justify-between">
              <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center">
                <CalendarDays className="w-5 h-5 text-emerald-600" />
              </div>

              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  isActive
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-red-50 text-red-700"
                }`}
              >
                {subscription?.status || "No subscription"}
              </span>
            </div>

            <p className="text-sm text-slate-500 mt-6">
              Subscription
            </p>

            <h2 className="text-2xl font-bold mt-1 capitalize">
              {subscription?.plan
                ? `${subscription.plan} plan`
                : "No active plan"}
            </h2>

            {subscription?.renewal_date && (
              <p className="text-sm text-slate-500 mt-2">
                Renews:{" "}
                <span className="font-semibold text-slate-700">
                  {new Date(
                    subscription.renewal_date
                  ).toLocaleDateString("en-IN")}
                </span>
              </p>
            )}

            {isActive && (
              <button
                onClick={handleCancelSubscription}
                className="mt-5 w-full border border-red-200 text-red-600 hover:bg-red-50 font-semibold py-3 rounded-xl transition"
              >
                Cancel Subscription
              </button>
            )}

            {!isActive && (
              <button
                onClick={() => navigate("/subscribe")}
                className="mt-5 w-full bg-slate-950 text-white hover:bg-emerald-600 font-semibold py-3 rounded-xl transition"
              >
                Subscribe
              </button>
            )}
          </div>

          {/* SCORES */}
          <div className="bg-white text-slate-950 rounded-3xl p-6 shadow-xl shadow-black/20">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center">
              <Target className="w-5 h-5 text-emerald-600" />
            </div>

            <p className="text-sm text-slate-500 mt-6">
              Stableford scores
            </p>

            <div className="flex items-end gap-2 mt-1">
              <h2 className="text-3xl font-bold">
                {scores.length}/5
              </h2>

              <span className="text-sm text-slate-500 mb-1">
                recorded
              </span>
            </div>

            <p className="text-sm text-slate-500 mt-2">
              Average:{" "}
              <span className="font-semibold text-emerald-600">
                {averageScore}
              </span>
            </p>
          </div>

          {/* CHARITY */}
          <div className="bg-emerald-500 text-slate-950 rounded-3xl p-6 shadow-xl shadow-emerald-500/10">
            <div className="w-11 h-11 rounded-xl bg-slate-950/10 flex items-center justify-center">
              <Heart className="w-5 h-5 fill-slate-950" />
            </div>

            <p className="text-sm opacity-70 mt-6">
              Supported charity
            </p>

            <h2 className="text-xl font-bold mt-1">
              {charity?.name || "Not selected"}
            </h2>

            <p className="text-sm mt-2 font-semibold">
              Contribution:{" "}
              {subscription?.charity_percentage
                ? `${subscription.charity_percentage}%`
                : "—"}
            </p>

            <button
              onClick={() => navigate("/charities")}
              className="mt-5 inline-flex items-center gap-2 text-sm font-semibold hover:gap-3 transition-all"
            >
              {charity ? "Change charity" : "Choose charity"}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* DRAW / WINNINGS */}
          <div className="bg-white text-slate-950 rounded-3xl p-6 shadow-xl shadow-black/20">
            <div className="flex items-center justify-between">
              <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center">
                <Trophy className="w-5 h-5 text-emerald-600" />
              </div>

              <Ticket className="w-5 h-5 text-slate-300" />
            </div>

            <p className="text-sm text-slate-500 mt-6">
              Draw participation
            </p>

            <h2 className="text-3xl font-bold mt-1">
              {drawEntries.length}
            </h2>

            <p className="text-sm text-slate-500 mt-2">
              Entries submitted
            </p>

            <p className="text-sm mt-2 font-semibold text-emerald-600">
              Winnings: ₹{totalWinnings.toFixed(2)}
            </p>
          </div>
        </div>

        {/* SUBSCRIPTION / WINNING SUMMARY */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-slate-900 border border-white/10 rounded-3xl p-6">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-emerald-400/10 flex items-center justify-center">
                <CalendarDays className="w-5 h-5 text-emerald-400" />
              </div>

              <div>
                <h2 className="font-bold text-lg">
                  Membership details
                </h2>
                <p className="text-sm text-slate-400">
                  Your current subscription information
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-6">
              <div>
                <p className="text-xs text-slate-500 uppercase">
                  Plan
                </p>
                <p className="font-semibold mt-1 capitalize">
                  {subscription?.plan || "—"}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-500 uppercase">
                  Amount
                </p>
                <p className="font-semibold mt-1">
                  ₹{subscription?.amount || "0"}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-500 uppercase">
                  Status
                </p>
                <p className="font-semibold mt-1 capitalize">
                  {subscription?.status || "—"}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-500 uppercase">
                  Charity
                </p>
                <p className="font-semibold mt-1">
                  {subscription?.charity_percentage
                    ? `${subscription.charity_percentage}%`
                    : "—"}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-white/10 rounded-3xl p-6">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-emerald-400/10 flex items-center justify-center">
                <IndianRupee className="w-5 h-5 text-emerald-400" />
              </div>

              <div>
                <h2 className="font-bold text-lg">
                  Winnings & verification
                </h2>
                <p className="text-sm text-slate-400">
                  Track your prize status
                </p>
              </div>
            </div>

            {winners.length === 0 ? (
              <p className="text-slate-400 mt-6 text-sm">
                No winnings yet. Keep participating in monthly draws.
              </p>
            ) : (
              <div className="mt-5 space-y-3">
                {winners.slice(0, 3).map((winner) => (
                  <div
                    key={winner.id}
                    className="flex items-center justify-between bg-white/5 rounded-xl p-4"
                  >
                    <div>
                      <p className="font-semibold">
                        {winner.match_count}/5 matches
                      </p>

                      <p className="text-xs text-slate-400 mt-1 capitalize">
                        Verification:{" "}
                        {winner.verification_status}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="font-bold text-emerald-400">
                        ₹{Number(
                          winner.prize_amount || 0
                        ).toFixed(2)}
                      </p>

                      <p className="text-xs text-slate-400 capitalize">
                        {winner.payment_status}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* SCORE SECTION */}
        <div className="bg-white text-slate-950 rounded-3xl overflow-hidden shadow-xl shadow-black/20">
          <div className="p-6 md:p-8 border-b border-slate-200 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-emerald-600" />
                </div>

                <div>
                  <h2 className="text-xl font-bold">
                    Your latest scores
                  </h2>

                  <p className="text-sm text-slate-500">
                    Your five most recent Stableford scores
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => navigate("/scores")}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-950 text-white font-semibold hover:bg-emerald-600 transition"
            >
              <Plus className="w-4 h-4" />
              Add score
            </button>
          </div>

          {scores.length === 0 ? (
            <div className="p-10 text-center">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-50 flex items-center justify-center">
                <Target className="w-7 h-7 text-emerald-500" />
              </div>

              <h3 className="text-xl font-bold mt-5">
                No scores yet
              </h3>

              <p className="text-slate-500 mt-2 max-w-md mx-auto">
                Add your first Stableford score to start building your
                performance history.
              </p>

              <button
                onClick={() => navigate("/scores")}
                className="mt-6 px-6 py-3 rounded-xl bg-slate-950 text-white font-semibold hover:bg-emerald-600 transition"
              >
                Add your first score
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {scores.map((score, index) => (
                <div
                  key={score.id}
                  className="p-6 flex items-center justify-between hover:bg-emerald-50/40 transition"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                      {index + 1}
                    </div>

                    <div>
                      <p className="font-semibold">
                        Stableford Score
                      </p>

                      <p className="text-sm text-slate-500">
                        {new Date(
                          score.score_date
                        ).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="text-2xl font-bold text-emerald-600">
                    {score.score}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* QUICK ACTIONS */}
        <div className="grid md:grid-cols-3 gap-6 mt-8">
          <button
            onClick={() => navigate("/scores")}
            className="text-left bg-slate-900 text-white rounded-3xl p-6 border border-white/10 hover:border-emerald-500/40 hover:bg-slate-800 transition"
          >
            <Target className="w-6 h-6 mb-5 text-emerald-400" />

            <h3 className="text-xl font-bold">
              Manage scores
            </h3>

            <p className="text-slate-400 text-sm mt-2">
              Add, edit and manage your latest five scores.
            </p>
          </button>

          <button
            onClick={() => navigate("/charities")}
            className="text-left bg-white text-slate-950 rounded-3xl p-6 hover:border-emerald-400 transition"
          >
            <Heart className="w-6 h-6 mb-5 text-emerald-600" />

            <h3 className="text-xl font-bold">
              Explore charities
            </h3>

            <p className="text-slate-500 text-sm mt-2">
              Discover causes and choose where your impact goes.
            </p>
          </button>

          <button
            onClick={() => navigate("/draws")}
            className="text-left bg-white text-slate-950 rounded-3xl p-6 hover:border-emerald-400 transition"
          >
            <Trophy className="w-6 h-6 mb-5 text-emerald-600" />

            <h3 className="text-xl font-bold">
              View draws
            </h3>

            <p className="text-slate-500 text-sm mt-2">
              Follow upcoming draws, matches and winnings.
            </p>
          </button>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;