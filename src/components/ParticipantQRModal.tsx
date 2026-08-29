import React from 'react';
import { X, CheckCircle2 } from 'lucide-react';
import { Participant } from '../types';

interface ParticipantQRModalProps {
  isOpen: boolean;
  onClose: () => void;
  participant: Participant;
}

export const ParticipantQRModal: React.FC<ParticipantQRModalProps> = ({
  isOpen,
  onClose,
  participant,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn" role="dialog" aria-modal="true" aria-labelledby="qr-pass-title">
      <div className="veyra-card max-w-sm w-full text-center space-y-4 shadow-2xl">
        <div className="flex justify-between items-center border-b border-white/10 pb-3">
          <h2 id="qr-pass-title" className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            MY EVENT PASS
          </h2>
          <button
            onClick={onClose}
            aria-label="Close Event Pass modal"
            className="text-slate-400 hover:text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 rounded p-1"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        <div>
          <h3 className="text-lg font-bold text-white">{participant.name}</h3>
          <p className="text-xs text-slate-400">{participant.college}</p>
          <p className="text-xs font-semibold text-sky-400 mt-0.5">{participant.role}</p>
        </div>

        {/* QR Code Pass Container */}
        <div className="p-4 rounded-xl bg-[#182032] border border-white/10 flex flex-col items-center justify-center space-y-2">
          <img
            src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(
              participant.qrCodeId
            )}`}
            alt={`Digital QR Pass for ${participant.name}`}
            className="w-40 h-40 object-contain rounded-md"
          />
          <span className="text-xs font-mono font-bold text-white tracking-wider">
            {participant.qrCodeId}
          </span>
        </div>

        {/* Check-In Status */}
        <div>
          {participant.checkedIn ? (
            <div className="p-2 rounded-lg bg-emerald-950/60 text-emerald-400 text-xs font-semibold flex items-center justify-center space-x-1.5 border border-emerald-800/80">
              <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
              <span>Checked in at venue</span>
            </div>
          ) : (
            <div className="p-2 rounded-lg bg-amber-950/60 text-amber-400 text-xs font-semibold border border-amber-800/80">
              Pending Check-in at Desk
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
