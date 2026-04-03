import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

const STORAGE_KEY = "expenseTrackCookiePreferences";

const defaultPreferences = {
  essential: true,
  analytics: false,
  ads: false,
  personalization: false,
};

const CookieConsentBanner = () => {
  const [mounted, setMounted] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [showManage, setShowManage] = useState(false);
  const [preferences, setPreferences] = useState(defaultPreferences);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);

      if (!saved) {
        setShowBanner(true);
        setPreferences(defaultPreferences);
      } else {
        const parsed = JSON.parse(saved);
        setPreferences({
          ...defaultPreferences,
          ...parsed,
          essential: true,
        });
      }
    } catch {
      setShowBanner(true);
    } finally {
      setMounted(true);
    }
  }, []);

  const savePreferences = (nextPreferences) => {
    const resolvedPreferences = {
      ...defaultPreferences,
      ...nextPreferences,
      essential: true,
      updatedAt: new Date().toISOString(),
    };

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(resolvedPreferences));
    setPreferences(resolvedPreferences);
    setShowBanner(false);
    setShowManage(false);
  };

  const preferenceRows = useMemo(
    () => [
      {
        key: "essential",
        title: "Essential cookies",
        description: "Required for login state, security, and basic site functionality.",
        locked: true,
      },
      {
        key: "analytics",
        title: "Analytics cookies",
        description: "Helps measure page usage and improve the product experience.",
      },
      {
        key: "ads",
        title: "Advertising cookies",
        description: "Supports Google AdSense or similar partners for relevant ads.",
      },
      {
        key: "personalization",
        title: "Personalization cookies",
        description: "Stores presentation preferences and non-essential customizations.",
      },
    ],
    []
  );

  if (!mounted || !showBanner) {
    return null;
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-[70] px-4 pb-4 sm:px-6">
      <div className="mx-auto max-w-5xl overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white/95 shadow-[0_20px_70px_rgba(15,23,42,0.22)] backdrop-blur">
        <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-indigo-700">
              Cookie Preferences
            </p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900">
              Choose how this site uses cookies.
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Essential cookies are always active. Optional cookies may be used for
              analytics, personalization, and advertising services such as Google
              AdSense. You can update these choices later from the cookies page.
            </p>
            <div className="mt-4 flex flex-wrap gap-3 text-sm">
              <Link to="/privacy-policy" className="font-medium text-indigo-700 hover:text-indigo-800">
                Privacy Policy
              </Link>
              <Link to="/cookies" className="font-medium text-indigo-700 hover:text-indigo-800">
                Cookies Policy
              </Link>
              <Link to="/contact" className="font-medium text-indigo-700 hover:text-indigo-800">
                Contact
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            {showManage ? (
              <div className="space-y-4">
                {preferenceRows.map((item) => (
                  <label key={item.key} className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-900">{item.title}</p>
                      <p className="text-xs leading-5 text-slate-500">{item.description}</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={Boolean(preferences[item.key])}
                      disabled={item.locked}
                      onChange={(event) =>
                        setPreferences((current) => ({
                          ...current,
                          [item.key]: event.target.checked,
                        }))
                      }
                      className="mt-1 h-4 w-4 accent-indigo-600"
                    />
                  </label>
                ))}

                <div className="flex flex-col gap-2 pt-2 sm:flex-row">
                  <button
                    onClick={() => savePreferences(preferences)}
                    className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
                  >
                    Save Preferences
                  </button>
                  <button
                    onClick={() => setShowManage(false)}
                    className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                  >
                    Back
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-sm text-slate-600">
                  Current optional categories remain off until you consent.
                </p>
                <div className="mt-4 flex flex-col gap-2">
                  <button
                    onClick={() =>
                      savePreferences({
                        essential: true,
                        analytics: true,
                        ads: true,
                        personalization: true,
                      })
                    }
                    className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
                  >
                    Accept All
                  </button>
                  <button
                    onClick={() => savePreferences(defaultPreferences)}
                    className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                  >
                    Reject Optional
                  </button>
                  <button
                    onClick={() => setShowManage(true)}
                    className="rounded-xl border border-indigo-200 px-4 py-2.5 text-sm font-semibold text-indigo-700 hover:bg-indigo-50"
                  >
                    Manage Cookies
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookieConsentBanner;
