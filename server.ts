import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const isProduction = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '10mb' }));

// Shared Gemini AI client with telemetry user-agent
const getGeminiClient = () => {
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

// Health and AI status check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    time: new Date().toISOString(),
  });
});

// 1. AI Bullet Point Enhancer
app.post('/api/ai/enhance-bullet', async (req, res) => {
  try {
    const { bullet, role, context } = req.body;
    if (!bullet || typeof bullet !== 'string') {
      return res.status(400).json({ error: 'Bullet point text is required.' });
    }

    const ai = getGeminiClient();
    if (!ai) {
      // Fallback enhancement if key not set
      const clean = bullet.trim().replace(/^[-*•]\s*/, '');
      return res.json({
        enhanced: `Spearheaded initiatives to ${clean.toLowerCase()}, increasing operational efficiency and measurable output across key projects.`,
        variations: [
          `Spearheaded ${clean.toLowerCase()}, optimizing delivery time and stakeholder satisfaction.`,
          `Engineered scalable solutions for ${clean.toLowerCase()}, driving a 25% boost in team productivity.`,
          `Orchestrated the execution of ${clean.toLowerCase()} by applying industry best practices and cross-functional leadership.`
        ],
        rationale: 'Enhanced using strong action verbs, quantifiable framing, and structured Google XYZ formula.',
        simulated: true,
      });
    }

    const prompt = `You are a world-class elite executive resume coach. Enhance the following resume bullet point using Google's XYZ formula ("Accomplished [X] as measured by [Y], by doing [Z]").
Original bullet: "${bullet}"
Target Job/Role context: "${role || 'Professional'}"
Additional context: "${context || 'General industry'}"

Rules:
1. Start with high-impact power action verbs (e.g., Architected, Spearheaded, Accelerated, Catalyzed, Engineered).
2. Incorporate realistic quantifiable impact metrics (%, $, time saved, users, scale).
3. Eliminate passive voice, weak filler words ("responsible for", "helped with", "worked on").
4. Provide the primary enhanced bullet, 3 distinct variations (one metrics-heavy, one leadership-focused, one technical/execution-focused), and a concise 1-sentence rationale.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
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
              description: '3 high-quality alternative variations'
            },
            rationale: { type: Type.STRING, description: 'Why this enhancement works and beats ATS filters' }
          },
          required: ['enhanced', 'variations', 'rationale']
        }
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.error('Enhance bullet error:', error);
    return res.status(500).json({
      error: error.message || 'Failed to enhance bullet point with Gemini.'
    });
  }
});

// 2. AI Professional Summary Generator
app.post('/api/ai/generate-summary', async (req, res) => {
  try {
    const { title, experienceYears, keySkills, targetRole, rawExperience } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      const skillsStr = Array.isArray(keySkills) && keySkills.length ? keySkills.join(', ') : 'modern industry tooling';
      return res.json({
        summaries: [
          {
            style: 'Impact-Driven',
            text: `Results-oriented ${title || 'Professional'} with ${experienceYears || '5+'} years of experience driving high-velocity initiatives and cross-functional alignment. Proven track record in ${skillsStr}, consistently delivering scalable outcomes and high-impact solutions for enterprise and high-growth environments.`
          },
          {
            style: 'Executive & Strategic',
            text: `Strategic ${targetRole || title || 'Leader'} recognized for architecting resilient systems and leading cross-functional teams. Expertise spanning ${skillsStr}, with an unyielding commitment to operational rigor, continuous innovation, and measurable business growth.`
          },
          {
            style: 'Concise & Modern',
            text: `Dynamic ${title || 'Specialist'} specializing in ${skillsStr}. Adept at turning complex challenges into streamlined, high-value outcomes through agile execution and data-backed decision-making.`
          }
        ],
        simulated: true,
      });
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

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
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
                  text: { type: Type.STRING }
                },
                required: ['style', 'text']
              }
            }
          },
          required: ['summaries']
        }
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.error('Generate summary error:', error);
    return res.status(500).json({ error: error.message || 'Failed to generate summary.' });
  }
});

// 3. AI ATS Review & Score
app.post('/api/ai/ats-review', async (req, res) => {
  try {
    const { resume, targetIndustry } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.json({
        overallScore: 84,
        breakdown: {
          formatting: 90,
          actionVerbs: 85,
          metricsAndQuantification: 78,
          brevityAndImpact: 82,
          completeness: 88
        },
        strengths: [
          'Strong structural hierarchy with clear role distinctions',
          'Clean contact section and accessible links',
          'Active power verbs utilized across primary accomplishments'
        ],
        weaknesses: [
          'Several bullet points lack quantifiable numbers or percentages',
          'Professional summary could be more tightly focused on value proposition',
          'Technical skills could be grouped by taxonomy (Languages, Frameworks, Cloud)'
        ],
        actionableFixes: [
          {
            category: 'Metrics & Data',
            issue: 'Vague statements like "improved speed" or "worked on features"',
            suggestion: 'Add concrete percentages or benchmarks, e.g., "reduced latency by 32% across 1.2M daily queries".'
          },
          {
            category: 'Action Verbs',
            issue: 'Repetition of basic verbs like "managed" or "helped"',
            suggestion: 'Substitute with high-conviction verbs like "Architected", "Spearheaded", "Revamped", "Orchestrated".'
          },
          {
            category: 'Keywords & ATS',
            issue: 'Skills section missing high-frequency industry standard tokens',
            suggestion: 'Ensure exact standard terms appear in both skills and experience bullets to pass ATS parsing.'
          }
        ],
        simulated: true,
      });
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

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
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
                completeness: { type: Type.INTEGER }
              },
              required: ['formatting', 'actionVerbs', 'metricsAndQuantification', 'brevityAndImpact', 'completeness']
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
                  suggestion: { type: Type.STRING }
                },
                required: ['category', 'issue', 'suggestion']
              }
            }
          },
          required: ['overallScore', 'breakdown', 'strengths', 'weaknesses', 'actionableFixes']
        }
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.error('ATS review error:', error);
    return res.status(500).json({ error: error.message || 'Failed to review resume with Gemini.' });
  }
});

// 4. AI Tailor Resume to Job Description
app.post('/api/ai/tailor-resume', async (req, res) => {
  try {
    const { resume, jobDescription, targetTitle } = req.body;
    if (!jobDescription) {
      return res.status(400).json({ error: 'Job description is required.' });
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.json({
        matchScore: 78,
        matchAnalysis: 'Good match on foundational responsibilities. The target job heavily emphasizes cross-functional velocity, cloud scalability, and stakeholder presentation.',
        keywordsFound: ['TypeScript', 'React', 'API Design', 'System Architecture', 'Agile'],
        keywordsMissing: ['Kubernetes', 'CI/CD Pipelines', 'Performance Optimization', 'SOC2 Compliance'],
        suggestions: [
          'Incorporate target keywords directly into the work experience accomplishments.',
          'Emphasize leadership and business outcome metrics in your latest position.',
          'Align your headline and summary directly to the target title.'
        ],
        tailoredBullets: [
          {
            sectionIndex: 0,
            itemIndex: 0,
            original: 'Worked on front-end features and fixed bugs.',
            suggested: 'Spearheaded frontend architecture modernization using React and TypeScript, boosting page responsiveness by 40% and eliminating 15+ weekly client bug reports.',
            rationale: 'Incorporates missing skills and converts passive phrasing into high-value quantifiable outcomes.'
          }
        ],
        simulated: true,
      });
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
6. Specific rewritten bullet suggestions matching candidate's existing experience to the job requirements.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
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
                  rationale: { type: Type.STRING }
                },
                required: ['original', 'suggested', 'rationale']
              }
            }
          },
          required: ['matchScore', 'matchAnalysis', 'keywordsFound', 'keywordsMissing', 'suggestions', 'tailoredBullets']
        }
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.error('Tailor resume error:', error);
    return res.status(500).json({ error: error.message || 'Failed to tailor resume with Gemini.' });
  }
});

// 5. AI Skill Suggester
app.post('/api/ai/suggest-skills', async (req, res) => {
  try {
    const { jobTitle, currentSkills } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.json({
        technical: ['TypeScript', 'React.js', 'Next.js', 'Node.js', 'PostgreSQL', 'GraphQL', 'Tailwind CSS'],
        soft: ['Cross-functional Collaboration', 'Technical Mentorship', 'Strategic Roadmap Planning', 'Agile Leadership'],
        toolsAndFrameworks: ['Git / GitHub', 'Docker', 'AWS / Cloudflare', 'Jest / Vitest', 'Figma', 'CI/CD Actions'],
        simulated: true,
      });
    }

    const prompt = `Recommend relevant, high-demand skills for a candidate in this role:
Role: ${jobTitle || 'Software Engineer'}
Currently listed skills: ${Array.isArray(currentSkills) ? currentSkills.join(', ') : 'None'}

Provide a grouped set of modern industry-demanded skills (do not repeat already listed ones).`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            technical: { type: Type.ARRAY, items: { type: Type.STRING } },
            soft: { type: Type.ARRAY, items: { type: Type.STRING } },
            toolsAndFrameworks: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ['technical', 'soft', 'toolsAndFrameworks']
        }
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.error('Skill suggestion error:', error);
    return res.status(500).json({ error: error.message || 'Failed to suggest skills.' });
  }
});

// 6. AI Cover Letter Generator
app.post('/api/ai/cover-letter', async (req, res) => {
  try {
    const { resume, companyName, roleTitle, jobDescription, tone } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      const candidateName = resume?.basics?.name || 'Applicant';
      return res.json({
        coverLetter: `Dear Hiring Team at ${companyName || 'the Organization'},\n\nI am writing to express my strong enthusiasm for the ${roleTitle || 'position'} role. With my background in delivering measurable results and building resilient, user-focused solutions, I am excited about the opportunity to contribute directly to your team's mission.\n\nThroughout my career, I have prioritized high-velocity execution, technical craft, and cross-functional collaboration. Whether architecting scalable systems or optimizing end-user workflows, I focus on tangible business outcomes and sustainable engineering practices.\n\nThank you for your time and consideration. I welcome the opportunity to discuss how my skill set and passion can add immediate value to ${companyName || 'your team'}.\n\nSincerely,\n${candidateName}`,
        simulated: true
      });
    }

    const prompt = `You are an executive talent coach. Write a compelling, tailored, non-generic cover letter:
Candidate Resume: ${JSON.stringify(resume?.basics || {}, null, 2)}
Company Name: ${companyName || 'the Company'}
Target Role: ${roleTitle || 'Target Role'}
Job Description: ${jobDescription || 'Standard requirements for the role'}
Desired Tone: ${tone || 'Confident, professional, and forward-looking'}

Guidelines:
1. Compelling hook in paragraph 1 connecting candidate's key expertise to the company.
2. Concrete proof points in paragraph 2-3 referencing key accomplishments.
3. Clean, courteous closing without cliché phrases.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: 'You write crisp, human, high-impact cover letters that avoid corporate buzzword fluff.'
      }
    });

    return res.json({ coverLetter: response.text || '' });
  } catch (error: any) {
    console.error('Cover letter error:', error);
    return res.status(500).json({ error: error.message || 'Failed to generate cover letter.' });
  }
});

// Vite middleware or static serving
async function setupVite() {
  if (!isProduction) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ResumeFlow server running at http://0.0.0.0:${PORT}`);
  });
}

setupVite();
