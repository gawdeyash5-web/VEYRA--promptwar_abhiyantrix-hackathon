export type UserRole = 'participant' | 'judge' | 'organizer';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  college?: string;
  avatarUrl?: string;
  skills?: string[];
  projectInterests?: string[];
}

export interface Participant {
  id: string;
  uid: string;
  name: string;
  email: string;
  college: string;
  skills: string[];
  role: string; // e.g. 'Frontend Developer', 'ML Engineer', 'Product Designer', 'Backend Engineer'
  projectInterests: string[];
  checkedIn: boolean;
  checkedInAt?: string;
  qrCodeId: string;
  teamId?: string;
  teamName?: string;
}

export interface TeamMember {
  participantId: string;
  name: string;
  role: string;
  checkedIn: boolean;
}

export interface Team {
  id: string;
  name: string;
  tagline: string;
  description: string;
  leaderId: string;
  memberIds: string[];
  members: TeamMember[];
  projectInterests: string[];
  lookingForSkills: string[];
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  riskFactors: string[];
  lastActivityAt: string;
  submissionId?: string;
  repoUrl?: string;
}

export interface TeamInvitation {
  id: string;
  teamId: string;
  teamName: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  receiverName: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  createdAt: string;
}

export interface Submission {
  id: string;
  teamId: string;
  teamName: string;
  title: string;
  tagline: string;
  description: string;
  demoUrl: string;
  repoUrl: string;
  videoUrl?: string;
  techStack: string[];
  submittedAt: string;
  updatedAt: string;
}

export interface JudgeAssignment {
  id: string;
  judgeId: string;
  judgeName: string;
  teamId: string;
  teamName: string;
  status: 'PENDING' | 'COMPLETED';
}

export interface ScoreDeviationFlag {
  isFlagged: boolean;
  pointsBelowMean: number;
  peerAverage: number;
  judgeScore: number;
}

export interface Evaluation {
  id: string;
  judgeId: string;
  judgeName: string;
  teamId: string;
  teamName: string;
  innovation: number; // 0-10
  technicalImplementation: number; // 0-10
  impact: number; // 0-10
  presentation: number; // 0-10
  totalScore: number; // 0-40 (or scaled 0-100)
  feedback: string;
  startedAt: string;
  submittedAt: string;
  durationSeconds: number;
  isRushed: boolean;
  deviationFlag?: ScoreDeviationFlag;
}

export interface Announcement {
  id: string;
  title: string;
  message: string;
  priority: 'NORMAL' | 'URGENT' | 'CRITICAL';
  audience: 'EVERYONE' | 'PARTICIPANTS' | 'CHECKED_IN' | 'JUDGES' | 'NO_SUBMISSION_TEAMS';
  createdAt: string;
  createdBy: string;
}

export interface AttendanceStats {
  registeredCount: number;
  checkedInCount: number;
  checkInPercentage: number;
  lastCheckInAt?: string;
}

export interface OpsReport {
  id: string;
  reporterId: string;
  reporterName: string;
  rawText: string;
  category: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  summary: string;
  recommendedAction: string;
  status: 'OPEN' | 'ACKNOWLEDGED' | 'IN_PROGRESS' | 'RESOLVED';
  createdAt: string;
  resolvedAt?: string;
  location?: string;
}

export interface EventActivity {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  type: 'CHECK_IN' | 'TEAM_EVENT' | 'SUBMISSION' | 'EVALUATION' | 'ANNOUNCEMENT' | 'OPS_REPORT';
  actorName?: string;
}

export interface EventPulseData {
  overallScore: number;
  statusText: 'HEALTHY' | 'STABLE' | 'AT RISK';
  breakdown: {
    attendance: { percentage: number; contribution: number; rawText: string };
    teamActivity: { percentage: number; contribution: number; rawText: string };
    submissionProgress: { percentage: number; contribution: number; rawText: string };
    judgingProgress: { percentage: number; contribution: number; rawText: string };
  };
}

export interface CandidateMatch {
  candidate: Participant;
  matchScore: number;
  reasons: string[];
  aiExplanation?: string;
}
