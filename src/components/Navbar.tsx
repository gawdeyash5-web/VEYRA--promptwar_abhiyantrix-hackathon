import React from 'react';
import { Users, Gavel, Cpu, Database, Activity } from 'lucide-react';
import { UserRole } from '../types';

interface NavbarProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  onSeedDemoData: () => void;
  isSeeding: boolean;
  eventPulseScore?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  onRoleChange,
  onSeedDemoData,
  isSeeding,
  eventPulseScore = 82,
}) => {
  return (
    <header className="sticky top-0 z-50 bg-[#0b0f17]/90 backdrop-blur-md border-b border-white/10 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Left: Brand Logo & Live Badge */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <span className="font-bold text-lg tracking-tight text-white">VEYRA</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-950/60 text-sky-400 border border-sky-800/60 font-mono">
                ABHIYANTRIX 2026
              </span>
            </div>
            <div className="hidden md:flex items-center space-x-1.5 text-xs text-slate-400 pl-2 border-l border-white/10">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true"></span>
              <span className="font-semibold text-slate-300">LIVE OPERATIONAL VIEW</span>
            </div>
          </div>

          {/* Center: Role Switcher Navigation Tabs */}
          <nav className="flex items-center bg-[#141b2d] p-1 rounded-lg border border-white/10" aria-label="User role navigation">
            <button
              onClick={() => onRoleChange('participant')}
              aria-pressed={currentRole === 'participant'}
              aria-label="Switch to Participant Dashboard view"
              className={`flex items-center space-x-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all ${
                currentRole === 'participant'
                  ? 'bg-sky-600 text-white shadow-sm font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Users className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Participant</span>
            </button>

            <button
              onClick={() => onRoleChange('judge')}
              aria-pressed={currentRole === 'judge'}
              aria-label="Switch to Judge Scorecard portal view"
              className={`flex items-center space-x-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all ${
                currentRole === 'judge'
                  ? 'bg-sky-600 text-white shadow-sm font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Gavel className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Judge</span>
            </button>

            <button
              onClick={() => onRoleChange('organizer')}
              aria-pressed={currentRole === 'organizer'}
              aria-label="Switch to Organizer Command Center view"
              className={`flex items-center space-x-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all ${
                currentRole === 'organizer'
                  ? 'bg-sky-600 text-white shadow-sm font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Organizer</span>
            </button>
          </nav>

          {/* Right: Event Pulse Pill & Seed Demo Data */}
          <div className="flex items-center space-x-2.5">
            {/* Event Pulse Pill */}
            <div className="hidden lg:flex items-center space-x-1.5 bg-[#141b2d] px-2.5 py-1 rounded-md text-xs border border-white/10" aria-label={`Current Event Pulse Score: ${eventPulseScore} out of 100`}>
              <Activity className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
              <span className="font-bold text-white font-mono">{eventPulseScore}</span>
              <span className="text-[10px] text-slate-400 font-mono uppercase">PULSE</span>
            </div>

            {/* Seed Demo Data Button */}
            <button
              onClick={onSeedDemoData}
              disabled={isSeeding}
              aria-label="Seed demo data into Cloud Firestore"
              className="flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs text-slate-300 bg-[#141b2d] hover:bg-slate-800 border border-white/10 transition-all disabled:opacity-50"
              title="Seed demo data into Firestore"
            >
              <Database className={`w-3.5 h-3.5 ${isSeeding ? 'animate-spin text-sky-400' : ''}`} aria-hidden="true" />
              <span className="hidden sm:inline text-[11px] font-medium">{isSeeding ? 'Seeding...' : 'Seed Data'}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
