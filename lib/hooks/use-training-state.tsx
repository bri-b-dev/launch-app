import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useClubs } from './use-sqlite-training';

interface TrainingStateValue {
  activeClubId: string;
  setActiveClubId: (clubId: string) => void;
  activeSessionId: string | null;
  startSession: (clubId: string) => void;
  endSession: () => void;
}

const TrainingStateContext = createContext<TrainingStateValue | null>(null);

function newSessionId(clubId: string): string {
  return `session-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}-${clubId}`;
}

export function TrainingStateProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const { rows: clubs } = useClubs();
  const [activeClubId, setActiveClubId] = useState('7i');
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  useEffect(() => {
    if (clubs.length === 0) {
      return;
    }
    const hasActiveClub = clubs.some((club) => club.id === activeClubId);
    if (!hasActiveClub) {
      setActiveClubId(clubs[0].id);
    }
  }, [activeClubId, clubs]);

  const startSession = useCallback((clubId: string) => {
    setActiveClubId(clubId);
    setActiveSessionId(newSessionId(clubId));
  }, []);

  const endSession = useCallback(() => {
    setActiveSessionId(null);
  }, []);

  const value = useMemo(
    () => ({
      activeClubId,
      setActiveClubId,
      activeSessionId,
      startSession,
      endSession,
    }),
    [activeClubId, activeSessionId, startSession, endSession],
  );

  return (
    <TrainingStateContext.Provider value={value}>
      {children}
    </TrainingStateContext.Provider>
  );
}

export function useTrainingState() {
  const context = useContext(TrainingStateContext);
  if (context == null) {
    throw new Error('useTrainingState must be used inside TrainingStateProvider');
  }
  return context;
}
