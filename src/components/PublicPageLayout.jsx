import React from "react";
import { Link } from "react-router-dom";

const PublicPageLayout = ({ eyebrow, title, description, children }) => (
  <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.08),_transparent_24%),linear-gradient(180deg,_#f8fafc_0%,_#ffffff_100%)] text-slate-800">
    <header className="border-b border-slate-200 bg-white/90 px-4 py-4 backdrop-blur sm:px-6">
      <div className="mx-auto flex max-w-5xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link to="/" className="text-xl font-bold text-indigo-700">
          ExpenseTrack
        </Link>
        <nav className="flex flex-wrap gap-4 text-sm text-slate-600">
          <Link to="/about" className="hover:text-indigo-700">
            About
          </Link>
          <Link to="/privacy-policy" className="hover:text-indigo-700">
            Privacy Policy
          </Link>
          <Link to="/cookies" className="hover:text-indigo-700">
            Cookies
          </Link>
          <Link to="/contact" className="hover:text-indigo-700">
            Contact
          </Link>
        </nav>
      </div>
    </header>

    <main className="px-4 py-12 sm:px-6">
      <div className="mx-auto max-w-5xl rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] sm:p-10">
        <p className="text-xs font-semibold uppercase tracking-[0.26em] text-indigo-700">
          {eyebrow}
        </p>
        <h1 className="mt-3 text-3xl font-bold text-slate-900 sm:text-4xl">{title}</h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
          {description}
        </p>
        <div className="mt-8 space-y-8 text-sm leading-7 text-slate-700 sm:text-base">
          {children}
        </div>
      </div>
    </main>
  </div>
);

export default PublicPageLayout;
