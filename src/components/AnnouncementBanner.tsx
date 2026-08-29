import React from 'react';
import { Megaphone, AlertTriangle, AlertOctagon, Bell } from 'lucide-react';
import { Announcement } from '../types';

interface AnnouncementBannerProps {
  announcements: Announcement[];
}

export const AnnouncementBanner: React.FC<AnnouncementBannerProps> = ({ announcements }) => {
  if (!announcements || announcements.length === 0) return null;

  // Show top urgent or critical announcement, or latest announcement
  const topAnnouncement =
    announcements.find((a) => a.priority === 'CRITICAL') ||
    announcements.find((a) => a.priority === 'URGENT') ||
    announcements[0];

  if (!topAnnouncement) return null;

  let bgClass = 'bg-gradient-to-r from-blue-950/90 via-slate-900 to-indigo-950 border-blue-800/80 text-blue-200';
  let IconComponent = Megaphone;

  if (topAnnouncement.priority === 'CRITICAL') {
    bgClass = 'bg-gradient-to-r from-rose-950 via-slate-900 to-pink-950 border-rose-800 text-rose-200 animate-pulse';
    IconComponent = AlertOctagon;
  } else if (topAnnouncement.priority === 'URGENT') {
    bgClass = 'bg-gradient-to-r from-amber-950 via-slate-900 to-orange-950 border-amber-800 text-amber-200';
    IconComponent = AlertTriangle;
  }

  return (
    <div className={`w-full py-2.5 px-4 border-b text-xs ${bgClass} shadow-md backdrop-blur-md`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center space-x-2.5 overflow-hidden">
          <IconComponent className="w-4 h-4 shrink-0" />
          <span className="font-extrabold uppercase text-[10px] tracking-wider px-2 py-0.5 rounded bg-white/10 shrink-0">
            {topAnnouncement.priority} BROADCAST
          </span>
          <span className="font-bold shrink-0">{topAnnouncement.title}:</span>
          <span className="truncate opacity-90">{topAnnouncement.message}</span>
        </div>
        <span className="text-[10px] font-mono opacity-60 shrink-0 hidden sm:inline">
          {new Date(topAnnouncement.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  );
};
