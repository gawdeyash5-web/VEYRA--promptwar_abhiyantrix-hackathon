import { Evaluation, ScoreDeviationFlag } from '../types';

export function detectRushedEvaluation(startedAt: string, submittedAt: string, thresholdSeconds = 60): boolean {
  if (!startedAt || !submittedAt) return false;
  const start = new Date(startedAt).getTime();
  const submit = new Date(submittedAt).getTime();
  const durationSec = (submit - start) / 1000;
  return durationSec > 0 && durationSec < thresholdSeconds;
}

export interface IntegrityAnalysisResult {
  evaluations: Evaluation[];
  flaggedDeviationsCount: number;
  fastReviewsCount: number;
  averageScore: number;
  scoreSpread: { min: number; max: number };
}

export function analyzeJudgingIntegrity(evaluations: Evaluation[]): IntegrityAnalysisResult {
  if (evaluations.length === 0) {
    return {
      evaluations: [],
      flaggedDeviationsCount: 0,
      fastReviewsCount: 0,
      averageScore: 0,
      scoreSpread: { min: 0, max: 0 },
    };
  }

  // 1. Group evaluations by teamId
  const teamMap: Record<string, Evaluation[]> = {};
  evaluations.forEach((ev) => {
    if (!teamMap[ev.teamId]) teamMap[ev.teamId] = [];
    teamMap[ev.teamId].push(ev);
  });

  let fastReviewsCount = 0;
  let flaggedDeviationsCount = 0;
  let totalScoreSum = 0;
  let minScore = 40;
  let maxScore = 0;

  const processedEvaluations: Evaluation[] = evaluations.map((ev) => {
    totalScoreSum += ev.totalScore;
    if (ev.totalScore < minScore) minScore = ev.totalScore;
    if (ev.totalScore > maxScore) maxScore = ev.totalScore;

    // Check fast review
    const isRushed = ev.isRushed || detectRushedEvaluation(ev.startedAt, ev.submittedAt);
    if (isRushed) fastReviewsCount++;

    // Calculate score deviation for team
    const teamEvals = teamMap[ev.teamId] || [];
    let deviationFlag: ScoreDeviationFlag | undefined;

    if (teamEvals.length > 1) {
      const peerEvals = teamEvals.filter((other) => other.id !== ev.id);
      if (peerEvals.length > 0) {
        const peerSum = peerEvals.reduce((acc, curr) => acc + curr.totalScore, 0);
        const peerAvg = parseFloat((peerSum / peerEvals.length).toFixed(1));
        const diffBelow = peerAvg - ev.totalScore;

        // Flag if score is > 12 points below peer average (or > 1.2 z-score equivalent)
        if (diffBelow >= 12) {
          deviationFlag = {
            isFlagged: true,
            pointsBelowMean: parseFloat(diffBelow.toFixed(1)),
            peerAverage: peerAvg,
            judgeScore: ev.totalScore,
          };
          flaggedDeviationsCount++;
        }
      }
    }

    return {
      ...ev,
      isRushed,
      deviationFlag,
    };
  });

  const averageScore = parseFloat((totalScoreSum / evaluations.length).toFixed(1));

  return {
    evaluations: processedEvaluations,
    flaggedDeviationsCount,
    fastReviewsCount,
    averageScore,
    scoreSpread: { min: minScore, max: maxScore },
  };
}
