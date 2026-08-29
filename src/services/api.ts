export async function parseOpsReportWithAI(rawText: string, reporterName: string) {
  try {
    const res = await fetch('/api/gemini/parse-ops-report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rawText, reporterName }),
    });
    if (!res.ok) throw new Error('API failed');
    return await res.json();
  } catch (err) {
    console.warn('Fallback to client parser due to API:', err);
    // Graceful fallback if Gemini API is unreachable
    let category = 'Venue';
    let severity: 'Low' | 'Medium' | 'High' | 'Critical' = 'Medium';
    const lower = rawText.toLowerCase();

    if (lower.includes('wifi') || lower.includes('internet') || lower.includes('network')) {
      category = 'Wi-Fi';
      severity = 'Critical';
    } else if (lower.includes('power') || lower.includes('plug') || lower.includes('charging') || lower.includes('electricity')) {
      category = 'Power';
      severity = 'High';
    } else if (lower.includes('washroom') || lower.includes('water') || lower.includes('clean')) {
      category = 'Facility';
      severity = 'Medium';
    } else if (lower.includes('food') || lower.includes('lunch') || lower.includes('dinner')) {
      category = 'Catering';
      severity = 'Low';
    }

    return {
      category,
      severity,
      summary: rawText.length > 80 ? `${rawText.substring(0, 77)}...` : rawText,
      recommendedAction: `Inspect ${category} facilities reported by ${reporterName}`,
    };
  }
}

export async function explainMatchWithAI(userSkills: string[], userRole: string, candidateSkills: string[], candidateRole: string) {
  try {
    const res = await fetch('/api/gemini/explain-match', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userSkills, userRole, candidateSkills, candidateRole }),
    });
    if (!res.ok) throw new Error('API failed');
    const data = await res.json();
    return data.explanation;
  } catch {
    return `Strong synergy between ${userRole} and ${candidateRole} with complementary tech skill overlap.`;
  }
}

export async function rewriteAnnouncementWithAI(roughText: string) {
  try {
    const res = await fetch('/api/gemini/rewrite-announcement', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roughText }),
    });
    if (!res.ok) throw new Error('API failed');
    const data = await res.json();
    return data.improvedText;
  } catch {
    return `Announcement: ${roughText}. Please check VEYRA for further live operational updates.`;
  }
}

export async function seedDemoDataAPI() {
  const res = await fetch('/api/seed', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  return await res.json();
}
