import { EventPulseData, Participant, Team, Submission, Evaluation } from '../types';

export function calculateEventPulse(
  participants: Participant[],
  teams: Team[],
  submissions: Submission[],
  evaluations: Evaluation[],
  totalExpectedEvaluations: number = 15
): EventPulseData {
  // 1. Attendance Health (35%)
  const totalRegistered = Math.max(participants.length, 1);
  const checkedInCount = participants.filter((p) => p.checkedIn).length;
  const attendanceRatio = Math.min(checkedInCount / totalRegistered, 1);
  const attendanceScore = Math.round(attendanceRatio * 100);
  const attendanceContribution = parseFloat((attendanceScore * 0.35).toFixed(1));

  // 2. Team Activity (20%)
  // % of teams with activity in last 120 minutes or with active members
  const now = Date.now();
  const activeTeamsCount = teams.filter((t) => {
    if (!t.lastActivityAt) return false;
    const diffMins = (now - new Date(t.lastActivityAt).getTime()) / (1000 * 60);
    return diffMins <= 180 || t.members.some((m) => m.checkedIn);
  }).length;
  const teamActivityRatio = teams.length > 0 ? activeTeamsCount / teams.length : 0.8;
  const teamActivityScore = Math.round(teamActivityRatio * 100);
  const teamActivityContribution = parseFloat((teamActivityScore * 0.20).toFixed(1));

  // 3. Submission Progress (25%)
  const totalTeams = Math.max(teams.length, 1);
  const submissionRatio = Math.min(submissions.length / totalTeams, 1);
  const submissionScore = Math.round(submissionRatio * 100);
  const submissionContribution = parseFloat((submissionScore * 0.25).toFixed(1));

  // 4. Judging Progress (20%)
  const completedEvals = evaluations.length;
  const expectedEvals = Math.max(totalExpectedEvaluations, 1);
  const judgingRatio = Math.min(completedEvals / expectedEvals, 1);
  const judgingScore = Math.round(judgingRatio * 100);
  const judgingContribution = parseFloat((judgingScore * 0.20).toFixed(1));

  // Total Pulse Score
  const rawTotal =
    attendanceContribution +
    teamActivityContribution +
    submissionContribution +
    judgingContribution;
  const overallScore = Math.min(Math.max(Math.round(rawTotal), 0), 100);

  let statusText: 'HEALTHY' | 'STABLE' | 'AT RISK' = 'HEALTHY';
  if (overallScore < 60) {
    statusText = 'AT RISK';
  } else if (overallScore < 78) {
    statusText = 'STABLE';
  }

  return {
    overallScore,
    statusText,
    breakdown: {
      attendance: {
        percentage: attendanceScore,
        contribution: attendanceContribution,
        rawText: `${checkedInCount}/${totalRegistered} checked in`,
      },
      teamActivity: {
        percentage: teamActivityScore,
        contribution: teamActivityContribution,
        rawText: `${activeTeamsCount}/${totalTeams} active teams`,
      },
      submissionProgress: {
        percentage: submissionScore,
        contribution: submissionContribution,
        rawText: `${submissions.length}/${totalTeams} submitted`,
      },
      judgingProgress: {
        percentage: judgingScore,
        contribution: judgingContribution,
        rawText: `${completedEvals}/${expectedEvals} evaluations`,
      },
    },
  };
}
