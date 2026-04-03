import React from "react";
import PublicPageLayout from "../components/PublicPageLayout";

const CookiesPage = () => (
  <PublicPageLayout
    eyebrow="Legal"
    title="Cookies Policy"
    description="This page explains how ExpenseTrack uses cookies and similar technologies, including optional cookies related to analytics and advertising providers."
    seoTitle="Cookies Policy - TrackExpense"
    seoDescription="Understand how TrackExpense uses essential, analytics, personalization, and advertising cookies."
    seoPath="/cookies"
  >
    <section>
      <h2 className="text-xl font-semibold text-slate-900">What Cookies Are</h2>
      <p className="mt-3">
        Cookies are small text files stored in your browser. They help websites keep
        sessions active, remember preferences, measure usage, and support advertising
        features.
      </p>
    </section>

    <section>
      <h2 className="text-xl font-semibold text-slate-900">Cookie Categories Used</h2>
      <div className="mt-3 space-y-3">
        <p>
          <strong>Essential cookies:</strong> Required for authentication, security,
          theme persistence, and basic page operation.
        </p>
        <p>
          <strong>Analytics cookies:</strong> May be used to understand how visitors
          interact with public pages and to improve product performance.
        </p>
        <p>
          <strong>Advertising cookies:</strong> May be set by Google AdSense or other
          advertising partners to show ads, limit repeated ads, and measure campaign
          effectiveness.
        </p>
        <p>
          <strong>Personalization cookies:</strong> Used to remember non-essential
          display or experience preferences.
        </p>
      </div>
    </section>

    <section>
      <h2 className="text-xl font-semibold text-slate-900">Managing Your Preferences</h2>
      <p className="mt-3">
        When you first visit the site, you can accept all optional cookies, reject
        them, or choose individual categories. Essential cookies remain active because
        the site depends on them for basic operation.
      </p>
    </section>

    <section>
      <h2 className="text-xl font-semibold text-slate-900">Third-Party Services</h2>
      <p className="mt-3">
        If advertising or analytics tools are enabled, third-party providers may set
        or read cookies according to their own policies. That can include Google and
        similar partners used to support monetization and audience measurement.
      </p>
    </section>

    <section>
      <h2 className="text-xl font-semibold text-slate-900">Browser Controls</h2>
      <p className="mt-3">
        Most browsers let you block, delete, or limit cookies through browser
        settings. Blocking essential cookies may prevent parts of the site from
        working correctly.
      </p>
    </section>
  </PublicPageLayout>
);

export default CookiesPage;
