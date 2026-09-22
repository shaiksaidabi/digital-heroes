import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import {
  Heart,
  ArrowRight,
  Loader2,
  HeartHandshake,
} from "lucide-react";

function Signup() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    charityId: "",
  });

  const [charities, setCharities] = useState([]);
  const [loadingCharities, setLoadingCharities] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    loadCharities();
  }, []);

  const loadCharities = async () => {
    try {
      const { data, error } = await supabase
        .from("charities")
        .select("id, name")
        .eq("active", true)
        .order("name");

      if (error) throw error;

      setCharities(data || []);
    } catch (err) {
      console.error("Charity loading error:", err);
      setError("Unable to load charities. Please refresh and try again.");
    } finally {
      setLoadingCharities(false);
    }
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!form.fullName.trim()) {
      setError("Please enter your full name.");
      return;
    }

    if (!form.charityId) {
      setError("Please select a charity.");
      return;
    }

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const selectedCharity = charities.find(
        (charity) => charity.id === form.charityId
      );

      const { data, error } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: {
            full_name: form.fullName,
            charity_id: form.charityId,
            charity_name: selectedCharity?.name || "",
          },
        },
      });

      if (error) {
        throw error;
      }

      if (data.session) {
        navigate("/dashboard");
      } else {
        setSuccess(
          "Account created successfully. Please check your email to verify your account."
        );
      }
    } catch (err) {
      setError(err.message || "Unable to create account.");
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
              Create your account
            </h1>

            <p className="text-slate-500 mt-2">
              Start tracking your game and making an impact.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Success */}
          {success && (
            <div className="mb-5 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700">
              {success}
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-5">

            {/* Full Name */}
            <div>
              <label className="block text-sm font-semibold mb-2">
                Full name
              </label>

              <input
                type="text"
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                placeholder="Enter your full name"
                className="w-full px-4 py-3.5 rounded-xl border border-slate-200 outline-none focus:border-slate-950 focus:ring-2 focus:ring-slate-950/10"
                required
              />
            </div>

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

            {/* Charity */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold mb-2">
                <HeartHandshake className="w-4 h-4 text-emerald-600" />
                Choose your charity
              </label>

              <select
                name="charityId"
                value={form.charityId}
                onChange={handleChange}
                disabled={loadingCharities}
                className="w-full px-4 py-3.5 rounded-xl border border-slate-200 bg-white outline-none focus:border-slate-950 focus:ring-2 focus:ring-slate-950/10 disabled:bg-slate-100"
                required
              >
                <option value="">
                  {loadingCharities
                    ? "Loading charities..."
                    : "Select a charity"}
                </option>

                {charities.map((charity) => (
                  <option key={charity.id} value={charity.id}>
                    {charity.name}
                  </option>
                ))}
              </select>

              <p className="text-xs text-slate-500 mt-2">
                At least 10% of your subscription can support your selected
                charity.
              </p>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold mb-2">
                Password
              </label>

              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Minimum 6 characters"
                className="w-full px-4 py-3.5 rounded-xl border border-slate-200 outline-none focus:border-slate-950 focus:ring-2 focus:ring-slate-950/10"
                required
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-semibold mb-2">
                Confirm password
              </label>

              <input
                type="password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="Repeat your password"
                className="w-full px-4 py-3.5 rounded-xl border border-slate-200 outline-none focus:border-slate-950 focus:ring-2 focus:ring-slate-950/10"
                required
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || loadingCharities}
              className="w-full flex items-center justify-center gap-2 bg-slate-950 text-white py-3.5 rounded-xl font-semibold hover:bg-slate-800 transition disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating account...
                </>
              ) : (
                <>
                  Create account
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Login */}
          <p className="text-center text-sm text-slate-500 mt-7">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-semibold text-slate-950 hover:underline"
            >
              Login
            </Link>
          </p>
        </div>

        <p className="text-center text-xs text-slate-500 mt-6">
          By creating an account, you agree to use Digital Heroes responsibly.
        </p>
      </div>
    </div>
  );
}

export default Signup;