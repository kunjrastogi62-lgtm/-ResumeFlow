import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  FileText,
  Target,
  Database,
  Layers,
  Download,
  ChevronDown,
  Star,
  Github,
  Zap,
  Lock,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { TemplateDefinition } from '../../types/resume';

interface LandingPageProps {
  onStartBuilding: (templateId?: string) => void;
  onExploreTemplates: () => void;
  onOpenDashboard: () => void;
}

const TEMPLATES: TemplateDefinition[] = [
  {
    id: 'professional-classic',
    name: 'Professional Classic',
    description: 'Clean single-column layout optimized for strict corporate ATS algorithms in finance, law, and consulting.',
    popular: true,
  },
  {
    id: 'modern-minimalist',
    name: 'Modern Minimalist',
    description: 'Sophisticated two-column design balancing high data density with visual hierarchy and breathing room.',
    badge: 'Popular',
  },
  {
    id: 'executive-slate',
    name: 'Executive Slate',
    description: 'Commanding slate headers with emphasis on leadership scope, business ROI, and strategic milestones.',
    badge: 'Executive',
  },
  {
    id: 'tech-monochrome',
    name: 'Tech Monochrome',
    description: 'Developer-first monospace accents highlighting GitHub repositories, system architecture, and tech stacks.',
    badge: 'Tech',
  },
  {
    id: 'creative-accent',
    name: 'Creative Accent',
    description: 'Contemporary typography with subtle accent borders for product managers, designers, and innovators.',
    badge: 'Creative',
  },
];

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartBuilding,
  onExploreTemplates,
  onOpenDashboard,
}) => {
  const { user, setAuthModalOpen, setAuthModalTab, setConfigModalOpen, isConfigured } = useAuth();
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const faqs = [
    {
      q: 'How does ResumeFlow beat modern Applicant Tracking Systems (ATS)?',
      a: 'ResumeFlow templates are built using ATS-compliant single and dual-column semantic structures with clean typography. Our built-in Gemini 3.8 ATS Auditor checks power action verbs, quantifiable metrics (Google XYZ formula), keyword frequencies, and section headers to ensure 90%+ pass rates across Workday, Greenhouse, and Lever.',
    },
    {
      q: 'How does Supabase database and authentication work here?',
      a: 'Your account and resumes are backed by Supabase PostgreSQL with strict Row Level Security (RLS). Resumes are tied to your authenticated auth.uid(), meaning only you can read, modify, or delete your resumes. All profile triggers and database operations run directly on PostgreSQL.',
    },
    {
      q: 'Can I export a clean, high-resolution PDF?',
      a: 'Yes. ResumeFlow provides a dedicated print-optimized rendering engine that outputs standard A4 / US Letter PDFs with razor-sharp vector typography, zero layout shifts, and selectable text.',
    },
    {
      q: 'What AI model powers the resume enhancements?',
      a: 'We use the latest Google Gemini 3.8 Flash model hosted securely on our server. It powers bullet point enhancement, professional summary generation, ATS scoring, and job description keyword tailoring.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#0b0d13] text-[#e2e8f0] selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* 1. Navigation */}
      <nav className="sticky top-0 z-40 border-b border-[#1b1f2d] bg-[#0b0d13]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/25">
              <FileText className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-base tracking-tight text-white flex items-center gap-1.5">
                ResumeFlow
                <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  AI v3.8
                </span>
              </span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-6 text-xs font-medium text-neutral-400">
            <a href="#features" className="hover:text-white transition">Features</a>
            <a href="#templates" className="hover:text-white transition">Templates</a>
            <a href="#how-it-works" className="hover:text-white transition">How It Works</a>
            <a href="#security" className="hover:text-white transition">Supabase PostgreSQL</a>
            <a href="#faq" className="hover:text-white transition">FAQ</a>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setConfigModalOpen(true)}
              className="px-2.5 py-1 text-xs text-neutral-400 hover:text-white bg-[#141724] border border-[#232736] rounded-lg flex items-center gap-1.5 transition"
              title="Supabase Database Settings"
            >
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Supabase</span>
              <span className={`w-2 h-2 rounded-full ${isConfigured ? 'bg-emerald-400' : 'bg-amber-400'}`} />
            </button>

            {user ? (
              <button
                onClick={onOpenDashboard}
                className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition shadow-sm flex items-center gap-1.5"
              >
                <span>Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <>
                <button
                  onClick={() => {
                    setAuthModalTab('login');
                    setAuthModalOpen(true);
                  }}
                  className="px-3 py-1.5 text-xs font-medium text-neutral-300 hover:text-white transition"
                >
                  Log In
                </button>
                <button
                  onClick={() => {
                    setAuthModalTab('signup');
                    setAuthModalOpen(true);
                  }}
                  className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition shadow-sm"
                >
                  Sign Up
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* 2. Hero Section */}
      <section className="relative pt-20 pb-24 overflow-hidden">
        {/* Subtle glow background */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[350px] bg-indigo-600/10 blur-[130px] rounded-full pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium mb-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Google Gemini 3.8 Flash • Supabase PostgreSQL • Real RLS</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-[1.12]">
            Build a Resume That Gets You Noticed.
          </h1>

          <p className="mt-5 text-lg sm:text-xl text-neutral-400 max-w-2xl mx-auto font-normal">
            Your Career. Your Story. Powered by AI.
          </p>

          <p className="mt-2 text-sm text-neutral-500 max-w-xl mx-auto">
            Transform raw experience into quantified Google XYZ bullets, audit ATS compatibility in real time, and tailor resumes to any job description.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5">
            <button
              onClick={() => onStartBuilding()}
              className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold flex items-center gap-2 transition shadow-xl shadow-indigo-600/25 hover:shadow-indigo-600/35"
            >
              <span>Build My Resume</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <a
              href="#templates"
              className="px-5 py-3 rounded-xl bg-[#141724] hover:bg-[#1a1e30] border border-[#232736] text-neutral-200 text-sm font-medium transition"
            >
              Explore Templates
            </a>
          </div>

          {/* Social proof pills */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs text-neutral-500">
            <div className="flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>ATS-Friendly Parsing</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>Direct Supabase Sync</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>Zero-Margin PDF Export</span>
            </div>
          </div>

          {/* Interactive Hero Preview Element */}
          <div className="mt-14 relative max-w-4xl mx-auto rounded-2xl p-1 bg-gradient-to-b from-[#2a3048] to-[#12141f] shadow-2xl">
            <div className="bg-[#0e1017] rounded-xl overflow-hidden border border-[#1f2436] p-4 sm:p-6 text-left">
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#1b1f2d]">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-rose-500/70" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/70" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/70" />
                  <span className="text-xs text-neutral-400 font-mono pl-2">resume_lead_architect.json</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    ATS Score: 94 / 100
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-semibold">
                    PostgreSQL Synced
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
                {/* Before bullet */}
                <div className="p-4 rounded-xl bg-[#08090f] border border-rose-500/20 space-y-2">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    Weak Traditional Phrasing (Fails ATS)
                  </div>
                  <p className="text-xs text-neutral-400 font-mono">
                    "Responsible for working on front-end features and fixing bugs on customer dashboard."
                  </p>
                  <p className="text-[11px] text-neutral-500 italic">
                    Lacks action verbs, zero metrics, passive voice.
                  </p>
                </div>

                {/* After bullet */}
                <div className="p-4 rounded-xl bg-[#08090f] border border-emerald-500/30 space-y-2">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    Gemini 3.8 XYZ Formula Enhancement
                  </div>
                  <p className="text-xs text-white font-mono">
                    "Spearheaded frontend architecture modernization for 45K+ enterprise users, boosting page load speeds by 44% and lowering bug reports by 65%."
                  </p>
                  <p className="text-[11px] text-emerald-400/90 font-medium">
                    Strong action verb, quantified metrics ($/scale/%), passes top ATS filters.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Features Section */}
      <section id="features" className="py-20 border-t border-[#1b1f2d] bg-[#0d0f17]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-400">Intelligent Features</h2>
            <p className="text-3xl font-extrabold text-white mt-2">
              Everything You Need to Land Top Interviews
            </p>
            <p className="text-sm text-neutral-400 mt-3">
              Crafted with the precision of Linear, the reliability of Stripe, and the intelligence of Google Gemini.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-[#11131a] border border-[#232736] hover:border-indigo-500/30 transition space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Google XYZ Bullet Enhancer</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Automatically rewrites duties into quantifiable impact statements: "Accomplished [X] as measured by [Y], by doing [Z]".
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#11131a] border border-[#232736] hover:border-indigo-500/30 transition space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Real-Time ATS Auditor</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Deep algorithmic evaluation of power verbs, density, metrics, and section structure with 0-100 scoring and targeted fixes.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#11131a] border border-[#232736] hover:border-indigo-500/30 transition space-y-3">
              <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center">
                <Target className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Job Description Tailoring</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Paste any job posting. Gemini scans missing keywords and rewrites your bullets to perfectly match the role requirements.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#11131a] border border-[#232736] hover:border-indigo-500/30 transition space-y-3">
              <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400 flex items-center justify-center">
                <Database className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Supabase PostgreSQL & RLS</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Real relational database storage with Row Level Security. Never worry about losing data across sessions or devices.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#11131a] border border-[#232736] hover:border-indigo-500/30 transition space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">5 High-Craft Templates</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                From traditional Wall Street classics to modern dual-column and developer monospace designs. Custom fonts and colors.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#11131a] border border-[#232736] hover:border-indigo-500/30 transition space-y-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center">
                <Download className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Vector PDF & JSON Export</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Generate clean, high-resolution PDFs without page breaks clipping your text. Export and import standardized JSON anytime.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Templates Showcase */}
      <section id="templates" className="py-20 border-t border-[#1b1f2d]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-400">Recruiter-Approved</h2>
            <p className="text-3xl font-extrabold text-white mt-2">
              Designed for Human Eyes and ATS Machines
            </p>
            <p className="text-sm text-neutral-400 mt-2">
              Select any template to launch directly into the editor with pre-structured sample data.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {TEMPLATES.map((tmpl) => (
              <div
                key={tmpl.id}
                onClick={() => onStartBuilding(tmpl.id)}
                className="group p-4 bg-[#11131a] border border-[#232736] hover:border-indigo-500/50 rounded-xl transition cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-white group-hover:text-indigo-400 transition">
                      {tmpl.name}
                    </span>
                    {tmpl.badge && (
                      <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        {tmpl.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-neutral-400 leading-relaxed">
                    {tmpl.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-[#1b1f2d] flex items-center justify-between text-xs text-indigo-400 font-medium">
                  <span>Use Template</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. How It Works Section */}
      <section id="how-it-works" className="py-20 border-t border-[#1b1f2d] bg-[#0d0f17]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-400">Simple 3-Step Flow</h2>
            <p className="text-3xl font-extrabold text-white mt-2">From Blank Page to Interview-Ready in Minutes</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="p-6 bg-[#11131a] border border-[#232736] rounded-2xl relative space-y-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 font-bold flex items-center justify-center text-sm">
                1
              </div>
              <h3 className="text-base font-bold text-white">Enter Your Experience</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Add your career highlights, education, and technical competencies. Pre-populate with our executive template in 1 click.
              </p>
            </div>

            <div className="p-6 bg-[#11131a] border border-[#232736] rounded-2xl relative space-y-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 font-bold flex items-center justify-center text-sm">
                2
              </div>
              <h3 className="text-base font-bold text-white">AI Polishes & Tailors</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Click ✨ to enhance bullets into quantified Google XYZ format, run the ATS compliance audit, and tailor to job descriptions.
              </p>
            </div>

            <div className="p-6 bg-[#11131a] border border-[#232736] rounded-2xl relative space-y-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 font-bold flex items-center justify-center text-sm">
                3
              </div>
              <h3 className="text-base font-bold text-white">Save to Supabase & Export</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Your resume syncs to Supabase PostgreSQL under your user account. Download clean, ATS-compliant PDF with one click.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Supabase Security & Architecture */}
      <section id="security" className="py-20 border-t border-[#1b1f2d]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-8 rounded-2xl bg-gradient-to-r from-[#111420] to-[#151928] border border-[#232736] space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Enterprise Database & Security Architecture</h3>
                <p className="text-xs text-neutral-400">Strict PostgreSQL Row Level Security (RLS) & Auth</p>
              </div>
            </div>

            <p className="text-xs text-neutral-300 leading-relaxed">
              ResumeFlow connects directly to Supabase PostgreSQL. Tables (<code className="text-indigo-400 font-mono">profiles</code>, <code className="text-indigo-400 font-mono">resumes</code>, <code className="text-indigo-400 font-mono">templates</code>, <code className="text-indigo-400 font-mono">ai_usage</code>) are protected by Row Level Security policies that verify <code className="text-indigo-400 font-mono">auth.uid() = user_id</code> on every query. Automatic database triggers handle timestamps and user profile provisioning upon signup.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => setConfigModalOpen(true)}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition flex items-center gap-2"
              >
                <Database className="w-3.5 h-3.5" />
                <span>View Supabase Setup & SQL Schema</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 7. FAQs */}
      <section id="faq" className="py-20 border-t border-[#1b1f2d] bg-[#0d0f17]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-400">Answers & Details</h2>
            <p className="text-3xl font-extrabold text-white mt-2">Frequently Asked Questions</p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="border border-[#232736] rounded-xl overflow-hidden bg-[#11131a] transition"
              >
                <button
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                  className="w-full px-5 py-4 text-left text-sm font-semibold text-white flex items-center justify-between gap-4"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-neutral-400 shrink-0 transition-transform ${
                      activeFaq === idx ? 'rotate-180 text-indigo-400' : ''
                    }`}
                  />
                </button>
                {activeFaq === idx && (
                  <div className="px-5 pb-4 text-xs text-neutral-300 leading-relaxed border-t border-[#1b1f2d] pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. Footer */}
      <footer className="border-t border-[#1b1f2d] py-12 bg-[#090b10] text-neutral-500 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-md bg-indigo-600 flex items-center justify-center text-white font-bold text-xs">
              R
            </div>
            <span className="font-semibold text-white">ResumeFlow</span>
            <span className="text-neutral-600">•</span>
            <span>Your Career. Your Story. Powered by AI.</span>
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <button
              onClick={() => alert('ResumeFlow Privacy: Your data is stored exclusively in your Supabase database and never sold or used for public model training.')}
              className="hover:text-white transition"
            >
              Privacy Policy
            </button>
            <button
              onClick={() => alert('ResumeFlow Terms: Free-tier compliant for personal and professional career management.')}
              className="hover:text-white transition"
            >
              Terms of Service
            </button>
            <a href="mailto:support@resumeflow.ai" className="hover:text-white transition">
              Contact
            </a>
            <button
              onClick={() => setConfigModalOpen(true)}
              className="hover:text-emerald-400 text-emerald-500/80 transition"
            >
              Database Status
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
