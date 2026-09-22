import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  BarChart3,
  Users,
  CreditCard,
  Heart,
  Trophy,
  Ticket,
  IndianRupee,
  Loader2,
} from "lucide-react";
import { supabase } from "../lib/supabase";

function AdminReports() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [stats, setStats] = useState({
    users: 0,
    activeSubscriptions: 0,
    revenue: 0,
    charityContribution: 0,
    drawEntries: 0,
    winners: 0,
    prizes: 0,
    monthlyPlans: 0,
    yearlyPlans: 0,
  });

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

      await loadReports();
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadReports = async () => {
    const [
      profilesResult,
      subscriptionsResult,
      entriesResult,
      winnersResult,
    ] = await Promise.all([
      supabase.from("profiles").select("id"),

      supabase
        .from("subscriptions")
        .select("amount, status, plan, charity_percentage"),

      supabase.from("draw_entries").select("id"),

      supabase
        .from("winners")
        .select("id, prize_amount"),
    ]);

    if (profilesResult.error) throw profilesResult.error;
    if (subscriptionsResult.error) throw subscriptionsResult.error;
    if (entriesResult.error) throw entriesResult.error;
    if (winnersResult.error) throw winnersResult.error;

    const profiles = profilesResult.data || [];
    const subscriptions = subscriptionsResult.data || [];
    const entries = entriesResult.data || [];
    const winners = winnersResult.data || [];

    const active = subscriptions.filter(
      (subscription) => subscription.status === "active"
    );

    const revenue = subscriptions
      .filter((subscription) => subscription.status !== "failed")
      .reduce(
        (sum, subscription) =>
          sum + Number(subscription.amount || 0),
        0
      );

    const charityContribution = active.reduce(
      (sum, subscription) =>
        sum + Number(subscription.charity_percentage || 0),
      0
    );

    const prizes = winners.reduce(
      (sum, winner) =>
        sum + Number(winner.prize_amount || 0),
      0
    );

    setStats({
      users: profiles.length,
      activeSubscriptions: active.length,
      revenue,
      charityContribution,
      drawEntries: entries.length,
      winners: winners.length,
      prizes,
      monthlyPlans: subscriptions.filter(
        (s) => s.plan === "monthly"
      ).length,
      yearlyPlans: subscriptions.filter(
        (s) => s.plan === "yearly"
      ).length,
    });
  };

  const cards = [
    {
      title: "Total users",
      value: stats.users,
      icon: Users,
      suffix: "",
    },
    {
      title: "Active subscriptions",
      value: stats.activeSubscriptions,
      icon: CreditCard,
      suffix: "",
    },
    {
      title: "Subscription revenue",
      value: `₹${stats.revenue.toFixed(2)}`,
      icon: IndianRupee,
      suffix: "",
    },
    {
      title: "Charity contribution",
      value: `${stats.charityContribution.toFixed(0)}%`,
      icon: Heart,
      suffix: "",
    },
    {
      title: "Draw entries",
      value: stats.drawEntries,
      icon: Ticket,
      suffix: "",
    },
    {
      title: "Winners",
      value: stats.winners,
      icon: Trophy,
      suffix: "",
    },
    {
      title: "Prize payouts",
      value: `₹${stats.prizes.toFixed(2)}`,
      icon: IndianRupee,
      suffix: "",
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin" />
          Loading reports...
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
              <div className="w-10 h-10 rounded-xl bg-emerald-400 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-slate-950" />
              </div>

              <div>
                <div className="font-bold text-xl">
                  Reports & Analytics
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
          <p className="text-sm font-semibold text-emerald-600 uppercase tracking-wider">
            Administration
          </p>

          <h1 className="text-4xl font-bold mt-2">
            Platform analytics
          </h1>

          <p className="text-slate-500 mt-3">
            Live statistics from users, subscriptions, draws and winners.
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 rounded-2xl px-5 py-4">
            {error}
          </div>
        )}

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {cards.map((card) => {
            const Icon = card.icon;

            return (
              <div
                key={card.title}
                className="bg-white rounded-2xl border border-slate-200 p-6"
              >
                <div className="flex items-center justify-between">
                  <div className="text-sm text-slate-500">
                    {card.title}
                  </div>

                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-slate-700" />
                  </div>
                </div>

                <div className="text-3xl font-bold mt-4">
                  {card.value}
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid md:grid-cols-2 gap-6 mt-8">
          <div className="bg-white rounded-3xl border border-slate-200 p-7">
            <h2 className="text-xl font-bold">
              Subscription plans
            </h2>

            <div className="space-y-5 mt-6">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-slate-600">
                    Monthly
                  </span>

                  <span className="font-bold">
                    {stats.monthlyPlans}
                  </span>
                </div>

                <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{
                      width: `${
                        stats.monthlyPlans +
                          stats.yearlyPlans >
                        0
                          ? (stats.monthlyPlans /
                              (stats.monthlyPlans +
                                stats.yearlyPlans)) *
                            100
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-slate-600">
                    Yearly
                  </span>

                  <span className="font-bold">
                    {stats.yearlyPlans}
                  </span>
                </div>

                <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-slate-900 rounded-full"
                    style={{
                      width: `${
                        stats.monthlyPlans +
                          stats.yearlyPlans >
                        0
                          ? (stats.yearlyPlans /
                              (stats.monthlyPlans +
                                stats.yearlyPlans)) *
                            100
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-950 text-white rounded-3xl p-7">
            <div className="flex items-center gap-3">
              <Heart className="w-6 h-6 text-emerald-400" />

              <h2 className="text-xl font-bold">
                Charity impact
              </h2>
            </div>

            <p className="text-slate-400 mt-4">
              Subscriber contribution preferences are being
              tracked independently from subscription status.
            </p>

            <div className="mt-7">
              <div className="text-4xl font-bold">
                {stats.charityContribution.toFixed(0)}%
              </div>

              <div className="text-sm text-slate-400 mt-1">
                Combined contribution percentage across active
                subscriptions
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default AdminReports;