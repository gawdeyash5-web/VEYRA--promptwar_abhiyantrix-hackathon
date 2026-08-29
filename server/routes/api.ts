import { Router, Request, Response } from 'express';
import { parseOpsReportAI, explainMatchAI, rewriteAnnouncementAI } from '../gemini/index.js';

export const apiRouter = Router();

apiRouter.post('/gemini/parse-ops-report', async (req: Request, res: Response) => {
  const { rawText, reporterName } = req.body;
  if (!rawText) {
    return res.status(400).json({ error: 'rawText is required' });
  }

  const aiResult = await parseOpsReportAI(rawText, reporterName || 'Participant');
  if (aiResult) {
    return res.json(aiResult);
  }

  // Deterministic fallback if Gemini key is not configured or fails
  let category = 'Venue';
  let severity = 'Medium';
  const lower = rawText.toLowerCase();

  if (lower.includes('wifi') || lower.includes('internet') || lower.includes('network')) {
    category = 'Wi-Fi';
    severity = 'Critical';
  } else if (lower.includes('power') || lower.includes('socket') || lower.includes('charging') || lower.includes('electricity')) {
    category = 'Power';
    severity = 'High';
  } else if (lower.includes('washroom') || lower.includes('water') || lower.includes('toilet')) {
    category = 'Facility';
    severity = 'Medium';
  } else if (lower.includes('food') || lower.includes('snack') || lower.includes('dinner')) {
    category = 'Catering';
    severity = 'Low';
  }

  return res.json({
    category,
    severity,
    summary: rawText.length > 90 ? `${rawText.substring(0, 87)}...` : rawText,
    recommendedAction: `Deploy ops team to inspect ${category} issue reported in workspace area.`,
  });
});

apiRouter.post('/gemini/explain-match', async (req: Request, res: Response) => {
  const { userSkills, userRole, candidateSkills, candidateRole } = req.body;
  const explanation = await explainMatchAI(
    userSkills || [],
    userRole || 'Developer',
    candidateSkills || [],
    candidateRole || 'Engineer'
  );

  if (explanation) {
    return res.json({ explanation });
  }

  return res.json({
    explanation: `Excellent technical synergy combining ${userRole} (${(userSkills || []).join(
      ', '
    )}) and ${candidateRole} (${(candidateSkills || []).join(', ')}).`,
  });
});

apiRouter.post('/gemini/rewrite-announcement', async (req: Request, res: Response) => {
  const { roughText } = req.body;
  const improvedText = await rewriteAnnouncementAI(roughText || '');
  if (improvedText) {
    return res.json({ improvedText });
  }
  return res.json({
    improvedText: `Important Announcement: ${roughText}. Please stay updated on VEYRA for further live operational notices.`,
  });
});

apiRouter.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'VEYRA Event OS', timestamp: new Date().toISOString() });
});
