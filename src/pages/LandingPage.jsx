import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
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
  Atom,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import { useAuth } from "../context/AuthContext";
import heroImg from "../assets/finnance.svg";
import work from "../assets/work.svg";
import secure from "../assets/secure.svg";
import visual from "../assets/visual.svg";
import "../index.css";

const DEMO_VIDEO_URL = "";

const advantages = [
  {
    title: "Smart Visual Reports",
    description:
      "Understand where your money goes with clear charts and real-time summaries.",
    icon: <LineChartIcon className="w-5 h-5" />,
    image: visual,
  },
  {
    title: "Secure by Design",
    description:
      "Authentication and private user storage keep your personal finance data protected.",
    icon: <ShieldCheck className="w-5 h-5" />,
    image: secure,
  },
  {
    title: "Works on Every Device",
    description:
      "Track income and expenses smoothly from mobile, tablet, or desktop.",
    icon: <Wallet className="w-5 h-5" />,
    image: work,
  },
  {
    title: "Monthly Budget Control",
    description:
      "Set category limits and compare actual spending against targets.",
    icon: <Goal className="w-5 h-5" />,
  },
  {
    title: "Practical Spending Insights",
    description:
      "Identify overspending patterns and improve savings with actionable metrics.",
    icon: <TrendingUp className="w-5 h-5" />,
  },
  {
    title: "Useful Reminders",
    description:
      "Stay consistent with your money habits using regular account nudges.",
    icon: <BellRing className="w-5 h-5" />,
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

const demoHighlights = [
  "Add transactions in seconds with category-based tracking.",
  "Monitor monthly income, expense, and net savings in one dashboard.",
  "Compare budget limits vs actual category spending visually.",
  "Manage category lists and keep records clean and organized.",
];

const trendData = [
  { month: "Jan", income: 75000, expense: 52000 },
  { month: "Feb", income: 72000, expense: 50000 },
  { month: "Mar", income: 81000, expense: 56000 },
  { month: "Apr", income: 79000, expense: 53000 },
  { month: "May", income: 86000, expense: 57000 },
  { month: "Jun", income: 90000, expense: 59000 },
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
  const [demoOpen, setDemoOpen] = useState(false);

  const ctaLabel = useMemo(() => (user ? "Go to Dashboard" : "Get Started"), [user]);

  const handleStart = () => {
    if (user) navigate("/dashboard");
    else navigate("/login");
  };

  const handleOpenDemo = () => {
    setDemoOpen(true);
  };

  return (
    <div className="overflow-x-hidden min-h-screen bg-slate-50 text-slate-800">
      <header className="px-4 sm:px-6 py-4 bg-white/95 backdrop-blur border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-xl sm:text-2xl font-bold text-indigo-700">ExpenseTrack</h1>

          <button
            className="md:hidden text-slate-700"
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label="Toggle navigation menu"
          >
            {menuOpen ? <X /> : <Menu />}
          </button>

          <nav className="hidden md:flex items-center gap-2 lg:gap-3">
            <a href="#advantages" className="px-3 py-2 text-sm rounded-lg hover:bg-slate-100">
              Advantages
            </a>
            <a href="#insights" className="px-3 py-2 text-sm rounded-lg hover:bg-slate-100">
              Practical Insights
            </a>
            <button
              onClick={handleOpenDemo}
              className="px-4 py-2 text-sm rounded-lg border border-indigo-200 text-indigo-700 hover:bg-indigo-50"
            >
              View Demo
            </button>
            <button
              onClick={handleStart}
              className="px-4 py-2 text-sm rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
            >
              {ctaLabel}
            </button>
          </nav>
        </div>

        {menuOpen && (
          <div className="md:hidden max-w-7xl mx-auto mt-4 border-t border-slate-200 pt-4 space-y-2">
            <a
              href="#advantages"
              className="block px-3 py-2 rounded-lg bg-white hover:bg-slate-100"
              onClick={() => setMenuOpen(false)}
            >
              Advantages
            </a>
            <a
              href="#insights"
              className="block px-3 py-2 rounded-lg bg-white hover:bg-slate-100"
              onClick={() => setMenuOpen(false)}
            >
              Practical Insights
            </a>
            <button
              onClick={() => {
                setMenuOpen(false);
                handleOpenDemo();
              }}
              className="w-full px-4 py-2 rounded-lg border border-indigo-200 text-indigo-700 hover:bg-indigo-50"
            >
              View Demo
            </button>
            <button
              onClick={() => {
                setMenuOpen(false);
                handleStart();
              }}
              className="w-full px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
            >
              {ctaLabel}
            </button>
          </div>
        )}
      </header>

      <section className="px-4 sm:px-6 pt-12 pb-14 bg-gradient-to-br from-indigo-100 via-sky-50 to-white">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-white border border-indigo-100 rounded-full px-3 py-1 text-xs text-indigo-700 font-semibold mb-4">
              <Sparkles className="w-3.5 h-3.5" /> Money clarity for everyday life
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold leading-tight text-slate-900">
              Track smarter.
              <br />
              Spend better.
              <br />
              Save with confidence.
            </h2>
            <p className="mt-5 text-slate-600 text-base sm:text-lg max-w-xl">
              ExpenseTrack helps you organize transactions, control category budgets,
              and understand monthly trends without complexity.
            </p>

            <div className="mt-7 flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleStart}
                className="px-6 py-3 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 font-semibold"
              >
                {ctaLabel}
              </button>
              <button
                onClick={handleOpenDemo}
                className="px-6 py-3 rounded-xl bg-white text-indigo-700 border border-indigo-200 hover:bg-indigo-50 font-semibold inline-flex items-center justify-center gap-2"
              >
                <PlayCircle className="w-5 h-5" /> View Demo
              </button>
            </div>

            <div className="mt-7 grid grid-cols-3 gap-3 max-w-lg">
              <MetricCard title="10s" subtitle="Quick entry" />
              <MetricCard title="360deg" subtitle="Spending view" />
              <MetricCard title="24/7" subtitle="Any device" />
            </div>
          </div>

          <div className="bg-white border border-indigo-100 rounded-3xl shadow-xl p-5 sm:p-7">
            <img src={heroImg} alt="Finance dashboard preview" className="w-full max-w-lg mx-auto" />
          </div>
        </div>
      </section>

      <section id="advantages" className="px-4 sm:px-6 py-14 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <h3 className="text-3xl sm:text-4xl font-bold text-slate-900">Why people choose ExpenseTrack</h3>
          <p className="mt-3 text-slate-600 max-w-3xl">
            Built to solve daily money-management problems with fast input, practical analytics,
            and better spending discipline.
          </p>

          <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {advantages.map((item) => (
              <AdvantageCard key={item.title} item={item} />
            ))}
          </div>
        </div>
      </section>

      <section id="insights" className="px-4 sm:px-6 py-14 bg-white">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-8 items-start">
          <div className="bg-slate-900 text-slate-100 rounded-2xl p-6 sm:p-8">
            <h3 className="text-2xl sm:text-3xl font-bold">Practical insights you can use today</h3>
            <p className="mt-3 text-slate-300">
              This is not just a tracker. It gives decision-ready context to improve your monthly outcomes.
            </p>
            <div className="mt-6 space-y-4">
              {practicalInsights.map((item) => (
                <div key={item.heading} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 mt-0.5 text-emerald-400" />
                  <div>
                    <p className="font-semibold">{item.heading}</p>
                    <p className="text-sm text-slate-300">{item.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 sm:p-8">
            <h4 className="text-xl font-semibold text-slate-900">How ExpenseTrack works</h4>
            <div className="mt-5 space-y-4">
              <Step number="1" title="Add income and expenses" body="Capture daily transactions quickly with categories." />
              <Step number="2" title="Set monthly budgets" body="Define limits for each expense category and stay on target." />
              <Step number="3" title="Review trends and take action" body="Use insights to cut waste and increase savings." />
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-8 grid lg:grid-cols-2 gap-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-5 h-5 text-indigo-600" />
              <h5 className="text-lg font-semibold text-slate-900">Income vs Expense Trend</h5>
            </div>
            <p className="text-sm text-slate-500 mb-4">
              Track monthly momentum and keep expense growth under control.
            </p>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="4 4" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="income" stroke="#2563EB" strokeWidth={3} />
                  <Line type="monotone" dataKey="expense" stroke="#F97316" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <CalendarCheck className="w-5 h-5 text-emerald-600" />
              <h5 className="text-lg font-semibold text-slate-900">Budget vs Actual (Practical)</h5>
            </div>
            <p className="text-sm text-slate-500 mb-4">
              Compare category budgets with actual spending to prevent overruns.
            </p>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={budgetVsActualData}>
                  <CartesianGrid strokeDasharray="4 4" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="budget" fill="#22C55E" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="actual" fill="#EF4444" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-slate-100 text-slate-700 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <p className="font-semibold text-slate-900">ExpenseTrack</p>
            <p className="text-sm mt-2 text-slate-600">
              Smart expense tracking with practical budgeting insights.
            </p>
          </div>
          <div>
            <p className="font-semibold text-slate-900">Explore</p>
            <div className="mt-2 flex flex-col text-sm gap-1">
              <a href="#advantages" className="hover:text-indigo-700">Advantages</a>
              <a href="#insights" className="hover:text-indigo-700">Insights</a>
              <button onClick={handleOpenDemo} className="text-left hover:text-indigo-700">
                View Demo
              </button>
            </div>
          </div>
          <div>
            <p className="font-semibold text-slate-900">Account</p>
            <div className="mt-2 flex flex-col text-sm gap-1">
              <button onClick={() => navigate("/login")} className="text-left hover:text-indigo-700">
                Login
              </button>
              <button onClick={() => navigate("/register")} className="text-left hover:text-indigo-700">
                Register
              </button>
            </div>
          </div>
          <div>
            <p className="font-semibold text-slate-900">Social</p>
            <div className="mt-2 text-sm text-slate-600 space-y-1">
              <p className="inline-flex items-center gap-2">
                <Instagram className="w-4 h-4" /> dev_sahu_785
              </p>
              <p className="inline-flex items-center gap-2">
                <Instagram className="w-4 h-4" /> saktey_785
              </p>
            </div>
          </div>
        </div>
        <div className="border-t border-slate-200 px-4 sm:px-6 py-4 text-center text-sm text-slate-600">
          <p className="inline-flex items-center gap-2">
            Developed by Shakti with Codex
            <Atom className="w-4 h-4 text-sky-600" />
          </p>
        </div>
      </footer>

      {demoOpen && (
        <div className="fixed inset-0 bg-black/60 z-[70] flex items-center justify-center p-4">
          <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-200">
              <div>
                <h4 className="text-lg sm:text-xl font-semibold text-slate-900">Product Demo</h4>
                <p className="text-sm text-slate-500">See how ExpenseTrack helps you manage money end-to-end.</p>
              </div>
              <button onClick={() => setDemoOpen(false)} className="text-slate-500 hover:text-slate-800" aria-label="Close demo">
                <X />
              </button>
            </div>

            {DEMO_VIDEO_URL ? (
              <div className="aspect-video bg-black">
                <iframe
                  title="ExpenseTrack demo video"
                  src={DEMO_VIDEO_URL}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : (
              <div className="p-5 sm:p-6 grid md:grid-cols-2 gap-6">
                <div className="rounded-xl bg-slate-50 border border-slate-200 p-4">
                  <p className="text-sm font-semibold text-indigo-700">Demo Preview</p>
                  <p className="mt-2 text-sm text-slate-600">
                    Add your product walkthrough video by setting `DEMO_VIDEO_URL` in
                    `LandingPage.jsx`. Until then, this guided summary explains key flows.
                  </p>
                  <div className="mt-4 rounded-lg bg-white border border-slate-200 p-4">
                    <p className="text-sm text-slate-700">Suggested video sections:</p>
                    <ol className="mt-2 space-y-1 text-sm text-slate-600 list-decimal list-inside">
                      <li>Quick transaction entry and categories</li>
                      <li>Monthly budgets and variance check</li>
                      <li>Insights dashboard and practical actions</li>
                    </ol>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-900">Feature Highlights</p>
                  <ul className="mt-3 space-y-2">
                    {demoHighlights.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-sm text-slate-700">
                        <TrendingUp className="w-4 h-4 mt-0.5 text-indigo-600" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-5 flex gap-3">
                    <button
                      onClick={() => {
                        setDemoOpen(false);
                        navigate("/register");
                      }}
                      className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
                    >
                      Try It Now
                    </button>
                    <button
                      onClick={() => {
                        setDemoOpen(false);
                        handleStart();
                      }}
                      className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100"
                    >
                      Open App
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const MetricCard = ({ title, subtitle }) => (
  <div className="bg-white border border-slate-200 rounded-xl p-3 text-center">
    <p className="text-lg font-bold text-slate-900">{title}</p>
    <p className="text-xs text-slate-500">{subtitle}</p>
  </div>
);

const AdvantageCard = ({ item }) => (
  <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition">
    <div className="w-9 h-9 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center mb-3">
      {item.icon}
    </div>
    <h4 className="text-lg font-semibold text-slate-900">{item.title}</h4>
    <p className="mt-2 text-sm text-slate-600">{item.description}</p>
    {item.image && (
      <img src={item.image} alt={item.title} className="mt-4 w-full h-28 object-contain" />
    )}
  </div>
);

const Step = ({ number, title, body }) => (
  <div className="flex gap-3">
    <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 text-sm font-bold flex items-center justify-center shrink-0">
      {number}
    </div>
    <div>
      <p className="font-semibold text-slate-900">{title}</p>
      <p className="text-sm text-slate-600">{body}</p>
    </div>
  </div>
);

export default Landing;
