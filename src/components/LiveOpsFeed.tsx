import React, { useState } from 'react';
import { AlertOctagon, Send, CheckCircle2, Clock, Wrench, Sparkles, Filter } from 'lucide-react';
import { OpsReport, UserRole } from '../types';
import { parseOpsReportWithAI } from '../services/api';

interface LiveOpsFeedProps {
  reports: OpsReport[];
  currentRole: UserRole;
  onAddReport: (newReport: Omit<OpsReport, 'id' | 'createdAt'>) => void;
  onUpdateReportStatus: (reportId: string, status: OpsReport['status']) => void;
}

export const LiveOpsFeed: React.FC<LiveOpsFeedProps> = ({
  reports,
  currentRole,
  onAddReport,
  onUpdateReportStatus,
}) => {
  const [rawInput, setRawInput] = useState('');
  const [locationInput, setLocationInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('ALL');

  const handleSubmitIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rawInput.trim()) return;

    setIsSubmitting(true);
    try {
      const parsed = await parseOpsReportWithAI(rawInput, 'Participant');
      onAddReport({
        reporterId: 'part-user',
        reporterName: 'Participant',
        rawText: rawInput,
        category: parsed.category || 'Venue',
        severity: parsed.severity || 'Medium',
        summary: parsed.summary || rawInput,
        recommendedAction: parsed.recommendedAction || 'Inspect venue issue',
        status: 'OPEN',
        location: locationInput || 'Main Hall',
      });
      setRawInput('');
      setLocationInput('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredReports = reports.filter((r) => filterCategory === 'ALL' || r.category === filterCategory);

  return (
    <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-6 shadow-xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <AlertOctagon className="w-5 h-5 text-rose-400 animate-pulse" />
            <h3 className="text-lg font-bold text-slate-100">LIVE VENUE OPS FEED</h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/30">
              GEMINI CLASSIFIED
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time participant incident reporting converted into structured operational telemetry via Gemini API.
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex items-center space-x-2 text-xs">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-slate-300 focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">All Categories</option>
            <option value="Wi-Fi">Wi-Fi</option>
            <option value="Power">Power</option>
            <option value="Facility">Facility</option>
            <option value="Catering">Catering</option>
          </select>
        </div>
      </div>

      {/* Participant Issue Form */}
      <form onSubmit={handleSubmitIssue} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-300">Report Venue Issue</span>
          <span className="text-[11px] text-cyan-400 flex items-center space-x-1 font-mono">
            <Sparkles className="w-3 h-3" />
            <span>Gemini Auto-Structure</span>
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input
            type="text"
            placeholder="Describe issue (e.g. Wi-Fi down in Hall B...)"
            value={rawInput}
            onChange={(e) => setRawInput(e.target.value)}
            className="sm:col-span-2 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            required
          />
          <input
            type="text"
            placeholder="Location (e.g. Room 204)"
            value={locationInput}
            onChange={(e) => setLocationInput(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting || !rawInput.trim()}
            className="flex items-center space-x-1.5 px-4 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white transition-all shadow-md shadow-rose-600/20 disabled:opacity-50"
          >
            <Send className="w-3 h-3" />
            <span>{isSubmitting ? 'Parsing...' : 'Submit Incident Report'}</span>
          </button>
        </div>
      </form>

      {/* Feed List */}
      <div className="space-y-3">
        {filteredReports.length === 0 ? (
          <div className="text-center py-6 text-xs text-slate-500">No active operational reports found.</div>
        ) : (
          filteredReports.map((report) => {
            let sevBadge = 'bg-slate-800 text-slate-300';
            if (report.severity === 'Critical') sevBadge = 'bg-rose-500/20 text-rose-400 border border-rose-500/40';
            if (report.severity === 'High') sevBadge = 'bg-amber-500/20 text-amber-400 border border-amber-500/40';

            return (
              <div
                key={report.id}
                className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${sevBadge}`}>
                      {report.severity}
                    </span>
                    <span className="text-xs font-bold text-slate-200">{report.category}</span>
                    <span className="text-slate-500">•</span>
                    <span className="text-xs text-slate-400">{report.location || 'Venue'}</span>
                  </div>

                  <p className="text-xs font-semibold text-slate-200">{report.summary}</p>
                  <p className="text-[11px] text-slate-400 italic">Recommended: "{report.recommendedAction}"</p>
                </div>

                {/* Status & Action Controls */}
                <div className="flex items-center space-x-2 shrink-0">
                  <span className="text-[11px] font-mono text-slate-400 px-2 py-1 rounded bg-slate-900 border border-slate-800">
                    {report.status}
                  </span>

                  {currentRole === 'organizer' && (
                    <div className="flex items-center space-x-1">
                      {report.status === 'OPEN' && (
                        <button
                          onClick={() => onUpdateReportStatus(report.id, 'ACKNOWLEDGED')}
                          className="px-2.5 py-1 rounded text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
                        >
                          Acknowledge
                        </button>
                      )}
                      {report.status !== 'RESOLVED' && (
                        <button
                          onClick={() => onUpdateReportStatus(report.id, 'RESOLVED')}
                          className="px-2.5 py-1 rounded text-xs font-semibold bg-emerald-600/80 hover:bg-emerald-500 text-white shadow-sm"
                        >
                          Resolve
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
