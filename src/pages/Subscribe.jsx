import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRazorpay } from "react-razorpay";
import {
  ArrowLeft,
  Check,
  CreditCard,
  Heart,
  Loader2,
} from "lucide-react";
import { supabase } from "../lib/supabase";

function Subscribe() {
  const navigate = useNavigate();

  const {
    error: razorpayError,
    isLoading: razorpayLoading,
    Razorpay,
  } = useRazorpay();

  const [plan, setPlan] = useState("monthly");
  const [charities, setCharities] = useState([]);
  const [charityId, setCharityId] = useState("");
  const [percentage, setPercentage] = useState(10);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const amount = plan === "monthly" ? 19 : 190;

  useEffect(() => {
  loadCharities();
  loadSelectedCharity();
}, []);
  useEffect(() => {
    if (razorpayError) {
      console.error("Razorpay error:", razorpayError);
    }
  }, [razorpayError]);

  const loadCharities = async () => {
    const { data, error } = await supabase
      .from("charities")
      .select("*")
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
  const loadSelectedCharity = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const selectedCharityId =
    user?.user_metadata?.charity_id;

  if (selectedCharityId) {
    setCharityId(selectedCharityId);
  }
};

  const createRazorpayOrder = async () => {
    const amountInPaise = amount * 100;

    const { data, error } = await supabase.functions.invoke(
      "razorpay-payment",
      {
        body: {
          action: "create_order",
          amount: amountInPaise,
          currency: "INR",
          receipt: `DH_${Date.now()}`,
        },
      }
    );

    if (error) {
      throw new Error(error.message);
    }

    if (!data?.id) {
      throw new Error(
        data?.error || "Unable to create Razorpay order."
      );
    }

    return data;
  };

  const verifyPayment = async (paymentResponse) => {
    const { data, error } = await supabase.functions.invoke(
      "razorpay-payment",
      {
        body: {
          action: "verify_payment",
          razorpay_order_id:
            paymentResponse.razorpay_order_id,
          razorpay_payment_id:
            paymentResponse.razorpay_payment_id,
          razorpay_signature:
            paymentResponse.razorpay_signature,
        },
      }
    );

    if (error) {
      throw new Error(error.message);
    }

    if (!data?.verified) {
      throw new Error("Payment verification failed.");
    }

    return true;
  };

  const saveSubscription = async (user) => {
    const startDate = new Date();
    const renewalDate = new Date(startDate);

    if (plan === "monthly") {
      renewalDate.setMonth(renewalDate.getMonth() + 1);
    } else {
      renewalDate.setFullYear(
        renewalDate.getFullYear() + 1
      );
    }

    const { error } = await supabase
      .from("subscriptions")
      .insert({
        user_id: user.id,
        plan,
        amount,
        status: "active",
        charity_id: charityId,
        charity_percentage: percentage,
        start_date: startDate
          .toISOString()
          .split("T")[0],
        renewal_date: renewalDate
          .toISOString()
          .split("T")[0],
      });

    if (error) {
      throw error;
    }
  };

  const handleSubscribe = async () => {
    setMessage("");
    setError("");

    if (!charityId) {
      setError("Please select a charity.");
      return;
    }

    if (!Razorpay) {
      setError("Razorpay is still loading. Please try again.");
      return;
    }

    setSaving(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        navigate("/login");
        return;
      }

      // 1. Create Razorpay order
      const order = await createRazorpayOrder();

      // 2. Open Razorpay Checkout
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,

        amount: order.amount,
        currency: order.currency,

        name: "Digital Heroes",
        description:
          plan === "monthly"
            ? "Monthly Digital Heroes Subscription"
            : "Yearly Digital Heroes Subscription",

        order_id: order.id,

        prefill: {
          name:
            user.user_metadata?.full_name || "",
          email: user.email || "",
        },

        theme: {
          color: "#34d399",
        },

        handler: async function (response) {
          try {
            setMessage("Verifying payment...");
            setError("");

            // 3. Verify payment on server
            await verifyPayment(response);

            // 4. Save subscription only after verification
            await saveSubscription(user);

            setMessage(
              "Payment successful! Your subscription is now active."
            );
          } catch (err) {
            console.error(err);
            setError(
              err.message ||
                "Payment verification failed."
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
            "Payment failed:",
            response.error
          );

          setError(
            response.error?.description ||
              "Payment failed. Please try again."
          );

          setSaving(false);
        }
      );

      razorpay.open();
    } catch (err) {
      console.error(err);
      setError(
        err.message ||
          "Unable to start payment."
      );
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-950">

      <nav className="bg-slate-950 text-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="h-20 flex items-center justify-between">

            <div>
              <div className="font-bold text-xl">
                Digital Heroes
              </div>

              <div className="text-xs text-slate-400">
                Subscription
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

      <main className="max-w-6xl mx-auto px-6 py-12">

        <div className="text-center">
          <p className="text-sm font-bold text-emerald-600 uppercase">
            Membership
          </p>

          <h1 className="text-4xl font-bold mt-2">
            Choose your subscription
          </h1>

          <p className="text-slate-500 mt-3">
            Play your game while supporting a cause you care about.
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

        <div className="grid md:grid-cols-2 gap-6 mt-10">

          <button
            onClick={() => setPlan("monthly")}
            className={`text-left rounded-3xl p-7 border-2 transition ${
              plan === "monthly"
                ? "border-emerald-400 bg-white"
                : "border-slate-200 bg-white"
            }`}
          >
            <p className="text-slate-500">
              Monthly
            </p>

            <h2 className="text-4xl font-bold mt-2">
              ₹19
              <span className="text-base text-slate-400">
                /month
              </span>
            </h2>

            {plan === "monthly" && (
              <Check className="text-emerald-500 mt-5" />
            )}
          </button>

          <button
            onClick={() => setPlan("yearly")}
            className={`text-left rounded-3xl p-7 border-2 transition ${
              plan === "yearly"
                ? "border-emerald-400 bg-white"
                : "border-slate-200 bg-white"
            }`}
          >
            <p className="text-slate-500">
              Yearly
            </p>

            <h2 className="text-4xl font-bold mt-2">
              ₹190
              <span className="text-base text-slate-400">
                /year
              </span>
            </h2>

            {plan === "yearly" && (
              <Check className="text-emerald-500 mt-5" />
            )}
          </button>

        </div>

        <div className="bg-white rounded-3xl border border-slate-200 p-7 mt-8">

          <div className="flex items-center gap-3">
            <Heart className="text-emerald-600" />

            <div>
              <h2 className="text-xl font-bold">
                Choose your charity
              </h2>

              <p className="text-sm text-slate-500">
                At least 10% of your subscription goes to your selected charity.
              </p>
            </div>
          </div>

          <select
            value={charityId}
            onChange={(e) =>
              setCharityId(e.target.value)
            }
            className="w-full mt-6 border border-slate-300 rounded-xl px-4 py-3 bg-white"
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

            <div className="flex justify-between">
              <span className="font-semibold">
                Charity contribution
              </span>

              <span className="font-bold text-emerald-600">
                {percentage}%
              </span>
            </div>

            <input
              type="range"
              min="10"
              max="100"
              step="5"
              value={percentage}
              onChange={(e) =>
                setPercentage(
                  Number(e.target.value)
                )
              }
              className="w-full mt-4 accent-emerald-500"
            />

            <div className="flex justify-between text-xs text-slate-400 mt-2">
              <span>10%</span>
              <span>100%</span>
            </div>

          </div>

        </div>

        <div className="bg-slate-950 text-white rounded-3xl p-7 mt-8">

          <div className="flex justify-between">
            <span className="text-slate-400">
              Selected plan
            </span>

            <strong>
              {plan === "monthly"
                ? "Monthly"
                : "Yearly"}
            </strong>
          </div>

          <div className="flex justify-between mt-4">
            <span className="text-slate-400">
              Subscription
            </span>

            <strong>
              ₹{amount}
            </strong>
          </div>

          <div className="flex justify-between mt-4">
            <span className="text-slate-400">
              Charity contribution
            </span>

            <strong className="text-emerald-400">
              {percentage}%
            </strong>
          </div>

          <button
            onClick={handleSubscribe}
            disabled={
              saving || razorpayLoading
            }
            className="w-full mt-7 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold py-4 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Processing payment...
              </>
            ) : (
              <>
                <CreditCard className="w-5 h-5" />
                Continue to payment
              </>
            )}
          </button>

        </div>

      </main>
    </div>
  );
}

export default Subscribe;