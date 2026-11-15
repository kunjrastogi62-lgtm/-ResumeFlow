import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Target,
  Database,
  Layers,
  Download,
  ChevronDown,
  Lock,
  X,
  Menu,
  Mail,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { INITIAL_RESUME, TemplateDefinition } from '../../types/resume';
import { fetchActiveTemplates } from '../../lib/supabase';
import { ResumeRenderer } from '../templates/ResumeRenderer';
import { ResumeFlowLogo } from '../common/ResumeFlowLogo';

const DEFAULT_TEMPLATES: TemplateDefinition[] = [
  {
    id: 'professional-classic',
    name: 'Professional Classic',
    description: 'Single-column hierarchy engineered for strict enterprise ATS parsers in finance, consulting, and engineering.',
    badge: 'ATS Standard',
  },
  {
    id: 'modern-minimalist',
    name: 'Modern Minimalist',
    description: 'Balanced two-column architecture pairing crisp contact metadata with readable career milestones.',
    badge: 'Popular',
  },
  {
    id: 'executive-slate',
    name: 'Executive Slate',
    description: 'Commanding slate banner and leadership summary framing designed for staff, principal, and VP roles.',
    badge: 'Executive',
  },
  {
    id: 'tech-monochrome',
    name: 'Tech Monochrome',
    description: 'Developer-first layout with monospace section cues highlighting GitHub projects and technical depth.',
    badge: 'Engineering',
  },
  {
    id: 'creative-accent',
    name: 'Creative Accent',
    description: 'Contemporary typography with subtle left-edge accent styling for product, design, and growth leaders.',
    badge: 'Product',
  },
];

export const LandingPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [templates, setTemplates] = useState<TemplateDefinition[]>(DEFAULT_TEMPLATES);
  const [activeFaq, setActiveFaq] = useState<number | null>(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [legalModal, setLegalModal] = useState<'privacy' | 'terms' | 'contact' | null>(null);

  useEffect(() => {
    fetchActiveTemplates().then((dbTemplates) => {
      if (dbTemplates.length > 0) {
        setTemplates((prev) =>
          prev.map((item) => {
            const match = dbTemplates.find(
              (dbItem) => dbItem.name.toLowerCase() === item.name.toLowerCase()
            );
            return match ? { ...item, description: match.description || item.description } : item;
          })
        );
      }
    });
  }, []);

  const handleBuildClick = (templateId?: string) => {
    const target = templateId ? `/builder?template=${templateId}` : '/builder';
    if (user) {
      navigate(target);
    } else {
      navigate('/signup', { state: { from: target } });
    }
  };

  const faqs = [
    {
      q: 'How does ResumeFlow help my resume pass ATS screening?',
      a: 'Every ResumeFlow template uses clean, parseable layout structures with predictable headings and vector PDF output. Our Gemini AI ATS Auditor checks action verbs, quantified metrics (Google XYZ formula), and keyword alignment against target job descriptions.',
    },
    {
      q: 'How is my personal career data stored and protected?',
      a: 'Your account and resumes are stored directly in Supabase PostgreSQL with Row Level Security (RLS). Every database operation checks your authenticated Supabase session so only you can view, edit, duplicate, or delete your resumes.',
    },
    {
      q: 'Can I customize templates and export high-resolution PDFs?',
      a: 'Yes. Switch seamlessly between 5 handcrafted templates, customize accent colors, font families, and spacing in real time, and export print-ready A4 PDFs with selectable text.',
    },
    {
      q: 'What AI capabilities are included for free?',
      a: 'ResumeFlow includes Google Gemini-powered bullet enhancement, executive summary generation, ATS scoring, job description tailoring, skill recommendations, and tailored cover letter drafting.',
    },
  ];

  return (
    <div id="home" className="min-h-screen bg-[#090b10] text-[#e2e8f0] selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Navigation */}
      <header className="sticky top-0 z-40 border-b border-[#181c28] bg-[#090b10]/85 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="hover:opacity-90 transition">
            <ResumeFlowLogo size="md" showTag />
          </Link>

          <nav className="hidden md:flex items-center gap-7 text-xs font-medium text-neutral-400">
            <a href="#home" className="hover:text-white transition">Home</a>
            <a href="#features" className="hover:text-white transition">Features</a>
            <a href="#templates" className="hover:text-white transition">Templates</a>
            <a href="#about" className="hover:text-white transition">About</a>
            <a href="#faq" className="hover:text-white transition">FAQs</a>
          </nav>

          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <Link
                  to="/settings"
                  className="px-3 py-1.5 text-xs font-medium text-neutral-300 hover:text-white transition"
                >
                  Settings
                </Link>
                <Link
                  to="/dashboard"
                  className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition flex items-center gap-1.5"
                >
                  <span>Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-3 py-1.5 text-xs font-medium text-neutral-300 hover:text-white transition"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((v) => !v)}
            className="md:hidden p-2 text-neutral-400 hover:text-white rounded-lg hover:bg-[#141724] transition"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Nav Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-[#181c28] bg-[#0d0f17] px-4 py-4 space-y-3 text-xs">
            <div className="flex flex-col space-y-2.5 text-neutral-300 font-medium">
              <a href="#home" onClick={() => setMobileMenuOpen(false)} className="py-1 hover:text-white">Home</a>
              <a href="#features" onClick={() => setMobileMenuOpen(false)} className="py-1 hover:text-white">Features</a>
              <a href="#templates" onClick={() => setMobileMenuOpen(false)} className="py-1 hover:text-white">Templates</a>
              <a href="#about" onClick={() => setMobileMenuOpen(false)} className="py-1 hover:text-white">About</a>
            </div>
            <div className="pt-3 border-t border-[#1c2030] flex items-center gap-2.5">
              {user ? (
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 py-2 text-center font-semibold rounded-lg bg-indigo-600 text-white"
                >
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 py-2 text-center font-medium rounded-lg border border-[#232736] text-neutral-200"
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 py-2 text-center font-semibold rounded-lg bg-indigo-600 text-white"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 sm:pt-24 pb-20 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[540px] h-[260px] bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#121521] border border-[#23283b] text-indigo-300 text-xs font-medium mb-6">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Your Career. Your Story. Powered by AI.</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-[56px] font-bold tracking-tight text-white max-w-4xl mx-auto leading-[1.1]">
            Build a Resume That Gets You Noticed.
          </h1>

          <p className="mt-5 text-sm sm:text-base text-neutral-400 max-w-2xl mx-auto leading-relaxed">
            Craft crisp, recruiter-ready resumes with Google Gemini bullet enhancements, instant ATS scoring, job description tailoring, and secure Supabase cloud sync.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5">
            <button
              onClick={() => handleBuildClick()}
              className="px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-semibold flex items-center gap-2 transition shadow-sm"
            >
              <span>Build My Resume</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <a
              href="#templates"
              className="px-5 py-2.5 rounded-lg bg-[#121521] hover:bg-[#191d2d] border border-[#252a3d] text-neutral-200 text-xs sm:text-sm font-medium transition"
            >
              Explore Templates
            </a>
          </div>

          <div className="mt-9 flex flex-wrap items-center justify-center gap-6 text-xs text-neutral-500">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
              <span>ATS-Verified Structures</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
              <span>Supabase PostgreSQL Sync</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
              <span>Vector PDF Export</span>
            </div>
          </div>

          {/* Interactive Workspace Showcase */}
          <div className="mt-14 max-w-4xl mx-auto rounded-2xl border border-[#1f2433] bg-[#0e1017] p-4 sm:p-6 text-left shadow-2xl">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#191d2b]">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-neutral-700" />
                <span className="w-2.5 h-2.5 rounded-full bg-neutral-700" />
                <span className="w-2.5 h-2.5 rounded-full bg-neutral-700" />
                <span className="text-xs text-neutral-400 font-mono ml-2">senior_software_engineer.resume</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-[11px] font-medium flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  ATS Score: 94 / 100
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
              <div className="p-4 rounded-xl bg-[#090b10] border border-[#1d2130] space-y-2">
                <div className="text-[11px] font-medium text-neutral-400">Original Draft</div>
                <p className="text-xs text-neutral-400 font-mono leading-relaxed">
                  "Responsible for building frontend features and fixing bugs on the analytics dashboard."
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#090b10] border border-indigo-500/30 space-y-2">
                <div className="text-[11px] font-medium text-indigo-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Gemini XYZ Enhancement</span>
                </div>
                <p className="text-xs text-neutral-100 font-mono leading-relaxed">
                  "Spearheaded React and TypeScript dashboard modernization for 45K+ enterprise users, cutting page load latency by 44% and reducing regressions by 65%."
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 border-t border-[#181c28] bg-[#0b0d13]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest text-indigo-400">Features</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mt-2">
              Precision tools for modern job searches
            </h2>
            <p className="text-sm text-neutral-400 mt-2">
              Designed to eliminate busywork and surface the measurable impact recruiters look for.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                icon: Sparkles,
                title: 'AI Bullet Point Enhancer',
                desc: 'Convert passive task lists into quantified Google XYZ achievements with tailored variations.',
              },
              {
                icon: ShieldCheck,
                title: 'Real-Time ATS Auditor',
                desc: 'Score formatting, power verbs, and metric density out of 100 with concrete, actionable fixes.',
              },
              {
                icon: Target,
                title: 'Job Description Tailoring',
                desc: 'Compare your resume against any job posting to uncover missing keywords and targeted rewrites.',
              },
              {
                icon: Database,
                title: 'Supabase PostgreSQL Sync',
                desc: 'Save, rename, duplicate, and restore resumes across devices with strict Row Level Security.',
              },
              {
                icon: Layers,
                title: '5 Handcrafted Templates',
                desc: 'Switch templates on the fly with customizable accent colors, typography, and spacing.',
              },
              {
                icon: Download,
                title: 'Clean Vector PDF & JSON',
                desc: 'Export razor-sharp A4 PDFs with selectable text or portable JSON backups in one click.',
              },
            ].map((f) => (
              <div
                key={f.title}
                className="p-6 rounded-xl bg-[#101219] border border-[#1d2130] hover:border-[#2c334a] transition space-y-3"
              >
                <div className="w-9 h-9 rounded-lg bg-[#161925] border border-[#23283b] text-indigo-400 flex items-center justify-center">
                  <f.icon className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-semibold text-white">{f.title}</h3>
                <p className="text-xs text-neutral-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Templates Showcase with Live Previews */}
      <section id="templates" className="py-20 border-t border-[#181c28]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-indigo-400">Templates</p>
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mt-2">
                Recruiter-approved layouts
              </h2>
              <p className="text-sm text-neutral-400 mt-2 max-w-xl">
                Every template renders live in the editor and exports cleanly for both human hiring managers and ATS parsers.
              </p>
            </div>
            <button
              onClick={() => handleBuildClick()}
              className="self-start sm:self-auto px-4 py-2 text-xs font-semibold rounded-lg bg-[#141724] hover:bg-[#1c2032] border border-[#252a3d] text-white transition flex items-center gap-1.5"
            >
              <span>Start from any template</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((tmpl) => (
              <div
                key={tmpl.id}
                onClick={() => handleBuildClick(tmpl.id)}
                className="group rounded-2xl bg-[#101219] border border-[#1d2130] hover:border-indigo-500/40 overflow-hidden cursor-pointer transition flex flex-col"
              >
                {/* Live Scaled Mini Preview */}
                <div className="h-64 bg-[#07080c] border-b border-[#1d2130] overflow-hidden relative flex justify-center pt-4">
                  <div className="pointer-events-none select-none origin-top scale-[0.34]">
                    <ResumeRenderer data={INITIAL_RESUME} template={tmpl.id} isPrint />
                  </div>
                  <div className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-[#101219] to-transparent" />
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <h3 className="text-sm font-semibold text-white group-hover:text-indigo-300 transition">
                        {tmpl.name}
                      </h3>
                      {tmpl.badge && (
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-[#161925] text-indigo-300 border border-[#24293d]">
                          {tmpl.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-neutral-400 leading-relaxed">{tmpl.description}</p>
                  </div>

                  <div className="pt-3 border-t border-[#191d2b] flex items-center justify-between text-xs font-medium text-indigo-400">
                    <span>Use {tmpl.name}</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 border-t border-[#181c28] bg-[#0b0d13]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest text-indigo-400">Workflow</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mt-2">
              Three steps from draft to interview
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                step: '01',
                title: 'Structure your background',
                desc: 'Enter your roles, education, skills, and projects—or load a structured template and customize every section.',
              },
              {
                step: '02',
                title: 'Enhance & tailor with Gemini',
                desc: 'Upgrade weak bullets with quantified metrics, check your ATS score, and align keywords to your target job posting.',
              },
              {
                step: '03',
                title: 'Sync to Supabase & export',
                desc: 'Keep multiple tailored versions organized in your private Supabase dashboard and download clean PDFs anytime.',
              },
            ].map((item) => (
              <div key={item.step} className="p-6 rounded-xl bg-[#101219] border border-[#1d2130] space-y-3">
                <span className="text-xs font-mono font-semibold text-indigo-400">{item.step}</span>
                <h3 className="text-sm font-semibold text-white">{item.title}</h3>
                <p className="text-xs text-neutral-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About & Security Section */}
      <section id="about" className="py-20 border-t border-[#181c28]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-indigo-400">About ResumeFlow</p>
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Built for clarity, speed, and data ownership
              </h2>
              <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
                ResumeFlow was built to replace bloated, paywalled resume tools with a focused workspace. Your resume data stays private inside your authenticated Supabase PostgreSQL database with Row Level Security enforced at the database layer.
              </p>
              <div className="pt-2 flex flex-wrap gap-3">
                <button
                  onClick={() => handleBuildClick()}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition"
                >
                  Create Free Account
                </button>
                <Link
                  to="/login"
                  className="px-4 py-2 text-xs font-medium rounded-lg bg-[#121521] hover:bg-[#191d2d] border border-[#252a3d] text-neutral-200 transition"
                >
                  Sign In
                </Link>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-[#101219] border border-[#1d2130] space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">PostgreSQL Row Level Security</h3>
                  <p className="text-[11px] text-neutral-400">Private user isolation verified via auth.uid()</p>
                </div>
              </div>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Tables for <code className="text-indigo-300 font-mono">profiles</code>,{' '}
                <code className="text-indigo-300 font-mono">resumes</code>,{' '}
                <code className="text-indigo-300 font-mono">templates</code>, and{' '}
                <code className="text-indigo-300 font-mono">ai_usage</code> are protected with strict RLS policies and automated database triggers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section id="faq" className="py-20 border-t border-[#181c28] bg-[#0b0d13]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <p className="text-xs font-semibold uppercase tracking-widest text-indigo-400">FAQs</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mt-2">
              Frequently asked questions
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="border border-[#1d2130] rounded-xl overflow-hidden bg-[#101219]"
              >
                <button
                  type="button"
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                  className="w-full px-5 py-4 text-left text-xs sm:text-sm font-semibold text-white flex items-center justify-between gap-4"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-neutral-400 shrink-0 transition-transform ${
                      activeFaq === idx ? 'rotate-180 text-indigo-400' : ''
                    }`}
                  />
                </button>
                {activeFaq === idx && (
                  <div className="px-5 pb-4 text-xs text-neutral-400 leading-relaxed border-t border-[#181c28] pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#181c28] py-10 bg-[#07090d] text-neutral-500 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <ResumeFlowLogo size="sm" />
            <span className="text-neutral-700">•</span>
            <span>Your Career. Your Story. Powered by AI.</span>
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <button
              type="button"
              onClick={() => setLegalModal('privacy')}
              className="hover:text-white transition"
            >
              Privacy Policy
            </button>
            <button
              type="button"
              onClick={() => setLegalModal('terms')}
              className="hover:text-white transition"
            >
              Terms
            </button>
            <button
              type="button"
              onClick={() => setLegalModal('contact')}
              className="hover:text-white transition"
            >
              Contact
            </button>
          </div>
        </div>
      </footer>

      {/* Privacy / Terms / Contact Modal */}
      {legalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#101219] border border-[#232736] rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">
                {legalModal === 'privacy' && 'Privacy Policy'}
                {legalModal === 'terms' && 'Terms of Service'}
                {legalModal === 'contact' && 'Contact ResumeFlow'}
              </h3>
              <button
                type="button"
                onClick={() => setLegalModal(null)}
                className="p-1 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {legalModal === 'privacy' && (
              <p className="text-xs text-neutral-300 leading-relaxed">
                ResumeFlow stores your profile and resume documents exclusively in your authenticated Supabase PostgreSQL database protected by Row Level Security. Your resume content is never sold to third parties or shared publicly without your action.
              </p>
            )}

            {legalModal === 'terms' && (
              <p className="text-xs text-neutral-300 leading-relaxed">
                ResumeFlow is provided for personal and professional career development. You retain full ownership of all resumes, cover letters, and exports you create on the platform.
              </p>
            )}

            {legalModal === 'contact' && (
              <div className="space-y-3 text-xs text-neutral-300">
                <p className="leading-relaxed">
                  Questions, feedback, or deployment support? Reach out anytime:
                </p>
                <a
                  href="mailto:support@resumeflow.ai"
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-[#161925] border border-[#252b3d] text-indigo-300 hover:text-indigo-200 transition"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>support@resumeflow.ai</span>
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
