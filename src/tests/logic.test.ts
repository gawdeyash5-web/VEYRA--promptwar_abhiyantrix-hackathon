import { calculateEventPulse } from '../utils/eventPulse';
import { calculateCandidateMatch } from '../utils/smartMatching';
import { analyzeJudgingIntegrity, detectRushedEvaluation } from '../utils/judgingIntegrity';
import { evaluateTeamRisk } from '../utils/teamRiskRadar';
import { Participant, Team, Submission, Evaluation } from '../types';

console.log('🧪 Running VEYRA Business Logic Test Suite...\n');

let totalPassed = 0;
let totalFailed = 0;

function assert(condition: boolean, testName: string) {
  if (condition) {
    console.log(`  ✅ PASS: ${testName}`);
    totalPassed++;
  } else {
    console.error(`  ❌ FAIL: ${testName}`);
    totalFailed++;
  }
}

// 1. Event Pulse Test
console.log('1. Event Pulse Score Calculation Test:');
const sampleParticipants: Participant[] = [
  { id: '1', uid: '1', name: 'A', email: '', college: '', skills: [], role: '', projectInterests: [], checkedIn: true, qrCodeId: '1' },
  { id: '2', uid: '2', name: 'B', email: '', college: '', skills: [], role: '', projectInterests: [], checkedIn: false, qrCodeId: '2' },
];
const sampleTeams: Team[] = [
  {
    id: 't1',
    name: 'T1',
    tagline: '',
    description: '',
    leaderId: '1',
    memberIds: ['1'],
    members: [{ participantId: '1', name: 'A', role: 'Dev', checkedIn: true }],
    projectInterests: [],
    lookingForSkills: [],
    riskLevel: 'LOW',
    riskFactors: [],
    lastActivityAt: new Date().toISOString(),
  },
];
const pulse = calculateEventPulse(sampleParticipants, sampleTeams, [], [], 10);
assert(pulse.overallScore >= 0 && pulse.overallScore <= 100, 'Pulse score is bounded between 0 and 100');
assert(pulse.breakdown.attendance.percentage === 50, 'Attendance 1/2 checked in equals 50%');

// 2. Team Matching Score Test
console.log('\n2. Smart Teammate Matching Score Test:');
const p1: Participant = { id: 'p1', uid: 'p1', name: 'Dev', email: '', college: '', skills: ['React', 'TypeScript'], role: 'Frontend', projectInterests: ['Healthcare'], checkedIn: true, qrCodeId: 'p1' };
const p2: Participant = { id: 'p2', uid: 'p2', name: 'ML Guy', email: '', college: '', skills: ['Python', 'PyTorch'], role: 'ML Engineer', projectInterests: ['Healthcare'], checkedIn: true, qrCodeId: 'p2' };

const match = calculateCandidateMatch(p1, p2);
assert(match.matchScore >= 80, `High match score computed (${match.matchScore}%) for complementary skills`);
assert(match.reasons.length > 0, 'Generated match reasons array');

// 3. Judging Score & Deviation Detection Test
console.log('\n3. Judging Integrity & Score Deviation Test:');
const evaluations: Evaluation[] = [
  { id: 'e1', judgeId: 'j1', judgeName: 'J1', teamId: 't1', teamName: 'T1', innovation: 9, technicalImplementation: 9, impact: 9, presentation: 9, totalScore: 36, feedback: '', startedAt: '', submittedAt: '', durationSeconds: 120, isRushed: false },
  { id: 'e2', judgeId: 'j2', judgeName: 'J2', teamId: 't1', teamName: 'T1', innovation: 9, technicalImplementation: 9, impact: 9, presentation: 9, totalScore: 36, feedback: '', startedAt: '', submittedAt: '', durationSeconds: 120, isRushed: false },
  { id: 'e3', judgeId: 'j3', judgeName: 'J3', teamId: 't1', teamName: 'T1', innovation: 4, technicalImplementation: 4, impact: 4, presentation: 3, totalScore: 15, feedback: '', startedAt: '', submittedAt: '', durationSeconds: 120, isRushed: false },
];

const analysis = analyzeJudgingIntegrity(evaluations);
assert(analysis.flaggedDeviationsCount === 1, 'Detected 1 score deviation (Judge 3 is 21 pts below peer mean)');

// 4. Rushed Review Test
console.log('\n4. Rushed Evaluation Detection Test:');
const isFast = detectRushedEvaluation('2026-08-29T10:00:00.000Z', '2026-08-29T10:00:38.000Z', 60);
assert(isFast === true, 'Detected rushed evaluation completed in 38 seconds (< 60s)');

// 5. Team Risk Classification Test
console.log('\n5. Team Risk Radar Test:');
const riskTeam: Team = {
  id: 'tr1',
  name: 'Inactive Team',
  tagline: '',
  description: '',
  leaderId: 'p1',
  memberIds: ['p1'],
  members: [{ participantId: 'p1', name: 'P1', role: 'Dev', checkedIn: false }],
  projectInterests: [],
  lookingForSkills: [],
  riskLevel: 'HIGH',
  riskFactors: [],
  lastActivityAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
};
const evaluatedRisk = evaluateTeamRisk(riskTeam, []);
assert(evaluatedRisk.riskLevel === 'HIGH', 'Classified team with no check-in & 120m inactivity as HIGH RISK');

console.log(`\n========================================`);
console.log(`Test Summary: ${totalPassed} Passed, ${totalFailed} Failed`);
if (totalFailed > 0) process.exit(1);
