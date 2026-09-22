import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Users,
  Loader2,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { supabase } from "../lib/supabase";

function AdminUsers() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
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

      await loadUsers();
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, phone, admin, created_at")
      .order("created_at", { ascending: false });

    if (error) throw error;

    const userIds = (data || []).map((user) => user.id);

    let subscriptions = [];

    if (userIds.length > 0) {
      const { data: subscriptionData, error: subscriptionError } =
        await supabase
          .from("subscriptions")
          .select(
            "user_id, plan, amount, status, renewal_date, charity_percentage"
          )
          .in("user_id", userIds)
          .order("created_at", { ascending: false });

      if (subscriptionError) throw subscriptionError;

      subscriptions = subscriptionData || [];
    }

    const latestSubscription = {};

    subscriptions.forEach((subscription) => {
      if (!latestSubscription[subscription.user_id]) {
        latestSubscription[subscription.user_id] = subscription;
      }
    });

    const mergedUsers = (data || []).map((user) => ({
      ...user,
      subscription: latestSubscription[user.id] || null,
    }));

    setUsers(mergedUsers);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin" />
          Loading users...
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
                <Users className="w-5 h-5 text-slate-950" />
              </div>

              <div>
                <div className="font-bold text-xl">
                  User Management
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
            Users & subscriptions
          </h1>

          <p className="text-slate-500 mt-3">
            View registered users and their subscription lifecycle.
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 rounded-2xl px-5 py-4">
            {error}
          </div>
        )}

        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-200">
            <div className="text-2xl font-bold">
              {users.length} registered user
              {users.length !== 1 ? "s" : ""}
            </div>
          </div>

          {users.length === 0 ? (
            <div className="p-10 text-center text-slate-500">
              No users found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <thead className="bg-slate-50">
                  <tr className="text-left text-sm text-slate-500">
                    <th className="px-6 py-4">User</th>
                    <th className="px-6 py-4">Role</th>
                    <th className="px-6 py-4">Plan</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Renewal</th>
                    <th className="px-6 py-4">Charity</th>
                  </tr>
                </thead>

                <tbody>
                  {users.map((user) => {
                    const subscription = user.subscription;

                    return (
                      <tr
                        key={user.id}
                        className="border-t border-slate-100"
                      >
                        <td className="px-6 py-5">
                          <div className="font-semibold">
                            {user.full_name || "Unnamed user"}
                          </div>

                          <div className="text-sm text-slate-500">
                            {user.phone || "No phone"}
                          </div>
                        </td>

                        <td className="px-6 py-5">
                          <span
                            className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${
                              user.admin === "admin"
                                ? "bg-purple-100 text-purple-700"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {user.admin === "admin"
                              ? "Admin"
                              : "Member"}
                          </span>
                        </td>

                        <td className="px-6 py-5">
                          {subscription ? (
                            <span className="font-semibold capitalize">
                              {subscription.plan}
                            </span>
                          ) : (
                            <span className="text-slate-400">
                              No subscription
                            </span>
                          )}
                        </td>

                        <td className="px-6 py-5">
                          {subscription?.status === "active" ? (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">
                              <CheckCircle2 className="w-3 h-3" />
                              Active
                            </span>
                          ) : subscription ? (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-bold">
                              <XCircle className="w-3 h-3" />
                              {subscription.status}
                            </span>
                          ) : (
                            <span className="text-slate-400">
                              —
                            </span>
                          )}
                        </td>

                        <td className="px-6 py-5">
                          {subscription?.renewal_date
                            ? new Date(
                                subscription.renewal_date
                              ).toLocaleDateString("en-IN")
                            : "—"}
                        </td>

                        <td className="px-6 py-5">
                          {subscription?.charity_percentage
                            ? `${subscription.charity_percentage}%`
                            : "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default AdminUsers;