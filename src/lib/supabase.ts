import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ResumeData, ResumeRecord, UserProfile, TemplateDefinition } from '../types/resume';
export type { UserProfile };

export const PRODUCTION_SITE_URL = 'https://resume-flow-iota.vercel.app';

const DEFAULT_SUPABASE_URL = 'https://tzfdzzleqlawvnvfvwma.supabase.co';
const DEFAULT_SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_i4OnpucYw2RSwimq4pdy6Q_pVCpnZRI';

const STORAGE_KEY_URL = 'resumeflow_supabase_url';
const STORAGE_KEY_ANON = 'resumeflow_supabase_anon_key';

// Normalize Supabase URLs (handles dashboard URLs, accidental KEY= prefixes, whitespace, and trailing slashes)
export function normalizeSupabaseUrl(rawUrl: string): string {
  let trimmed = (rawUrl || '').trim();
  if (!trimmed) return '';
  trimmed = trimmed.replace(/^VITE_SUPABASE_URL=/i, '').replace(/^["']|["']$/g, '').trim().replace(/\/+$/, '');
  const dashboardMatch = trimmed.match(/https?:\/\/(?:app\.)?supabase\.com\/dashboard\/project\/([a-z0-9]+)/i);
  if (dashboardMatch?.[1]) {
    return `https://${dashboardMatch[1]}.supabase.co`;
  }
  const apiMatch = trimmed.match(/https?:\/\/([a-z0-9-]+)\.supabase\.co/i);
  if (apiMatch?.[0]) {
    return apiMatch[0];
  }
  return trimmed;
}

// Extract clean Supabase publishable or anon JWT key even if pasted with KEY= prefixes or extra text
export function normalizeSupabaseKey(rawKey: string): string {
  const trimmed = (rawKey || '').trim().replace(/^["']|["']$/g, '');
  if (!trimmed) return '';
  const pubMatch = trimmed.match(/sb_publishable_[A-Za-z0-9_-]+/);
  if (pubMatch?.[0]) return pubMatch[0];
  const jwtMatch = trimmed.match(/eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/);
  if (jwtMatch?.[0]) return jwtMatch[0];
  return trimmed.replace(/^VITE_SUPABASE_(?:PUBLISHABLE|ANON)_KEY=/i, '').trim();
}

// Compute the proper redirect URL for Supabase Auth emails and OAuth callbacks.
// Supports production Vercel domain (https://resume-flow-iota.vercel.app), localhost, and preview URLs.
export function getAuthRedirectUrl(path: string = '/auth/callback'): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  if (typeof window !== 'undefined') {
    const { origin, hostname } = window.location;
    if (hostname === 'resume-flow-iota.vercel.app') {
      return `${PRODUCTION_SITE_URL}${normalizedPath}`;
    }
    if (hostname === 'localhost' || hostname === '127.0.0.1' || origin.startsWith('http')) {
      return `${origin}${normalizedPath}`;
    }
  }
  const envSiteUrl = (import.meta.env.VITE_SITE_URL as string) || PRODUCTION_SITE_URL;
  return `${envSiteUrl.replace(/\/+$/, '')}${normalizedPath}`;
}

// Read from env, local override, or connected project defaults
export function getStoredSupabaseConfig(): { url: string; anonKey: string } {
  const envUrl = normalizeSupabaseUrl((import.meta.env.VITE_SUPABASE_URL as string) || '');
  const envAnon = normalizeSupabaseKey(
    (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string) ||
      (import.meta.env.VITE_SUPABASE_ANON_KEY as string) ||
      ''
  );

  const storedUrl =
    typeof window !== 'undefined' ? normalizeSupabaseUrl(localStorage.getItem(STORAGE_KEY_URL) || '') : '';
  const storedAnon =
    typeof window !== 'undefined' ? normalizeSupabaseKey(localStorage.getItem(STORAGE_KEY_ANON) || '') : '';

  const resolvedUrl = storedUrl || (envUrl && !envUrl.includes('your-project-ref') ? envUrl : '') || DEFAULT_SUPABASE_URL;
  const resolvedKey =
    storedAnon ||
    (envAnon && !envAnon.includes('your-anon') && !envAnon.includes('your-publishable') ? envAnon : '') ||
    DEFAULT_SUPABASE_PUBLISHABLE_KEY;

  return {
    url: resolvedUrl,
    anonKey: resolvedKey,
  };
}

export function saveStoredSupabaseConfig(url: string, anonKey: string) {
  if (typeof window !== 'undefined') {
    const normalized = normalizeSupabaseUrl(url);
    if (normalized) localStorage.setItem(STORAGE_KEY_URL, normalized);
    else localStorage.removeItem(STORAGE_KEY_URL);

    const normalizedKey = normalizeSupabaseKey(anonKey);
    if (normalizedKey) localStorage.setItem(STORAGE_KEY_ANON, normalizedKey);
    else localStorage.removeItem(STORAGE_KEY_ANON);

    // Re-initialize client
    supabaseClientInstance = null;
  }
}

export function isSupabaseConfigured(): boolean {
  const { url, anonKey } = getStoredSupabaseConfig();
  return Boolean(
    url &&
    anonKey &&
    !url.includes('your-project-ref') &&
    url.startsWith('https://')
  );
}

let supabaseClientInstance: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (supabaseClientInstance) return supabaseClientInstance;

  const { url, anonKey } = getStoredSupabaseConfig();
  if (!url || !anonKey || url.includes('your-project-ref') || !url.startsWith('https://')) {
    return null;
  }

  try {
    supabaseClientInstance = createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: 'implicit',
      },
    });
    return supabaseClientInstance;
  } catch (err) {
    console.error('Failed to initialize Supabase client:', err);
    return null;
  }
}

// Test connection
export async function testSupabaseConnection(url?: string, key?: string): Promise<{ success: boolean; message: string }> {
  const testUrl = normalizeSupabaseUrl(url || getStoredSupabaseConfig().url);
  const testKey = normalizeSupabaseKey(key || getStoredSupabaseConfig().anonKey);

  if (!testUrl || !testKey || testUrl.includes('your-project-ref')) {
    return {
      success: false,
      message: 'Supabase URL and Publishable/Anon Key must be provided.',
    };
  }

  try {
    const client = createClient(testUrl, testKey, {
      auth: { persistSession: false },
    });
    const { error } = await client.from('templates').select('count', { count: 'exact', head: true });
    if (error && error.code !== 'PGRST116' && !error.message.includes('relation "public.templates" does not exist')) {
      if (error.message.includes('relation') || error.code === '42P01') {
        return {
          success: true,
          message: 'Connected to Supabase! (Database tables need to be created via SQL Editor).',
        };
      }
      return { success: false, message: error.message };
    }
    return { success: true, message: `Successfully connected to Supabase (${testUrl})!` };
  } catch (err: any) {
    return { success: false, message: err.message || 'Connection failed.' };
  }
}

// -------------------------------------------------------------
// Database Operations (profiles, resumes, templates, ai_usage)
// -------------------------------------------------------------

export async function fetchProfile(userId: string): Promise<UserProfile | null> {
  const supabase = getSupabase();
  if (!supabase || !userId) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    console.warn('Profile fetch error:', error.message);
    return null;
  }
  return data as UserProfile | null;
}

export async function updateProfile(
  userId: string,
  updates: { full_name?: string; email?: string; avatar_url?: string }
): Promise<{ data: UserProfile | null; error: any }> {
  const supabase = getSupabase();
  if (!supabase) return { data: null, error: new Error('Supabase client is not configured.') };

  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from('profiles')
    .upsert(
      {
        id: userId,
        ...updates,
        updated_at: now,
      },
      { onConflict: 'id' }
    )
    .select()
    .single();

  if (!error && updates.full_name !== undefined) {
    await supabase.auth.updateUser({
      data: { full_name: updates.full_name, name: updates.full_name },
    });
  }

  return { data: (data as UserProfile) || null, error };
}

export async function uploadAvatarToStorage(
  userId: string,
  file: File
): Promise<{ url: string | null; error: any }> {
  const supabase = getSupabase();
  if (!supabase) return { url: null, error: new Error('Supabase client is not configured.') };

  const ext = file.name.split('.').pop()?.toLowerCase() || 'png';
  const filePath = `${userId}/avatar-${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(filePath, file, { upsert: true, contentType: file.type });

  if (uploadError) {
    return { url: null, error: uploadError };
  }

  const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
  return { url: data.publicUrl, error: null };
}

export async function fetchUserResumes(userId: string): Promise<ResumeRecord[]> {
  const supabase = getSupabase();
  if (!supabase) {
    throw new Error('Supabase is not configured. Please verify your project credentials.');
  }
  if (!userId) {
    throw new Error('Authentication required to load resumes.');
  }

  const { data, error } = await supabase
    .from('resumes')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  if (error) {
    throw new Error(error.message || 'Failed to fetch resumes from Supabase.');
  }

  return (data || []) as ResumeRecord[];
}

export async function fetchResumeById(resumeId: string, userId: string): Promise<ResumeRecord | null> {
  const supabase = getSupabase();
  if (!supabase || !userId || !resumeId) return null;

  const { data, error } = await supabase
    .from('resumes')
    .select('*')
    .eq('id', resumeId)
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message || 'Failed to fetch resume from Supabase.');
  }
  return data as ResumeRecord | null;
}

export async function saveResumeToDb(payload: {
  id?: string;
  user_id?: string;
  title: string;
  template: string;
  resume_data: ResumeData;
}): Promise<{ data: ResumeRecord | null; error: any }> {
  const supabase = getSupabase();
  if (!supabase) {
    return { data: null, error: new Error('Supabase is not configured.') };
  }

  // Verify real authenticated user from Supabase session rather than trusting client payload
  const { data: sessionData, error: sessionErr } = await supabase.auth.getUser();
  const authenticatedUserId = sessionData?.user?.id;
  if (sessionErr || !authenticatedUserId) {
    return { data: null, error: new Error('Your session has expired. Please log in again.') };
  }

  // Validate data
  if (!payload.title || !payload.title.trim()) {
    return { data: null, error: new Error('Resume title cannot be empty.') };
  }
  if (!payload.resume_data || !payload.resume_data.basics?.name?.trim()) {
    return { data: null, error: new Error('Candidate full name is required before saving.') };
  }

  const now = new Date().toISOString();

  if (payload.id && !payload.id.startsWith('local-') && !payload.id.startsWith('new-')) {
    // Update existing record
    const { data, error } = await supabase
      .from('resumes')
      .update({
        title: payload.title.trim(),
        template: payload.template || 'professional-classic',
        resume_data: payload.resume_data,
        updated_at: now,
      })
      .eq('id', payload.id)
      .eq('user_id', authenticatedUserId)
      .select()
      .single();

    if (error) {
      return { data: null, error };
    }
    return { data: data as ResumeRecord, error: null };
  } else {
    // Insert new record
    const { data, error } = await supabase
      .from('resumes')
      .insert({
        user_id: authenticatedUserId,
        title: payload.title.trim(),
        template: payload.template || 'professional-classic',
        resume_data: payload.resume_data,
        updated_at: now,
      })
      .select()
      .single();

    if (error) {
      return { data: null, error };
    }
    return { data: data as ResumeRecord, error: null };
  }
}

export async function deleteResumeFromDb(resumeId: string, userId: string): Promise<{ error: any }> {
  const supabase = getSupabase();
  if (!supabase) return { error: new Error('Supabase is not configured.') };

  const { error } = await supabase
    .from('resumes')
    .delete()
    .eq('id', resumeId)
    .eq('user_id', userId);

  return { error };
}

export async function duplicateResumeInDb(resumeId: string, userId: string): Promise<{ data: ResumeRecord | null; error: any }> {
  const existing = await fetchResumeById(resumeId, userId);
  if (!existing) {
    return { data: null, error: new Error('Resume not found to duplicate.') };
  }

  return saveResumeToDb({
    user_id: userId,
    title: `${existing.title} (Copy)`,
    template: existing.template,
    resume_data: existing.resume_data,
  });
}

export async function fetchActiveTemplates(): Promise<TemplateDefinition[]> {
  const supabase = getSupabase();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('templates')
    .select('id, name, description, preview_url')
    .eq('is_active', true)
    .order('created_at', { ascending: true });

  if (error || !data) return [];
  return data as TemplateDefinition[];
}

export interface AiUsageRecord {
  id: string;
  user_id: string;
  feature: string;
  created_at: string;
}

export async function fetchAiUsageHistory(userId: string): Promise<AiUsageRecord[]> {
  const supabase = getSupabase();
  if (!supabase || !userId) return [];

  const { data, error } = await supabase
    .from('ai_usage')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(25);

  if (error || !data) return [];
  return data as AiUsageRecord[];
}

export async function recordAiUsageInDb(userId: string, feature: string): Promise<void> {
  const supabase = getSupabase();
  if (!supabase || !userId) return;

  try {
    await supabase.from('ai_usage').insert({
      user_id: userId,
      feature,
    });
  } catch (err) {
    console.warn('AI usage recording notice:', err);
  }
}

// -------------------------------------------------------------
// Admin Operations (protected by Supabase Auth + PostgreSQL RLS)
// -------------------------------------------------------------

export const PRIMARY_ADMIN_EMAILS = [
  'kunjrastogi62@gmail.com',
  'noreply@resume-flow-eight.vercel.app',
];

export function isAdminAccount(
  user: { email?: string | null; app_metadata?: any } | null,
  profile: UserProfile | null
): boolean {
  if (!user) return false;
  if (profile?.role === 'admin') return true;
  if (user.app_metadata?.role === 'admin') return true;
  const email = (user.email || '').trim().toLowerCase();
  return PRIMARY_ADMIN_EMAILS.includes(email);
}

export interface SiteSettings {
  announcementEnabled: boolean;
  announcementText: string;
  heroBadgeText: string;
  heroTitle: string;
  heroTagline: string;
  supportEmail: string;
  allowSignups: boolean;
}

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  announcementEnabled: false,
  announcementText: 'ResumeFlow AI v2 is live — Gemini-powered ATS scoring & instant PDF export.',
  heroBadgeText: 'Your Career. Your Story. Powered by AI.',
  heroTitle: 'Build a Resume That Gets You Noticed.',
  heroTagline: 'Craft ATS-ready, recruiter-tested resumes in minutes with structured templates, live A4 previews, and Google Gemini intelligence.',
  supportEmail: 'support@resumeflow.ai',
  allowSignups: true,
};

const SITE_SETTINGS_STORAGE_KEY = 'resumeflow_site_settings_v1';

export async function fetchSiteSettings(): Promise<SiteSettings> {
  let local: Partial<SiteSettings> = {};
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(SITE_SETTINGS_STORAGE_KEY);
      if (raw) local = JSON.parse(raw);
    } catch {
      // ignore storage errors
    }
  }

  const supabase = getSupabase();
  if (!supabase) {
    return { ...DEFAULT_SITE_SETTINGS, ...local };
  }

  try {
    const { data, error } = await supabase
      .from('site_settings')
      .select('config')
      .eq('id', 'global')
      .maybeSingle();

    if (!error && data?.config) {
      const merged = { ...DEFAULT_SITE_SETTINGS, ...(data.config as Partial<SiteSettings>) };
      if (typeof window !== 'undefined') {
        localStorage.setItem(SITE_SETTINGS_STORAGE_KEY, JSON.stringify(merged));
      }
      return merged;
    }
  } catch {
    // fallback cleanly to local settings
  }

  return { ...DEFAULT_SITE_SETTINGS, ...local };
}

export async function saveSiteSettingsAdmin(
  settings: SiteSettings
): Promise<{ savedToDb: boolean; error: any }> {
  if (typeof window !== 'undefined') {
    localStorage.setItem(SITE_SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  }

  const supabase = getSupabase();
  if (!supabase) return { savedToDb: false, error: null };

  const { error } = await supabase
    .from('site_settings')
    .upsert(
      {
        id: 'global',
        config: settings,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' }
    );

  if (error) {
    return { savedToDb: false, error };
  }
  return { savedToDb: true, error: null };
}

export async function fetchAllProfilesAdmin(): Promise<{ data: UserProfile[]; error: any }> {
  const supabase = getSupabase();
  if (!supabase) return { data: [], error: new Error('Supabase is not configured.') };

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(200);

  return { data: (data || []) as UserProfile[], error };
}

export async function updateProfileAdmin(
  targetUserId: string,
  updates: { full_name?: string; role?: 'user' | 'admin' }
): Promise<{ data: UserProfile | null; error: any }> {
  const supabase = getSupabase();
  if (!supabase) return { data: null, error: new Error('Supabase is not configured.') };

  const { data, error } = await supabase
    .from('profiles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', targetUserId)
    .select()
    .single();

  return { data: (data as UserProfile) || null, error };
}

export async function updateUserRoleAdmin(
  targetUserId: string,
  role: 'user' | 'admin'
): Promise<{ data: UserProfile | null; error: any }> {
  return updateProfileAdmin(targetUserId, { role });
}

export async function fetchAllTemplatesAdmin(): Promise<{ data: TemplateDefinition[]; error: any }> {
  const supabase = getSupabase();
  if (!supabase) return { data: [], error: new Error('Supabase is not configured.') };

  const { data, error } = await supabase
    .from('templates')
    .select('*')
    .order('created_at', { ascending: true });

  return { data: (data || []) as TemplateDefinition[], error };
}

export async function createTemplateAdmin(payload: {
  name: string;
  description: string;
  preview_url?: string;
  is_active?: boolean;
}): Promise<{ data: TemplateDefinition | null; error: any }> {
  const supabase = getSupabase();
  if (!supabase) return { data: null, error: new Error('Supabase is not configured.') };

  const { data, error } = await supabase
    .from('templates')
    .insert({
      name: payload.name.trim(),
      description: payload.description.trim(),
      preview_url: payload.preview_url?.trim() || '',
      is_active: payload.is_active ?? true,
    })
    .select()
    .single();

  return { data: (data as TemplateDefinition) || null, error };
}

export async function updateTemplateAdmin(
  templateId: string,
  updates: { name?: string; description?: string; preview_url?: string; is_active?: boolean }
): Promise<{ data: TemplateDefinition | null; error: any }> {
  const supabase = getSupabase();
  if (!supabase) return { data: null, error: new Error('Supabase is not configured.') };

  const { data, error } = await supabase
    .from('templates')
    .update(updates)
    .eq('id', templateId)
    .select()
    .single();

  return { data: (data as TemplateDefinition) || null, error };
}

export async function toggleTemplateActiveAdmin(
  templateId: string,
  isActive: boolean
): Promise<{ error: any }> {
  const supabase = getSupabase();
  if (!supabase) return { error: new Error('Supabase is not configured.') };

  const { error } = await supabase
    .from('templates')
    .update({ is_active: isActive })
    .eq('id', templateId);

  return { error };
}

export async function seedDefaultTemplatesAdmin(): Promise<{ data: TemplateDefinition[]; error: any }> {
  const supabase = getSupabase();
  if (!supabase) return { data: [], error: new Error('Supabase is not configured.') };

  const defaults = [
    {
      name: 'Professional Classic',
      description: 'Traditional single-column layout optimized for corporate, law, finance, and ATS scanners.',
      preview_url: '/templates/classic.png',
      is_active: true,
    },
    {
      name: 'Modern Minimalist',
      description: 'Two-column layout balancing visual hierarchy with high data density.',
      preview_url: '/templates/modern.png',
      is_active: true,
    },
    {
      name: 'Executive Slate',
      description: 'Polished slate headers and executive metrics callouts for leadership roles.',
      preview_url: '/templates/executive.png',
      is_active: true,
    },
    {
      name: 'Tech Monochrome',
      description: 'Developer-first clean monospace styling with GitHub/project emphasis.',
      preview_url: '/templates/tech.png',
      is_active: true,
    },
    {
      name: 'Creative Accent',
      description: 'Contemporary typography with subtle accent borders for product & design roles.',
      preview_url: '/templates/creative.png',
      is_active: true,
    },
  ];

  const { data, error } = await supabase.from('templates').insert(defaults).select();
  return { data: (data || []) as TemplateDefinition[], error };
}

export async function deleteTemplateAdmin(templateId: string): Promise<{ error: any }> {
  const supabase = getSupabase();
  if (!supabase) return { error: new Error('Supabase is not configured.') };

  const { error } = await supabase.from('templates').delete().eq('id', templateId);
  return { error };
}

export async function fetchRecentResumesAdmin(): Promise<{ data: ResumeRecord[]; error: any }> {
  const supabase = getSupabase();
  if (!supabase) return { data: [], error: new Error('Supabase is not configured.') };

  const { data, error } = await supabase
    .from('resumes')
    .select('id, user_id, title, template, created_at, updated_at, resume_data')
    .order('updated_at', { ascending: false })
    .limit(100);

  return { data: (data || []) as ResumeRecord[], error };
}

export async function updateResumeAdmin(
  resumeId: string,
  updates: { title?: string; template?: string }
): Promise<{ data: ResumeRecord | null; error: any }> {
  const supabase = getSupabase();
  if (!supabase) return { data: null, error: new Error('Supabase is not configured.') };

  const { data, error } = await supabase
    .from('resumes')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', resumeId)
    .select()
    .single();

  return { data: (data as ResumeRecord) || null, error };
}

export async function deleteResumeAdmin(resumeId: string): Promise<{ error: any }> {
  const supabase = getSupabase();
  if (!supabase) return { error: new Error('Supabase is not configured.') };

  const { error } = await supabase.from('resumes').delete().eq('id', resumeId);
  return { error };
}

export async function fetchAllAiUsageAdmin(): Promise<{ data: AiUsageRecord[]; error: any }> {
  const supabase = getSupabase();
  if (!supabase) return { data: [], error: new Error('Supabase is not configured.') };

  const { data, error } = await supabase
    .from('ai_usage')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(150);

  return { data: (data || []) as AiUsageRecord[], error };
}
