import React, { useState } from 'react';
import { Activity, Info, ChevronDown, ChevronUp, CheckCircle2, AlertTriangle, AlertCircle } from 'lucide-react';
import { EventPulseData } from '../types';

interface EventPulseCardProps {
  pulseData: EventPulseData;
}

export const EventPulseCard: React.FC<EventPulseCardProps> = ({ pulseData }) => {
  const [showExplanation, setShowExplanation] = useState(false);

  const getStatusBadge = () => {
    switch (pulseData.statusText) {
      case 'HEALTHY':
        return (
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-sm shadow-emerald-500/10">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>HEALTHY</span>
          </span>
        );
      case 'STABLE':
        return (
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 shadow-sm shadow-amber-500/10">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>STABLE</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30 shadow-sm shadow-rose-500/10">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>AT RISK</span>
          </span>
        );
    }
  };

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 p-6 border border-slate-800 shadow-xl shadow-slate-950/50">
      {/* Background Subtle Ambient Glow */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Header & Main Score */}
        <div className="flex items-start space-x-4">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-600/10 border border-cyan-500/30 text-cyan-400">
            <Activity className="w-8 h-8 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs uppercase tracking-widest font-extrabold text-slate-400">
                PRIMARY OPERATIONAL SIGNAL
              </span>
              <button
                onClick={() => setShowExplanation(!showExplanation)}
                className="text-slate-500 hover:text-cyan-400 transition-colors"
                title="What is Event Pulse?"
              >
                <Info className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-baseline space-x-3 mt-1">
              <h2 className="text-3xl font-extrabold text-slate-100 tracking-tight">EVENT PULSE</h2>
              <div className="flex items-baseline space-x-1">
                <span className="text-4xl font-black bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">
                  {pulseData.overallScore}
                </span>
                <span className="text-xl font-bold text-slate-500">/ 100</span>
              </div>
              <div>{getStatusBadge()}</div>
            </div>
            <p className="text-xs text-slate-400 mt-1 font-medium">
              Live operational health calculated across attendance, activity, submissions & judging.
            </p>
          </div>
        </div>

        {/* Toggle Explanation Button */}
        <button
          onClick={() => setShowExplanation(!showExplanation)}
          className="flex items-center space-x-1 text-xs font-semibold text-cyan-400 hover:text-cyan-300 self-start md:self-auto bg-cyan-950/40 px-3 py-1.5 rounded-lg border border-cyan-800/40"
        >
          <span>{showExplanation ? 'Hide Formula' : 'Explain Score'}</span>
          {showExplanation ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Expandable Explanation Tooltip Card */}
      {showExplanation && (
        <div className="mt-4 p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 leading-relaxed animate-fadeIn">
          <p className="font-semibold text-cyan-400 mb-1">How Event Pulse works:</p>
          <p className="text-slate-400">
            Event Pulse is a live operational health indicator calculated dynamically from four key event streams:
            <span className="text-slate-200"> Attendance Health (35%)</span>,
            <span className="text-slate-200"> Team Activity (20%)</span>,
            <span className="text-slate-200"> Submission Progress (25%)</span>, and
            <span className="text-slate-200"> Judging Progress (20%)</span>.
          </p>
        </div>
      )}

      {/* Breakdown Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        {/* Attendance Breakdown */}
        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition-colors">
          <div className="flex justify-between items-center text-xs font-semibold text-slate-400 mb-1">
            <span>Attendance (35%)</span>
            <span className="text-cyan-400 font-mono">+{pulseData.breakdown.attendance.contribution}</span>
          </div>
          <div className="flex justify-between items-baseline mb-2">
            <span className="text-lg font-bold text-slate-200">{pulseData.breakdown.attendance.percentage}%</span>
            <span className="text-[11px] text-slate-500 font-mono">{pulseData.breakdown.attendance.rawText}</span>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-teal-400 rounded-full transition-all duration-500"
              style={{ width: `${pulseData.breakdown.attendance.percentage}%` }}
            ></div>
          </div>
        </div>

        {/* Team Activity Breakdown */}
        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition-colors">
          <div className="flex justify-between items-center text-xs font-semibold text-slate-400 mb-1">
            <span>Team Activity (20%)</span>
            <span className="text-cyan-400 font-mono">+{pulseData.breakdown.teamActivity.contribution}</span>
          </div>
          <div className="flex justify-between items-baseline mb-2">
            <span className="text-lg font-bold text-slate-200">{pulseData.breakdown.teamActivity.percentage}%</span>
            <span className="text-[11px] text-slate-500 font-mono">{pulseData.breakdown.teamActivity.rawText}</span>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-indigo-400 rounded-full transition-all duration-500"
              style={{ width: `${pulseData.breakdown.teamActivity.percentage}%` }}
            ></div>
          </div>
        </div>

        {/* Submissions Breakdown */}
        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition-colors">
          <div className="flex justify-between items-center text-xs font-semibold text-slate-400 mb-1">
            <span>Submissions (25%)</span>
            <span className="text-cyan-400 font-mono">+{pulseData.breakdown.submissionProgress.contribution}</span>
          </div>
          <div className="flex justify-between items-baseline mb-2">
            <span className="text-lg font-bold text-slate-200">
              {pulseData.breakdown.submissionProgress.percentage}%
            </span>
            <span className="text-[11px] text-slate-500 font-mono">
              {pulseData.breakdown.submissionProgress.rawText}
            </span>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-pink-400 rounded-full transition-all duration-500"
              style={{ width: `${pulseData.breakdown.submissionProgress.percentage}%` }}
            ></div>
          </div>
        </div>

        {/* Judging Breakdown */}
        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition-colors">
          <div className="flex justify-between items-center text-xs font-semibold text-slate-400 mb-1">
            <span>Judging (20%)</span>
            <span className="text-cyan-400 font-mono">+{pulseData.breakdown.judgingProgress.contribution}</span>
          </div>
          <div className="flex justify-between items-baseline mb-2">
            <span className="text-lg font-bold text-slate-200 font-mono">
              {pulseData.breakdown.judgingProgress.percentage}%
            </span>
            <span className="text-[11px] text-slate-500 font-mono">
              {pulseData.breakdown.judgingProgress.rawText}
            </span>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
              style={{ width: `${pulseData.breakdown.judgingProgress.percentage}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};
