import React, { useState } from 'react';
import { X, Database, Check, Copy, ExternalLink, RefreshCw, Key, Shield, AlertCircle } from 'lucide-react';
import {
  getStoredSupabaseConfig,
  normalizeSupabaseUrl,
  saveStoredSupabaseConfig,
  testSupabaseConnection,
} from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

interface SupabaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseConfigModal: React.FC<SupabaseConfigModalProps> = ({ isOpen, onClose }) => {
  const { isConfigured, recheckConfig } = useAuth();
  const config = getStoredSupabaseConfig();
  const [url, setUrl] = useState(config.url || '');
  const [anonKey, setAnonKey] = useState(config.anonKey || '');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);
  const [activeTab, setActiveTab] = useState<'credentials' | 'sql'>('credentials');

  if (!isOpen) return null;

  const handleSave = () => {
    const normalized = normalizeSupabaseUrl(url);
    setUrl(normalized);
    saveStoredSupabaseConfig(normalized, anonKey);
    recheckConfig();
    handleTest(normalized);
  };

  const handleTest = async (overrideUrl?: string) => {
    setTesting(true);
    setTestResult(null);
    const normalized = normalizeSupabaseUrl(overrideUrl ?? url);
    if (normalized !== url) setUrl(normalized);
    const res = await testSupabaseConnection(normalized, anonKey.trim());
    setTestResult(res);
    setTesting(false);
  };

  const sqlSchema = `-- RESUMEFLOW DATABASE TABLES & ROW LEVEL SECURITY
-- Run this in your Supabase Project: SQL Editor > New Query

-- 1. PROFILES
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. RESUMES
CREATE TABLE IF NOT EXISTS public.resumes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  resume_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  template TEXT DEFAULT 'professional-classic',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TEMPLATES
CREATE TABLE IF NOT EXISTS public.templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  preview_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. AI_USAGE
CREATE TABLE IF NOT EXISTS public.ai_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  feature TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_resumes_user_id ON public.resumes(user_id);
CREATE INDEX IF NOT EXISTS idx_resumes_updated_at ON public.resumes(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_usage_user_id ON public.ai_usage(user_id);

-- UPDATED_AT TRIGGER
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_resumes_updated_at ON public.resumes;
CREATE TRIGGER trigger_resumes_updated_at
  BEFORE UPDATE ON public.resumes
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- AUTO CREATE PROFILE ON USER SIGNUP TRIGGER
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
  )
  ON CONFLICT (id) DO UPDATE SET updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ENABLE RLS ON ALL TABLES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_usage ENABLE ROW LEVEL SECURITY;

-- POLICIES
CREATE POLICY "Users view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users view own resumes" ON public.resumes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own resumes" ON public.resumes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own resumes" ON public.resumes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own resumes" ON public.resumes FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Read active templates" ON public.templates FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Users read own ai usage" ON public.ai_usage FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own ai usage" ON public.ai_usage FOR INSERT WITH CHECK (auth.uid() = user_id);`;

  const handleCopySql = () => {
    navigator.clipboard.writeText(sqlSchema);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-[#11131a] border border-[#232736] rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#232736] bg-[#161922]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">Supabase PostgreSQL & Auth Setup</h2>
              <p className="text-xs text-neutral-400">Direct PostgreSQL connection with Row Level Security</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-[#232736] bg-[#0d0f17] px-6 text-xs font-medium">
          <button
            onClick={() => setActiveTab('credentials')}
            className={`py-3 px-3 border-b-2 flex items-center gap-1.5 transition ${
              activeTab === 'credentials'
                ? 'border-indigo-500 text-white font-semibold'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>Connection Credentials</span>
          </button>
          <button
            onClick={() => setActiveTab('sql')}
            className={`py-3 px-3 border-b-2 flex items-center gap-1.5 transition ${
              activeTab === 'sql'
                ? 'border-indigo-500 text-white font-semibold'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>SQL Schema & RLS Policies</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          {activeTab === 'credentials' ? (
            <div className="space-y-4">
              <div className="p-3.5 bg-[#0a0c12] border border-[#232736] rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      isConfigured ? 'bg-emerald-400 shadow-sm shadow-emerald-400/50' : 'bg-amber-400'
                    }`}
                  />
                  <div>
                    <div className="text-xs font-semibold text-white">
                      {isConfigured ? 'Supabase Credentials Configured' : 'Supabase Not Configured'}
                    </div>
                    <div className="text-[11px] text-neutral-400">
                      {isConfigured
                        ? 'Connected to live Supabase project. Resumes sync to PostgreSQL.'
                        : 'Enter your project details below to persist resumes directly in Supabase.'}
                    </div>
                  </div>
                </div>
                <a
                  href="https://supabase.com/dashboard"
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 underline shrink-0"
                >
                  <span>Supabase Dashboard</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  Supabase Project URL
                </label>
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://xyzprojectref.supabase.co"
                  className="w-full px-3 py-2 text-xs bg-[#0a0c12] border border-[#232736] rounded-lg text-white font-mono focus:outline-none focus:border-indigo-500"
                />
                <p className="text-[11px] text-neutral-500 mt-1">Found in Project Settings &gt; API &gt; Project URL</p>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  Supabase Anon / Public API Key
                </label>
                <input
                  type="password"
                  value={anonKey}
                  onChange={(e) => setAnonKey(e.target.value)}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  className="w-full px-3 py-2 text-xs bg-[#0a0c12] border border-[#232736] rounded-lg text-white font-mono focus:outline-none focus:border-indigo-500"
                />
                <p className="text-[11px] text-neutral-500 mt-1">Found in Project Settings &gt; API &gt; Project API Keys &gt; anon public</p>
              </div>

              {testResult && (
                <div
                  className={`p-3 rounded-lg text-xs flex items-start gap-2 border ${
                    testResult.success
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                      : 'bg-rose-500/10 border-rose-500/20 text-rose-300'
                  }`}
                >
                  {testResult.success ? <Check className="w-4 h-4 shrink-0 text-emerald-400" /> : <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />}
                  <span>{testResult.message}</span>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-semibold text-white">PostgreSQL Migration Script</h4>
                  <p className="text-[11px] text-neutral-400">Creates profiles, resumes, templates, ai_usage, triggers & RLS</p>
                </div>
                <button
                  onClick={handleCopySql}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1.5 transition"
                >
                  {copiedSql ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSql ? 'Copied SQL!' : 'Copy SQL Script'}</span>
                </button>
              </div>

              <div className="p-3 bg-[#0a0c12] border border-[#232736] rounded-lg text-[11px] text-neutral-300 font-mono overflow-x-auto max-h-[300px]">
                <pre>{sqlSchema}</pre>
              </div>

              <div className="p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300 space-y-1">
                <div className="font-semibold">How to execute in Supabase:</div>
                <ol className="list-decimal pl-4 space-y-0.5 text-neutral-300">
                  <li>Open your Supabase Project Dashboard</li>
                  <li>Click on <span className="font-semibold text-white">SQL Editor</span> in the left sidebar</li>
                  <li>Click <span className="font-semibold text-white">New Query</span>, paste the script above, and click <span className="font-semibold text-white">Run</span></li>
                </ol>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-[#232736] bg-[#161922]">
          <button
            onClick={() => handleTest()}
            disabled={testing || !url.trim() || !anonKey.trim()}
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white flex items-center gap-1.5 transition disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin' : ''}`} />
            <span>Test Connection</span>
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-neutral-400 hover:text-white rounded-lg transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition shadow-sm"
            >
              Save Credentials
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
