import React, { useState } from 'react';
import { UserPlus, CheckCircle2, X, Filter } from 'lucide-react';
import { Participant, CandidateMatch } from '../types';
import { calculateCandidateMatch } from '../utils/smartMatching';

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
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('ALL');

  if (!isOpen) return null;

  const candidates = allParticipants.filter(
    (p) =>
      p.id !== currentParticipant.id &&
      p.teamId !== currentParticipant.teamId &&
      (selectedRoleFilter === 'ALL' || p.role.toLowerCase().includes(selectedRoleFilter.toLowerCase()))
  );

  const candidateMatches: CandidateMatch[] = candidates
    .map((cand) => calculateCandidateMatch(currentParticipant, cand))
    .sort((a, b) => b.matchScore - a.matchScore);

  const handleInvite = (candidate: Participant) => {
    onSendInvite(candidate.id, candidate.name);
    setInvitedIds((prev) => [...prev, candidate.id]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn" role="dialog" aria-modal="true" aria-labelledby="smart-match-title">
      <div className="veyra-card w-full max-w-2xl shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div>
            <h2 id="smart-match-title" className="text-lg font-bold text-white">Find Teammates</h2>
            <p className="text-xs text-slate-400">Discover compatible hackers based on complementary skills and interests.</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close Find Teammates modal"
            className="text-slate-400 hover:text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 rounded p-1"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Role Filter Bar */}
        <div className="flex items-center space-x-2 text-xs">
          <Filter className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
          <label htmlFor="role-filter-select" className="font-medium text-slate-300">Role Filter:</label>
          <select
            id="role-filter-select"
            value={selectedRoleFilter}
            onChange={(e) => setSelectedRoleFilter(e.target.value)}
            className="veyra-input px-2.5 py-1"
          >
            <option value="ALL">All Roles</option>
            <option value="Frontend">Frontend</option>
            <option value="Backend">Backend</option>
            <option value="ML">ML & AI</option>
            <option value="Designer">Product Designer</option>
          </select>
        </div>

        {/* Candidate Cards List */}
        <div className="space-y-3">
          {candidateMatches.length === 0 ? (
            <div className="text-center py-6 text-xs text-slate-400">No unassigned candidates found.</div>
          ) : (
            candidateMatches.slice(0, 5).map((match) => {
              const isInvited = invitedIds.includes(match.candidate.id);

              return (
                <div key={match.candidate.id} className="veyra-subcard space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-bold text-white text-sm">{match.candidate.name}</h3>
                        <span className="badge-info">{match.candidate.role}</span>
                        <span className="text-xs text-slate-400">{match.candidate.college}</span>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {match.candidate.skills.map((sk) => (
                          <span key={sk} className="text-[11px] px-2 py-0.5 rounded bg-[#111726] text-slate-300 border border-white/10">
                            {sk}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-base font-extrabold text-emerald-400 font-mono">
                        {match.matchScore}% Match
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 italic bg-[#111726] p-2.5 rounded-md border border-white/10">
                    "{match.aiExplanation}"
                  </p>

                  <div className="flex justify-end pt-1">
                    <button
                      onClick={() => handleInvite(match.candidate)}
                      disabled={isInvited}
                      aria-label={isInvited ? `Invite already sent to ${match.candidate.name}` : `Send team invitation to ${match.candidate.name}`}
                      className={isInvited ? 'veyra-btn-secondary' : 'veyra-btn-primary'}
                    >
                      {isInvited ? (
                        <span className="flex items-center space-x-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
                          <span>Invite Sent</span>
                        </span>
                      ) : (
                        <span className="flex items-center space-x-1">
                          <UserPlus className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>Invite to Team</span>
                        </span>
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
