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
        flowType: 'pkce',
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
