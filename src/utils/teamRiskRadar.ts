import { Team, Submission } from '../types';

export interface EvaluatedTeamRisk {
  team: Team;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  riskFactors: string[];
  recommendedIntervention: string;
}

export function evaluateTeamRisk(team: Team, submissions: Submission[]): EvaluatedTeamRisk {
  const riskFactors: string[] = [];
  let score = 0; // Higher = riskier

  // Check last activity timestamp
  const now = Date.now();
  let minsSinceActivity = 999;
  if (team.lastActivityAt) {
    minsSinceActivity = Math.round((now - new Date(team.lastActivityAt).getTime()) / (1000 * 60));
  }

  if (minsSinceActivity > 90) {
    score += 40;
    riskFactors.push(`No team activity for ${minsSinceActivity} minutes`);
  } else if (minsSinceActivity > 45) {
    score += 20;
    riskFactors.push(`Inactive for ${minsSinceActivity} minutes`);
  }

  // Check attendance ratio
  const totalMembers = Math.max(team.members.length, 1);
  const checkedInMembers = team.members.filter((m) => m.checkedIn).length;

  if (checkedInMembers === 0) {
    score += 40;
    riskFactors.push(`0/${totalMembers} team members checked in`);
  } else if (checkedInMembers < totalMembers) {
    score += 20;
    riskFactors.push(`Only ${checkedInMembers}/${totalMembers} members checked in`);
  }

  // Check submission progress
  const hasSubmission = submissions.some((s) => s.teamId === team.id || s.teamName === team.name);
  if (!hasSubmission) {
    score += 30;
    riskFactors.push('No submission draft or project submitted');
  }

  let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
  let recommendedIntervention = 'Team is performing well. Maintain monitoring.';

  if (score >= 60 || team.riskLevel === 'HIGH') {
    riskLevel = 'HIGH';
    recommendedIntervention = 'High Operational Risk: Contact team captain or assign a mentor immediately.';
  } else if (score >= 30 || team.riskLevel === 'MEDIUM') {
    riskLevel = 'MEDIUM';
    recommendedIntervention = 'Medium Operational Risk: Send progress check-in prompt to team.';
  }

  if (riskFactors.length === 0) {
    riskFactors.push('All members checked in', 'Active workspace updates', 'Submission in progress');
  }

  return {
    team: {
      ...team,
      riskLevel,
      riskFactors,
    },
    riskLevel,
    riskFactors,
    recommendedIntervention,
  };
}
