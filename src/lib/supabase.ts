import { createClient, SupabaseClient, User, Session } from '@supabase/supabase-js';
import { ResumeData, ResumeRecord, UserProfile } from '../types/resume';
export type { UserProfile };

const STORAGE_KEY_URL = 'resumeflow_supabase_url';
const STORAGE_KEY_ANON = 'resumeflow_supabase_anon_key';

// Normalize Supabase Dashboard URLs (e.g. https://supabase.com/dashboard/project/<ref>) to API URL (https://<ref>.supabase.co)
export function normalizeSupabaseUrl(rawUrl: string): string {
  const trimmed = (rawUrl || '').trim().replace(/\/+$/, '');
  const dashboardMatch = trimmed.match(/^https?:\/\/(?:app\.)?supabase\.com\/dashboard\/project\/([a-z0-9]+)/i);
  if (dashboardMatch?.[1]) {
    return `https://${dashboardMatch[1]}.supabase.co`;
  }
  return trimmed;
}

// Read from env or local override
export function getStoredSupabaseConfig(): { url: string; anonKey: string } {
  const envUrl = normalizeSupabaseUrl((import.meta.env.VITE_SUPABASE_URL as string) || '');
  const envAnon =
    (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string) ||
    (import.meta.env.VITE_SUPABASE_ANON_KEY as string) ||
    '';

  const storedUrl =
    typeof window !== 'undefined' ? normalizeSupabaseUrl(localStorage.getItem(STORAGE_KEY_URL) || '') : '';
  const storedAnon = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY_ANON) || '' : '';

  return {
    url: storedUrl || envUrl,
    anonKey: storedAnon || envAnon,
  };
}

export function saveStoredSupabaseConfig(url: string, anonKey: string) {
  if (typeof window !== 'undefined') {
    const normalized = normalizeSupabaseUrl(url);
    if (normalized) localStorage.setItem(STORAGE_KEY_URL, normalized);
    else localStorage.removeItem(STORAGE_KEY_URL);

    if (anonKey) localStorage.setItem(STORAGE_KEY_ANON, anonKey.trim());
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
  const testKey = (key || getStoredSupabaseConfig().anonKey).trim();

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
    // Ping rest endpoint
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
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.warn('Profile fetch note:', error.message);
    return null;
  }
  return data as UserProfile;
}

export async function updateProfile(userId: string, updates: Partial<UserProfile>): Promise<{ error: any }> {
  const supabase = getSupabase();
  if (!supabase) return { error: new Error('Supabase client not configured') };

  const { error } = await supabase
    .from('profiles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', userId);

  return { error };
}

export async function fetchUserResumes(userId: string): Promise<ResumeRecord[]> {
  const supabase = getSupabase();
  if (!supabase) {
    // Local fallback for guest testing
    const local = localStorage.getItem(`resumeflow_resumes_${userId || 'guest'}`);
    return local ? JSON.parse(local) : [];
  }

  const { data, error } = await supabase
    .from('resumes')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Error fetching resumes from Supabase:', error);
    // Fallback to local
    const local = localStorage.getItem(`resumeflow_resumes_${userId}`);
    return local ? JSON.parse(local) : [];
  }

  return (data || []) as ResumeRecord[];
}

export async function fetchResumeById(resumeId: string, userId: string): Promise<ResumeRecord | null> {
  const supabase = getSupabase();
  if (!supabase) {
    const list = await fetchUserResumes(userId);
    return list.find((r) => r.id === resumeId) || null;
  }

  const { data, error } = await supabase
    .from('resumes')
    .select('*')
    .eq('id', resumeId)
    .eq('user_id', userId)
    .single();

  if (error) {
    console.error('Error fetching resume by id:', error);
    return null;
  }
  return data as ResumeRecord;
}

export async function saveResumeToDb(payload: {
  id?: string;
  user_id: string;
  title: string;
  template: string;
  resume_data: ResumeData;
}): Promise<{ data: ResumeRecord | null; error: any }> {
  const supabase = getSupabase();
  const now = new Date().toISOString();

  // Validate data
  if (!payload.title || !payload.title.trim()) {
    return { data: null, error: new Error('Resume title cannot be empty.') };
  }

  if (!supabase) {
    // Local storage fallback for sandbox preview
    const resumeId = payload.id || `local-${Date.now()}`;
    const record: ResumeRecord = {
      id: resumeId,
      user_id: payload.user_id || 'guest-user',
      title: payload.title.trim(),
      template: payload.template || 'professional-classic',
      resume_data: payload.resume_data,
      created_at: now,
      updated_at: now,
    };

    const key = `resumeflow_resumes_${payload.user_id || 'guest'}`;
    const existing = JSON.parse(localStorage.getItem(key) || '[]');
    const index = existing.findIndex((r: ResumeRecord) => r.id === resumeId);
    if (index >= 0) {
      existing[index] = { ...existing[index], ...record, created_at: existing[index].created_at };
    } else {
      existing.unshift(record);
    }
    localStorage.setItem(key, JSON.stringify(existing));
    return { data: record, error: null };
  }

  // Real Supabase PostgreSQL saving
  if (payload.id && !payload.id.startsWith('local-')) {
    // Update existing record
    const { data, error } = await supabase
      .from('resumes')
      .update({
        title: payload.title.trim(),
        template: payload.template,
        resume_data: payload.resume_data,
        updated_at: now,
      })
      .eq('id', payload.id)
      .eq('user_id', payload.user_id)
      .select()
      .single();

    if (error) {
      console.error('Supabase resume update error:', error);
      return { data: null, error };
    }
    return { data: data as ResumeRecord, error: null };
  } else {
    // Insert new record
    const { data, error } = await supabase
      .from('resumes')
      .insert({
        user_id: payload.user_id,
        title: payload.title.trim(),
        template: payload.template || 'professional-classic',
        resume_data: payload.resume_data,
        updated_at: now,
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase resume insert error:', error);
      return { data: null, error };
    }
    return { data: data as ResumeRecord, error: null };
  }
}

export async function deleteResumeFromDb(resumeId: string, userId: string): Promise<{ error: any }> {
  const supabase = getSupabase();
  if (!supabase) {
    const key = `resumeflow_resumes_${userId || 'guest'}`;
    const existing = JSON.parse(localStorage.getItem(key) || '[]');
    const filtered = existing.filter((r: ResumeRecord) => r.id !== resumeId);
    localStorage.setItem(key, JSON.stringify(filtered));
    return { error: null };
  }

  const { error } = await supabase
    .from('resumes')
    .delete()
    .eq('id', resumeId)
    .eq('user_id', userId);

  return { error };
}

export async function duplicateResumeInDb(resumeId: string, userId: string): Promise<{ data: ResumeRecord | null; error: any }> {
  const supabase = getSupabase();
  const existing = await fetchResumeById(resumeId, userId);
  if (!existing) {
    return { data: null, error: new Error('Resume not found to duplicate.') };
  }

  const newTitle = `${existing.title} (Copy)`;
  return saveResumeToDb({
    user_id: userId,
    title: newTitle,
    template: existing.template,
    resume_data: existing.resume_data,
  });
}

export async function recordAiUsageInDb(userId: string, feature: string): Promise<void> {
  const supabase = getSupabase();
  if (!supabase || !userId) return;

  try {
    await supabase.from('ai_usage').insert({
      user_id: userId,
      feature: feature,
    });
  } catch (err) {
    console.warn('AI usage recording notice:', err);
  }
}
