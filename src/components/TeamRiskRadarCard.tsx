import React from 'react';
import { ShieldAlert, AlertTriangle, CheckCircle, UserX, Clock, FileX, Sparkles, ExternalLink } from 'lucide-react';
import { Team, Submission } from '../types';
import { evaluateTeamRisk } from '../utils/teamRiskRadar';

interface TeamRiskRadarCardProps {
  teams: Team[];
  submissions: Submission[];
}

export const TeamRiskRadarCard: React.FC<TeamRiskRadarCardProps> = ({ teams, submissions }) => {
  const evaluatedTeams = teams.map((team) => evaluateTeamRisk(team, submissions));

  const highRiskTeams = evaluatedTeams.filter((t) => t.riskLevel === 'HIGH');
  const mediumRiskTeams = evaluatedTeams.filter((t) => t.riskLevel === 'MEDIUM');
  const lowRiskTeams = evaluatedTeams.filter((t) => t.riskLevel === 'LOW');

  return (
    <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-6 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-5 h-5 text-amber-400" />
            <h3 className="text-lg font-bold text-slate-100">TEAM RISK RADAR</h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
              OPERATIONAL SIGNAL
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Explainable operational risk telemetry calculated from check-ins, activity logs & submission updates.
          </p>
        </div>

        {/* Risk Level Pills */}
        <div className="flex items-center space-x-2 text-xs font-semibold">
          <span className="px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/30">
            {highRiskTeams.length} High Risk
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30">
            {mediumRiskTeams.length} Medium
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            {lowRiskTeams.length} Healthy
          </span>
        </div>
      </div>

      {/* Team Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {evaluatedTeams.map(({ team, riskLevel, riskFactors, recommendedIntervention }) => {
          let badgeColor = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
          let borderAccent = 'border-slate-800';

          if (riskLevel === 'HIGH') {
            badgeColor = 'bg-rose-500/15 text-rose-400 border-rose-500/40 animate-pulse';
            borderAccent = 'border-rose-900/40 bg-gradient-to-b from-rose-950/20 to-slate-900';
          } else if (riskLevel === 'MEDIUM') {
            badgeColor = 'bg-amber-500/10 text-amber-400 border-amber-500/30';
            borderAccent = 'border-amber-900/30';
          }

          return (
            <div
              key={team.id}
              className={`p-4 rounded-xl border ${borderAccent} bg-slate-950/60 flex flex-col justify-between space-y-4 hover:border-slate-700 transition-colors`}
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-slate-100 text-sm">{team.name}</h4>
                    <p className="text-[11px] text-slate-400 line-clamp-1">{team.tagline}</p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${badgeColor}`}>
                    {riskLevel} RISK
                  </span>
                </div>

                {/* Why: Explainable Risk Factors */}
                <div className="mt-3 space-y-1.5 text-xs text-slate-300">
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Why ({riskFactors.length} signals):
                  </p>
                  {riskFactors.map((factor, idx) => (
                    <div key={idx} className="flex items-center space-x-1.5 text-[11px] text-slate-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
                      <span>{factor}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommended Intervention */}
              <div className="pt-3 border-t border-slate-800/80 text-[11px]">
                <span className="font-semibold text-slate-400 block mb-0.5">Recommended Intervention:</span>
                <p className="text-slate-300 italic">"{recommendedIntervention}"</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
