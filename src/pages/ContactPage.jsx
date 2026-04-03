import React from "react";
import PublicPageLayout from "../components/PublicPageLayout";

const contactMethods = [
  {
    label: "Email",
    value: "devsahushakti785@gmail.com",
    href: "mailto:devsahushakti785@gmail.com",
  },
  {
    label: "GitHub",
    value: "github.com/DEVS-shakti",
    href: "https://github.com/DEVS-shakti",
  },
  {
    label: "Instagram",
    value: "instagram.com/dev_sahu_785",
    href: "https://www.instagram.com/dev_sahu_785/",
  },
];

const ContactPage = () => (
  <PublicPageLayout
    eyebrow="Support"
    title="Contact TrackExpense"
    description="For support requests, business contact, privacy questions, or advertising-related communication, use the details below."
    seoTitle="Contact TrackExpense"
    seoDescription="Contact TrackExpense for support, business inquiries, privacy questions, or advertising-related communication."
    seoPath="/contact"
  >
    <section>
      <h2 className="text-xl font-semibold text-slate-900">Direct Contact</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {contactMethods.map((method) => (
          <a
            key={method.label}
            href={method.href}
            target={method.href.startsWith("http") ? "_blank" : undefined}
            rel={method.href.startsWith("http") ? "noreferrer" : undefined}
            className="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-indigo-200 hover:bg-indigo-50"
          >
            <p className="text-sm font-semibold text-slate-900">{method.label}</p>
            <p className="mt-2 text-sm text-slate-600">{method.value}</p>
          </a>
        ))}
      </div>
    </section>

    <section>
      <h2 className="text-xl font-semibold text-slate-900">Response Scope</h2>
      <p className="mt-3">
        Messages related to account issues, privacy, content, partnerships, or ad
        review can be sent through the contact methods above. Please include enough
        detail to identify the issue clearly.
      </p>
    </section>
  </PublicPageLayout>
);

export default ContactPage;
