import {
  handleEnhanceBullet,
  handleGenerateSummary,
  handleAtsReview,
  handleTailorResume,
  handleSuggestSkills,
  handleCoverLetter,
} from '../../server/ai-handlers';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const rawAction = req.query?.action;
  const action = Array.isArray(rawAction) ? rawAction[0] : rawAction;

  const body =
    typeof req.body === 'string'
      ? JSON.parse(req.body || '{}')
      : req.body || {};

  let result: { status: number; data: any };

  switch (action) {
    case 'enhance-bullet':
      result = await handleEnhanceBullet(body);
      break;
    case 'generate-summary':
      result = await handleGenerateSummary(body);
      break;
    case 'ats-review':
      result = await handleAtsReview(body);
      break;
    case 'tailor-resume':
      result = await handleTailorResume(body);
      break;
    case 'suggest-skills':
      result = await handleSuggestSkills(body);
      break;
    case 'cover-letter':
      result = await handleCoverLetter(body);
      break;
    default:
      return res.status(404).json({ error: 'Unknown AI endpoint.' });
  }

  return res.status(result.status).json(result.data);
}
