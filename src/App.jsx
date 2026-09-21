import { useState, useEffect } from "react";
import { supabase } from './lib/supabase'
import { HashRouter, Routes, Route, Link } from "react-router-dom";import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Scores from "./pages/Scores";
import Charities from "./pages/Charities";
import Subscribe from "./pages/Subscribe";
import Draws from "./pages/Draws";
import AdminDashboard from "./pages/AdminDashboard";
import AdminWinners from "./pages/AdminWinners";

import {
  ArrowRight,
  Heart,
  Trophy,
  Target,
  Sparkles,
  Menu,
  X,
} from "lucide-react";

function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
useEffect(() => {
    const testSupabase = async () => {
      const { data, error } = await supabase
        .from('charities')
        .select('*')

      console.log('Supabase data:', data)
      console.log('Supabase error:', error)
    }

    testSupabase()
  }, [])
  return (
    <div className="min-h-screen bg-slate-950 text-white">

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400 text-slate-950">
              <Heart size={21} fill="currentColor" />
            </div>

            <span className="text-xl font-bold tracking-tight">
              Digital<span className="text-emerald-400">Heroes</span>
            </span>
          </div>

          <div className="hidden items-center gap-8 md:flex">
            <a href="#how-it-works" className="text-sm text-slate-300 transition hover:text-white">
              How it works
            </a>

            <a href="#impact" className="text-sm text-slate-300 transition hover:text-white">
              Our impact
            </a>

            <a href="#charities" className="text-sm text-slate-300 transition hover:text-white">
              Charities
            </a>

            <Link
  to="/signup"
  className="rounded-full bg-emerald-400 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300"
>
  Get started
</Link>
          </div>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden"
          >
            {menuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {menuOpen && (
          <div className="border-t border-white/10 px-6 py-5 md:hidden">
            <div className="flex flex-col gap-5">
              <a href="#how-it-works">How it works</a>
              <a href="#impact">Our impact</a>
              <a href="#charities">Charities</a>
              <button className="rounded-full bg-emerald-400 px-5 py-3 font-semibold text-slate-950">
                Get started
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero */}
      <main>

        <section className="relative overflow-hidden pt-36 pb-24">
          <div className="absolute left-1/2 top-20 h-96 w-96 -translate-x-1/2 rounded-full bg-emerald-400/10 blur-3xl" />

          <div className="relative mx-auto max-w-7xl px-6">
            <div className="grid items-center gap-16 lg:grid-cols-2">

              <div>
                <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm text-emerald-300">
                  <Sparkles size={16} />
                  Play for something bigger
                </div>

                <h1 className="max-w-3xl text-5xl font-bold leading-tight tracking-tight sm:text-6xl lg:text-7xl">
                  Your game.
                  <br />
                  Your chance.
                  <br />
                  <span className="text-emerald-400">
                    Their future.
                  </span>
                </h1>

                <p className="mt-7 max-w-xl text-lg leading-8 text-slate-400">
                  Track your golf performance, enter monthly prize draws,
                  and support a charity you care about — all through one
                  simple membership.
                </p>

                <div className="mt-9 flex flex-col gap-4 sm:flex-row">
                  <Link
                  to="/signup"
                   className="group flex items-center justify-center gap-2 rounded-full bg-emerald-400 px-7 py-4 font-semibold text-slate-950 transition hover:bg-emerald-300"
                                                                                                                                                                       >
                    <ArrowRight
                      size={18}
                      className="transition group-hover:translate-x-1"
                    />
                   </Link>

                  <Link
                               to="/charities"
                      className="rounded-full border border-white/15 px-7 py-4 font-semibold text-white transition hover:bg-white/5"
                         >
                          Explore charities
                         </Link>
                </div>
              </div>

              {/* Hero visual */}
              <div className="relative">
                <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur">

                  <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-emerald-400/10 blur-3xl" />

                  <div className="relative">

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-400">
                          This month's impact
                        </p>
                        <p className="mt-2 text-4xl font-bold">
                          £24,850
                        </p>
                      </div>

                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-400/10 text-emerald-400">
                        <Heart size={26} fill="currentColor" />
                      </div>
                    </div>

                    <div className="my-8 h-px bg-white/10" />

                    <div className="grid grid-cols-2 gap-4">

                      <div className="rounded-2xl bg-slate-900/70 p-5">
                        <Target className="text-emerald-400" size={22} />
                        <p className="mt-5 text-2xl font-bold">1,248</p>
                        <p className="mt-1 text-sm text-slate-400">
                          Active players
                        </p>
                      </div>

                      <div className="rounded-2xl bg-slate-900/70 p-5">
                        <Trophy className="text-emerald-400" size={22} />
                        <p className="mt-5 text-2xl font-bold">£12k</p>
                        <p className="mt-1 text-sm text-slate-400">
                          Prize pool
                        </p>
                      </div>

                    </div>

                    <div className="mt-4 rounded-2xl bg-emerald-400 p-5 text-slate-950">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium opacity-70">
                            Next draw
                          </p>
                          <p className="mt-1 text-xl font-bold">
                            Coming this month
                          </p>
                        </div>

                        <ArrowRight size={22} />
                      </div>
                    </div>

                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* How it works */}
        <section
          id="how-it-works"
          className="border-t border-white/10 bg-slate-900/50 py-24"
        >
          <div className="mx-auto max-w-7xl px-6">

            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-widest text-emerald-400">
                How it works
              </p>

              <h2 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
                Three simple steps.
              </h2>

              <p className="mt-5 text-slate-400">
                A straightforward membership designed around your game
                and the causes that matter to you.
              </p>
            </div>

            <div className="mt-14 grid gap-6 md:grid-cols-3">

              {[
                {
                  number: "01",
                  title: "Choose your plan",
                  text: "Subscribe monthly or yearly and choose the charity you want to support.",
                },
                {
                  number: "02",
                  title: "Track your game",
                  text: "Enter your latest Stableford scores and keep your performance history up to date.",
                },
                {
                  number: "03",
                  title: "Play. Win. Give.",
                  text: "Take part in monthly draws while a portion of your membership supports your chosen cause.",
                },
              ].map((step) => (
                <div
                  key={step.number}
                  className="group rounded-3xl border border-white/10 bg-white/[0.03] p-7 transition hover:-translate-y-1 hover:border-emerald-400/30"
                >
                  <span className="text-sm font-bold text-emerald-400">
                    {step.number}
                  </span>

                  <h3 className="mt-8 text-xl font-bold">
                    {step.title}
                  </h3>

                  <p className="mt-4 leading-7 text-slate-400">
                    {step.text}
                  </p>
                </div>
              ))}

            </div>
          </div>
        </section>

        {/* Impact */}
        <section id="impact" className="py-24">
          <div className="mx-auto max-w-7xl px-6">

            <div className="grid gap-12 lg:grid-cols-2 lg:items-center">

              <div>
                <p className="text-sm font-semibold uppercase tracking-widest text-emerald-400">
                  More than a game
                </p>

                <h2 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
                  Every membership can create an impact.
                </h2>

                <p className="mt-6 max-w-xl leading-8 text-slate-400">
                  Choose a cause that means something to you. At least
                  10% of your subscription goes towards your selected
                  charity, with the option to give more.
                </p>

                <button className="mt-8 flex items-center gap-2 font-semibold text-emerald-400">
                  Discover our charities
                  <ArrowRight size={18} />
                </button>
              </div>

              <div
                id="charities"
                className="rounded-3xl border border-white/10 bg-gradient-to-br from-emerald-400/10 to-transparent p-8"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-400 text-slate-950">
                  <Heart size={28} fill="currentColor" />
                </div>

                <p className="mt-10 text-5xl font-bold">10%</p>

                <p className="mt-3 text-lg font-semibold">
                  Minimum charity contribution
                </p>

                <p className="mt-3 leading-7 text-slate-400">
                  You decide where your contribution goes and can
                  voluntarily increase the percentage of your subscription.
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="px-6 pb-24">
          <div className="mx-auto max-w-7xl overflow-hidden rounded-3xl bg-emerald-400 px-8 py-16 text-slate-950 sm:px-14">

            <div className="flex flex-col justify-between gap-10 md:flex-row md:items-center">

              <div className="max-w-2xl">
                <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
                  Ready to play for something bigger?
                </h2>

                <p className="mt-5 max-w-xl text-lg text-slate-900/70">
                  Join Digital Heroes and turn every round into an
                  opportunity to make a difference.
                </p>
              </div>

              <Link
                       to="/signup"
                className="flex shrink-0 items-center justify-center gap-2 rounded-full bg-slate-950 px-7 py-4 font-semibold text-white transition hover:bg-slate-800"
                 >
                      Get started
                    <ArrowRight size={18} />
                   </Link>

            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">

          <p>
            © 2026 Digital Heroes. Built for impact.
          </p>

          <p>
            Play. Win. Give.
          </p>

        </div>
      </footer>

    </div>
  );
}

function App() {
  return (
    <HashRouter>
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/signup" element={<Signup />} />
    <Route path="/login" element={<Login />} />
    <Route path="/dashboard" element={<Dashboard />} />
    <Route path="/scores" element={<Scores />} />
    <Route path="/charities" element={<Charities />} />
    <Route path="/subscribe" element={<Subscribe />} />
    <Route path="/draws" element={<Draws />} />
    <Route path="/admin" element={<AdminDashboard />} />
    <Route path="/admin-winners" element={<AdminWinners />} />
  </Routes>
</HashRouter>
  );
}

export default App;