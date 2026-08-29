import React from 'react';
import { QrCode, X, CheckCircle2, Shield } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-6 text-center">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <Shield className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-bold text-slate-200">DIGITAL EVENT PASSPORT</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div>
          <h3 className="text-lg font-bold text-slate-100">{participant.name}</h3>
          <p className="text-xs text-slate-400">{participant.college}</p>
          <p className="text-[11px] font-mono text-cyan-400 mt-0.5">{participant.role}</p>
        </div>

        {/* QR Code Container */}
        <div className="p-6 rounded-2xl bg-white flex flex-col items-center justify-center space-y-2 shadow-inner">
          <img
            src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(
              participant.qrCodeId
            )}`}
            alt="Participant QR Code"
            className="w-40 h-40 object-contain"
          />
          <span className="text-xs font-mono font-bold text-slate-900 tracking-wider">
            {participant.qrCodeId}
          </span>
        </div>

        {/* Check-In Status */}
        <div>
          {participant.checkedIn ? (
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center justify-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>OFFICIALLY CHECKED IN</span>
            </div>
          ) : (
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold">
              PENDING CHECK-IN AT VENUE DESK
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
