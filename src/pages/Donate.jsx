import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRazorpay } from "react-razorpay";
import {
  ArrowLeft,
  Heart,
  Loader2,
  CreditCard,
} from "lucide-react";
import { supabase } from "../lib/supabase";

function Donate() {
  const navigate = useNavigate();

  const {
    error: razorpayError,
    isLoading: razorpayLoading,
    Razorpay,
  } = useRazorpay();

  const [charities, setCharities] = useState([]);
  const [charityId, setCharityId] = useState("");
  const [amount, setAmount] = useState(10);
  const [customAmount, setCustomAmount] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadCharities();
  }, []);

  useEffect(() => {
    if (razorpayError) {
      console.error("Razorpay error:", razorpayError);
    }
  }, [razorpayError]);

  const loadCharities = async () => {
    const { data, error } = await supabase
      .from("charities")
      .select("id, name")
      .eq("active", true)
      .order("name");

    if (error) {
      setError(error.message);
      return;
    }

    setCharities(data || []);

    if (data?.length) {
      setCharityId(data[0].id);
    }
  };

  const selectedAmount =
    customAmount !== ""
      ? Number(customAmount)
      : amount;

  const createOrder = async () => {
    const { data, error } = await supabase.functions.invoke(
      "razorpay-payment",
      {
        body: {
          action: "create_order",
          amount: selectedAmount * 100,
          currency: "INR",
          receipt: `DON_${Date.now()}`,
        },
      }
    );

    if (error) {
      throw new Error(error.message);
    }

    if (!data?.id) {
      throw new Error(
        data?.error || "Unable to create donation order."
      );
    }

    return data;
  };

  const verifyPayment = async (response) => {
    const { data, error } = await supabase.functions.invoke(
      "razorpay-payment",
      {
        body: {
          action: "verify_payment",
          razorpay_order_id:
            response.razorpay_order_id,
          razorpay_payment_id:
            response.razorpay_payment_id,
          razorpay_signature:
            response.razorpay_signature,
        },
      }
    );

    if (error) {
      throw new Error(error.message);
    }

    if (!data?.verified) {
      throw new Error("Payment verification failed.");
    }
  };

  const saveDonation = async (user) => {
    const { error } = await supabase
      .from("donations")
      .insert({
        user_id: user.id,
        charity_id: charityId,
        amount: selectedAmount,
        status: "paid",
      });

    if (error) {
      throw error;
    }
  };

  const handleDonate = async () => {
    setMessage("");
    setError("");

    if (!charityId) {
      setError("Please select a charity.");
      return;
    }

    if (!selectedAmount || selectedAmount < 1) {
      setError("Please enter a donation amount of at least ₹1.");
      return;
    }

    if (!Razorpay) {
      setError("Razorpay is still loading. Please try again.");
      return;
    }

    try {
      setSaving(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        navigate("/login");
        return;
      }

      const order = await createOrder();

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "Digital Heroes",
        description: "Independent Charity Donation",
        order_id: order.id,

        prefill: {
          name: user.user_metadata?.full_name || "",
          email: user.email || "",
        },

        theme: {
          color: "#34d399",
        },

        handler: async function (response) {
          try {
            setMessage("Verifying donation...");
            setError("");

            await verifyPayment(response);
            await saveDonation(user);

            setMessage(
              "Donation successful! Thank you for supporting the cause."
            );
          } catch (err) {
            console.error(err);
            setError(
              err.message ||
                "Donation verification failed."
            );
          } finally {
            setSaving(false);
          }
        },

        modal: {
          ondismiss: function () {
            setSaving(false);
            setMessage("");
          },
        },
      };

      const razorpay = new Razorpay(options);

      razorpay.on(
        "payment.failed",
        function (response) {
          console.error(
            "Donation payment failed:",
            response.error
          );

          setError(
            response.error?.description ||
              "Donation payment failed."
          );

          setSaving(false);
        }
      );

      razorpay.open();
    } catch (err) {
      console.error(err);

      setError(
        err.message ||
          "Unable to start donation."
      );

      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-950">

      <nav className="bg-slate-950 text-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="h-20 flex items-center justify-between">

            <div>
              <div className="font-bold text-xl">
                Digital Heroes
              </div>

              <div className="text-xs text-slate-400">
                Independent Donation
              </div>
            </div>

            <button
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-2 border border-white/15 px-4 py-2 rounded-xl"
            >
              <ArrowLeft className="w-4 h-4" />
              Dashboard
            </button>

          </div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-12">

        <div className="text-center">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-100 flex items-center justify-center">
            <Heart className="w-8 h-8 text-emerald-600 fill-emerald-600" />
          </div>

          <p className="text-sm font-bold text-emerald-600 uppercase mt-6">
            Give directly
          </p>

          <h1 className="text-4xl font-bold mt-2">
            Support a cause you care about
          </h1>

          <p className="text-slate-500 mt-3">
            Make a one-time donation independently of your subscription.
          </p>
        </div>

        {message && (
          <div className="mt-8 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl p-4">
            {message}
          </div>
        )}

        {error && (
          <div className="mt-8 bg-red-50 border border-red-200 text-red-700 rounded-2xl p-4">
            {error}
          </div>
        )}

        <div className="bg-white rounded-3xl border border-slate-200 p-7 mt-10">

          <label className="block font-semibold mb-2">
            Choose charity
          </label>

          <select
            value={charityId}
            onChange={(e) => setCharityId(e.target.value)}
            className="w-full border border-slate-300 rounded-xl px-4 py-3 bg-white"
          >
            {charities.map((charity) => (
              <option
                key={charity.id}
                value={charity.id}
              >
                {charity.name}
              </option>
            ))}
          </select>

          <div className="mt-8">

            <label className="block font-semibold mb-3">
              Donation amount
            </label>

            <div className="grid grid-cols-3 gap-3">

              {[10, 25, 50].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => {
                    setAmount(value);
                    setCustomAmount("");
                  }}
                  className={`py-3 rounded-xl border-2 font-semibold ${
                    amount === value &&
                    customAmount === ""
                      ? "border-emerald-400 bg-emerald-50"
                      : "border-slate-200"
                  }`}
                >
                  ₹{value}
                </button>
              ))}

            </div>

            <input
              type="number"
              min="1"
              value={customAmount}
              onChange={(e) =>
                setCustomAmount(e.target.value)
              }
              placeholder="Or enter custom amount"
              className="w-full mt-4 border border-slate-300 rounded-xl px-4 py-3"
            />

          </div>

          <div className="mt-8 bg-slate-950 text-white rounded-2xl p-6">

            <div className="flex justify-between">
              <span className="text-slate-400">
                Donation
              </span>

              <strong className="text-2xl">
                ₹{selectedAmount || 0}
              </strong>
            </div>

            <button
              onClick={handleDonate}
              disabled={saving || razorpayLoading}
              className="w-full mt-6 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold py-4 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="w-5 h-5" />
                  Donate ₹{selectedAmount || 0}
                </>
              )}
            </button>

          </div>

        </div>

      </main>
    </div>
  );
}

export default Donate;