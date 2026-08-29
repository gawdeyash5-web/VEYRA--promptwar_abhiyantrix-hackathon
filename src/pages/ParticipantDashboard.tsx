import React, { useState } from 'react';
import {
  QrCode,
  Users,
  Sparkles,
  Send,
  AlertOctagon,
  Award,
  Plus,
  CheckCircle2,
  ExternalLink,
  Code,
} from 'lucide-react';
import { Participant, Team, Submission, Announcement, OpsReport, Evaluation } from '../types';
import { ParticipantQRModal } from '../components/ParticipantQRModal';
import { SmartMatchModal } from '../components/SmartMatchModal';
import { LiveOpsFeed } from '../components/LiveOpsFeed';
import confetti from 'canvas-confetti';

interface ParticipantDashboardProps {
  currentParticipant: Participant;
  allParticipants: Participant[];
  teams: Team[];
  submissions: Submission[];
  evaluations: Evaluation[];
  announcements: Announcement[];
  opsReports: OpsReport[];
  onAddSubmission: (newSub: Omit<Submission, 'id' | 'submittedAt' | 'updatedAt'>) => void;
  onAddReport: (newReport: Omit<OpsReport, 'id' | 'createdAt'>) => void;
  onUpdateReportStatus: (reportId: string, status: OpsReport['status']) => void;
  onSendTeamInvite: (candidateId: string, candidateName: string) => void;
}

export const ParticipantDashboard: React.FC<ParticipantDashboardProps> = ({
  currentParticipant,
  allParticipants,
  teams,
  submissions,
  evaluations,
  announcements,
  opsReports,
  onAddSubmission,
  onAddReport,
  onUpdateReportStatus,
  onSendTeamInvite,
}) => {
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'TEAM' | 'SUBMISSION' | 'OPS' | 'LEADERBOARD'>('OVERVIEW');
  const [isQrOpen, setIsQrOpen] = useState(false);
  const [isSmartMatchOpen, setIsSmartMatchOpen] = useState(false);

  // Submission Form State
  const myTeam = teams.find((t) => t.id === currentParticipant.teamId || t.name === currentParticipant.teamName);
  const mySubmission = submissions.find((s) => s.teamId === myTeam?.id || s.teamName === myTeam?.name);

  const [subTitle, setSubTitle] = useState(mySubmission?.title || '');
  const [subTagline, setSubTagline] = useState(mySubmission?.tagline || '');
  const [subDescription, setSubDescription] = useState(mySubmission?.description || '');
  const [subDemoUrl, setSubDemoUrl] = useState(mySubmission?.demoUrl || '');
  const [subRepoUrl, setSubRepoUrl] = useState(mySubmission?.repoUrl || '');
  const [subTechStack, setSubTechStack] = useState(mySubmission?.techStack?.join(', ') || 'React, TypeScript, Gemini API');

  const handleSubmitProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!myTeam || !subTitle.trim() || !subDemoUrl.trim() || !subRepoUrl.trim()) return;

    onAddSubmission({
      teamId: myTeam.id,
      teamName: myTeam.name,
      title: subTitle,
      tagline: subTagline,
      description: subDescription,
      demoUrl: subDemoUrl,
      repoUrl: subRepoUrl,
      techStack: subTechStack.split(',').map((s) => s.trim()).filter(Boolean),
    });

    try {
      confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
    } catch {}
  };

  // Leaderboard Calculation
  const leaderboardData = teams.map((team) => {
    const teamEvals = evaluations.filter((e) => e.teamId === team.id || e.teamName === team.name);
    const avgScore =
      teamEvals.length > 0
        ? parseFloat((teamEvals.reduce((acc, curr) => acc + curr.totalScore, 0) / teamEvals.length).toFixed(1))
        : 0;
    return { team, avgScore, evalCount: teamEvals.length };
  }).sort((a, b) => b.avgScore - a.avgScore);

  return (
    <div className="space-y-8 pb-12">
      {/* Participant Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-extrabold uppercase tracking-widest text-cyan-400">
              PARTICIPANT WORKSPACE
            </span>
            {currentParticipant.checkedIn ? (
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold">
                CHECKED IN
              </span>
            ) : (
              <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 font-bold">
                CHECK-IN REQUIRED
              </span>
            )}
          </div>
          <h1 className="text-3xl font-black text-slate-100 tracking-tight mt-1">
            Welcome, {currentParticipant.name}
          </h1>
          <p className="text-xs text-slate-400 font-medium">
            {currentParticipant.role} • {currentParticipant.college} • {myTeam ? `Team: ${myTeam.name}` : 'Looking for Team'}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsQrOpen(true)}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all"
          >
            <QrCode className="w-4 h-4 text-cyan-400" />
            <span>My Digital QR Passport</span>
          </button>

          <button
            onClick={() => setIsSmartMatchOpen(true)}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-600/20 transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>AI Smart Teammate Finder</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('OVERVIEW')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'OVERVIEW' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Overview & Workspace
        </button>
        <button
          onClick={() => setActiveTab('TEAM')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'TEAM' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          My Team ({myTeam?.members.length || 1})
        </button>
        <button
          onClick={() => setActiveTab('SUBMISSION')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'SUBMISSION' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Submit Project {mySubmission ? '✓' : ''}
        </button>
        <button
          onClick={() => setActiveTab('OPS')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'OPS' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Report Venue Issue
        </button>
        <button
          onClick={() => setActiveTab('LEADERBOARD')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'LEADERBOARD' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Live Leaderboard
        </button>
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === 'OVERVIEW' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Team Status & Submission Status */}
          <div className="lg:col-span-2 space-y-6">
            {/* Team Card */}
            <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    ACTIVE TEAM WORKSPACE
                  </span>
                  <h3 className="text-xl font-extrabold text-slate-100 mt-0.5">
                    {myTeam ? myTeam.name : 'No Team Assigned Yet'}
                  </h3>
                </div>
                <button
                  onClick={() => setIsSmartMatchOpen(true)}
                  className="text-xs text-purple-400 hover:text-purple-300 font-semibold flex items-center space-x-1"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Find Teammates</span>
                </button>
              </div>

              {myTeam ? (
                <div>
                  <p className="text-xs text-slate-300 mb-3">{myTeam.tagline}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {myTeam.members.map((m) => (
                      <div key={m.participantId} className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                        <div className="font-bold text-slate-100">{m.name}</div>
                        <div className="text-[11px] text-cyan-400">{m.role}</div>
                        <div className="text-[10px] text-slate-400 mt-1 font-mono">
                          {m.checkedIn ? 'Checked in at desk' : 'Pending check-in'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400">
                  Use the Smart Teammate Finder to connect with compatible hackers matching your skills & role.
                </div>
              )}
            </div>

            {/* Submission Form Quick Access */}
            <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-base font-bold text-slate-100">Project Submission</h3>
                {mySubmission ? (
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-bold">
                    SUBMITTED ✓
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30 text-xs font-bold">
                    DRAFT PENDING
                  </span>
                )}
              </div>

              <form onSubmit={handleSubmitProject} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Project Title</label>
                    <input
                      type="text"
                      placeholder="e.g. NovaCare AI"
                      value={subTitle}
                      onChange={(e) => setSubTitle(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">One-line Tagline</label>
                    <input
                      type="text"
                      placeholder="e.g. AI-driven emergency triage"
                      value={subTagline}
                      onChange={(e) => setSubTagline(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Live Demo / App URL</label>
                    <input
                      type="url"
                      placeholder="https://my-app.vercel.app"
                      value={subDemoUrl}
                      onChange={(e) => setSubDemoUrl(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">GitHub Repository URL</label>
                    <input
                      type="url"
                      placeholder="https://github.com/team/repo"
                      value={subRepoUrl}
                      onChange={(e) => setSubRepoUrl(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Project Description & Gemini Usage</label>
                  <textarea
                    rows={3}
                    placeholder="Describe how your project solves the challenge and uses Gemini API..."
                    value={subDescription}
                    onChange={(e) => setSubDescription(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200"
                    required
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-600/20"
                  >
                    {mySubmission ? 'Update Project Submission' : 'Submit Final Project'}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Right Column: Live Announcements */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-100">Broadcast Feed</h3>
            {announcements.map((ann) => (
              <div key={ann.id} className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-100 text-xs">{ann.title}</span>
                  <span className="text-[10px] font-mono text-cyan-400 uppercase">{ann.priority}</span>
                </div>
                <p className="text-xs text-slate-300">{ann.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* OPS TAB */}
      {activeTab === 'OPS' && (
        <LiveOpsFeed
          reports={opsReports}
          currentRole="participant"
          onAddReport={onAddReport}
          onUpdateReportStatus={onUpdateReportStatus}
        />
      )}

      {/* LEADERBOARD TAB */}
      {activeTab === 'LEADERBOARD' && (
        <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-6 shadow-xl space-y-4">
          <h3 className="text-lg font-bold text-slate-100">HACKATHON LIVE LEADERBOARD</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
                <tr>
                  <th className="p-3">Rank</th>
                  <th className="p-3">Team Name</th>
                  <th className="p-3">Average Score</th>
                  <th className="p-3">Completed Reviews</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {leaderboardData.map((item, idx) => (
                  <tr key={item.team.id} className="hover:bg-slate-950/50">
                    <td className="p-3 font-mono font-bold text-slate-300">#{idx + 1}</td>
                    <td className="p-3 font-bold text-slate-100">{item.team.name}</td>
                    <td className="p-3 font-mono font-bold text-cyan-400 text-sm">
                      {item.avgScore > 0 ? `${item.avgScore} / 40` : 'Pending'}
                    </td>
                    <td className="p-3 font-mono text-slate-300">{item.evalCount} reviews</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modals */}
      <ParticipantQRModal
        isOpen={isQrOpen}
        onClose={() => setIsQrOpen(false)}
        participant={currentParticipant}
      />

      <SmartMatchModal
        isOpen={isSmartMatchOpen}
        onClose={() => setIsSmartMatchOpen(false)}
        currentParticipant={currentParticipant}
        allParticipants={allParticipants}
        onSendInvite={onSendTeamInvite}
      />
    </div>
  );
};
