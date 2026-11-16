import { GoogleGenAI, Type } from '@google/genai';

const MODEL_CHAIN = ['gemini-4-hydrogen', 'gemini-3.1-flash-lite', 'gemini-3.8-flash'] as const;

export const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

export function formatGeminiError(error: any): { status: number; message: string } {
  const raw = String(error?.message || error || 'AI request failed.');
  let parsedMsg = raw;
  let code = Number(error?.status || error?.code || 500);

  // Extract nested JSON error if Google SDK wrapped JSON inside error.message
  if (raw.trim().startsWith('{')) {
    try {
      const obj = JSON.parse(raw);
      if (obj?.error?.message) parsedMsg = obj.error.message;
      if (obj?.error?.code) code = Number(obj.error.code);
    } catch {
      // ignore parse failure
    }
  }

  if (code === 503 || parsedMsg.toLowerCase().includes('high demand') || parsedMsg.toLowerCase().includes('unavailable')) {
    return {
      status: 503,
      message: 'Gemini AI is experiencing temporary high demand. Please try again in a few seconds.',
    };
  }
  if (code === 429 || parsedMsg.toLowerCase().includes('resource_exhausted') || parsedMsg.toLowerCase().includes('quota')) {
    return {
      status: 429,
      message: 'AI rate limit reached temporarily. Please wait a moment and try again.',
    };
  }
  if (code === 401 || code === 403 || parsedMsg.toLowerCase().includes('api_key')) {
    return {
      status: 500,
      message: 'Gemini API key is missing or unauthorized on the server.',
    };
  }

  return {
    status: code >= 400 && code < 600 ? code : 500,
    message: parsedMsg,
  };
}

function isRetryableError(err: any): boolean {
  const msg = String(err?.message || '').toLowerCase();
  const status = Number(err?.status || err?.code || 0);
  return (
    status === 503 ||
    status === 429 ||
    status === 500 ||
    msg.includes('503') ||
    msg.includes('429') ||
    msg.includes('unavailable') ||
    msg.includes('high demand') ||
    msg.includes('resource_exhausted') ||
    msg.includes('timeout')
  );
}

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function generateWithFallback(
  ai: GoogleGenAI,
  params: {
    contents: string;
    config?: any;
  }
) {
  let lastError: any;

  for (let i = 0; i < MODEL_CHAIN.length; i++) {
    const model = MODEL_CHAIN[i];
    try {
      return await ai.models.generateContent({
        model,
        contents: params.contents,
        config: params.config,
      });
    } catch (err: any) {
      lastError = err;
      if (!isRetryableError(err) || i === MODEL_CHAIN.length - 1) {
        throw err;
      }
      await sleep(300 * (i + 1));
    }
  }

  throw lastError;
}

export function getHealthPayload() {
  return {
    status: 'ok',
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    time: new Date().toISOString(),
  };
}

export async function handleEnhanceBullet(body: any): Promise<{ status: number; data: any }> {
  try {
    const { bullet, role, context } = body || {};
    if (!bullet || typeof bullet !== 'string' || !bullet.trim()) {
      return { status: 400, data: { error: 'Bullet point text is required.' } };
    }

    const ai = getGeminiClient();
    if (!ai) {
      const clean = bullet.trim().replace(/^[-*•]\s*/, '');
      return {
        status: 200,
        data: {
          enhanced: `Spearheaded initiatives to ${clean.toLowerCase()}, increasing operational efficiency and measurable output across key projects.`,
          variations: [
            `Spearheaded ${clean.toLowerCase()}, optimizing delivery time and stakeholder satisfaction.`,
            `Engineered scalable solutions for ${clean.toLowerCase()}, driving a 25% boost in team productivity.`,
            `Orchestrated the execution of ${clean.toLowerCase()} by applying industry best practices and cross-functional leadership.`,
          ],
          rationale: 'Enhanced using strong action verbs, quantifiable framing, and structured Google XYZ formula.',
          simulated: true,
        },
      };
    }

    const prompt = `You are a world-class executive resume coach. Enhance the following resume bullet point using Google's XYZ formula ("Accomplished [X] as measured by [Y], by doing [Z]").
Original bullet: "${bullet}"
Target Job/Role context: "${role || 'Professional'}"
Additional context: "${context || 'General industry'}"

Rules:
1. Start with high-impact power action verbs (e.g., Architected, Spearheaded, Accelerated, Catalyzed, Engineered).
2. Incorporate realistic quantifiable impact metrics (%, $, time saved, users, scale).
3. Eliminate passive voice and weak filler words ("responsible for", "helped with", "worked on").
4. Provide the primary enhanced bullet, 3 distinct variations (metrics-heavy, leadership-focused, technical/execution-focused), and a concise 1-sentence rationale.`;

    const response = await generateWithFallback(ai, {
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            enhanced: { type: Type.STRING, description: 'Primary best enhanced bullet point' },
            variations: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: '3 high-quality alternative variations',
            },
            rationale: { type: Type.STRING, description: 'Why this enhancement works and beats ATS filters' },
          },
          required: ['enhanced', 'variations', 'rationale'],
        },
      },
    });

    const parsed = JSON.parse((response.text || '{}').trim());
    return { status: 200, data: parsed };
  } catch (error: any) {
    console.error('Enhance bullet error:', error);
    const formatted = formatGeminiError(error);
    return { status: formatted.status, data: { error: formatted.message } };
  }
}

export async function handleGenerateSummary(body: any): Promise<{ status: number; data: any }> {
  try {
    const { title, experienceYears, keySkills, targetRole, rawExperience } = body || {};
    const ai = getGeminiClient();

    if (!ai) {
      const skillsStr = Array.isArray(keySkills) && keySkills.length ? keySkills.join(', ') : 'modern industry tooling';
      return {
        status: 200,
        data: {
          summaries: [
            {
              style: 'Impact-Driven',
              text: `Results-oriented ${title || 'Professional'} with ${experienceYears || '5+'} years of experience driving high-velocity initiatives and cross-functional alignment. Proven track record in ${skillsStr}, consistently delivering scalable outcomes and high-impact solutions.`,
            },
            {
              style: 'Executive & Strategic',
              text: `Strategic ${targetRole || title || 'Leader'} recognized for architecting resilient systems and leading cross-functional teams. Expertise spanning ${skillsStr}, with a focus on operational rigor and measurable business growth.`,
            },
            {
              style: 'Concise & Modern',
              text: `Dynamic ${title || 'Specialist'} specializing in ${skillsStr}. Adept at turning complex challenges into streamlined, high-value outcomes through agile execution and data-backed decision-making.`,
            },
          ],
          simulated: true,
        },
      };
    }

    const prompt = `You are an elite career strategist. Create 3 distinct, ATS-optimized professional resume summary paragraphs based on this candidate profile:
Candidate Title: ${title || 'Specialist'}
Years of Experience: ${experienceYears || '3+ years'}
Core Skills: ${Array.isArray(keySkills) ? keySkills.join(', ') : keySkills || 'General'}
Target Role: ${targetRole || title || 'Target Role'}
Background details: ${rawExperience || 'Strong foundation in execution and collaboration'}

Generate 3 variations:
1. "Impact-Driven" (focus on business ROI, quantifiable metrics, high velocity)
2. "Executive & Strategic" (focus on leadership, vision, architecture, cross-functional value)
3. "Concise & Modern" (punchy, 2-3 sentences, direct, tech-forward)`;

    const response = await generateWithFallback(ai, {
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summaries: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  style: { type: Type.STRING },
                  text: { type: Type.STRING },
                },
                required: ['style', 'text'],
              },
            },
          },
          required: ['summaries'],
        },
      },
    });

    const parsed = JSON.parse((response.text || '{}').trim());
    return { status: 200, data: parsed };
  } catch (error: any) {
    console.error('Generate summary error:', error);
    const formatted = formatGeminiError(error);
    return { status: formatted.status, data: { error: formatted.message } };
  }
}

export async function handleAtsReview(body: any): Promise<{ status: number; data: any }> {
  try {
    const { resume, targetIndustry } = body || {};
    if (!resume) {
      return { status: 400, data: { error: 'Resume data is required for ATS review.' } };
    }

    const ai = getGeminiClient();
    if (!ai) {
      return {
        status: 200,
        data: {
          overallScore: 84,
          breakdown: {
            formatting: 90,
            actionVerbs: 85,
            metricsAndQuantification: 78,
            brevityAndImpact: 82,
            completeness: 88,
          },
          strengths: [
            'Strong structural hierarchy with clear role distinctions',
            'Clean contact section and accessible links',
            'Active power verbs utilized across primary accomplishments',
          ],
          weaknesses: [
            'Several bullet points lack quantifiable numbers or percentages',
            'Professional summary could be more tightly focused on value proposition',
            'Technical skills could be grouped by taxonomy (Languages, Frameworks, Cloud)',
          ],
          actionableFixes: [
            {
              category: 'Metrics & Data',
              issue: 'Vague statements like "improved speed" or "worked on features"',
              suggestion: 'Add concrete percentages or benchmarks, e.g., "reduced latency by 32% across 1.2M daily queries".',
            },
            {
              category: 'Action Verbs',
              issue: 'Repetition of basic verbs like "managed" or "helped"',
              suggestion: 'Substitute with high-conviction verbs like "Architected", "Spearheaded", "Revamped", "Orchestrated".',
            },
            {
              category: 'Keywords & ATS',
              issue: 'Skills section missing high-frequency industry standard tokens',
              suggestion: 'Ensure exact standard terms appear in both skills and experience bullets to pass ATS parsing.',
            },
          ],
          simulated: true,
        },
      };
    }

    const prompt = `You are a principal talent acquisition engineer and enterprise ATS (Applicant Tracking System) parser algorithm reviewer.
Analyze this resume JSON for ATS compliance, scoring, and weaknesses:
Target Industry/Role: ${targetIndustry || 'Technology / General Corporate'}
Resume Data: ${JSON.stringify(resume, null, 2)}

Provide a strict, realistic assessment:
1. Overall score (0-100)
2. Breakdown scores (0-100 each for: formatting, actionVerbs, metricsAndQuantification, brevityAndImpact, completeness)
3. 3-4 concrete strengths
4. 3-4 specific weaknesses
5. 3-4 actionable fixes with category, issue, and suggestion.`;

    const response = await generateWithFallback(ai, {
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            overallScore: { type: Type.INTEGER },
            breakdown: {
              type: Type.OBJECT,
              properties: {
                formatting: { type: Type.INTEGER },
                actionVerbs: { type: Type.INTEGER },
                metricsAndQuantification: { type: Type.INTEGER },
                brevityAndImpact: { type: Type.INTEGER },
                completeness: { type: Type.INTEGER },
              },
              required: ['formatting', 'actionVerbs', 'metricsAndQuantification', 'brevityAndImpact', 'completeness'],
            },
            strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
            weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
            actionableFixes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  category: { type: Type.STRING },
                  issue: { type: Type.STRING },
                  suggestion: { type: Type.STRING },
                },
                required: ['category', 'issue', 'suggestion'],
              },
            },
          },
          required: ['overallScore', 'breakdown', 'strengths', 'weaknesses', 'actionableFixes'],
        },
      },
    });

    const parsed = JSON.parse((response.text || '{}').trim());
    return { status: 200, data: parsed };
  } catch (error: any) {
    console.error('ATS review error:', error);
    const formatted = formatGeminiError(error);
    return { status: formatted.status, data: { error: formatted.message } };
  }
}

export async function handleTailorResume(body: any): Promise<{ status: number; data: any }> {
  try {
    const { resume, jobDescription, targetTitle } = body || {};
    if (!jobDescription || typeof jobDescription !== 'string' || !jobDescription.trim()) {
      return { status: 400, data: { error: 'Job description is required.' } };
    }

    const ai = getGeminiClient();
    if (!ai) {
      return {
        status: 200,
        data: {
          matchScore: 78,
          matchAnalysis: 'Good match on foundational responsibilities. The target job emphasizes cross-functional velocity, cloud scalability, and stakeholder presentation.',
          keywordsFound: ['TypeScript', 'React', 'API Design', 'System Architecture', 'Agile'],
          keywordsMissing: ['Kubernetes', 'CI/CD Pipelines', 'Performance Optimization', 'SOC2 Compliance'],
          suggestions: [
            'Incorporate target keywords directly into the work experience accomplishments.',
            'Emphasize leadership and business outcome metrics in your latest position.',
            'Align your headline and summary directly to the target title.',
          ],
          tailoredBullets: [
            {
              sectionIndex: 0,
              itemIndex: 0,
              original: resume?.work?.[0]?.highlights?.[0] || 'Worked on front-end features and fixed bugs.',
              suggested: 'Spearheaded frontend architecture modernization using React and TypeScript, boosting page responsiveness by 40% and eliminating 15+ weekly client bug reports.',
              rationale: 'Incorporates missing skills and converts passive phrasing into high-value quantifiable outcomes.',
            },
          ],
          simulated: true,
        },
      };
    }

    const prompt = `You are a specialist technical recruiter. Compare the candidate's resume with the target job description and provide a tailored optimization plan:
Target Job Title: ${targetTitle || 'Target Position'}
Job Description:
"""${jobDescription}"""

Candidate Resume:
${JSON.stringify(resume, null, 2)}

Analyze:
1. Match score (0-100)
2. Match analysis summary
3. Keywords found in candidate's resume that match job description
4. Crucial keywords missing from resume
5. High-impact strategic suggestions
6. Specific rewritten bullet suggestions matching candidate's existing experience (use exact 0-based sectionIndex into resume.work and 0-based itemIndex into highlights, and copy the exact original bullet string).`;

    const response = await generateWithFallback(ai, {
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            matchScore: { type: Type.INTEGER },
            matchAnalysis: { type: Type.STRING },
            keywordsFound: { type: Type.ARRAY, items: { type: Type.STRING } },
            keywordsMissing: { type: Type.ARRAY, items: { type: Type.STRING } },
            suggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
            tailoredBullets: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  sectionIndex: { type: Type.INTEGER },
                  itemIndex: { type: Type.INTEGER },
                  original: { type: Type.STRING },
                  suggested: { type: Type.STRING },
                  rationale: { type: Type.STRING },
                },
                required: ['original', 'suggested', 'rationale'],
              },
            },
          },
          required: ['matchScore', 'matchAnalysis', 'keywordsFound', 'keywordsMissing', 'suggestions', 'tailoredBullets'],
        },
      },
    });

    const parsed = JSON.parse((response.text || '{}').trim());
    return { status: 200, data: parsed };
  } catch (error: any) {
    console.error('Tailor resume error:', error);
    const formatted = formatGeminiError(error);
    return { status: formatted.status, data: { error: formatted.message } };
  }
}

export async function handleSuggestSkills(body: any): Promise<{ status: number; data: any }> {
  try {
    const { jobTitle, currentSkills } = body || {};
    const ai = getGeminiClient();

    if (!ai) {
      return {
        status: 200,
        data: {
          technical: ['TypeScript', 'React.js', 'Next.js', 'Node.js', 'PostgreSQL', 'GraphQL', 'Tailwind CSS'],
          soft: ['Cross-functional Collaboration', 'Technical Mentorship', 'Strategic Roadmap Planning', 'Agile Leadership'],
          toolsAndFrameworks: ['Git / GitHub', 'Docker', 'AWS / Cloudflare', 'Jest / Vitest', 'Figma', 'CI/CD Actions'],
          simulated: true,
        },
      };
    }

    const prompt = `Recommend relevant, high-demand skills for a candidate in this role:
Role: ${jobTitle || 'Software Engineer'}
Currently listed skills: ${Array.isArray(currentSkills) ? currentSkills.join(', ') : 'None'}

Provide a grouped set of modern industry-demanded skills (do not repeat already listed ones).`;

    const response = await generateWithFallback(ai, {
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            technical: { type: Type.ARRAY, items: { type: Type.STRING } },
            soft: { type: Type.ARRAY, items: { type: Type.STRING } },
            toolsAndFrameworks: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ['technical', 'soft', 'toolsAndFrameworks'],
        },
      },
    });

    const parsed = JSON.parse((response.text || '{}').trim());
    return { status: 200, data: parsed };
  } catch (error: any) {
    console.error('Skill suggestion error:', error);
    const formatted = formatGeminiError(error);
    return { status: formatted.status, data: { error: formatted.message } };
  }
}

export async function handleCoverLetter(body: any): Promise<{ status: number; data: any }> {
  try {
    const { resume, companyName, roleTitle, jobDescription, tone } = body || {};
    const ai = getGeminiClient();

    if (!ai) {
      const candidateName = resume?.basics?.name || 'Applicant';
      return {
        status: 200,
        data: {
          coverLetter: `Dear Hiring Team at ${companyName || 'the Organization'},\n\nI am writing to express my strong enthusiasm for the ${roleTitle || 'position'} role. With my background in delivering measurable results and building resilient, user-focused solutions, I am excited about the opportunity to contribute directly to your team's mission.\n\nThroughout my career, I have prioritized high-velocity execution, technical craft, and cross-functional collaboration. Whether architecting scalable systems or optimizing end-user workflows, I focus on tangible business outcomes and sustainable engineering practices.\n\nThank you for your time and consideration. I welcome the opportunity to discuss how my skill set and passion can add immediate value to ${companyName || 'your team'}.\n\nSincerely,\n${candidateName}`,
          simulated: true,
        },
      };
    }

    const prompt = `You are an executive talent coach. Write a compelling, tailored, non-generic cover letter:
Candidate Profile: ${JSON.stringify(resume?.basics || {}, null, 2)}
Key Work Highlights: ${JSON.stringify((resume?.work || []).slice(0, 2), null, 2)}
Company Name: ${companyName || 'the Company'}
Target Role: ${roleTitle || 'Target Role'}
Job Description: ${jobDescription || 'Standard requirements for the role'}
Desired Tone: ${tone || 'Confident, professional, and forward-looking'}

Guidelines:
1. Compelling hook in paragraph 1 connecting candidate's key expertise to the company.
2. Concrete proof points in paragraph 2-3 referencing key accomplishments from their experience.
3. Clean, courteous closing without cliché phrases.`;

    const response = await generateWithFallback(ai, {
      contents: prompt,
      config: {
        systemInstruction: 'You write crisp, human, high-impact cover letters that avoid corporate buzzword fluff.',
      },
    });

    return { status: 200, data: { coverLetter: response.text || '' } };
  } catch (error: any) {
    console.error('Cover letter error:', error);
    const formatted = formatGeminiError(error);
    return { status: formatted.status, data: { error: formatted.message } };
  }
}
