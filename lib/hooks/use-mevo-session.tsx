import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useMevo } from '@bri-b-dev/gspro-connect-mevoplus';
import type { ConnectionState, ShotData } from '../types/shot';
import { useTrainingState } from './use-training-state';
import { useShotCapture } from './use-sqlite-training';

export interface MevoSessionValue {
  state: ConnectionState;
  lastShot: ShotData | null;
  shotCount: number;
  error: string | null;
  connect: () => Promise<void>;
  arm: () => Promise<void>;
  disconnect: () => Promise<void>;
  isMock: boolean;
}

const MOCK_MEVO_ENABLED = process.env.EXPO_PUBLIC_MOCK_MEVO === 'true';

const MevoSessionContext = createContext<MevoSessionValue | null>(null);

const SHOT_INTERVAL_MS = 3500;
const FIRST_SHOT_DELAY_MS = 900;

interface MockClubProfile {
  ballSpeedMph: [number, number];
  clubSpeedMph: [number, number];
  verticalLaunchAngle: [number, number];
  horizontalLaunchAngle: [number, number];
  totalSpin: [number, number];
  spinAxis: [number, number];
  carryDistanceYards: [number, number];
  angleOfAttack: [number, number];
  clubPath: [number, number];
  faceToTarget: [number, number];
  dynamicLoft: [number, number];
  spinLoft: [number, number];
}

const MOCK_CLUB_PROFILES: Record<string, MockClubProfile> = {
  '7i': {
    ballSpeedMph: [108, 116],
    clubSpeedMph: [74, 78],
    verticalLaunchAngle: [13.2, 15.6],
    horizontalLaunchAngle: [-1.2, 1.8],
    totalSpin: [4200, 5100],
    spinAxis: [-10.5, 2.5],
    carryDistanceYards: [170, 184],
    angleOfAttack: [-4.8, -2.3],
    clubPath: [1.0, 4.5],
    faceToTarget: [-1.3, 0.7],
    dynamicLoft: [20, 24],
    spinLoft: [24, 28],
  },
  '7w': {
    ballSpeedMph: [119, 129],
    clubSpeedMph: [82, 86],
    verticalLaunchAngle: [10.5, 13.8],
    horizontalLaunchAngle: [-1.8, 2.6],
    totalSpin: [3600, 4400],
    spinAxis: [-6.5, 5.0],
    carryDistanceYards: [184, 200],
    angleOfAttack: [-2.5, -0.8],
    clubPath: [0.5, 3.5],
    faceToTarget: [-1.8, 1.4],
    dynamicLoft: [16, 20],
    spinLoft: [17, 21],
  },
  '50w': {
    ballSpeedMph: [77, 84],
    clubSpeedMph: [58, 62],
    verticalLaunchAngle: [24.5, 28.5],
    horizontalLaunchAngle: [-1.0, 1.2],
    totalSpin: [6800, 7800],
    spinAxis: [-3.0, 2.0],
    carryDistanceYards: [86, 96],
    angleOfAttack: [-6.6, -4.6],
    clubPath: [0.2, 2.0],
    faceToTarget: [-0.8, 0.8],
    dynamicLoft: [35, 41],
    spinLoft: [40, 47],
  },
  default: {
    ballSpeedMph: [95, 110],
    clubSpeedMph: [68, 78],
    verticalLaunchAngle: [12, 18],
    horizontalLaunchAngle: [-1.5, 1.5],
    totalSpin: [3800, 5200],
    spinAxis: [-6.0, 4.0],
    carryDistanceYards: [150, 175],
    angleOfAttack: [-4.5, -1.5],
    clubPath: [0.5, 3.0],
    faceToTarget: [-1.0, 1.0],
    dynamicLoft: [20, 28],
    spinLoft: [24, 32],
  },
};

function randomBetween([min, max]: [number, number]): number {
  return min + Math.random() * (max - min);
}

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

function buildMockShot(activeClubId: string): ShotData {
  const profile = MOCK_CLUB_PROFILES[activeClubId] ?? MOCK_CLUB_PROFILES.default;
  const faceToTarget = round1(randomBetween(profile.faceToTarget));
  const spinAxis = round1(randomBetween(profile.spinAxis));

  return {
    ballSpeedMph: round1(randomBetween(profile.ballSpeedMph)),
    verticalLaunchAngle: round1(randomBetween(profile.verticalLaunchAngle)),
    horizontalLaunchAngle: round1(randomBetween(profile.horizontalLaunchAngle)),
    totalSpin: Math.round(randomBetween(profile.totalSpin)),
    spinAxis,
    carryDistanceYards: round1(randomBetween(profile.carryDistanceYards)),
    isEstimatedSpin: false,
    hasClubData: true,
    clubSpeedMph: round1(randomBetween(profile.clubSpeedMph)),
    angleOfAttack: round1(randomBetween(profile.angleOfAttack)),
    clubPath: round1(randomBetween(profile.clubPath)),
    faceToTarget,
    dynamicLoft: round1(randomBetween(profile.dynamicLoft)),
    spinLoft: round1(randomBetween(profile.spinLoft)),
    hasFaceImpact: false,
    faceImpactX: 0,
    faceImpactY: 0,
  };
}

function useMockMevo(activeClubId: string): MevoSessionValue {
  const [state, setState] = useState<ConnectionState>('disconnected');
  const [lastShot, setLastShot] = useState<ShotData | null>(null);
  const [shotCount, setShotCount] = useState(0);
  const [error] = useState<string | null>(null);

  useEffect(() => {
    if (state !== 'armed') {
      return;
    }

    const emitShot = () => {
      setLastShot(buildMockShot(activeClubId));
      setShotCount((current) => current + 1);
    };

    const initialTimeout = setTimeout(emitShot, FIRST_SHOT_DELAY_MS);
    const intervalId = setInterval(emitShot, SHOT_INTERVAL_MS);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(intervalId);
    };
  }, [activeClubId, state]);

  return useMemo(
    () => ({
      state,
      lastShot,
      shotCount,
      error,
      connect: async () => {
        setState('connecting');
        await new Promise((resolve) => setTimeout(resolve, 450));
        setState('connected');
      },
      arm: async () => {
        if (state === 'disconnected') {
          throw new Error('Mock Mevo+ ist noch nicht verbunden.');
        }
        setState('armed');
      },
      disconnect: async () => {
        setState('disconnected');
      },
      isMock: true,
    }),
    [error, lastShot, shotCount, state],
  );
}

export function MevoSessionProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  if (MOCK_MEVO_ENABLED) {
    return <MockMevoSessionProvider>{children}</MockMevoSessionProvider>;
  }
  return <LiveMevoSessionProvider>{children}</LiveMevoSessionProvider>;
}

function LiveMevoSessionProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const { activeClubId } = useTrainingState();
  const liveMevo = useMevo();
  const mevo = {
    state: liveMevo.state,
    lastShot: liveMevo.lastShot,
    shotCount: liveMevo.shotCount,
    error: liveMevo.error,
    connect: liveMevo.connect,
    arm: liveMevo.arm,
    disconnect: liveMevo.disconnect,
    isMock: false,
  } satisfies MevoSessionValue;
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

function MockMevoSessionProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const { activeClubId } = useTrainingState();
  const mevo = useMockMevo(activeClubId);
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
