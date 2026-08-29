import React, { useState } from 'react';
import { QrCode, Search, CheckCircle2, AlertCircle, X, UserCheck } from 'lucide-react';
import { Participant } from '../types';

interface QRCheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
  participants: Participant[];
  onCheckInParticipant: (participantId: string) => void;
}

export const QRCheckInModal: React.FC<QRCheckInModalProps> = ({
  isOpen,
  onClose,
  participants,
  onCheckInParticipant,
}) => {
  const [searchInput, setSearchInput] = useState('');
  const [checkInResult, setCheckInResult] = useState<{
    success: boolean;
    message: string;
    participant?: Participant;
  } | null>(null);

  if (!isOpen) return null;

  const handleManualCheckIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchInput.trim()) return;

    const term = searchInput.trim().toLowerCase();
    const found = participants.find(
      (p) =>
        p.qrCodeId.toLowerCase() === term ||
        p.id.toLowerCase() === term ||
        p.email.toLowerCase() === term ||
        p.name.toLowerCase().includes(term)
    );

    if (!found) {
      setCheckInResult({
        success: false,
        message: `No participant found matching "${searchInput}". Check participant ID or QR code.`,
      });
      return;
    }

    if (found.checkedIn) {
      setCheckInResult({
        success: false,
        message: `Participant ${found.name} (${found.qrCodeId}) is ALREADY checked in!`,
        participant: found,
      });
      return;
    }

    onCheckInParticipant(found.id);
    setCheckInResult({
      success: true,
      message: `SUCCESS! ${found.name} (${found.college}) checked in successfully. Attendance updated.`,
      participant: { ...found, checkedIn: true },
    });
    setSearchInput('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">ATTENDEE CHECK-IN CENTER</h3>
              <p className="text-xs text-slate-400">Scan QR Code or enter Participant ID / Email</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* QR Camera Scanner Simulation Visual */}
        <div className="relative rounded-xl bg-slate-950 border border-slate-800 p-6 flex flex-col items-center justify-center text-center space-y-3 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 to-transparent pointer-events-none"></div>
          <div className="w-32 h-32 border-2 border-dashed border-cyan-400/60 rounded-xl flex items-center justify-center relative">
            <QrCode className="w-16 h-16 text-cyan-400 animate-pulse" />
            <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-cyan-400"></div>
            <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-cyan-400"></div>
            <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-cyan-400"></div>
            <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-cyan-400"></div>
          </div>
          <p className="text-xs text-slate-400 font-mono">Camera Scanner Active • Point QR Code Here</p>
        </div>

        {/* Manual ID Search Fallback Form */}
        <form onSubmit={handleManualCheckIn} className="space-y-3">
          <label className="text-xs font-semibold text-slate-300 block">
            Manual ID / Email Verification Fallback:
          </label>
          <div className="flex space-x-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Enter VEYRA-PART-005 or Email/Name..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition-colors shadow-md shadow-cyan-600/20"
            >
              Verify & Check In
            </button>
          </div>
        </form>

        {/* Feedback Alert */}
        {checkInResult && (
          <div
            className={`p-4 rounded-xl text-xs flex items-start space-x-3 ${
              checkInResult.success
                ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
                : 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
            }`}
          >
            {checkInResult.success ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            )}
            <div>
              <p className="font-bold">{checkInResult.message}</p>
              {checkInResult.participant && (
                <p className="text-[11px] opacity-80 mt-1">
                  Team: {checkInResult.participant.teamName || 'Unassigned'} • Role: {checkInResult.participant.role}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
