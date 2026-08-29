import React, { useState } from 'react';
import { Sparkles, UserPlus, CheckCircle2, X, Zap } from 'lucide-react';
import { Participant, CandidateMatch } from '../types';
import { calculateCandidateMatch } from '../utils/smartMatching';
import { explainMatchWithAI } from '../services/api';

interface SmartMatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentParticipant: Participant;
  allParticipants: Participant[];
  onSendInvite: (candidateId: string, candidateName: string) => void;
}

export const SmartMatchModal: React.FC<SmartMatchModalProps> = ({
  isOpen,
  onClose,
  currentParticipant,
  allParticipants,
  onSendInvite,
}) => {
  const [invitedIds, setInvitedIds] = useState<string[]>([]);
  const [aiExplanations, setAiExplanations] = useState<Record<string, string>>({});
  const [loadingAiId, setLoadingAiId] = useState<string | null>(null);

  if (!isOpen) return null;

  // Filter candidates excluding self & existing team members
  const candidates = allParticipants.filter(
    (p) => p.id !== currentParticipant.id && p.teamId !== currentParticipant.teamId
  );

  const candidateMatches: CandidateMatch[] = candidates
    .map((cand) => calculateCandidateMatch(currentParticipant, cand))
    .sort((a, b) => b.matchScore - a.matchScore);

  const handleFetchAiExplanation = async (match: CandidateMatch) => {
    setLoadingAiId(match.candidate.id);
    try {
      const explanation = await explainMatchWithAI(
        currentParticipant.skills || [],
        currentParticipant.role,
        match.candidate.skills || [],
        match.candidate.role
      );
      setAiExplanations((prev) => ({ ...prev, [match.candidate.id]: explanation }));
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAiId(null);
    }
  };

  const handleInvite = (candidate: Participant) => {
    onSendInvite(candidate.id, candidate.name);
    setInvitedIds((prev) => [...prev, candidate.id]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-2xl rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">SMART TEAM FORMATION ENGINE</h3>
              <p className="text-xs text-slate-400">Deterministic skill overlap + Gemini rationale generator</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current User Profile Summary */}
        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
          <div>
            <span className="text-slate-400">Matching for: </span>
            <span className="font-bold text-slate-100">{currentParticipant.name}</span>
            <span className="text-slate-500"> ({currentParticipant.role})</span>
          </div>
          <div className="flex space-x-1">
            {(currentParticipant.skills || []).slice(0, 3).map((sk) => (
              <span key={sk} className="px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800">
                {sk}
              </span>
            ))}
          </div>
        </div>

        {/* Candidate List */}
        <div className="space-y-4">
          {candidateMatches.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-500">No compatible unassigned candidates found.</div>
          ) : (
            candidateMatches.slice(0, 5).map((match) => {
              const isInvited = invitedIds.includes(match.candidate.id);
              const customExplanation = aiExplanations[match.candidate.id] || match.aiExplanation;
              const isLoadingThis = loadingAiId === match.candidate.id;

              return (
                <div
                  key={match.candidate.id}
                  className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col space-y-3 hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="font-bold text-slate-100 text-sm">{match.candidate.name}</h4>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                          {match.candidate.role}
                        </span>
                        <span className="text-[11px] text-slate-400">{match.candidate.college}</span>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {match.candidate.skills.map((sk) => (
                          <span
                            key={sk}
                            className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800"
                          >
                            {sk}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Match Score Badge */}
                    <div className="text-right">
                      <div className="text-lg font-black text-emerald-400 font-mono">{match.matchScore}% MATCH</div>
                    </div>
                  </div>

                  {/* Why Rationale Box */}
                  <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 text-xs text-slate-300">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-slate-400 uppercase text-[10px]">Match Rationale:</span>
                      <button
                        onClick={() => handleFetchAiExplanation(match)}
                        disabled={isLoadingThis}
                        className="text-[10px] text-purple-400 hover:text-purple-300 flex items-center space-x-1"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>{isLoadingThis ? 'Generating...' : 'Refresh AI Rationale'}</span>
                      </button>
                    </div>
                    <p className="text-slate-300 italic">{customExplanation}</p>
                  </div>

                  {/* Invite Action */}
                  <div className="flex justify-end pt-1">
                    <button
                      onClick={() => handleInvite(match.candidate)}
                      disabled={isInvited}
                      className={`flex items-center space-x-1.5 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        isInvited
                          ? 'bg-slate-800 text-slate-400 cursor-not-allowed'
                          : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-md shadow-purple-600/20'
                      }`}
                    >
                      {isInvited ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Invite Sent</span>
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-3.5 h-3.5" />
                          <span>Send Team Invite</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
