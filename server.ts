import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  getHealthPayload,
  handleEnhanceBullet,
  handleGenerateSummary,
  handleAtsReview,
  handleTailorResume,
  handleSuggestSkills,
  handleCoverLetter,
} from './server/ai-handlers';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT =
  Number(process.env.DEFAULT_APP_PORT) ||
  (process.env.PORT && process.env.PORT !== process.env.NGINX_PORT
    ? Number(process.env.PORT)
    : 3000);
const isProduction = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '10mb' }));

// Health and AI status check
app.get('/api/health', (_req, res) => {
  res.json(getHealthPayload());
});

// 1. AI Bullet Point Enhancer
app.post('/api/ai/enhance-bullet', async (req, res) => {
  const { status, data } = await handleEnhanceBullet(req.body);
  res.status(status).json(data);
});

// 2. AI Professional Summary Generator
app.post('/api/ai/generate-summary', async (req, res) => {
  const { status, data } = await handleGenerateSummary(req.body);
  res.status(status).json(data);
});

// 3. AI ATS Review & Score
app.post('/api/ai/ats-review', async (req, res) => {
  const { status, data } = await handleAtsReview(req.body);
  res.status(status).json(data);
});

// 4. AI Tailor Resume to Job Description
app.post('/api/ai/tailor-resume', async (req, res) => {
  const { status, data } = await handleTailorResume(req.body);
  res.status(status).json(data);
});

// 5. AI Skill Suggester
app.post('/api/ai/suggest-skills', async (req, res) => {
  const { status, data } = await handleSuggestSkills(req.body);
  res.status(status).json(data);
});

// 6. AI Cover Letter Generator
app.post('/api/ai/cover-letter', async (req, res) => {
  const { status, data } = await handleCoverLetter(req.body);
  res.status(status).json(data);
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
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ResumeFlow server running at http://0.0.0.0:${PORT}`);
  });
}

setupVite();
