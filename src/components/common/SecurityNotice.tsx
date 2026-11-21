import React from 'react';
import { Shield, Lock, ExternalLink, AlertTriangle, KeyRound, UserCheck } from 'lucide-react';

export const OFFICIAL_WEBSITE_URL = 'https://resume-flow-eight.vercel.app/';

/**
 * Homepage Security & Website Verification Notice section.
 * Clean Linear-inspired blue-and-white surface with honest, practical guidance.
 */
export const SecurityNoticeSection: React.FC = () => {
  const safeguards = [
    {
      icon: Shield,
      title: 'Verify the official domain',
      description:
        'Watch out for fake websites or misspelled lookalike URLs. Always confirm your browser address bar matches https://resume-flow-eight.vercel.app/ before entering account details.',
    },
    {
      icon: AlertTriangle,
      title: 'Avoid suspicious phishing links',
      description:
        'Be cautious with unexpected links in emails, messages, or unfamiliar ads asking you to sign in urgently. Open the official site directly from your browser or bookmark.',
    },
    {
      icon: KeyRound,
      title: 'Never share passwords or OTPs',
      description:
        'Keep your password, email verification links, and one-time codes (OTPs) private. No support team member or administrator will ever ask you to share them.',
    },
    {
      icon: UserCheck,
      title: 'Protect your personal resume data',
      description:
        'Use a strong, unique password for your account and review personal contact details before sharing exported resumes on public job boards.',
    },
  ];

  return (
    <section id="security" className="py-20 border-t border-white/15">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-white/95 backdrop-blur-xl border border-blue-200/85 shadow-[0_24px_64px_rgba(15,35,95,0.2)] overflow-hidden text-slate-900">
          {/* Top Linear-inspired header */}
          <div className="px-6 sm:px-8 py-6 sm:py-7 bg-gradient-to-r from-blue-50/90 via-white to-sky-50/75 border-b border-blue-100 flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="flex items-start gap-3.5 max-w-2xl">
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center shrink-0 shadow-xs">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold tracking-wide text-blue-700">
                  Security & Website Verification Notice
                </p>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-950 tracking-tight mt-0.5">
                  Stay safe on the official ResumeFlow site
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 mt-1.5 leading-relaxed">
                  Quick reminders to help you recognize authentic sign-in pages and keep your account credentials and personal career details private.
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            {/* Official URL Verification Box */}
            <div className="rounded-xl bg-blue-50/70 border border-blue-200/90 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start sm:items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-white border border-blue-200 text-blue-600 flex items-center justify-center shrink-0 shadow-xs">
                  <Lock className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-[11px] font-semibold text-slate-500">
                    Official ResumeFlow Website
                  </div>
                  <a
                    href={OFFICIAL_WEBSITE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 font-mono text-xs sm:text-sm font-semibold text-blue-700 hover:text-blue-800 underline decoration-blue-300 underline-offset-4 break-all transition mt-0.5"
                  >
                    <span>{OFFICIAL_WEBSITE_URL}</span>
                    <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                  </a>
                </div>
              </div>

              <p className="text-[11px] text-slate-600 sm:text-right sm:max-w-xs leading-relaxed">
                Check that this exact address appears in your browser before signing in or creating an account.
              </p>
            </div>

            {/* Guidance Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {safeguards.map((item) => (
                <div
                  key={item.title}
                  className="p-4 sm:p-5 rounded-xl bg-slate-50/75 border border-slate-200/90 hover:border-blue-200 transition space-y-2"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                      <item.icon className="w-3.5 h-3.5" />
                    </div>
                    <h3 className="text-sm font-semibold text-slate-900">{item.title}</h3>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{item.description}</p>
                </div>
              ))}
            </div>

            {/* Calm footer note */}
            <div className="pt-2 border-t border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-slate-500">
              <span>
                Unsure about a sign-in link? Navigate directly to{' '}
                <a
                  href={OFFICIAL_WEBSITE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-blue-700 hover:text-blue-800 underline decoration-blue-200 underline-offset-2"
                >
                  {OFFICIAL_WEBSITE_URL}
                </a>
                .
              </span>
              <span className="text-slate-500">Never share passwords or verification codes.</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

/**
 * Compact Linear-inspired blue-and-white reminder placed near Login and Sign Up forms.
 */
export const AuthSecurityReminder: React.FC = () => (
  <div className="mt-4 rounded-xl bg-white/95 backdrop-blur-xl border border-blue-200/90 px-4 py-3 text-slate-700 shadow-lg flex items-start gap-2.5">
    <div className="w-6 h-6 rounded-md bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
      <Lock className="w-3.5 h-3.5" />
    </div>
    <div className="text-[11px] leading-relaxed space-y-1 min-w-0">
      <div className="font-semibold text-slate-900">Security reminder</div>
      <p className="text-slate-600">
        Confirm you are on the official website{' '}
        <a
          href={OFFICIAL_WEBSITE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono font-medium text-blue-700 hover:text-blue-800 underline decoration-blue-300 underline-offset-2 break-all"
        >
          {OFFICIAL_WEBSITE_URL}
        </a>
        . Never share your password or OTP codes, and avoid untrusted links.
      </p>
    </div>
  </div>
);
