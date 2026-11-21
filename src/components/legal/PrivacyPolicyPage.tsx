import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  Lock,
  ArrowLeft,
  ArrowRight,
  ExternalLink,
  Mail,
  Loader2,
  AlertCircle,
  BookOpen,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  fetchSiteSettings,
  DEFAULT_SITE_SETTINGS,
  SiteSettings,
} from '../../lib/supabase';
import { ResumeFlowLogo } from '../common/ResumeFlowLogo';
import { PRIMARY_WEBSITE_URL, OFFICIAL_WEBSITE_URL } from '../common/SecurityNotice';

interface PolicySection {
  id: string;
  number: string;
  title: string;
  content: React.ReactNode;
}

export const PrivacyPolicyPage: React.FC = () => {
  const { user } = useAuth();
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [settingsError, setSettingsError] = useState<string | null>(null);
  const [activeSectionId, setActiveSectionId] = useState<string>('information-we-collect');
  const [legalModal, setLegalModal] = useState<'terms' | 'contact' | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
    let active = true;
    setLoadingSettings(true);
    setSettingsError(null);

    fetchSiteSettings()
      .then((cfg) => {
        if (!active) return;
        setSiteSettings(cfg);
      })
      .catch(() => {
        if (!active) return;
        setSettingsError('Showing default policy contact settings while live configuration is unavailable.');
      })
      .finally(() => {
        if (active) setLoadingSettings(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const supportEmail = siteSettings.supportEmail || 'support@resumeflow.ai';

  const sections: PolicySection[] = [
    {
      id: 'information-we-collect',
      number: '01',
      title: 'Information We Collect',
      content: (
        <div className="space-y-3 text-slate-600 text-sm leading-relaxed">
          <p>
            When you create an account or build a resume on ResumeFlow (
            <a
              href={PRIMARY_WEBSITE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-blue-700 hover:text-blue-800 underline decoration-blue-200 underline-offset-2"
            >
              {PRIMARY_WEBSITE_URL}
            </a>
            ), we collect only the information needed to operate your workspace:
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>
              <span className="font-semibold text-slate-800">Account & Profile Details:</span> Your email address, full name, and optional profile avatar URL provided during email sign-up or Google OAuth sign-in.
            </li>
            <li>
              <span className="font-semibold text-slate-800">Resume & Career Content:</span> Titles, contact details, work history, education, skills, projects, and custom formatting preferences you enter into your saved resumes.
            </li>
            <li>
              <span className="font-semibold text-slate-800">AI Feature Requests:</span> Text snippets or job descriptions you explicitly submit to AI features (such as bullet enhancement, ATS review, or cover letter drafting) and basic feature usage logs (<code className="text-xs font-mono text-blue-700 bg-blue-50 px-1 py-0.5 rounded">ai_usage</code>).
            </li>
            <li>
              <span className="font-semibold text-slate-800">Essential Browser Preferences:</span> Local session tokens and basic UI flags stored in your browser so you stay signed in and do not repeat onboarding prompts.
            </li>
          </ul>
        </div>
      ),
    },
    {
      id: 'how-we-use-your-information',
      number: '02',
      title: 'How We Use Your Information',
      content: (
        <div className="space-y-3 text-slate-600 text-sm leading-relaxed">
          <p>We use your information strictly to deliver and maintain ResumeFlow features:</p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>Authenticate your identity, verify email ownership where enabled, and maintain your active workspace session.</li>
            <li>Create, store, load, duplicate, rename, and delete your private resume documents across devices.</li>
            <li>Process your requested AI optimizations through server-side endpoints and display the generated suggestions back to you.</li>
            <li>Export print-ready A4 PDFs or portable JSON files directly on your device when you initiate an export.</li>
            <li>Respond to support questions, account deletion requests, or reported security issues.</li>
          </ul>
          <p>We do not sell your personal information or resume content to data brokers or advertising networks.</p>
        </div>
      ),
    },
    {
      id: 'advanced-security-data-protection',
      number: '03',
      title: 'Advanced Security & Data Protection',
      content: (
        <div className="space-y-5 text-slate-600 text-sm leading-relaxed">
          <p>
            At <span className="font-semibold text-slate-900">ResumeFlow</span>, protecting user information is a priority. We implement reasonable technical and organizational security measures designed to safeguard personal information against unauthorized access, misuse, alteration, disclosure, and destruction.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <h4 className="text-sm font-semibold text-slate-900">3.1 Secure Authentication</h4>
              <ul className="list-disc pl-4 space-y-1 text-xs text-slate-600">
                <li>Secure account authentication through supported authentication providers (Supabase Auth and Google OAuth).</li>
                <li>Email verification where enabled.</li>
                <li>Passwords are handled by our authentication provider and are not stored as plain text by ResumeFlow.</li>
                <li>Protection against unauthorized account access.</li>
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <h4 className="text-sm font-semibold text-slate-900">3.2 Data Encryption</h4>
              <ul className="list-disc pl-4 space-y-1 text-xs text-slate-600">
                <li>HTTPS encryption is used to protect information transmitted between your browser and our website.</li>
                <li>We rely on our infrastructure providers&apos; available encryption and security protections for stored information.</li>
                <li>Sensitive information is handled with appropriate security precautions.</li>
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <h4 className="text-sm font-semibold text-slate-900">3.3 Database Security</h4>
              <ul className="list-disc pl-4 space-y-1 text-xs text-slate-600">
                <li>Database access is restricted through configured security permissions.</li>
                <li>Row Level Security (RLS) policies are used where configured and applicable.</li>
                <li>Users should only be able to access their own private documents and account information.</li>
                <li>Administrative access is restricted to authorized personnel.</li>
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <h4 className="text-sm font-semibold text-slate-900">3.4 Protection Against Unauthorized Access</h4>
              <ul className="list-disc pl-4 space-y-1 text-xs text-slate-600">
                <li>Unauthorized account access.</li>
                <li>Data theft and misuse.</li>
                <li>Unauthorized document access.</li>
                <li>Malicious activity and suspicious requests.</li>
                <li>Unauthorized modification or deletion of stored information.</li>
              </ul>
            </div>
          </div>

          <div className="space-y-3 pt-1">
            <div>
              <h4 className="text-sm font-semibold text-slate-900">3.5 Secure Infrastructure</h4>
              <p className="mt-1">
                ResumeFlow may use trusted infrastructure providers, including Supabase and Vercel, to support authentication, database storage, and website hosting. Private API keys (such as Gemini AI keys) are kept in server-side environment variables and are never shipped in browser bundles.
              </p>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-slate-900">3.6 Security Limitations</h4>
              <p className="mt-1">
                Although we work to protect your information, no website, database, or internet transmission can be guaranteed to be completely secure. We cannot promise absolute protection against every possible security threat.
              </p>
            </div>

            <div id="reporting-security-issues" className="p-4 rounded-xl bg-blue-50/75 border border-blue-200">
              <h4 className="text-sm font-semibold text-slate-900">3.7 Reporting Security Issues</h4>
              <p className="mt-1 text-xs sm:text-sm text-slate-700">
                If you discover a security vulnerability or suspicious activity involving ResumeFlow, please report it through our official support email:{' '}
                <a
                  href={`mailto:${supportEmail}?subject=ResumeFlow%20Security%20Report`}
                  className="font-semibold text-blue-700 hover:text-blue-800 underline decoration-blue-300 underline-offset-2"
                >
                  {supportEmail}
                </a>
                . We take security reports seriously and will investigate reported issues appropriately.
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'data-encryption',
      number: '04',
      title: 'Data Encryption',
      content: (
        <div className="space-y-3 text-slate-600 text-sm leading-relaxed">
          <p>
            All communication between your browser and ResumeFlow is protected in transit using standard HTTPS/TLS encryption provided by our hosting and API endpoints.
          </p>
          <p>
            Stored authentication credentials, database rows, and file uploads rely on the storage encryption and infrastructure security controls provided by Supabase and Vercel. ResumeFlow does not claim custom hardware encryption modules or unverified third-party security certifications.
          </p>
        </div>
      ),
    },
    {
      id: 'secure-authentication',
      number: '05',
      title: 'Secure Authentication',
      content: (
        <div className="space-y-3 text-slate-600 text-sm leading-relaxed">
          <p>
            ResumeFlow uses Supabase Auth to manage sign-up, login, password recovery, and Google OAuth sessions. Passwords are processed directly by Supabase Auth and are never stored in plain text or exposed inside application tables.
          </p>
          <p>
            Where email verification is enabled, new accounts must confirm ownership of their email address before accessing protected workspace routes. Always verify you are signing in on our official URLs ({PRIMARY_WEBSITE_URL} or {OFFICIAL_WEBSITE_URL}) before entering credentials.
          </p>
        </div>
      ),
    },
    {
      id: 'database-security',
      number: '06',
      title: 'Database Security',
      content: (
        <div className="space-y-3 text-slate-600 text-sm leading-relaxed">
          <p>
            User profiles, resumes, templates, and AI usage logs are stored in Supabase PostgreSQL. Row Level Security (RLS) policies restrict table operations using the authenticated user identifier (<code className="text-xs font-mono text-blue-700 bg-blue-50 px-1 py-0.5 rounded">auth.uid()</code>), ensuring users can only view, create, update, or delete their own private resumes.
          </p>
          <p>
            Application queries also scope user-facing reads and deletions to the verified active session user, and no Supabase service-role secret key is ever placed in client-side code.
          </p>
        </div>
      ),
    },
    {
      id: 'data-storage-and-retention',
      number: '07',
      title: 'Data Storage and Retention',
      content: (
        <div className="space-y-3 text-slate-600 text-sm leading-relaxed">
          <p>
            We retain personal information only for as long as reasonably necessary to provide our services, meet legal obligations, resolve disputes, and enforce our agreements.
          </p>
          <p>
            Saved resumes remain in your account until you delete them from the dashboard or request account deletion.
          </p>
        </div>
      ),
    },
    {
      id: 'cookies-and-tracking',
      number: '08',
      title: 'Cookies and Tracking',
      content: (
        <div className="space-y-3 text-slate-600 text-sm leading-relaxed">
          <p>
            ResumeFlow uses essential browser storage (<code className="text-xs font-mono text-blue-700 bg-blue-50 px-1 py-0.5 rounded">localStorage</code>) strictly for functional purposes: maintaining your Supabase Auth session, remembering whether the first-time welcome message was played, and storing optional workspace configuration preferences.
          </p>
          <p>
            We do not embed third-party behavioral advertising cookies or sell browsing activity across websites.
          </p>
        </div>
      ),
    },
    {
      id: 'third-party-services',
      number: '09',
      title: 'Third-Party Services',
      content: (
        <div className="space-y-3 text-slate-600 text-sm leading-relaxed">
          <p>ResumeFlow relies on established infrastructure and AI providers strictly to deliver core product features:</p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>
              <span className="font-semibold text-slate-800">Supabase:</span> Provides user authentication, PostgreSQL database storage with RLS, and avatar file storage.
            </li>
            <li>
              <span className="font-semibold text-slate-800">Google Gemini API:</span> Processes resume bullets, summaries, or job descriptions only when you trigger an AI tool, routed securely through server-side <code className="text-xs font-mono text-blue-700 bg-blue-50 px-1 py-0.5 rounded">/api/ai/*</code> endpoints.
            </li>
            <li>
              <span className="font-semibold text-slate-800">Google OAuth:</span> Optional sign-in method if you choose &ldquo;Continue with Google.&rdquo;
            </li>
            <li>
              <span className="font-semibold text-slate-800">Vercel:</span> Hosts and serves the web application and serverless API endpoints over HTTPS.
            </li>
          </ul>
        </div>
      ),
    },
    {
      id: 'user-privacy-rights',
      number: '10',
      title: 'User Privacy Rights',
      content: (
        <div className="space-y-3 text-slate-600 text-sm leading-relaxed">
          <p>Depending on your location, you have the right to:</p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>Access and review the profile details and resumes stored in your account.</li>
            <li>Update or correct your profile name, avatar, or resume contents at any time inside Settings or the Builder.</li>
            <li>Export a portable JSON or PDF copy of your resume directly from the Resume Builder.</li>
            <li>Request deletion of your account and associated personal data.</li>
          </ul>
        </div>
      ),
    },
    {
      id: 'account-and-data-deletion',
      number: '11',
      title: 'Account and Data Deletion',
      content: (
        <div className="space-y-3 text-slate-600 text-sm leading-relaxed">
          <p>
            You may delete individual resumes at any time directly from your Dashboard, which removes those records from the database.
          </p>
          <p>
            You may also request full account and personal data deletion, subject to applicable legal requirements, by emailing{' '}
            <a
              href={`mailto:${supportEmail}?subject=ResumeFlow%20Account%20Deletion%20Request`}
              className="font-semibold text-blue-700 hover:text-blue-800 underline decoration-blue-200 underline-offset-2"
            >
              {supportEmail}
            </a>{' '}
            from the email address associated with your account.
          </p>
        </div>
      ),
    },
    {
      id: 'childrens-privacy',
      number: '12',
      title: "Children's Privacy",
      content: (
        <div className="space-y-3 text-slate-600 text-sm leading-relaxed">
          <p>
            ResumeFlow is designed for career and professional resume creation and is not directed at children under 13 years of age (or the applicable minimum digital consent age in your jurisdiction). We do not knowingly collect personal information from children. If you believe a child has submitted personal data, please contact us so we can delete it promptly.
          </p>
        </div>
      ),
    },
    {
      id: 'policy-updates',
      number: '13',
      title: 'Policy Updates',
      content: (
        <div className="space-y-3 text-slate-600 text-sm leading-relaxed">
          <p>
            We may update this Privacy Policy periodically as ResumeFlow features, infrastructure providers, or legal requirements evolve. When updates are made, we revise the &ldquo;Last Updated&rdquo; date at the top of this page. Continued use of ResumeFlow after an update constitutes acceptance of the revised policy.
          </p>
        </div>
      ),
    },
    {
      id: 'contact-information',
      number: '14',
      title: 'Contact Information',
      content: (
        <div className="space-y-3 text-slate-600 text-sm leading-relaxed">
          <p>
            If you have questions about this Privacy Policy, privacy rights requests, or security reports, contact ResumeFlow using the official details below:
          </p>
          <div className="p-4 rounded-xl bg-blue-50/75 border border-blue-200 space-y-2 text-xs sm:text-sm">
            <div>
              <span className="font-semibold text-slate-800">Official Website: </span>
              <a
                href={PRIMARY_WEBSITE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-blue-700 hover:text-blue-800 underline decoration-blue-300 underline-offset-2 break-all"
              >
                {PRIMARY_WEBSITE_URL}
              </a>
            </div>
            <div>
              <span className="font-semibold text-slate-800">Support & Security Email: </span>
              {loadingSettings ? (
                <span className="inline-flex items-center gap-1.5 text-slate-500">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
                  <span>Loading contact...</span>
                </span>
              ) : (
                <a
                  href={`mailto:${supportEmail}`}
                  className="font-medium text-blue-700 hover:text-blue-800 underline decoration-blue-300 underline-offset-2"
                >
                  {supportEmail}
                </a>
              )}
            </div>
          </div>
        </div>
      ),
    },
  ];

  const handleTocClick = (id: string) => {
    setActiveSectionId(id);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen relative bg-transparent text-[#e2e8f0] selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 border-b border-white/12 bg-[#090d1b]/78 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link to="/" className="hover:opacity-90 transition">
              <ResumeFlowLogo size="md" showTag />
            </Link>
            <span className="text-neutral-700 hidden sm:inline">/</span>
            <span className="text-xs font-medium text-neutral-300 hidden sm:inline">Privacy Policy</span>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-neutral-300">
            <Link to="/" className="hover:text-white transition whitespace-nowrap">Home</Link>
            <Link to="/#security" className="hover:text-white transition whitespace-nowrap">Security</Link>
            <Link to="/privacy-policy" className="text-white font-semibold whitespace-nowrap">Privacy Policy</Link>
          </nav>

          <div className="flex items-center gap-2.5">
            <Link
              to="/"
              className="px-3 py-1.5 text-xs font-medium text-neutral-300 hover:text-white bg-[#141724] border border-white/12 rounded-lg flex items-center gap-1.5 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Back to home</span>
            </Link>
            {user ? (
              <Link
                to="/dashboard"
                className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition flex items-center gap-1.5"
              >
                <span>Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <Link
                to="/login"
                className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-8">
        {/* Hero Header Card */}
        <section className="rounded-2xl bg-white/95 backdrop-blur-xl border border-blue-200/85 shadow-[0_24px_64px_rgba(15,35,95,0.2)] overflow-hidden text-slate-900">
          <div className="px-6 sm:px-8 py-7 sm:py-8 bg-gradient-to-r from-blue-50/95 via-white to-sky-50/80 border-b border-blue-100 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2.5 max-w-2xl">
              <div className="flex items-center gap-2.5 text-blue-700 text-xs font-semibold">
                <Shield className="w-4 h-4 shrink-0" />
                <span>ResumeFlow Legal & Security Documentation</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-bold text-slate-950 tracking-tight">
                Privacy Policy
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                How ResumeFlow collects, uses, secures, and protects your account and career information across our web platform.
              </p>
            </div>

            <div className="rounded-xl bg-white border border-blue-200/90 p-4 text-xs space-y-2 shadow-xs shrink-0">
              <div className="flex items-center justify-between gap-6">
                <span className="text-slate-500 font-medium">Effective Date</span>
                <span className="font-semibold text-slate-900 tabular-nums">November 21, 2026</span>
              </div>
              <div className="flex items-center justify-between gap-6">
                <span className="text-slate-500 font-medium">Last Updated</span>
                <span className="font-semibold text-slate-900 tabular-nums">November 21, 2026</span>
              </div>
              <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <a
                  href={PRIMARY_WEBSITE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-blue-700 hover:text-blue-800 underline decoration-blue-300 underline-offset-2 inline-flex items-center gap-1"
                >
                  <span>{PRIMARY_WEBSITE_URL}</span>
                  <ExternalLink className="w-3 h-3 shrink-0" />
                </a>
              </div>
            </div>
          </div>

          {settingsError && (
            <div className="px-6 sm:px-8 py-3 bg-amber-50 border-b border-amber-200 text-amber-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
              <span>{settingsError}</span>
            </div>
          )}

          {/* Mobile / Tablet Compact Table of Contents */}
          <div className="lg:hidden px-6 py-4 bg-slate-50 border-b border-slate-200">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-800 mb-3">
              <BookOpen className="w-3.5 h-3.5 text-blue-600" />
              <span>Table of Contents</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {sections.map((sec) => (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => handleTocClick(sec.id)}
                  className={`text-left px-2.5 py-1.5 rounded-lg text-xs transition flex items-center gap-2 ${
                    activeSectionId === sec.id
                      ? 'bg-blue-50 text-blue-700 font-semibold border border-blue-200'
                      : 'text-slate-600 hover:bg-white hover:text-slate-900'
                  }`}
                >
                  <span className="font-mono text-[10px] text-blue-600">{sec.number}</span>
                  <span className="truncate">{sec.title}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Desktop 2-Column Content Layout */}
          <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Sticky Sidebar TOC */}
            <aside className="hidden lg:block lg:col-span-4 sticky top-24">
              <div className="rounded-xl bg-slate-50/85 border border-slate-200/90 p-4 space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-900 pb-2 border-b border-slate-200">
                  <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                  <span>Table of Contents</span>
                </div>
                <nav className="space-y-1">
                  {sections.map((sec) => (
                    <button
                      key={sec.id}
                      type="button"
                      onClick={() => handleTocClick(sec.id)}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition flex items-center gap-2.5 ${
                        activeSectionId === sec.id
                          ? 'bg-blue-50 text-blue-700 font-semibold border border-blue-200'
                          : 'text-slate-600 hover:bg-white hover:text-slate-900'
                      }`}
                    >
                      <span className="font-mono text-[10px] text-blue-600 shrink-0">{sec.number}</span>
                      <span className="truncate">{sec.title}</span>
                    </button>
                  ))}
                </nav>
              </div>
            </aside>

            {/* Policy Sections */}
            <article className="lg:col-span-8 space-y-8">
              {sections.map((sec) => (
                <section
                  key={sec.id}
                  id={sec.id}
                  className="scroll-mt-24 pb-8 border-b border-slate-200/80 last:border-b-0 last:pb-0 space-y-3"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs font-mono font-semibold text-blue-600">
                      {sec.number}.
                    </span>
                    <h2 className="text-lg sm:text-xl font-bold text-slate-950 tracking-tight">
                      {sec.title}
                    </h2>
                  </div>
                  {sec.content}
                </section>
              ))}
            </article>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/12 py-10 bg-[#080b16]/82 backdrop-blur-xl text-neutral-300 text-xs mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <ResumeFlowLogo size="sm" />
              <span className="text-neutral-700">•</span>
              <span>Your Career. Your Story. Powered by AI.</span>
            </div>

            <div className="flex flex-wrap items-center gap-6">
              <Link to="/privacy-policy" className="text-white font-medium transition">
                Privacy Policy
              </Link>
              <button
                type="button"
                onClick={() => setLegalModal('terms')}
                className="hover:text-white transition"
              >
                Terms &amp; Conditions
              </button>
              <Link to="/#security" className="hover:text-white transition">
                Security
              </Link>
              <button
                type="button"
                onClick={() => setLegalModal('contact')}
                className="hover:text-white transition"
              >
                Contact Us
              </button>
            </div>
          </div>

          <div className="pt-5 border-t border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-2.5 text-[11px] text-neutral-300">
            <div className="flex items-center gap-2 flex-wrap">
              <Shield className="w-3.5 h-3.5 text-sky-400 shrink-0" />
              <span>Official website:</span>
              <a
                href={PRIMARY_WEBSITE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-sky-300 hover:text-white underline decoration-sky-400/40 underline-offset-2 break-all transition"
              >
                {PRIMARY_WEBSITE_URL}
              </a>
            </div>
            <p className="text-neutral-400 flex items-center gap-1.5">
              <Lock className="w-3 h-3 text-sky-400 shrink-0" />
              <span>Avoid phishing links. Never share your password or OTP codes.</span>
            </p>
          </div>
        </div>
      </footer>

      {/* Terms & Conditions / Contact Us Modal */}
      {legalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#101219] border border-[#232736] rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">
                {legalModal === 'terms' ? 'Terms & Conditions' : 'Contact Us'}
              </h3>
              <button
                type="button"
                onClick={() => setLegalModal(null)}
                className="p-1 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {legalModal === 'terms' ? (
              <p className="text-xs text-neutral-300 leading-relaxed">
                ResumeFlow is provided for personal and professional career development. You retain full ownership of all resumes, cover letters, and exports you create on the platform. You agree to use your account responsibly and keep your sign-in credentials private.
              </p>
            ) : (
              <div className="space-y-3 text-xs text-neutral-300">
                <p className="leading-relaxed">
                  Questions, privacy requests, or security reports? Reach out anytime:
                </p>
                <a
                  href={`mailto:${supportEmail}`}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-[#161925] border border-[#252b3d] text-indigo-300 hover:text-indigo-200 transition"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>{supportEmail}</span>
                </a>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setLegalModal(null)}
                className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
