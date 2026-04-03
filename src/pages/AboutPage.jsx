import React from "react";
import PublicPageLayout from "../components/PublicPageLayout";

const AboutPage = () => (
  <PublicPageLayout
    eyebrow="Company"
    title="About TrackExpense"
    description="TrackExpense is a personal finance web application focused on expense tracking, bill splitting, practical budgeting, and clear monthly insights."
    seoTitle="About TrackExpense"
    seoDescription="Learn what TrackExpense does, who built it, and how it helps users track expenses, split bills, and manage budgets."
    seoPath="/about"
  >
    <section>
      <h2 className="text-xl font-semibold text-slate-900">What the Product Does</h2>
      <p className="mt-3">
        The application helps users organize income and expenses, create spending
        categories, assign budgets, and review trends from a simple dashboard. The
        goal is to make routine money management easier without unnecessary clutter.
      </p>
    </section>

    <section>
      <h2 className="text-xl font-semibold text-slate-900">Who Built It</h2>
      <p className="mt-3">
        ExpenseTrack is built and maintained by Shakti. The public site and product
        pages are intended to present the app clearly, support users, and meet common
        publisher requirements for services such as Google AdSense.
      </p>
    </section>

    <section>
      <h2 className="text-xl font-semibold text-slate-900">Development Profiles</h2>
      <div className="mt-3 space-y-2">
        <p>Email: devsahushakti785@gmail.com</p>
        <p>GitHub: github.com/DEVS-shakti</p>
        <p>Instagram: dev_sahu_785</p>
      </div>
    </section>
  </PublicPageLayout>
);

export default AboutPage;
