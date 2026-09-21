import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Check,
  Heart,
  Loader2,
  Search,
  ExternalLink,
} from "lucide-react";
import { supabase } from "../lib/supabase";

function Charities() {
  const navigate = useNavigate();

  const [charities, setCharities] = useState([]);
  const [selectedCharity, setSelectedCharity] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadCharities();
    loadSelectedCharity();
  }, []);

  const loadCharities = async () => {
    try {
      const { data, error } = await supabase
        .from("charities")
        .select("*")
        .eq("active", true)
        .order("featured", { ascending: false })
        .order("name", { ascending: true });

      if (error) throw error;

      setCharities(data || []);
    } catch (err) {
      console.error(err);
      setError("Unable to load charities.");
    } finally {
      setLoading(false);
    }
  };

  const loadSelectedCharity = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data, error } = await supabase
      .from("subscriptions")
      .select("charity_id")
      .eq("user_id", user.id)
      .eq("status", "active")
      .maybeSingle();

    if (!error && data?.charity_id) {
      setSelectedCharity(data.charity_id);
    }
  };

  const handleSelect = async (charityId) => {
    setMessage("");
    setError("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      navigate("/login");
      return;
    }

    /*
      Subscription creation/update will be handled by the
      subscription module. For now we store the selected charity
      when an active subscription exists.
    */

    const { data: subscription, error: fetchError } = await supabase
      .from("subscriptions")
      .select("id")
      .eq("user_id", user.id)
      .eq("status", "active")
      .maybeSingle();

    if (fetchError) {
      console.error(fetchError);
    }

    if (!subscription) {
      setSelectedCharity(charityId);
      setMessage(
        "Charity selected. It will be saved when you activate your subscription."
      );
      return;
    }

    const { error: updateError } = await supabase
      .from("subscriptions")
      .update({
        charity_id: charityId,
      })
      .eq("id", subscription.id)
      .eq("user_id", user.id);

    if (updateError) {
      console.error(updateError);
      setError(
        "Your charity could not be updated. Please try again."
      );
      return;
    }

    setSelectedCharity(charityId);
    setMessage("Your charity has been updated successfully.");
  };

  const filteredCharities = charities.filter((charity) => {
    const searchText = search.toLowerCase();

    return (
      charity.name?.toLowerCase().includes(searchText) ||
      charity.description?.toLowerCase().includes(searchText)
    );
  });

  const featuredCharity = charities.find(
    (charity) => charity.featured
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin" />
          Loading charities...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-950">
      {/* NAVBAR */}
      <nav className="bg-slate-950 text-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="h-20 flex items-center justify-between">
            <button
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-400 flex items-center justify-center">
                <Heart className="w-5 h-5 text-slate-950 fill-slate-950" />
              </div>

              <div className="text-left">
                <div className="font-bold text-xl">
                  Digital Heroes
                </div>
                <div className="text-xs text-slate-400">
                  Charity directory
                </div>
              </div>
            </button>

            <button
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/15 text-sm hover:bg-white/10 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              Dashboard
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-10">
        {/* HEADER */}
        <div className="max-w-3xl mb-8">
          <p className="text-sm font-semibold text-emerald-600 uppercase tracking-wider">
            Your impact
          </p>

          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mt-2">
            Choose a cause that matters.
          </h1>

          <p className="text-slate-500 mt-4 text-lg">
            Your subscription can support a charity while you take part
            in the Digital Heroes community.
          </p>
        </div>

        {/* FEATURED */}
        {featuredCharity && (
          <div className="bg-slate-950 text-white rounded-3xl overflow-hidden mb-8">
            <div className="grid lg:grid-cols-2">
              <div className="h-64 lg:h-auto">
                {featuredCharity.image_url ? (
                  <img
                    src={featuredCharity.image_url}
                    alt={featuredCharity.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full min-h-64 bg-emerald-400 flex items-center justify-center">
                    <Heart className="w-16 h-16 text-slate-950" />
                  </div>
                )}
              </div>

              <div className="p-8 md:p-10 flex flex-col justify-center">
                <span className="inline-flex w-fit px-3 py-1.5 rounded-full bg-emerald-400 text-slate-950 text-xs font-bold uppercase tracking-wider">
                  Featured charity
                </span>

                <h2 className="text-3xl md:text-4xl font-bold mt-5">
                  {featuredCharity.name}
                </h2>

                <p className="text-slate-400 mt-4 leading-7">
                  {featuredCharity.description ||
                    "Supporting meaningful change through community action."}
                </p>

                <div className="flex flex-wrap gap-3 mt-7">
                  <button
                    onClick={() => handleSelect(featuredCharity.id)}
                    className={`inline-flex items-center gap-2 px-5 py-3 rounded-xl font-semibold transition ${
                      selectedCharity === featuredCharity.id
                        ? "bg-emerald-400 text-slate-950"
                        : "bg-white text-slate-950 hover:bg-slate-200"
                    }`}
                  >
                    {selectedCharity === featuredCharity.id ? (
                      <>
                        <Check className="w-4 h-4" />
                        Selected
                      </>
                    ) : (
                      <>
                        <Heart className="w-4 h-4" />
                        Choose this charity
                      </>
                    )}
                  </button>

                  {featuredCharity.website_url && (
                    <a
                      href={featuredCharity.website_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-white/15 hover:bg-white/10 font-semibold transition"
                    >
                      Visit website
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MESSAGE */}
        {error && (
          <div className="mb-6 px-5 py-4 rounded-2xl bg-red-50 border border-red-100 text-red-700">
            {error}
          </div>
        )}

        {message && (
          <div className="mb-6 px-5 py-4 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-700">
            {message}
          </div>
        )}

        {/* SEARCH */}
        <div className="bg-white rounded-3xl border border-slate-200 p-5 mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search charities..."
              className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-slate-200 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition"
            />
          </div>
        </div>

        {/* DIRECTORY */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold">
            Explore charities
          </h2>

          <p className="text-slate-500 mt-1">
            Discover causes and choose where your contribution goes.
          </p>
        </div>

        {filteredCharities.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-100 flex items-center justify-center">
              <Heart className="w-7 h-7 text-slate-400" />
            </div>

            <h3 className="text-xl font-bold mt-5">
              No charities found
            </h3>

            <p className="text-slate-500 mt-2">
              Try searching with a different keyword.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCharities.map((charity) => (
              <div
                key={charity.id}
                className="bg-white rounded-3xl border border-slate-200 overflow-hidden hover:border-emerald-300 hover:shadow-lg transition"
              >
            <div className="h-48 bg-emerald-400 flex items-center justify-center">
  {charity.image_url ? (
    <img
      src={charity.image_url}
      alt={charity.name}
      className="w-full h-full object-cover"
    />
  ) : (
    <Heart className="w-14 h-14 text-slate-950" />
  )}
</div>

                <div className="p-6">
                  {charity.featured && (
                    <span className="inline-flex px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold mb-3">
                      Featured
                    </span>
                  )}

                  <h3 className="text-xl font-bold">
                    {charity.name}
                  </h3>

                  <p className="text-slate-500 text-sm leading-6 mt-3 min-h-12">
                    {charity.description ||
                      "A community cause making a meaningful difference."}
                  </p>

                  <div className="flex gap-2 mt-6">
                    <button
                      onClick={() => handleSelect(charity.id)}
                      className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold transition ${
                        selectedCharity === charity.id
                          ? "bg-emerald-400 text-slate-950"
                          : "bg-slate-950 text-white hover:bg-slate-800"
                      }`}
                    >
                      {selectedCharity === charity.id ? (
                        <>
                          <Check className="w-4 h-4" />
                          Selected
                        </>
                      ) : (
                        <>
                          <Heart className="w-4 h-4" />
                          Select
                        </>
                      )}
                    </button>

                    {charity.website_url && (
                      <a
                        href={charity.website_url}
                        target="_blank"
                        rel="noreferrer"
                        className="w-11 h-11 rounded-xl border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition"
                        title="Visit website"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CONTRIBUTION INFO */}
        <div className="mt-10 bg-emerald-50 border border-emerald-100 rounded-3xl p-6 md:p-8">
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-xl bg-emerald-400 flex items-center justify-center shrink-0">
              <Heart className="w-5 h-5 text-slate-950 fill-slate-950" />
            </div>

            <div>
              <h3 className="text-lg font-bold">
                Your contribution starts at 10%
              </h3>

              <p className="text-slate-600 mt-2 leading-6">
                Every subscription supports your selected charity with a
                minimum contribution of 10%. You can increase your
                contribution when choosing your subscription plan.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Charities;