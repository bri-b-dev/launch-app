import React, { createContext, useContext, useEffect, useMemo, useRef } from 'react';
import { useMevo } from '@bri-b-dev/gspro-connect-mevoplus';
import { useTrainingState } from './use-training-state';
import { useShotCapture } from './use-sqlite-training';

type MevoSessionValue = ReturnType<typeof useMevo>;

const MevoSessionContext = createContext<MevoSessionValue | null>(null);

export function MevoSessionProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const mevo = useMevo();
  const { activeClubId } = useTrainingState();
  const { persistShot } = useShotCapture();
  const lastPersistedSignature = useRef<string | null>(null);

  useEffect(() => {
    if (mevo.lastShot == null) {
      return;
    }

    const signature = JSON.stringify({
      clubId: activeClubId,
      carry: mevo.lastShot.carryDistanceYards,
      spinAxis: mevo.lastShot.spinAxis,
      spin: mevo.lastShot.totalSpin,
      ballSpeed: mevo.lastShot.ballSpeedMph,
      clubSpeed: mevo.lastShot.clubSpeedMph ?? null,
    });

    if (lastPersistedSignature.current === signature) {
      return;
    }

    lastPersistedSignature.current = signature;
    persistShot(activeClubId, mevo.lastShot).catch((err) => {
      console.error('[Mevo] Shot-Persistenz fehlgeschlagen:', err);
      lastPersistedSignature.current = null;
    });
  }, [activeClubId, mevo.lastShot, persistShot]);

  const value = useMemo(() => mevo, [mevo]);

  return (
    <MevoSessionContext.Provider value={value}>
      {children}
    </MevoSessionContext.Provider>
  );
}

export function useMevoSession() {
  const context = useContext(MevoSessionContext);
  if (context == null) {
    throw new Error('useMevoSession must be used inside MevoSessionProvider');
  }
  return context;
}
