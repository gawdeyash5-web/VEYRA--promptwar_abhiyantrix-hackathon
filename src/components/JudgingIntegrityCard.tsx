import React from 'react';
import { EyeOff, Eye, AlertTriangle, Zap, CheckCircle2, Gavel, Scale, ShieldAlert } from 'lucide-react';
import { Evaluation } from '../types';
import { analyzeJudgingIntegrity } from '../utils/judgingIntegrity';

interface JudgingIntegrityCardProps {
  evaluations: Evaluation[];
  blindJudgingEnabled: boolean;
  onToggleBlindJudging: (enabled: boolean) => void;
}

export const JudgingIntegrityCard: React.FC<JudgingIntegrityCardProps> = ({
  evaluations,
  blindJudgingEnabled,
  onToggleBlindJudging,
}) => {
  const analysis = analyzeJudgingIntegrity(evaluations);

  return (
    <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-6 shadow-xl space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Scale className="w-5 h-5 text-purple-400" />
            <h3 className="text-lg font-bold text-slate-100">JUDGING INTEGRITY ENGINE</h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/30">
              AUDIT LAYER
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time evaluation telemetry detecting statistical score anomalies, rushed reviews & blind judging compliance.
          </p>
        </div>

        {/* Blind Judging Toggle Control */}
        <div className="flex items-center space-x-3 bg-slate-950 p-2 rounded-xl border border-slate-800">
          <div className="flex items-center space-x-2 text-xs font-semibold text-slate-300">
            {blindJudgingEnabled ? (
              <EyeOff className="w-4 h-4 text-purple-400" />
            ) : (
              <Eye className="w-4 h-4 text-slate-400" />
            )}
            <span>BLIND JUDGING</span>
          </div>
          <button
            onClick={() => onToggleBlindJudging(!blindJudgingEnabled)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              blindJudgingEnabled ? 'bg-purple-600' : 'bg-slate-800'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                blindJudgingEnabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Top Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
          <span className="text-xs text-slate-400 font-medium">Completed Reviews</span>
          <p className="text-2xl font-bold text-slate-100 font-mono mt-1">{analysis.evaluations.length}</p>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
          <span className="text-xs text-slate-400 font-medium">Average Total Score</span>
          <p className="text-2xl font-bold text-cyan-400 font-mono mt-1">{analysis.averageScore} / 40</p>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
          <span className="text-xs text-slate-400 font-medium">Flagged Deviations</span>
          <p className="text-2xl font-bold text-amber-400 font-mono mt-1">{analysis.flaggedDeviationsCount}</p>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
          <span className="text-xs text-slate-400 font-medium">Rushed Reviews (&lt;60s)</span>
          <p className="text-2xl font-bold text-rose-400 font-mono mt-1">{analysis.fastReviewsCount}</p>
        </div>
      </div>

      {/* Flagged Anomalies & Telemetry Stream */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Active Telemetry Flags ({analysis.flaggedDeviationsCount + analysis.fastReviewsCount})
        </h4>

        {analysis.evaluations.filter((ev) => ev.deviationFlag?.isFlagged || ev.isRushed).length === 0 ? (
          <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800/60 flex items-center space-x-3 text-xs text-slate-400">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>No score deviations or rushed reviews detected. Evaluation integrity verified.</span>
          </div>
        ) : (
          <div className="space-y-2">
            {analysis.evaluations.map((ev) => {
              const hasDeviation = ev.deviationFlag?.isFlagged;
              const hasRushed = ev.isRushed;

              if (!hasDeviation && !hasRushed) return null;

              return (
                <div
                  key={ev.id}
                  className="p-3.5 rounded-xl bg-slate-950 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-start space-x-3">
                    <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-100">{ev.teamName}</span>
                        <span className="text-slate-500">•</span>
                        <span className="text-slate-300 font-medium">{ev.judgeName}</span>
                      </div>

                      {hasDeviation && ev.deviationFlag && (
                        <p className="text-amber-300 mt-0.5 font-medium">
                          ⚠ Score deviation detected: {ev.deviationFlag.judgeScore} pts submitted (
                          <span className="font-bold text-amber-400">{ev.deviationFlag.pointsBelowMean} pts below</span> peer average of {ev.deviationFlag.peerAverage})
                        </p>
                      )}

                      {hasRushed && (
                        <p className="text-rose-300 mt-0.5 font-medium">
                          ⚡ Fast Review Flag: Completed in <span className="font-bold text-rose-400">{ev.durationSeconds || 38} seconds</span> (expected 2+ mins)
                        </p>
                      )}
                    </div>
                  </div>

                  <span className="px-3 py-1 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[11px] font-semibold self-start sm:self-auto">
                    Review Recommended
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
