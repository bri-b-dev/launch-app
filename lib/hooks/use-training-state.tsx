import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useClubs } from './use-sqlite-training';

interface TrainingStateValue {
  activeClubId: string;
  setActiveClubId: (clubId: string) => void;
}

const TrainingStateContext = createContext<TrainingStateValue | null>(null);

export function TrainingStateProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const { rows: clubs } = useClubs();
  const [activeClubId, setActiveClubId] = useState('7i');

  useEffect(() => {
    if (clubs.length === 0) {
      return;
    }
    const hasActiveClub = clubs.some((club) => club.id === activeClubId);
    if (!hasActiveClub) {
      setActiveClubId(clubs[0].id);
    }
  }, [activeClubId, clubs]);

  const value = useMemo(
    () => ({
      activeClubId,
      setActiveClubId,
    }),
    [activeClubId],
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
