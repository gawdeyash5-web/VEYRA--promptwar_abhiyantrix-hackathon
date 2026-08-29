import { Participant, CandidateMatch } from '../types';

export function calculateCandidateMatch(current: Participant, candidate: Participant): CandidateMatch {
  const reasons: string[] = [];
  let score = 50; // base match score

  // 1. Skill overlap & complementarity
  const currentSkills = (current.skills || []).map((s) => s.toLowerCase());
  const candidateSkills = (candidate.skills || []).map((s) => s.toLowerCase());

  const sharedSkills = currentSkills.filter((s) => candidateSkills.includes(s));
  const uniqueCandidateSkills = candidateSkills.filter((s) => !currentSkills.includes(s));

  if (uniqueCandidateSkills.length > 0) {
    score += 20;
    reasons.push(`Complementary skills: ${uniqueCandidateSkills.slice(0, 2).join(', ')}`);
  }
  if (sharedSkills.length > 0) {
    score += 10;
    reasons.push(`Shared expertise in ${sharedSkills.slice(0, 2).join(', ')}`);
  }

  // 2. Role complementarity
  if (current.role !== candidate.role) {
    score += 15;
    reasons.push(`Role synergy (${current.role} + ${candidate.role})`);
  }

  // 3. Project Interest overlap
  const currentInterests = (current.projectInterests || []).map((i) => i.toLowerCase());
  const candidateInterests = (candidate.projectInterests || []).map((i) => i.toLowerCase());
  const sharedInterests = currentInterests.filter((i) => candidateInterests.includes(i));

  if (sharedInterests.length > 0) {
    score += 15;
    reasons.push(`Shared domain interest in ${sharedInterests.slice(0, 2).join(', ')}`);
  }

  const matchScore = Math.min(Math.round(score), 98);

  const aiExplanation = `High compatibility (${matchScore}%). ${reasons.join('. ')}. Strong potential for hackathon execution.`;

  return {
    candidate,
    matchScore,
    reasons,
    aiExplanation,
  };
}
