import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  PlayCircle,
  ShieldCheck,
  LineChart as LineChartIcon,
  CalendarCheck,
  Wallet,
  Sparkles,
  TrendingUp,
  BellRing,
  Goal,
  CheckCircle2,
  Instagram,
  Github,
  BriefcaseBusiness,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import heroImg from "../assets/finnance.svg";
import work from "../assets/work.svg";
import secure from "../assets/secure.svg";
import visual from "../assets/visual.svg";
import SeoMeta from "../components/SeoMeta";
import "../index.css";

const advantages = [
  {
    title: "Smart Visual Reports",
    description:
      "Understand where your money goes with clear charts and real-time summaries.",
    icon: <LineChartIcon className="h-5 w-5" />,
    image: visual,
  },
  {
    title: "Secure by Design",
    description:
      "Authentication and private user storage keep your personal finance data protected.",
    icon: <ShieldCheck className="h-5 w-5" />,
    image: secure,
  },
  {
    title: "Works on Every Device",
    description:
      "Track income and expenses smoothly from mobile, tablet, or desktop.",
    icon: <Wallet className="h-5 w-5" />,
    image: work,
  },
  {
    title: "Monthly Budget Control",
    description:
      "Set category limits and compare actual spending against targets.",
    icon: <Goal className="h-5 w-5" />,
  },
  {
    title: "Practical Spending Insights",
    description:
      "Identify overspending patterns and improve savings with actionable metrics.",
    icon: <TrendingUp className="h-5 w-5" />,
  },
  {
    title: "Useful Reminders",
    description:
      "Stay consistent with your money habits using regular account nudges.",
    icon: <BellRing className="h-5 w-5" />,
  },
];

const practicalInsights = [
  {
    heading: "Cut food delivery overspending",
    detail:
      "Track food expenses weekly and compare against your monthly budget to spot leakage early.",
  },
  {
    heading: "Plan before salary day",
    detail:
      "Use trend view to estimate fixed costs first, then assign realistic limits to flexible categories.",
  },
  {
    heading: "Improve net savings steadily",
    detail:
      "Watch income vs expense trends and target a positive gap every month for long-term goals.",
  },
];

const demoClips = [
  {
    id: "categories",
    title: "Create Categories",
    eyebrow: "Setup flow",
    description:
      "Add income and expense categories first so the rest of the app stays structured.",
    src: "/demo/categoryview.mp4",
    length: "0:23",
  },
  {
    id: "budgets",
    title: "Plan Monthly Budgets",
    eyebrow: "Control spending",
    description:
      "Choose an existing category, set a limit, then edit or remove it in place.",
    src: "/demo/budgetview.mp4",
    length: "0:21",
  },
  {
    id: "transactions",
    title: "Add Transactions",
    eyebrow: "Daily usage",
    description:
      "Capture income and expenses with date, description, and category tracking.",
    src: "/demo/transactionview.mp4",
    length: "0:31",
  },
];

const budgetVsActualData = [
  { name: "Food", budget: 10000, actual: 8600 },
  { name: "Transport", budget: 5000, actual: 4300 },
  { name: "Utilities", budget: 7000, actual: 6400 },
  { name: "Entertainment", budget: 5000, actual: 4100 },
];

const Landing = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const demoSectionRef = useRef(null);

  const ctaLabel = useMemo(() => (user ? "Go to Dashboard" : "Get Started"), [user]);

  useEffect(() => {
    const nodes = document.querySelectorAll(".reveal-on-scroll");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
          }
        });
      },
      { threshold: 0.18, rootMargin: "0px 0px -8% 0px" }
    );

    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);

  const handleStart = () => {
    if (user) navigate("/dashboard");
    else navigate("/login");
  };

  const handleOpenDemo = () => {
    demoSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    setMenuOpen(false);
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-slate-50 text-slate-800">
      <SeoMeta
        title="TrackExpense - Free Expense Tracker & Bill Splitter"
        description="Track daily expenses, split bills with roommates, and manage your finances easily with this free online expense tracker."
        keywords="expense tracker, split bills, roommate expense app, budget tracker"
        path="/"
      />
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 px-4 py-4 backdrop-blur sm:px-6">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link to="/" className="text-xl font-bold text-indigo-700 sm:text-2xl">
            TrackExpense
          </Link>

          <button
            className="text-slate-700 md:hidden"
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label="Toggle navigation menu"
          >
            {menuOpen ? <X /> : <Menu />}
          </button>

          <nav className="hidden items-center gap-2 md:flex lg:gap-3">
          
            <a href="#advantages" className="rounded-lg px-3 py-2 text-sm hover:bg-slate-100">
              Advantages
            </a>
            <a href="#insights" className="rounded-lg px-3 py-2 text-sm hover:bg-slate-100">
              Insights
            </a>
            <Link to="/about" className="rounded-lg px-3 py-2 text-sm hover:bg-slate-100">
              About
            </Link>
            <Link
              to="/privacy-policy"
              className="rounded-lg px-3 py-2 text-sm hover:bg-slate-100"
            >
              Privacy Policy
            </Link>
            <Link to="/contact" className="rounded-lg px-3 py-2 text-sm hover:bg-slate-100">
              Contact
            </Link>
            <button
              onClick={handleOpenDemo}
              className="rounded-lg border border-indigo-200 px-4 py-2 text-sm text-indigo-700 hover:bg-indigo-50"
            >
              View Demo
            </button>
            <button
              onClick={handleStart}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700"
            >
              {ctaLabel}
            </button>
          </nav>
        </div>

        {menuOpen && (
          <div className="mx-auto mt-4 max-w-7xl space-y-2 border-t border-slate-200 pt-4 md:hidden">
            
            <a
              href="#advantages"
              className="block rounded-lg bg-white px-3 py-2 hover:bg-slate-100"
              onClick={() => setMenuOpen(false)}
            >
              Advantages
            </a>
            <a
              href="#insights"
              className="block rounded-lg bg-white px-3 py-2 hover:bg-slate-100"
              onClick={() => setMenuOpen(false)}
            >
              Practical Insights
            </a>
            <Link
              to="/about"
              className="block rounded-lg bg-white px-3 py-2 hover:bg-slate-100"
              onClick={() => setMenuOpen(false)}
            >
              About
            </Link>
            <Link
              to="/privacy-policy"
              className="block rounded-lg bg-white px-3 py-2 hover:bg-slate-100"
              onClick={() => setMenuOpen(false)}
            >
              Privacy Policy
            </Link>
            <Link
              to="/contact"
              className="block rounded-lg bg-white px-3 py-2 hover:bg-slate-100"
              onClick={() => setMenuOpen(false)}
            >
              Contact
            </Link>
            <button
              onClick={handleOpenDemo}
              className="w-full rounded-lg border border-indigo-200 px-4 py-2 text-indigo-700 hover:bg-indigo-50"
            >
              View Demo
            </button>
            <button
              onClick={() => {
                setMenuOpen(false);
                handleStart();
              }}
              className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
            >
              {ctaLabel}
            </button>
          </div>
        )}
      </header>

      <section className="bg-radial-gradient(circle_at_top_left,_rgba(99,102,241,0.18) bg-_transparent_28%) bg-linear-gradient(135deg,_-[#eef2ff_0%,_#f8fafc_42%,_#ffffff_100%)px-4] pb-20 pt-12 sm:px-6">
        <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-2">
          <div className="reveal-on-scroll">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-white px-3 py-1 text-xs font-semibold text-indigo-700">
              <Sparkles className="h-3.5 w-3.5" /> Money clarity for everyday life
            </div>
            <h1 className="text-4xl font-bold leading-tight text-slate-900 sm:text-5xl">
              Track smarter.
              <br />
              Spend better.
              <br />
              Split bills with confidence.
            </h1>
            <p className="mt-5 max-w-xl text-base text-slate-600 sm:text-lg">
              TrackExpense helps you organize transactions, split shared expenses,
              control category budgets, and understand monthly trends without complexity.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={handleStart}
                className="rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white hover:bg-indigo-700"
              >
                {ctaLabel}
              </button>
              <button
                onClick={handleOpenDemo}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-indigo-200 bg-white px-6 py-3 font-semibold text-indigo-700 hover:bg-indigo-50"
              >
                <PlayCircle className="h-5 w-5" /> View Demo
              </button>
            </div>

            <div className="mt-7 grid max-w-lg grid-cols-3 gap-3">
              <MetricCard title="10s" subtitle="Quick entry" />
              <MetricCard title="Bill split" subtitle="Roommates ready" />
              <MetricCard title="24/7" subtitle="Any device" />
            </div>
          </div>

          <div className="reveal-on-scroll relative">
            <div className="absolute -left-4 top-10 hidden h-28 w-28 rounded-full bg-sky-200/50 blur-3xl sm:block" />
            <div className="absolute -right-2 bottom-4 hidden h-32 w-32 rounded-full bg-indigo-200/60 blur-3xl sm:block" />
            <div className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-white/80 p-5 shadow-[0_30px_80px_rgba(15,23,42,0.16)] backdrop-blur">
              <img
                src={heroImg}
                alt="TrackExpense dashboard preview"
                className="mx-auto w-full max-w-lg"
                loading="eager"
                fetchPriority="high"
                decoding="async"
              />
            </div>
          </div>
        </div>
      </section>

      <section
        id="demo"
        ref={demoSectionRef}
        className="relative overflow-hidden bg-slate-950 px-4 py-16 text-white sm:px-6"
      >
        <div className="bg-radial-gradient(circle_at_top,_rgba(59,130,246,0.22) bg-_transparent_30%) bg-radial-gradient(circle_at_bottom_right,_rgba(99,102,241,0.26) bg-_transparent_25%) absolute inset-0" />
        <div className="relative mx-auto max-w-7xl">
          <div className="reveal-on-scroll max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-sky-300">
              Product Demo
            </p>
            <h3 className="mt-3 text-3xl font-bold sm:text-4xl">
              Real app flows, shown directly in the page.
            </h3>
            <p className="mt-4 text-base text-slate-300 sm:text-lg">
              Start with the dashboard, then move through categories, budgets, and
              transactions. The clips are embedded into the layout so the section feels
              like part of the product story, not a detached popup.
            </p>
          </div>

          <div className="mt-10 grid gap-8 lg:grid-cols-[0.92fr_1.08fr]">
            <div className="reveal-on-scroll flex flex-col justify-between rounded-[2rem] border border-white/10 bg-white/10 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.32)] backdrop-blur">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-300">
                  Overview Snapshot
                </p>
                <h4 className="mt-3 text-2xl font-semibold">Start with the dashboard, then follow the daily flow.</h4>
                <p className="mt-4 text-sm text-slate-300 sm:text-base">
                  The demo section focuses on the three actions that matter most in real use:
                  create categories, define budgets from those categories, and log transactions that
                  update your reports.
                </p>
              </div>

              <div className="mt-8 space-y-5">
                <div>
                  <p className="mb-2 pl-1 text-xs font-medium tracking-[0.18em] text-slate-400">
                    LIGHT MODE
                  </p>
                  <div className="overflow-hidden rounded-[1.6rem] border border-white/10 bg-slate-900/70 p-3">
                    <div className="relative aspect-[16/10] overflow-hidden rounded-[1.15rem] bg-slate-950">
                      <img
                        src="/demo/dashboardimg.png"
                        alt="TrackExpense dashboard screenshot"
                        className="h-full w-full object-cover object-top"
                        loading="lazy"
                        decoding="async"
                      />
                      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-slate-950/55 to-transparent" />
                    </div>
                  </div>
                </div>

                <div>
                  <p className="mb-2 pl-1 text-xs font-medium tracking-[0.18em] text-slate-400">
                    DARK MODE
                  </p>
                  <div className="overflow-hidden rounded-[1.6rem] border border-white/10 bg-slate-900/70 p-3">
                    <div className="relative aspect-[16/10] overflow-hidden rounded-[1.15rem] bg-slate-950">
                      <img
                        src="/demo/darkdash.png"
                        alt="TrackExpense dark dashboard screenshot"
                        className="h-full w-full object-cover object-top"
                        loading="lazy"
                        decoding="async"
                      />
                      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-slate-950/60 to-transparent" />
                    </div>
                  </div>
                </div>

                <div className="overflow-hidden rounded-[1.6rem] border border-white/10 bg-slate-900/70 p-4">
                  <div className="mb-3">
                    <p className="text-xs font-medium tracking-[0.18em] text-slate-400">
                      PROFILE
                    </p>
                    <p className="mt-1 text-sm text-slate-300">
                      Manage account details, check sign-in information, and handle
                      profile actions from one clean settings view.
                    </p>
                  </div>
                  <div className="relative aspect-[16/10] overflow-hidden rounded-[1.15rem] bg-slate-950">
                    <img
                      src="/demo/profile.png"
                      alt="TrackExpense profile screenshot"
                      className="h-full w-full object-cover object-top"
                      loading="lazy"
                      decoding="async"
                    />
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-slate-950/60 to-transparent" />
                  </div>
                </div>
              </div>

              <button
                onClick={handleStart}
                className="mt-6 rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950 hover:bg-slate-100"
              >
                {user ? "Open Dashboard" : "Try It Now"}
              </button>
            </div>

            <div className="grid gap-5">
              {demoClips.map((clip, index) => (
                <DemoClipCard key={clip.id} clip={clip} index={index} />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="advantages" className="bg-slate-50 px-4 py-14 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="reveal-on-scroll">
            <h3 className="text-3xl font-bold text-slate-900 sm:text-4xl">
              Why people choose ExpenseTrack
            </h3>
            <p className="mt-3 max-w-3xl text-slate-600">
              Built to solve daily money-management problems with fast input, practical
              analytics, and better spending discipline.
            </p>
          </div>

          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {advantages.map((item) => (
              <AdvantageCard key={item.title} item={item} />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-14 sm:px-6">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-3">
          <article className="reveal-on-scroll rounded-2xl border border-slate-200 bg-slate-50 p-6">
            <h2 className="text-2xl font-bold text-slate-900">What is TrackExpense?</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
              TrackExpense is a free expense tracker and bill management app for personal
              budgeting, shared household spending, and simple monthly money planning.
            </p>
          </article>
          <article className="reveal-on-scroll rounded-2xl border border-slate-200 bg-slate-50 p-6">
            <h2 className="text-2xl font-bold text-slate-900">How to use this expense tracker</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
              Create categories, add income and expenses, set budget limits, and review
              reports to keep spending visible. For shared living, use the app to track
              common costs before splitting bills manually.
            </p>
          </article>
          <article className="reveal-on-scroll rounded-2xl border border-slate-200 bg-slate-50 p-6">
            <h2 className="text-2xl font-bold text-slate-900">Features of the app</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
              The app includes expense logging, category-based budgets, reports, trend
              tracking, profile management, and public legal pages needed for a more
              production-ready website footprint.
            </p>
          </article>
        </div>
      </section>

      <section id="insights" className="bg-white px-4 py-14 sm:px-6">
        <div className="mx-auto grid max-w-7xl items-start gap-8 lg:grid-cols-2">
          <div className="reveal-on-scroll rounded-2xl bg-slate-900 p-6 text-slate-100 sm:p-8">
            <h3 className="text-2xl font-bold sm:text-3xl">Practical insights you can use today</h3>
            <p className="mt-3 text-slate-300">
              This is not just a tracker. It gives decision-ready context to improve your monthly outcomes.
            </p>
            <div className="mt-6 space-y-4">
              {practicalInsights.map((item) => (
                <div key={item.heading} className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-400" />
                  <div>
                    <p className="font-semibold">{item.heading}</p>
                    <p className="text-sm text-slate-300">{item.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="reveal-on-scroll rounded-2xl border border-slate-200 bg-slate-50 p-6 sm:p-8">
            <h4 className="text-xl font-semibold text-slate-900">How ExpenseTrack works</h4>
            <div className="mt-5 space-y-4">
              <Step number="1" title="Add income and expenses" body="Capture daily transactions quickly with categories." />
              <Step number="2" title="Set monthly budgets" body="Define limits for each expense category and stay on target." />
              <Step number="3" title="Review trends and take action" body="Use insights to cut waste and increase savings." />
            </div>
          </div>
        </div>

        <div className="mx-auto mt-8 grid max-w-7xl gap-6 lg:grid-cols-2">
          <div className="reveal-on-scroll rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
            <div className="mb-3 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-indigo-600" />
              <h5 className="text-lg font-semibold text-slate-900">Income vs Expense Trend</h5>
            </div>
            <p className="mb-4 text-sm text-slate-500">
              Track monthly momentum and keep expense growth under control.
            </p>
            <svg viewBox="0 0 440 220" className="h-60 w-full rounded-xl border border-slate-200 bg-slate-50">
              <polyline
                fill="none"
                stroke="#2563EB"
                strokeWidth="4"
                points="20,150 90,160 160,120 230,130 300,95 370,80"
              />
              <polyline
                fill="none"
                stroke="#F97316"
                strokeWidth="4"
                points="20,175 90,180 160,155 230,165 300,145 370,140"
              />
              <text x="26" y="205" fontSize="12" fill="#64748b">Jan</text>
              <text x="90" y="205" fontSize="12" fill="#64748b">Feb</text>
              <text x="160" y="205" fontSize="12" fill="#64748b">Mar</text>
              <text x="230" y="205" fontSize="12" fill="#64748b">Apr</text>
              <text x="300" y="205" fontSize="12" fill="#64748b">May</text>
              <text x="370" y="205" fontSize="12" fill="#64748b">Jun</text>
              <circle cx="370" cy="80" r="4" fill="#2563EB" />
              <circle cx="370" cy="140" r="4" fill="#F97316" />
            </svg>
            <div className="mt-3 flex items-center gap-4 text-xs text-slate-600">
              <span className="inline-flex items-center gap-1">
                <span className="h-2.5 w-2.5 rounded-full bg-blue-600" /> Income
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="h-2.5 w-2.5 rounded-full bg-orange-500" /> Expense
              </span>
            </div>
          </div>

          <div className="reveal-on-scroll rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
            <div className="mb-3 flex items-center gap-2">
              <CalendarCheck className="h-5 w-5 text-emerald-600" />
              <h5 className="text-lg font-semibold text-slate-900">Budget vs Actual</h5>
            </div>
            <p className="mb-4 text-sm text-slate-500">
              Compare category budgets with actual spending to prevent overruns.
            </p>
            <div className="space-y-4">
              {budgetVsActualData.map((row) => {
                const actualPct = Math.min(100, Math.round((row.actual / row.budget) * 100));
                return (
                  <div key={row.name}>
                    <div className="mb-1 flex justify-between text-xs text-slate-600">
                      <span>{row.name}</span>
                      <span>
                        Budget: {row.budget} | Actual: {row.actual}
                      </span>
                    </div>
                    <div className="h-2.5 overflow-hidden rounded-full bg-slate-200">
                      <div className="h-full w-full bg-emerald-500" />
                    </div>
                    <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-slate-200">
                      <div className="h-full bg-rose-500" style={{ width: `${actualPct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-3 flex items-center gap-4 text-xs text-slate-600">
              <span className="inline-flex items-center gap-1">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Budget
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-500" /> Actual
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-slate-50 px-4 py-14 sm:px-6">
        <div className="mx-auto max-w-7xl rounded-[2rem] border border-dashed border-slate-300 bg-white p-6 text-center shadow-sm sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
            Advertising
          </p>
          <h2 className="mt-3 text-2xl font-bold text-slate-900">Ad placement area</h2>
          <p className="mt-3 text-sm text-slate-600 sm:text-base">
            This reserved section can be used for Google AdSense or another approved ad partner
            after policy review and publisher approval.
          </p>
          <div className="ad-container mt-5 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-10 text-sm text-slate-400">
            Ad container
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-slate-100 text-slate-700">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:grid-cols-2 sm:px-6 lg:grid-cols-5">
          <div>
            <p className="font-semibold text-slate-900">TrackExpense</p>
            <p className="mt-2 text-sm text-slate-600">
              Free expense tracking, shared bill planning, and practical budgeting insights.
            </p>
          </div>
          <div>
            <p className="font-semibold text-slate-900">Explore</p>
            <div className="mt-2 flex flex-col gap-1 text-sm">
              <a href="#demo" className="hover:text-indigo-700">Demo</a>
              <a href="#advantages" className="hover:text-indigo-700">Advantages</a>
              <a href="#insights" className="hover:text-indigo-700">Insights</a>
            </div>
          </div>
          <div>
            <p className="font-semibold text-slate-900">Account</p>
            <div className="mt-2 flex flex-col gap-1 text-sm">
              <button onClick={() => navigate("/login")} className="text-left hover:text-indigo-700">
                Login
              </button>
              <button onClick={() => navigate("/register")} className="text-left hover:text-indigo-700">
                Register
              </button>
            </div>
          </div>
          <div>
            <p className="font-semibold text-slate-900">Company</p>
            <div className="mt-2 flex flex-col gap-1 text-sm">
              <Link to="/about" className="hover:text-indigo-700">
                About
              </Link>
              <Link to="/contact" className="hover:text-indigo-700">
                Contact
              </Link>
              <Link to="/privacy-policy" className="hover:text-indigo-700">
                Privacy Policy
              </Link>
              <Link to="/cookies" className="hover:text-indigo-700">
                Cookies Policy
              </Link>
            </div>
          </div>
          <div>
            <p className="font-semibold text-slate-900">Social</p>
            <div className="mt-2 space-y-1 text-sm text-slate-600">
              <a
                href="https://www.instagram.com/dev_sahu_785/"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 hover:text-pink-600"
              >
                <Instagram className="h-4 w-4" /> dev_sahu_785
              </a>
              <br />
              <a
                href="https://www.instagram.com/saktey_785/"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 hover:text-pink-600"
              >
                <Instagram className="h-4 w-4" /> saktey_785
              </a>
              <br />
              <a
                href="https://devshakti2024.netlify.app"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 hover:text-indigo-700"
              >
                <BriefcaseBusiness className="h-4 w-4" />
                Portfolio: shakti2024.netlify.app
              </a>
              <br />
              <a
                href="https://github.com/DEVS-shakti"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 hover:text-indigo-700"
              >
                <Github className="h-4 w-4" />
                GitHub: github.com/DEVS-shakti
              </a>
            </div>
          </div>
        </div>
        <div className="border-t border-slate-200 px-4 py-4 sm:px-6">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 text-center text-sm text-slate-600 md:flex-row md:text-left">
            <p>&copy; 2026 TrackExpense. All rights reserved.</p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link to="/privacy-policy" className="hover:text-indigo-700">
                Privacy Policy
              </Link>
              <span className="text-slate-400">|</span>
              <Link to="/contact" className="hover:text-indigo-700">
                Contact
              </Link>
              <span className="text-slate-400">|</span>
              <Link to="/about" className="hover:text-indigo-700">
                About
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

const MetricCard = ({ title, subtitle }) => (
  <div className="rounded-xl border border-slate-200 bg-white p-3 text-center">
    <p className="text-lg font-bold text-slate-900">{title}</p>
    <p className="text-xs text-slate-500">{subtitle}</p>
  </div>
);

const DemoClipCard = ({ clip, index }) => (
  <article
    className="reveal-on-scroll overflow-hidden rounded-[1.8rem] border border-white/10 bg-white/5 p-3 text-white shadow-[0_16px_40px_rgba(15,23,42,0.22)] backdrop-blur"
    style={{ transitionDelay: `${index * 90}ms` }}
  >
    <div className="overflow-hidden rounded-[1.25rem] border border-white/10 bg-black">
      <video
        className="aspect-video w-full object-cover"
        src={clip.src}
        muted
        autoPlay
        loop
        playsInline
        preload="none"
      />
    </div>
    <div className="mt-4 flex items-center justify-between gap-3">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-300">
          {clip.eyebrow}
        </p>
        <h4 className="mt-2 text-lg font-semibold">{clip.title}</h4>
      </div>
      <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-slate-200">
        {clip.length}
      </span>
    </div>
    <p className="mt-2 text-sm text-slate-300">{clip.description}</p>
  </article>
);

const AdvantageCard = ({ item }) => (
  <div className="reveal-on-scroll rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
    <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700">
      {item.icon}
    </div>
    <h4 className="text-lg font-semibold text-slate-900">{item.title}</h4>
    <p className="mt-2 text-sm text-slate-600">{item.description}</p>
    {item.image && (
      <img
        src={item.image}
        alt={item.title}
        className="mt-4 h-28 w-full object-contain"
        loading="lazy"
        decoding="async"
      />
    )}
  </div>
);

const Step = ({ number, title, body }) => (
  <div className="flex gap-3">
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700">
      {number}
    </div>
    <div>
      <p className="font-semibold text-slate-900">{title}</p>
      <p className="text-sm text-slate-600">{body}</p>
    </div>
  </div>
);

export default Landing;
