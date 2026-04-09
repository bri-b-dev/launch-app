import React, { createContext, useContext, useMemo, useState } from 'react';
import { CLUBS, getClubById } from '../mock/training';

interface TrainingStateValue {
  activeClubId: string;
  setActiveClubId: (clubId: string) => void;
}

const TrainingStateContext = createContext<TrainingStateValue | null>(null);

export function TrainingStateProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const [activeClubId, setActiveClubId] = useState(CLUBS[0]?.id ?? '7i');

  const value = useMemo(
    () => ({
      activeClubId,
      setActiveClubId: (clubId: string) => {
        if (getClubById(clubId) != null) {
          setActiveClubId(clubId);
        }
      },
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

export function useActiveClub() {
  const { activeClubId } = useTrainingState();
  return getClubById(activeClubId) ?? CLUBS[0];
}
