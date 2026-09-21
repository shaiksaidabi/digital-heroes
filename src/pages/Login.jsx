import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { Heart, ArrowRight, Loader2 } from "lucide-react";

function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");

    try {
      setLoading(true);

      const { data, error } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password,
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        navigate("/dashboard");
      }
    } catch (err) {
      setError(err.message || "Unable to login.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">

        {/* Logo */}
        <Link
          to="/"
          className="flex items-center justify-center gap-3 mb-10"
        >
          <div className="w-11 h-11 rounded-xl bg-white flex items-center justify-center">
            <Heart className="w-5 h-5 text-slate-950 fill-slate-950" />
          </div>

          <div>
            <div className="font-bold text-xl">
              Digital Heroes
            </div>

            <div className="text-xs text-slate-400">
              Play. Give. Win.
            </div>
          </div>
        </Link>

        {/* Card */}
        <div className="bg-white text-slate-950 rounded-3xl p-8 shadow-2xl">

          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight">
              Welcome back
            </h1>

            <p className="text-slate-500 mt-2">
              Login to continue your Digital Heroes journey.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold mb-2">
                Email address
              </label>

              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="w-full px-4 py-3.5 rounded-xl border border-slate-200 outline-none focus:border-slate-950 focus:ring-2 focus:ring-slate-950/10"
                required
              />
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-semibold">
                  Password
                </label>

                <button
                  type="button"
                  className="text-xs text-slate-500 hover:text-slate-950"
                  onClick={() => {
                    alert("Password reset can be added next.");
                  }}
                >
                  Forgot password?
                </button>
              </div>

              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className="w-full px-4 py-3.5 rounded-xl border border-slate-200 outline-none focus:border-slate-950 focus:ring-2 focus:ring-slate-950/10"
                required
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-slate-950 text-white py-3.5 rounded-xl font-semibold hover:bg-slate-800 transition disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Logging in...
                </>
              ) : (
                <>
                  Login
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Signup */}
          <p className="text-center text-sm text-slate-500 mt-7">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="font-semibold text-slate-950 hover:underline"
            >
              Create account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;