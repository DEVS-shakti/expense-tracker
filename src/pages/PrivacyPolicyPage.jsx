import React from "react";
import PublicPageLayout from "../components/PublicPageLayout";

const PrivacyPolicyPage = () => (
  <PublicPageLayout
    eyebrow="Legal"
    title="Privacy Policy"
    description="This policy explains what information ExpenseTrack may collect, how it is used, and the choices users have when visiting the public website or using the application."
  >
    <section>
      <h2 className="text-xl font-semibold text-slate-900">Information We Collect</h2>
      <p className="mt-3">
        ExpenseTrack may collect account details you provide directly, including your
        email address and profile information. The app may also process expense,
        budget, and category records that you create inside your account. Technical
        information such as browser type, device data, IP-based location signals, and
        cookie identifiers may also be collected for security, analytics, and ad
        serving purposes.
      </p>
    </section>

    <section>
      <h2 className="text-xl font-semibold text-slate-900">How Information Is Used</h2>
      <p className="mt-3">
        Information is used to operate the website, authenticate users, store finance
        records, improve performance, respond to support requests, and maintain
        platform security. If advertising is enabled, data may also be used to
        display ads through services such as Google AdSense or other approved
        advertising partners.
      </p>
    </section>

    <section>
      <h2 className="text-xl font-semibold text-slate-900">Cookies and Advertising</h2>
      <p className="mt-3">
        ExpenseTrack uses essential cookies for basic functionality and may use
        optional cookies for analytics, personalization, and advertising. Third-party
        vendors, including Google, may use cookies to serve ads based on prior visits
        to this or other websites. Users can manage cookie preferences through the
        site banner and can review more detail on the cookies page.
      </p>
    </section>

    <section>
      <h2 className="text-xl font-semibold text-slate-900">Data Sharing</h2>
      <p className="mt-3">
        Personal information is not sold. Data may be shared with infrastructure,
        authentication, analytics, and advertising providers only when needed to run
        the service, comply with law, prevent fraud, or protect rights and safety.
      </p>
    </section>

    <section>
      <h2 className="text-xl font-semibold text-slate-900">Your Choices</h2>
      <p className="mt-3">
        You may request updates or deletion of account-related information, subject to
        legal and operational retention requirements. You can also reject optional
        cookies or update your cookie settings later.
      </p>
    </section>

    <section>
      <h2 className="text-xl font-semibold text-slate-900">Contact</h2>
      <p className="mt-3">
        Privacy questions can be sent to devsahushakti785@gmail.com.
      </p>
    </section>
  </PublicPageLayout>
);

export default PrivacyPolicyPage;
