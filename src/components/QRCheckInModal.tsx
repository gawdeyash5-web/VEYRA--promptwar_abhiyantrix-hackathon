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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn" role="dialog" aria-modal="true" aria-labelledby="checkin-modal-title">
      <div className="veyra-card w-full max-w-md shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center space-x-2">
            <UserCheck className="w-4 h-4 text-sky-400" aria-hidden="true" />
            <h2 id="checkin-modal-title" className="text-base font-bold text-white">ATTENDEE CHECK-IN CENTER</h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close Check-in modal"
            className="text-slate-400 hover:text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 rounded p-1"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        {/* QR Camera Visual */}
        <div className="veyra-subcard flex flex-col items-center justify-center text-center space-y-2 py-4">
          <div className="w-24 h-24 border-2 border-dashed border-sky-400 rounded-lg flex items-center justify-center relative">
            <QrCode className="w-12 h-12 text-sky-400 animate-pulse" aria-hidden="true" />
          </div>
          <p className="text-[11px] text-slate-400 font-mono">Scanner Active • Point QR Code Here</p>
        </div>

        {/* Manual Search Form */}
        <form onSubmit={handleManualCheckIn} className="space-y-2 text-xs">
          <label htmlFor="manual-checkin-input" className="font-semibold text-slate-300 block">
            Manual Verification (ID, Name, or Email):
          </label>
          <div className="flex space-x-2">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" aria-hidden="true" />
              <input
                id="manual-checkin-input"
                type="text"
                placeholder="VEYRA-PART-005 or Email/Name..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="veyra-input pl-8 w-full"
                required
              />
            </div>
            <button type="submit" className="veyra-btn-primary">
              Verify & Check In
            </button>
          </div>
        </form>

        {/* Feedback Alert */}
        {checkInResult && (
          <div
            role="status"
            aria-live="polite"
            className={`p-3 rounded-lg text-xs flex items-start space-x-2 ${
              checkInResult.success
                ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/80'
                : 'bg-rose-950/60 text-rose-400 border border-rose-800/80'
            }`}
          >
            {checkInResult.success ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
            )}
            <div>
              <p className="font-bold">{checkInResult.message}</p>
              {checkInResult.participant && (
                <p className="text-[11px] opacity-90 mt-0.5">
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
