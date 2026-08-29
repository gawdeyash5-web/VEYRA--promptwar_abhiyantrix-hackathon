import React, { useState } from 'react';
import { EyeOff, Send, ExternalLink } from 'lucide-react';
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

  const [innovation, setInnovation] = useState<number>(8);
  const [technicalImplementation, setTechnicalImplementation] = useState<number>(8);
  const [impact, setImpact] = useState<number>(8);
  const [presentation, setPresentation] = useState<number>(8);
  const [feedback, setFeedback] = useState<string>('');

  const activeTeam = teams.find((t) => t.id === selectedTeamId) || teams[0];
  const activeSubmission = submissions.find((s) => s.teamId === activeTeam?.id || s.teamName === activeTeam?.name);

  const existingEval = evaluations.find(
    (e) => (e.teamId === activeTeam?.id || e.teamName === activeTeam?.name) && e.judgeId === 'judge-1'
  );

  const handleSelectTeam = (teamId: string) => {
    setSelectedTeamId(teamId);
    setEvaluationStartTime(Date.now());
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
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Judge Scorecard Suite</h1>
          <p className="text-xs text-slate-400">
            Evaluate assigned submissions. Scores update leaderboard rankings automatically.
          </p>
        </div>
        {blindJudgingEnabled && (
          <div className="flex items-center space-x-1.5 text-xs font-semibold text-purple-300 bg-purple-950/60 px-3 py-1 rounded-lg border border-purple-800/80">
            <EyeOff className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Blind Judging Mode Active</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Team Queue */}
        <div className="space-y-2">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
            Assigned Submissions ({teams.length})
          </h2>
          <div className="space-y-1.5" role="region" aria-label="Assigned submissions queue">
            {teams.map((team) => {
              const isSelected = team.id === activeTeam?.id;
              const teamEval = evaluations.find(
                (e) => (e.teamId === team.id || e.teamName === team.name) && e.judgeId === 'judge-1'
              );

              return (
                <button
                  key={team.id}
                  onClick={() => handleSelectTeam(team.id)}
                  aria-pressed={isSelected}
                  aria-label={`Select team ${blindJudgingEnabled ? `Project #${team.id.substring(0, 6)}` : team.name}`}
                  className={`w-full p-3 rounded-lg text-left border text-xs transition-colors ${
                    isSelected
                      ? 'bg-sky-950/60 border-sky-500/60 font-semibold'
                      : 'veyra-card hover:border-white/20'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-slate-100">
                      {blindJudgingEnabled ? `Project #${team.id.substring(0, 6)}` : team.name}
                    </span>
                    {teamEval ? (
                      <span className="text-[10px] font-bold text-emerald-400">Evaluated ✓</span>
                    ) : (
                      <span className="text-[10px] text-slate-400">Pending</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Scorecard Form */}
        {activeTeam && (
          <div className="lg:col-span-2 space-y-6">
            <div className="veyra-card space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Project Details</span>
                  <h2 className="text-xl font-bold text-white">
                    {blindJudgingEnabled ? `Project ID: ${activeTeam.id}` : activeTeam.name}
                  </h2>
                  <p className="text-xs text-slate-300">{activeTeam.tagline}</p>
                </div>
              </div>

              {activeSubmission && (
                <div className="pt-2 border-t border-white/10 space-y-2 text-xs">
                  <p className="text-slate-300">{activeSubmission.description}</p>
                  <div className="flex items-center space-x-3 font-semibold">
                    <a href={activeSubmission.demoUrl} target="_blank" rel="noreferrer" className="text-sky-400 hover:underline flex items-center space-x-1" aria-label="Open live application demo in new tab">
                      <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Live App Demo</span>
                    </a>
                    <a href={activeSubmission.repoUrl} target="_blank" rel="noreferrer" className="text-purple-400 hover:underline flex items-center space-x-1" aria-label="Open GitHub code repository in new tab">
                      <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>GitHub Codebase</span>
                    </a>
                  </div>
                </div>
              )}
            </div>

            <form onSubmit={handleSubmitEvaluation} className="veyra-card space-y-5">
              <div className="flex justify-between items-center border-b border-white/10 pb-3">
                <h2 className="text-base font-bold text-white">Scorecard Criteria (0-10)</h2>
                <div className="text-right">
                  <span className="text-xs text-slate-400 block font-medium">Total Score:</span>
                  <span className="text-xl font-extrabold text-sky-400 font-mono">
                    {innovation + technicalImplementation + impact + presentation} / 40
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1.5">
                  <div className="flex justify-between font-semibold">
                    <label htmlFor="innovation-slider" className="text-slate-200">1. Innovation & Novelty</label>
                    <span className="text-sky-400 font-mono">{innovation} / 10</span>
                  </div>
                  <input
                    id="innovation-slider"
                    type="range"
                    min="0"
                    max="10"
                    value={innovation}
                    onChange={(e) => setInnovation(Number(e.target.value))}
                    className="w-full"
                    aria-valuemin={0}
                    aria-valuemax={10}
                    aria-valuenow={innovation}
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between font-semibold">
                    <label htmlFor="technical-slider" className="text-slate-200">2. Technical Implementation</label>
                    <span className="text-sky-400 font-mono">{technicalImplementation} / 10</span>
                  </div>
                  <input
                    id="technical-slider"
                    type="range"
                    min="0"
                    max="10"
                    value={technicalImplementation}
                    onChange={(e) => setTechnicalImplementation(Number(e.target.value))}
                    className="w-full"
                    aria-valuemin={0}
                    aria-valuemax={10}
                    aria-valuenow={technicalImplementation}
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between font-semibold">
                    <label htmlFor="impact-slider" className="text-slate-200">3. Real-world Impact</label>
                    <span className="text-sky-400 font-mono">{impact} / 10</span>
                  </div>
                  <input
                    id="impact-slider"
                    type="range"
                    min="0"
                    max="10"
                    value={impact}
                    onChange={(e) => setImpact(Number(e.target.value))}
                    className="w-full"
                    aria-valuemin={0}
                    aria-valuemax={10}
                    aria-valuenow={impact}
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between font-semibold">
                    <label htmlFor="presentation-slider" className="text-slate-200">4. Presentation & Pitch</label>
                    <span className="text-sky-400 font-mono">{presentation} / 10</span>
                  </div>
                  <input
                    id="presentation-slider"
                    type="range"
                    min="0"
                    max="10"
                    value={presentation}
                    onChange={(e) => setPresentation(Number(e.target.value))}
                    className="w-full"
                    aria-valuemin={0}
                    aria-valuemax={10}
                    aria-valuenow={presentation}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="qualitative-feedback" className="text-xs font-semibold text-slate-300 block mb-1">Qualitative Feedback</label>
                <textarea
                  id="qualitative-feedback"
                  rows={3}
                  placeholder="Evaluation feedback for team..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="veyra-input w-full"
                />
              </div>

              <div className="flex justify-end">
                <button type="submit" className="veyra-btn-primary flex items-center space-x-1.5">
                  <Send className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>{existingEval ? 'Update Scorecard' : 'Submit Scorecard'}</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
