import { Router, Request, Response } from 'express';
import { parseOpsReportAI, explainMatchAI, rewriteAnnouncementAI } from '../gemini/index.js';

export const apiRouter = Router();

// Middleware for input sanitization
function sanitizeString(input: unknown, maxLength = 1000): string {
  if (typeof input !== 'string') return '';
  return input.trim().substring(0, maxLength);
}

apiRouter.post('/gemini/parse-ops-report', async (req: Request, res: Response) => {
  try {
    const rawText = sanitizeString(req.body.rawText, 1000);
    const reporterName = sanitizeString(req.body.reporterName, 100) || 'Participant';

    if (!rawText) {
      return res.status(400).json({ error: 'rawText is required and must be a valid non-empty string' });
    }

    const aiResult = await parseOpsReportAI(rawText, reporterName);
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
  } catch (err) {
    console.error('API /gemini/parse-ops-report error:', err);
    return res.status(500).json({ error: 'Failed to process operations report request' });
  }
});

apiRouter.post('/gemini/explain-match', async (req: Request, res: Response) => {
  try {
    const userRole = sanitizeString(req.body.userRole, 100) || 'Developer';
    const candidateRole = sanitizeString(req.body.candidateRole, 100) || 'Engineer';
    const userSkills = Array.isArray(req.body.userSkills)
      ? req.body.userSkills.map((s: unknown) => sanitizeString(s, 50)).filter(Boolean)
      : [];
    const candidateSkills = Array.isArray(req.body.candidateSkills)
      ? req.body.candidateSkills.map((s: unknown) => sanitizeString(s, 50)).filter(Boolean)
      : [];

    const explanation = await explainMatchAI(userSkills, userRole, candidateSkills, candidateRole);

    if (explanation) {
      return res.json({ explanation });
    }

    return res.json({
      explanation: `Excellent technical synergy combining ${userRole} (${userSkills.join(
        ', '
      )}) and ${candidateRole} (${candidateSkills.join(', ')}).`,
    });
  } catch (err) {
    console.error('API /gemini/explain-match error:', err);
    return res.status(500).json({ error: 'Failed to generate match explanation' });
  }
});

apiRouter.post('/gemini/rewrite-announcement', async (req: Request, res: Response) => {
  try {
    const roughText = sanitizeString(req.body.roughText, 1500);

    if (!roughText) {
      return res.status(400).json({ error: 'roughText is required and must be a non-empty string' });
    }

    const improvedText = await rewriteAnnouncementAI(roughText);
    if (improvedText) {
      return res.json({ improvedText });
    }
    return res.json({
      improvedText: `Important Announcement: ${roughText}. Please stay updated on VEYRA for further live operational notices.`,
    });
  } catch (err) {
    console.error('API /gemini/rewrite-announcement error:', err);
    return res.status(500).json({ error: 'Failed to rewrite announcement' });
  }
});

apiRouter.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'VEYRA Event OS', timestamp: new Date().toISOString() });
});
