import React from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  Lock,
  ExternalLink,
  AlertTriangle,
  KeyRound,
  UserCheck,
  Database,
  Server,
  ShieldCheck,
  Mail,
  ArrowRight,
} from 'lucide-react';

export const PRIMARY_WEBSITE_URL = 'https://resume-flow-iota.vercel.app/';
export const OFFICIAL_WEBSITE_URL = 'https://resume-flow-eight.vercel.app/';

interface SecurityNoticeSectionProps {
  supportEmail?: string;
}

/**
 * Homepage Advanced Security & Data Protection + Official Website Verification Notice.
 * Uses a clean Linear-inspired blue-and-white palette with honest, verifiable security details.
 */
export const SecurityNoticeSection: React.FC<SecurityNoticeSectionProps> = ({
  supportEmail = 'support@resumeflow.ai',
}) => {
  const securityPillars = [
    {
      icon: Lock,
      title: 'HTTPS-Protected Communication',
      description:
        'Requests between your browser, ResumeFlow, and infrastructure endpoints use HTTPS transport encryption to protect sign-in sessions and resume edits in transit.',
    },
    {
      icon: KeyRound,
      title: 'Secure Authentication & Verification',
      description:
        'Account sign-in is handled through Supabase Auth (email/password and Google OAuth) with email verification where enabled. ResumeFlow never stores passwords in plain text.',
    },
    {
      icon: Database,
      title: 'Supabase Database & Row Level Security',
      description:
        'PostgreSQL Row Level Security (RLS) policies restrict access to profiles, resumes, and AI usage records using auth.uid() so each user only accesses their own private documents.',
    },
    {
      icon: UserCheck,
      title: 'User-Specific Document Isolation',
      description:
        'Every resume query, save, duplicate, and delete checks your authenticated session ID before updating records. Administrative permissions are separated and restricted.',
    },
    {
      icon: Server,
      title: 'Server-Side API & Secret Handling',
      description:
        'Gemini AI calls run through backend /api/ai/* routes so private API keys and service credentials remain in server environment variables and are never exposed in frontend code.',
    },
    {
      icon: ShieldCheck,
      title: 'Honest Limitations & Reporting',
      description:
        'No online system can guarantee absolute immunity from all threats. If you spot suspicious behavior or a vulnerability, please contact us directly so we can investigate promptly.',
    },
  ];

  const safeguards = [
    {
      icon: Shield,
      title: 'Beware of fake websites & clones',
      description:
        'Only sign in when your browser address bar matches our official domains. Watch closely for misspelled lookalike URLs before entering credentials.',
    },
    {
      icon: AlertTriangle,
      title: 'Avoid suspicious phishing links',
      description:
        'Do not trust unexpected emails, messages, or unfamiliar ads urging immediate login. Open ResumeFlow directly from your bookmark or address bar.',
    },
    {
      icon: KeyRound,
      title: 'Never share passwords or OTP codes',
      description:
        'Keep your password, email confirmation links, and one-time verification codes private. Support or admins will never ask for them.',
    },
    {
      icon: UserCheck,
      title: 'Protect your personal resume data',
      description:
        'Use a strong, unique password and review personal phone or address details before publishing or sharing exported PDFs publicly.',
    },
  ];

  return (
    <section id="security" className="py-20 border-t border-white/15">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Main Security & Data Protection Showcase */}
        <div className="rounded-2xl bg-white/95 backdrop-blur-xl border border-blue-200/85 shadow-[0_24px_64px_rgba(15,35,95,0.2)] overflow-hidden text-slate-900">
          {/* Linear-inspired top banner */}
          <div className="px-6 sm:px-8 py-6 sm:py-7 bg-gradient-to-r from-blue-50/95 via-white to-sky-50/80 border-b border-blue-100 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
            <div className="flex items-start gap-3.5 max-w-2xl">
              <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center shrink-0 shadow-xs">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold tracking-wide text-blue-700">
                  Security & Data Protection
                </p>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-950 tracking-tight mt-0.5">
                  Built with clear access controls and honest data protection
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 mt-1.5 leading-relaxed">
                  ResumeFlow pairs authenticated Supabase sessions, PostgreSQL Row Level Security, and server-side AI routing to keep your private career documents restricted to your account.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <Link
                to="/privacy-policy"
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition inline-flex items-center gap-1.5 shadow-xs whitespace-nowrap"
              >
                <span>Read Privacy Policy</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <a
                href={`mailto:${supportEmail}?subject=ResumeFlow%20Security%20Report`}
                className="px-3.5 py-2 text-xs font-medium rounded-lg bg-white hover:bg-blue-50 text-slate-700 border border-blue-200 transition inline-flex items-center gap-1.5 whitespace-nowrap"
              >
                <Mail className="w-3.5 h-3.5 text-blue-600" />
                <span>Report an Issue</span>
              </a>
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-8">
            {/* 6 Security Architecture Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {securityPillars.map((pillar) => (
                <div
                  key={pillar.title}
                  className="p-5 rounded-xl bg-slate-50/75 border border-slate-200/90 hover:border-blue-200 transition space-y-2.5"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                      <pillar.icon className="w-4 h-4" />
                    </div>
                    <h3 className="text-sm font-semibold text-slate-900 leading-snug">
                      {pillar.title}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{pillar.description}</p>
                </div>
              ))}
            </div>

            {/* Official Website & Anti-Phishing Verification Notice */}
            <div className="pt-6 border-t border-slate-200/80 space-y-5">
              <div className="rounded-xl bg-blue-50/75 border border-blue-200/90 p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex items-start sm:items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-white border border-blue-200 text-blue-600 flex items-center justify-center shrink-0 shadow-xs">
                    <Lock className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 space-y-1">
                    <div className="text-[11px] font-semibold text-slate-500">
                      Official Website Verification Notice
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                      <a
                        href={PRIMARY_WEBSITE_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 font-mono text-xs sm:text-sm font-semibold text-blue-700 hover:text-blue-800 underline decoration-blue-300 underline-offset-4 break-all transition"
                      >
                        <span>{PRIMARY_WEBSITE_URL}</span>
                        <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                      </a>
                      <span className="text-slate-300 hidden sm:inline">•</span>
                      <a
                        href={OFFICIAL_WEBSITE_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 font-mono text-xs font-medium text-blue-600 hover:text-blue-800 underline decoration-blue-200 underline-offset-4 break-all transition"
                      >
                        <span>{OFFICIAL_WEBSITE_URL}</span>
                        <ExternalLink className="w-3 h-3 shrink-0" />
                      </a>
                    </div>
                  </div>
                </div>

                <p className="text-[11px] text-slate-600 lg:text-right lg:max-w-xs leading-relaxed">
                  Always verify the exact URL in your browser address bar before signing in or sharing account details.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {safeguards.map((item) => (
                  <div
                    key={item.title}
                    className="p-4 rounded-xl bg-white border border-slate-200/90 hover:border-blue-200 transition space-y-1.5"
                  >
                    <div className="flex items-center gap-2">
                      <item.icon className="w-4 h-4 text-blue-600 shrink-0" />
                      <h4 className="text-xs sm:text-sm font-semibold text-slate-900">{item.title}</h4>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Quiet bottom bar */}
            <div className="pt-3 border-t border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-slate-500">
              <span>
                Security vulnerability or suspicious link? Report directly to{' '}
                <a
                  href={`mailto:${supportEmail}`}
                  className="font-medium text-blue-700 hover:text-blue-800 underline decoration-blue-200 underline-offset-2"
                >
                  {supportEmail}
                </a>
                .
              </span>
              <Link
                to="/privacy-policy"
                className="font-medium text-blue-700 hover:text-blue-800 underline decoration-blue-200 underline-offset-2"
              >
                View full Privacy Policy & Security details
              </Link>
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
        Sign in only on official ResumeFlow domains (
        <a
          href={PRIMARY_WEBSITE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono font-medium text-blue-700 hover:text-blue-800 underline decoration-blue-300 underline-offset-2 break-all"
        >
          {PRIMARY_WEBSITE_URL}
        </a>
        {' '}or{' '}
        <a
          href={OFFICIAL_WEBSITE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono font-medium text-blue-700 hover:text-blue-800 underline decoration-blue-300 underline-offset-2 break-all"
        >
          {OFFICIAL_WEBSITE_URL}
        </a>
        ). Never share your password or OTP codes, and review our{' '}
        <Link
          to="/privacy-policy"
          className="font-medium text-blue-700 hover:text-blue-800 underline decoration-blue-300 underline-offset-2"
        >
          Privacy Policy
        </Link>
        .
      </p>
    </div>
  </div>
);
