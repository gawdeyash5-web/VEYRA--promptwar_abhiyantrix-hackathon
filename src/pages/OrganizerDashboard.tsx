import React, { useState } from 'react';
import {
  Users,
  UserCheck,
  Briefcase,
  Send,
  Award,
  AlertOctagon,
  Cpu,
  Plus,
  Sparkles,
  QrCode,
  TrendingUp,
  Activity,
  Layers,
  Search,
} from 'lucide-react';
import { Participant, Team, Submission, Evaluation, Announcement, OpsReport } from '../types';
import { EventPulseCard } from '../components/EventPulseCard';
import { TeamRiskRadarCard } from '../components/TeamRiskRadarCard';
import { JudgingIntegrityCard } from '../components/JudgingIntegrityCard';
import { LiveOpsFeed } from '../components/LiveOpsFeed';
import { QRCheckInModal } from '../components/QRCheckInModal';
import { calculateEventPulse } from '../utils/eventPulse';
import { rewriteAnnouncementWithAI } from '../services/api';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts';

interface OrganizerDashboardProps {
  participants: Participant[];
  teams: Team[];
  submissions: Submission[];
  evaluations: Evaluation[];
  announcements: Announcement[];
  opsReports: OpsReport[];
  blindJudgingEnabled: boolean;
  onToggleBlindJudging: (enabled: boolean) => void;
  onCheckInParticipant: (participantId: string) => void;
  onAddAnnouncement: (newAnn: Omit<Announcement, 'id' | 'createdAt'>) => void;
  onAddReport: (newReport: Omit<OpsReport, 'id' | 'createdAt'>) => void;
  onUpdateReportStatus: (reportId: string, status: OpsReport['status']) => void;
}

export const OrganizerDashboard: React.FC<OrganizerDashboardProps> = ({
  participants,
  teams,
  submissions,
  evaluations,
  announcements,
  opsReports,
  blindJudgingEnabled,
  onToggleBlindJudging,
  onCheckInParticipant,
  onAddAnnouncement,
  onAddReport,
  onUpdateReportStatus,
}) => {
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'CHECKIN' | 'TEAMS' | 'ANNOUNCEMENTS' | 'JUDGING' | 'OPS' | 'ANALYTICS'>('OVERVIEW');
  const [isCheckInOpen, setIsCheckInOpen] = useState(false);
  const [participantSearch, setParticipantSearch] = useState('');

  // Announcement Form State
  const [annTitle, setAnnTitle] = useState('');
  const [annMessage, setAnnMessage] = useState('');
  const [annPriority, setAnnPriority] = useState<Announcement['priority']>('NORMAL');
  const [annAudience, setAnnAudience] = useState<Announcement['audience']>('EVERYONE');
  const [isRewriting, setIsRewriting] = useState(false);

  // Live Calculations
  const eventPulse = calculateEventPulse(participants, teams, submissions, evaluations, 15);
  const checkedInCount = participants.filter((p) => p.checkedIn).length;
  const openOpsCount = opsReports.filter((r) => r.status !== 'RESOLVED').length;

  const handleCreateAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle.trim() || !annMessage.trim()) return;

    onAddAnnouncement({
      title: annTitle,
      message: annMessage,
      priority: annPriority,
      audience: annAudience,
      createdBy: 'Organizer Command Center',
    });

    setAnnTitle('');
    setAnnMessage('');
  };

  const handleAiRewrite = async () => {
    if (!annMessage.trim()) return;
    setIsRewriting(true);
    try {
      const improved = await rewriteAnnouncementWithAI(annMessage);
      setAnnMessage(improved);
    } catch (err) {
      console.error(err);
    } finally {
      setIsRewriting(false);
    }
  };

  // Leaderboard Rankings Calculation
  const leaderboardData = teams.map((team) => {
    const teamEvals = evaluations.filter((e) => e.teamId === team.id || e.teamName === team.name);
    const avgScore =
      teamEvals.length > 0
        ? parseFloat((teamEvals.reduce((acc, curr) => acc + curr.totalScore, 0) / teamEvals.length).toFixed(1))
        : 0;

    return {
      team,
      avgScore,
      evalCount: teamEvals.length,
      hasSubmission: submissions.some((s) => s.teamId === team.id || s.teamName === team.name),
    };
  }).sort((a, b) => b.avgScore - a.avgScore);

  return (
    <div className="space-y-8 pb-12">
      {/* Top Banner & Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs uppercase font-extrabold tracking-widest text-cyan-400">
              ABHIYANTRIX HACK 2026
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-mono">
              LIVE EVENT STATE
            </span>
          </div>
          <h1 className="text-3xl font-black text-slate-100 tracking-tight mt-1">
            VEYRA EVENT COMMAND CENTER
          </h1>
          <p className="text-xs text-slate-400 font-medium mt-1">
            Consolidated real-time telemetry: attendance, team activity, judging integrity & venue operations.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsCheckInOpen(true)}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-600/20 transition-all"
          >
            <QrCode className="w-4 h-4" />
            <span>Open Check-in Center</span>
          </button>
        </div>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-xs font-semibold">Registered</span>
            <Users className="w-4 h-4 text-slate-500" />
          </div>
          <p className="text-2xl font-black text-slate-100 font-mono">{participants.length}</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-xs font-semibold">Checked In</span>
            <UserCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-emerald-400 font-mono">{checkedInCount}</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-xs font-semibold">Active Teams</span>
            <Briefcase className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-2xl font-black text-slate-100 font-mono">{teams.length}</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-xs font-semibold">Submissions</span>
            <Send className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-2xl font-black text-purple-400 font-mono">{submissions.length}</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-xs font-semibold">Evaluations</span>
            <Award className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-black text-amber-400 font-mono">{evaluations.length}</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-xs font-semibold">Open Ops Issues</span>
            <AlertOctagon className="w-4 h-4 text-rose-400" />
          </div>
          <p className="text-2xl font-black text-rose-400 font-mono">{openOpsCount}</p>
        </div>
      </div>

      {/* CORE PRODUCT FEATURE: EVENT PULSE CARD */}
      <EventPulseCard pulseData={eventPulse} />

      {/* EVENT LIFECYCLE TRACKER */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-3">
          Event Lifecycle Tracker
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2 text-center text-xs">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold">
            1. Registration ✓
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold">
            2. Check-in ✓
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold">
            3. Team Formation ✓
          </div>
          <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-bold animate-pulse">
            4. Build Phase ⚡
          </div>
          <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-400">
            5. Submissions
          </div>
          <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-400">
            6. Judging
          </div>
          <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-400">
            7. Results
          </div>
        </div>
      </div>

      {/* Command Center Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('OVERVIEW')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'OVERVIEW'
              ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Overview & Telemetry
        </button>
        <button
          onClick={() => setActiveTab('TEAMS')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'TEAMS'
              ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Team Risk Radar ({teams.length})
        </button>
        <button
          onClick={() => setActiveTab('JUDGING')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'JUDGING'
              ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Judging Integrity & Leaderboard
        </button>
        <button
          onClick={() => setActiveTab('ANNOUNCEMENTS')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'ANNOUNCEMENTS'
              ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Broadcast Center
        </button>
        <button
          onClick={() => setActiveTab('OPS')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'OPS'
              ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Live Ops Feed ({openOpsCount})
        </button>
        <button
          onClick={() => setActiveTab('CHECKIN')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'CHECKIN'
              ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Participants & Check-in
        </button>
      </div>

      {/* TAB CONTENT: OVERVIEW */}
      {activeTab === 'OVERVIEW' && (
        <div className="space-y-8">
          <TeamRiskRadarCard teams={teams} submissions={submissions} />
          <JudgingIntegrityCard
            evaluations={evaluations}
            blindJudgingEnabled={blindJudgingEnabled}
            onToggleBlindJudging={onToggleBlindJudging}
          />
          <LiveOpsFeed
            reports={opsReports}
            currentRole="organizer"
            onAddReport={onAddReport}
            onUpdateReportStatus={onUpdateReportStatus}
          />
        </div>
      )}

      {/* TAB CONTENT: TEAMS */}
      {activeTab === 'TEAMS' && <TeamRiskRadarCard teams={teams} submissions={submissions} />}

      {/* TAB CONTENT: JUDGING & LEADERBOARD */}
      {activeTab === 'JUDGING' && (
        <div className="space-y-8">
          <JudgingIntegrityCard
            evaluations={evaluations}
            blindJudgingEnabled={blindJudgingEnabled}
            onToggleBlindJudging={onToggleBlindJudging}
          />

          {/* Real-time Leaderboard */}
          <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-6 shadow-xl space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-slate-100">LIVE EVALUATION LEADERBOARD</h3>
                <p className="text-xs text-slate-400">Calculated in real time from completed judge evaluations</p>
              </div>
              <span className="text-xs font-mono text-cyan-400 px-3 py-1 rounded-lg bg-cyan-950/50 border border-cyan-800">
                LIVE SCORE STREAM
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
                  <tr>
                    <th className="p-3">Rank</th>
                    <th className="p-3">Team Name</th>
                    <th className="p-3">Average Score</th>
                    <th className="p-3">Evaluations</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {leaderboardData.map((item, idx) => (
                    <tr key={item.team.id} className="hover:bg-slate-950/50 transition-colors">
                      <td className="p-3 font-mono font-bold text-slate-300">#{idx + 1}</td>
                      <td className="p-3">
                        <div className="font-bold text-slate-100">{item.team.name}</div>
                        <div className="text-[11px] text-slate-400">{item.team.tagline}</div>
                      </td>
                      <td className="p-3 font-mono font-bold text-cyan-400 text-sm">
                        {item.avgScore > 0 ? `${item.avgScore} / 40` : 'Pending'}
                      </td>
                      <td className="p-3 font-mono text-slate-300">{item.evalCount} reviews</td>
                      <td className="p-3">
                        {item.hasSubmission ? (
                          <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-semibold">
                            Submitted
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px]">
                            No Submission
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: BROADCAST CENTER */}
      {activeTab === 'ANNOUNCEMENTS' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Create Announcement Form */}
          <form
            onSubmit={handleCreateAnnouncement}
            className="lg:col-span-1 p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-100">Publish Announcement</h3>
              <button
                type="button"
                onClick={handleAiRewrite}
                disabled={isRewriting || !annMessage.trim()}
                className="text-[11px] text-purple-400 hover:text-purple-300 flex items-center space-x-1"
                title="Use Gemini to rewrite rough message into a professional announcement"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isRewriting ? 'Rewriting...' : 'AI Rewrite'}</span>
              </button>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Title</label>
              <input
                type="text"
                placeholder="e.g. Schedule Update: Judging Delayed"
                value={annTitle}
                onChange={(e) => setAnnTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Message Content</label>
              <textarea
                rows={4}
                placeholder="Message body for participants..."
                value={annMessage}
                onChange={(e) => setAnnMessage(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Priority</label>
                <select
                  value={annPriority}
                  onChange={(e) => setAnnPriority(e.target.value as Announcement['priority'])}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-slate-200"
                >
                  <option value="NORMAL">Normal</option>
                  <option value="URGENT">Urgent</option>
                  <option value="CRITICAL">Critical</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Audience</label>
                <select
                  value={annAudience}
                  onChange={(e) => setAnnAudience(e.target.value as Announcement['audience'])}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-slate-200"
                >
                  <option value="EVERYONE">Everyone</option>
                  <option value="PARTICIPANTS">Participants Only</option>
                  <option value="CHECKED_IN">Checked-In Only</option>
                  <option value="JUDGES">Judges Only</option>
                  <option value="NO_SUBMISSION_TEAMS">Teams w/o Submission</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-600/20"
            >
              Publish Real-Time Broadcast
            </button>
          </form>

          {/* Announcements Feed */}
          <div className="lg:col-span-2 space-y-3">
            <h3 className="text-base font-bold text-slate-100">Live Broadcast Feed</h3>
            {announcements.map((ann) => (
              <div key={ann.id} className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-100 text-sm">{ann.title}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 uppercase">
                      {ann.priority}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {new Date(ann.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-xs text-slate-300">{ann.message}</p>
                <div className="text-[10px] text-slate-500 font-mono">Audience: {ann.audience}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: OPS FEED */}
      {activeTab === 'OPS' && (
        <LiveOpsFeed
          reports={opsReports}
          currentRole="organizer"
          onAddReport={onAddReport}
          onUpdateReportStatus={onUpdateReportStatus}
        />
      )}

      {/* TAB CONTENT: PARTICIPANTS & CHECK-IN */}
      {activeTab === 'CHECKIN' && (
        <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-6 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-slate-100">PARTICIPANT ROSTER & CHECK-IN</h3>
              <p className="text-xs text-slate-400">Total registered: {participants.length} • Checked in: {checkedInCount}</p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Filter by name, college..."
                  value={participantSearch}
                  onChange={(e) => setParticipantSearch(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200"
                />
              </div>
              <button
                onClick={() => setIsCheckInOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-cyan-600 text-white font-bold text-xs"
              >
                Scan QR
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
                <tr>
                  <th className="p-3">Participant ID</th>
                  <th className="p-3">Name</th>
                  <th className="p-3">College</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Team</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {participants
                  .filter((p) =>
                    participantSearch === '' ||
                    p.name.toLowerCase().includes(participantSearch.toLowerCase()) ||
                    p.college.toLowerCase().includes(participantSearch.toLowerCase())
                  )
                  .map((p) => (
                    <tr key={p.id} className="hover:bg-slate-950/50">
                      <td className="p-3 font-mono text-cyan-400 font-bold">{p.qrCodeId}</td>
                      <td className="p-3 font-bold text-slate-100">{p.name}</td>
                      <td className="p-3 text-slate-400">{p.college}</td>
                      <td className="p-3 text-slate-300">{p.role}</td>
                      <td className="p-3 text-slate-400">{p.teamName || 'Unassigned'}</td>
                      <td className="p-3">
                        {p.checkedIn ? (
                          <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                            CHECKED IN
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[10px] font-bold">
                            PENDING
                          </span>
                        )}
                      </td>
                      <td className="p-3">
                        {!p.checkedIn && (
                          <button
                            onClick={() => onCheckInParticipant(p.id)}
                            className="px-2 py-1 rounded bg-cyan-600/80 hover:bg-cyan-500 text-white font-bold text-[10px]"
                          >
                            Check In
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* QR Check-in Modal */}
      <QRCheckInModal
        isOpen={isCheckInOpen}
        onClose={() => setIsCheckInOpen(false)}
        participants={participants}
        onCheckInParticipant={onCheckInParticipant}
      />
    </div>
  );
};
