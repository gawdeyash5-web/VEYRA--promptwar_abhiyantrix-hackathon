import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '';
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export async function parseOpsReportAI(rawText: string, reporterName: string) {
  if (!genAI) {
    return null;
  }
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `You are VEYRA AI, the venue operations intelligence engine for a high-stakes hackathon.
An attendee reported this venue issue:
"${rawText}"

Analyze this issue and return ONLY a raw JSON object with NO markdown formatting or codeblocks:
{
  "category": "Wi-Fi" | "Power" | "Facility" | "Catering" | "Equipment" | "Venue",
  "severity": "Low" | "Medium" | "High" | "Critical",
  "summary": "Concise 1-sentence executive summary",
  "recommendedAction": "Actionable 1-sentence recommendation for event organizers"
}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanJson);
  } catch (err) {
    console.error('Gemini parseOpsReportAI error:', err);
    return null;
  }
}

export async function explainMatchAI(
  userSkills: string[],
  userRole: string,
  candidateSkills: string[],
  candidateRole: string
) {
  if (!genAI) return null;
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `Explain in 2 concise sentences why a ${userRole} skilled in (${userSkills.join(
      ', '
    )}) would make a great hackathon teammate with a ${candidateRole} skilled in (${candidateSkills.join(
      ', '
    )}). Return ONLY plain text.`;

    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch (err) {
    console.error('Gemini explainMatchAI error:', err);
    return null;
  }
}

export async function rewriteAnnouncementAI(roughText: string) {
  if (!genAI) return null;
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `Rewrite this rough event announcement into a clear, professional, urgent, high-impact broadcast message for hackathon participants:
"${roughText}"

Return ONLY the rewritten announcement text without intro/outro text.`;

    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch (err) {
    console.error('Gemini rewriteAnnouncementAI error:', err);
    return null;
  }
}
