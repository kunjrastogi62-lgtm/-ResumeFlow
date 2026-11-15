import { recordAiUsageInDb } from './supabase';

export interface EnhanceBulletResult {
  enhanced: string;
  variations: string[];
  rationale: string;
  simulated?: boolean;
}

export interface SummaryVariation {
  style: string;
  text: string;
}

export interface ATSReviewResult {
  overallScore: number;
  breakdown: {
    formatting: number;
    actionVerbs: number;
    metricsAndQuantification: number;
    brevityAndImpact: number;
    completeness: number;
  };
  strengths: string[];
  weaknesses: string[];
  actionableFixes: {
    category: string;
    issue: string;
    suggestion: string;
  }[];
  simulated?: boolean;
}

export interface TailorResult {
  matchScore: number;
  matchAnalysis: string;
  keywordsFound: string[];
  keywordsMissing: string[];
  suggestions: string[];
  tailoredBullets: {
    sectionIndex?: number;
    itemIndex?: number;
    original: string;
    suggested: string;
    rationale: string;
  }[];
  simulated?: boolean;
}

export interface SkillSuggestions {
  technical: string[];
  soft: string[];
  toolsAndFrameworks: string[];
  simulated?: boolean;
}

export async function checkAiHealth(): Promise<{ status: string; hasGeminiKey: boolean }> {
  try {
    const res = await fetch('/api/health');
    if (!res.ok) throw new Error('Health check failed');
    return await res.json();
  } catch (e) {
    return { status: 'error', hasGeminiKey: false };
  }
}

export async function enhanceBulletPoint(params: {
  bullet: string;
  role?: string;
  context?: string;
  userId?: string;
}): Promise<EnhanceBulletResult> {
  const res = await fetch('/api/ai/enhance-bullet', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to enhance bullet point');
  }

  if (params.userId) {
    recordAiUsageInDb(params.userId, 'enhance-bullet');
  }

  return await res.json();
}

export async function generateSummary(params: {
  title: string;
  experienceYears?: string;
  keySkills?: string[];
  targetRole?: string;
  rawExperience?: string;
  userId?: string;
}): Promise<{ summaries: SummaryVariation[]; simulated?: boolean }> {
  const res = await fetch('/api/ai/generate-summary', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to generate summary');
  }

  if (params.userId) {
    recordAiUsageInDb(params.userId, 'generate-summary');
  }

  return await res.json();
}

export async function reviewResumeATS(params: {
  resume: any;
  targetIndustry?: string;
  userId?: string;
}): Promise<ATSReviewResult> {
  const res = await fetch('/api/ai/ats-review', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to run ATS review');
  }

  if (params.userId) {
    recordAiUsageInDb(params.userId, 'ats-review');
  }

  return await res.json();
}

export async function tailorResumeToJob(params: {
  resume: any;
  jobDescription: string;
  targetTitle?: string;
  userId?: string;
}): Promise<TailorResult> {
  const res = await fetch('/api/ai/tailor-resume', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to tailor resume');
  }

  if (params.userId) {
    recordAiUsageInDb(params.userId, 'tailor-resume');
  }

  return await res.json();
}

export async function suggestSkillsForRole(params: {
  jobTitle: string;
  currentSkills?: string[];
  userId?: string;
}): Promise<SkillSuggestions> {
  const res = await fetch('/api/ai/suggest-skills', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to suggest skills');
  }

  if (params.userId) {
    recordAiUsageInDb(params.userId, 'suggest-skills');
  }

  return await res.json();
}

export async function generateCoverLetter(params: {
  resume: any;
  companyName: string;
  roleTitle: string;
  jobDescription?: string;
  tone?: string;
  userId?: string;
}): Promise<{ coverLetter: string; simulated?: boolean }> {
  const res = await fetch('/api/ai/cover-letter', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to generate cover letter');
  }

  if (params.userId) {
    recordAiUsageInDb(params.userId, 'cover-letter');
  }

  return await res.json();
}
