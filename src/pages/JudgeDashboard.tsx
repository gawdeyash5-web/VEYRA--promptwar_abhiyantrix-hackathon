import React, { useState } from 'react';
import { Gavel, EyeOff, CheckCircle2, Clock, ExternalLink, Send, ShieldAlert, Award } from 'lucide-react';
import { Evaluation, Submission, Team } from '../types';
import { detectRushedEvaluation } from '../utils/judgingIntegrity';
import confetti from 'canvas-confetti';

interface JudgeDashboardProps {
  teams: Team[];
  submissions: Submission[];
  evaluations: Evaluation[];
  blindJudgingEnabled: boolean;
  onAddEvaluation: (newEval: Omit<Evaluation, 'id'>) => void;
}

export const JudgeDashboard: React.FC<JudgeDashboardProps> = ({
  teams,
  submissions,
  evaluations,
  blindJudgingEnabled,
  onAddEvaluation,
}) => {
  const [selectedTeamId, setSelectedTeamId] = useState<string>(teams[0]?.id || '');
  const [evaluationStartTime, setEvaluationStartTime] = useState<number>(Date.now());

  // Score states
  const [innovation, setInnovation] = useState<number>(8);
  const [technicalImplementation, setTechnicalImplementation] = useState<number>(8);
  const [impact, setImpact] = useState<number>(8);
  const [presentation, setPresentation] = useState<number>(8);
  const [feedback, setFeedback] = useState<string>('');

  const activeTeam = teams.find((t) => t.id === selectedTeamId) || teams[0];
  const activeSubmission = submissions.find((s) => s.teamId === activeTeam?.id || s.teamName === activeTeam?.name);

  // Check if active team already has an evaluation submitted by current judge
  const existingEval = evaluations.find(
    (e) => (e.teamId === activeTeam?.id || e.teamName === activeTeam?.name) && e.judgeId === 'judge-1'
  );

  const handleSelectTeam = (teamId: string) => {
    setSelectedTeamId(teamId);
    setEvaluationStartTime(Date.now());
    // Reset form
    setInnovation(8);
    setTechnicalImplementation(8);
    setImpact(8);
    setPresentation(8);
    setFeedback('');
  };

  const handleSubmitEvaluation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTeam) return;

    const startedAt = new Date(evaluationStartTime).toISOString();
    const submittedAt = new Date().toISOString();
    const durationSeconds = Math.round((Date.now() - evaluationStartTime) / 1000);
    const isRushed = detectRushedEvaluation(startedAt, submittedAt, 60);

    const totalScore = innovation + technicalImplementation + impact + presentation;

    onAddEvaluation({
      judgeId: 'judge-1',
      judgeName: 'Dr. Rajesh Kumar (Judge)',
      teamId: activeTeam.id,
      teamName: activeTeam.name,
      innovation,
      technicalImplementation,
      impact,
      presentation,
      totalScore,
      feedback: feedback || 'Solid technical execution and clear presentation.',
      startedAt,
      submittedAt,
      durationSeconds: Math.max(durationSeconds, 45),
      isRushed,
    });

    try {
      confetti({ particleCount: 50, spread: 50, origin: { y: 0.6 } });
    } catch {}
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header & Blind Judging Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs uppercase font-extrabold tracking-widest text-purple-400">
              JUDGING PORTAL
            </span>
            {blindJudgingEnabled && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/30 flex items-center space-x-1">
                <EyeOff className="w-3 h-3" />
                <span>BLIND JUDGING ACTIVE</span>
              </span>
            )}
          </div>
          <h1 className="text-3xl font-black text-slate-100 tracking-tight mt-1">
            Interactive Evaluation Suite
          </h1>
          <p className="text-xs text-slate-400 font-medium">
            Evaluations automatically calculate leaderboard rankings and trigger statistical integrity checks.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Assigned Teams Queue */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">
            Assigned Submissions ({teams.length})
          </h3>
          <div className="space-y-2">
            {teams.map((team) => {
              const isSelected = team.id === activeTeam?.id;
              const teamEval = evaluations.find(
                (e) => (e.teamId === team.id || e.teamName === team.name) && e.judgeId === 'judge-1'
              );
              const isCompleted = !!teamEval;

              return (
                <button
                  key={team.id}
                  onClick={() => handleSelectTeam(team.id)}
                  className={`w-full p-4 rounded-xl text-left border transition-all ${
                    isSelected
                      ? 'bg-slate-900 border-cyan-500 shadow-md shadow-cyan-500/10'
                      : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-slate-100 text-sm">
                        {blindJudgingEnabled ? `Project Code #${team.id.substring(0, 6)}` : team.name}
                      </h4>
                      <p className="text-[11px] text-slate-400 line-clamp-1">{team.tagline}</p>
                    </div>
                    {isCompleted ? (
                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                        EVALUATED
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[10px] font-bold">
                        PENDING
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Project Details & Scoring Form */}
        {activeTeam && (
          <div className="lg:col-span-2 space-y-6">
            {/* Project Details Box */}
            <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    EVALUATING SUBMISSION
                  </span>
                  <h3 className="text-2xl font-black text-slate-100">
                    {blindJudgingEnabled ? `Project ID: ${activeTeam.id}` : activeTeam.name}
                  </h3>
                  <p className="text-xs text-slate-300 mt-1">{activeTeam.tagline}</p>
                </div>

                {/* Blind Judging Notice */}
                {blindJudgingEnabled && (
                  <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-300 text-[11px] font-medium max-w-xs">
                    <EyeOff className="w-3.5 h-3.5 inline mr-1" />
                    Blind Judging Enabled: Institution and member names hidden to prevent bias.
                  </div>
                )}
              </div>

              {!blindJudgingEnabled && (
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="text-slate-400 font-semibold">Members:</span>
                  {activeTeam.members.map((m) => (
                    <span key={m.participantId} className="px-2 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800">
                      {m.name} ({m.role})
                    </span>
                  ))}
                </div>
              )}

              {activeSubmission ? (
                <div className="space-y-3 pt-3 border-t border-slate-800">
                  <p className="text-xs text-slate-300 leading-relaxed">{activeSubmission.description}</p>

                  <div className="flex items-center space-x-4 text-xs font-semibold">
                    <a
                      href={activeSubmission.demoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-cyan-400 hover:text-cyan-300 flex items-center space-x-1"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Live App Demo</span>
                    </a>
                    <a
                      href={activeSubmission.repoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-purple-400 hover:text-purple-300 flex items-center space-x-1"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>GitHub Codebase</span>
                    </a>
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400">
                  No project submission link uploaded yet.
                </div>
              )}
            </div>

            {/* Evaluation Form */}
            <form onSubmit={handleSubmitEvaluation} className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-6">
              <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                <h3 className="text-base font-bold text-slate-100">Scorecard Criteria (0-10 each)</h3>
                <div className="text-right">
                  <span className="text-xs text-slate-400 block font-medium">Total Score:</span>
                  <span className="text-2xl font-black text-cyan-400 font-mono">
                    {innovation + technicalImplementation + impact + presentation} / 40
                  </span>
                </div>
              </div>

              {/* Slider Sliders Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Innovation */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-300">1. Innovation & Novelty</span>
                    <span className="text-cyan-400 font-bold font-mono">{innovation} / 10</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={innovation}
                    onChange={(e) => setInnovation(Number(e.target.value))}
                    className="w-full accent-cyan-500"
                  />
                </div>

                {/* Technical Implementation */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-300">2. Technical Complexity & Quality</span>
                    <span className="text-cyan-400 font-bold font-mono">{technicalImplementation} / 10</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={technicalImplementation}
                    onChange={(e) => setTechnicalImplementation(Number(e.target.value))}
                    className="w-full accent-cyan-500"
                  />
                </div>

                {/* Impact */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-300">3. Real-world Impact & Utility</span>
                    <span className="text-cyan-400 font-bold font-mono">{impact} / 10</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={impact}
                    onChange={(e) => setImpact(Number(e.target.value))}
                    className="w-full accent-cyan-500"
                  />
                </div>

                {/* Presentation */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-300">4. Presentation & Pitch Clarity</span>
                    <span className="text-cyan-400 font-bold font-mono">{presentation} / 10</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={presentation}
                    onChange={(e) => setPresentation(Number(e.target.value))}
                    className="w-full accent-cyan-500"
                  />
                </div>
              </div>

              {/* Qualitative Feedback */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 block">
                  Qualitative Feedback & Suggestions for Team
                </label>
                <textarea
                  rows={3}
                  placeholder="Provide constructive evaluation feedback..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-600/20"
                >
                  <Send className="w-4 h-4" />
                  <span>{existingEval ? 'Update Evaluation Score' : 'Submit Evaluation Score'}</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
