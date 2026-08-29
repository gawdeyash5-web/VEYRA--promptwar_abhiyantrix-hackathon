import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { UserRole, Participant, Team, Submission, Evaluation, Announcement, OpsReport } from './types';
import { Navbar } from './components/Navbar';
import { AnnouncementBanner } from './components/AnnouncementBanner';
import { OrganizerDashboard } from './pages/OrganizerDashboard';
import { ParticipantDashboard } from './pages/ParticipantDashboard';
import { JudgeDashboard } from './pages/JudgeDashboard';
import {
  SEEDED_PARTICIPANTS,
  SEEDED_TEAMS,
  SEEDED_SUBMISSIONS,
  SEEDED_EVALUATIONS,
  SEEDED_ANNOUNCEMENTS,
  SEEDED_OPS_REPORTS,
  seedDemoDataToFirestore,
} from './services/demoData';
import { calculateEventPulse } from './utils/eventPulse';
import { db, collection, onSnapshot, doc, setDoc, updateDoc } from './services/firebase';

export const App: React.FC = () => {
  const [currentRole, setCurrentRole] = useState<UserRole>('organizer');

  // Real-time Firestore state with fallbacks
  const [participants, setParticipants] = useState<Participant[]>(SEEDED_PARTICIPANTS);
  const [teams, setTeams] = useState<Team[]>(SEEDED_TEAMS);
  const [submissions, setSubmissions] = useState<Submission[]>(SEEDED_SUBMISSIONS);
  const [evaluations, setEvaluations] = useState<Evaluation[]>(SEEDED_EVALUATIONS);
  const [announcements, setAnnouncements] = useState<Announcement[]>(SEEDED_ANNOUNCEMENTS);
  const [opsReports, setOpsReports] = useState<OpsReport[]>(SEEDED_OPS_REPORTS);
  const [blindJudgingEnabled, setBlindJudgingEnabled] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);

  // Firestore Realtime Listeners
  useEffect(() => {
    const unsubParticipants = onSnapshot(
      collection(db, 'participants'),
      (snapshot) => {
        if (!snapshot.empty) {
          const list: Participant[] = [];
          snapshot.forEach((doc) => list.push(doc.data() as Participant));
          setParticipants(list);
        }
      },
      (err) => console.warn('Firestore participants listener:', err)
    );

    const unsubTeams = onSnapshot(
      collection(db, 'teams'),
      (snapshot) => {
        if (!snapshot.empty) {
          const list: Team[] = [];
          snapshot.forEach((doc) => list.push(doc.data() as Team));
          setTeams(list);
        }
      },
      (err) => console.warn('Firestore teams listener:', err)
    );

    const unsubSubmissions = onSnapshot(
      collection(db, 'submissions'),
      (snapshot) => {
        if (!snapshot.empty) {
          const list: Submission[] = [];
          snapshot.forEach((doc) => list.push(doc.data() as Submission));
          setSubmissions(list);
        }
      },
      (err) => console.warn('Firestore submissions listener:', err)
    );

    const unsubEvaluations = onSnapshot(
      collection(db, 'evaluations'),
      (snapshot) => {
        if (!snapshot.empty) {
          const list: Evaluation[] = [];
          snapshot.forEach((doc) => list.push(doc.data() as Evaluation));
          setEvaluations(list);
        }
      },
      (err) => console.warn('Firestore evaluations listener:', err)
    );

    const unsubAnnouncements = onSnapshot(
      collection(db, 'announcements'),
      (snapshot) => {
        if (!snapshot.empty) {
          const list: Announcement[] = [];
          snapshot.forEach((doc) => list.push(doc.data() as Announcement));
          setAnnouncements(list);
        }
      },
      (err) => console.warn('Firestore announcements listener:', err)
    );

    const unsubOps = onSnapshot(
      collection(db, 'ops_reports'),
      (snapshot) => {
        if (!snapshot.empty) {
          const list: OpsReport[] = [];
          snapshot.forEach((doc) => list.push(doc.data() as OpsReport));
          setOpsReports(list);
        }
      },
      (err) => console.warn('Firestore ops listener:', err)
    );

    return () => {
      unsubParticipants();
      unsubTeams();
      unsubSubmissions();
      unsubEvaluations();
      unsubAnnouncements();
      unsubOps();
    };
  }, []);

  // Handlers
  const handleSeedDemoData = async () => {
    setIsSeeding(true);
    try {
      await seedDemoDataToFirestore();
      setParticipants(SEEDED_PARTICIPANTS);
      setTeams(SEEDED_TEAMS);
      setSubmissions(SEEDED_SUBMISSIONS);
      setEvaluations(SEEDED_EVALUATIONS);
      setAnnouncements(SEEDED_ANNOUNCEMENTS);
      setOpsReports(SEEDED_OPS_REPORTS);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSeeding(false);
    }
  };

  const handleCheckInParticipant = async (participantId: string) => {
    const updated = participants.map((p) =>
      p.id === participantId
        ? { ...p, checkedIn: true, checkedInAt: new Date().toISOString() }
        : p
    );
    setParticipants(updated);

    try {
      const target = updated.find((p) => p.id === participantId);
      if (target) {
        await setDoc(doc(db, 'participants', participantId), target, { merge: true });
      }
    } catch (err) {
      console.warn('Firestore check-in write:', err);
    }
  };

  const handleAddAnnouncement = async (newAnn: Omit<Announcement, 'id' | 'createdAt'>) => {
    const ann: Announcement = {
      ...newAnn,
      id: `ann-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setAnnouncements((prev) => [ann, ...prev]);

    try {
      await setDoc(doc(db, 'announcements', ann.id), ann);
    } catch (err) {
      console.warn('Firestore announcement write:', err);
    }
  };

  const handleAddOpsReport = async (newReport: Omit<OpsReport, 'id' | 'createdAt'>) => {
    const report: OpsReport = {
      ...newReport,
      id: `ops-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setOpsReports((prev) => [report, ...prev]);

    try {
      await setDoc(doc(db, 'ops_reports', report.id), report);
    } catch (err) {
      console.warn('Firestore ops write:', err);
    }
  };

  const handleUpdateReportStatus = async (reportId: string, status: OpsReport['status']) => {
    const updated = opsReports.map((r) =>
      r.id === reportId ? { ...r, status, resolvedAt: status === 'RESOLVED' ? new Date().toISOString() : undefined } : r
    );
    setOpsReports(updated);

    try {
      const target = updated.find((r) => r.id === reportId);
      if (target) {
        await setDoc(doc(db, 'ops_reports', reportId), target, { merge: true });
      }
    } catch (err) {
      console.warn('Firestore ops status update:', err);
    }
  };

  const handleAddSubmission = async (newSub: Omit<Submission, 'id' | 'submittedAt' | 'updatedAt'>) => {
    const sub: Submission = {
      ...newSub,
      id: `sub-${Date.now()}`,
      submittedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setSubmissions((prev) => [sub, ...prev]);

    try {
      await setDoc(doc(db, 'submissions', sub.id), sub);
    } catch (err) {
      console.warn('Firestore submission write:', err);
    }
  };

  const handleAddEvaluation = async (newEval: Omit<Evaluation, 'id'>) => {
    const ev: Evaluation = {
      ...newEval,
      id: `eval-${Date.now()}`,
    };
    setEvaluations((prev) => [ev, ...prev]);

    try {
      await setDoc(doc(db, 'evaluations', ev.id), ev);
    } catch (err) {
      console.warn('Firestore evaluation write:', err);
    }
  };

  const currentParticipant = participants[0] || SEEDED_PARTICIPANTS[0];
  const pulseData = calculateEventPulse(participants, teams, submissions, evaluations, 15);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500 selection:text-slate-950">
        <AnnouncementBanner announcements={announcements} />
        <Navbar
          currentRole={currentRole}
          onRoleChange={setCurrentRole}
          onSeedDemoData={handleSeedDemoData}
          isSeeding={isSeeding}
          eventPulseScore={pulseData.overallScore}
        />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          {currentRole === 'organizer' && (
            <OrganizerDashboard
              participants={participants}
              teams={teams}
              submissions={submissions}
              evaluations={evaluations}
              announcements={announcements}
              opsReports={opsReports}
              blindJudgingEnabled={blindJudgingEnabled}
              onToggleBlindJudging={setBlindJudgingEnabled}
              onCheckInParticipant={handleCheckInParticipant}
              onAddAnnouncement={handleAddAnnouncement}
              onAddReport={handleAddOpsReport}
              onUpdateReportStatus={handleUpdateReportStatus}
            />
          )}

          {currentRole === 'participant' && (
            <ParticipantDashboard
              currentParticipant={currentParticipant}
              allParticipants={participants}
              teams={teams}
              submissions={submissions}
              evaluations={evaluations}
              announcements={announcements}
              opsReports={opsReports}
              onAddSubmission={handleAddSubmission}
              onAddReport={handleAddOpsReport}
              onUpdateReportStatus={handleUpdateReportStatus}
              onSendTeamInvite={(id, name) => console.log('Invite sent to:', name)}
            />
          )}

          {currentRole === 'judge' && (
            <JudgeDashboard
              teams={teams}
              submissions={submissions}
              evaluations={evaluations}
              blindJudgingEnabled={blindJudgingEnabled}
              onAddEvaluation={handleAddEvaluation}
            />
          )}
        </main>
      </div>
    </BrowserRouter>
  );
};
