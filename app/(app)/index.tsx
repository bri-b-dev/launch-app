import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  StatusBar,
  Animated,
  Dimensions,
  Platform,
  LayoutChangeEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import type { Href } from 'expo-router';
import type { ConnectionState } from '../../lib/types/shot';
import { useTrainingState } from '../../lib/hooks/use-training-state';
import { type DbClub, useClubs, useClubShots, useMargins } from '../../lib/hooks/use-sqlite-training';
import { useMevoSession } from '../../lib/hooks/use-mevo-session';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ---------------------------------------------------------------------------
// Design tokens
// ---------------------------------------------------------------------------

const C = {
  bg: '#080C10',
  surface: '#0F1519',
  card: '#111920',
  border: '#1A2632',
  borderLight: '#243040',
  gold: '#C8A84B',
  goldDim: '#5C4D22',
  goldGlow: 'rgba(200,168,75,0.12)',
  teal: '#3CB8AF',
  draw: '#4A8FD4',
  fade: '#E07840',
  neutral: '#8899AA',
  text: '#EDF1F5',
  textSecondary: '#6B8096',
  textMuted: '#2D4055',
  warning: '#F0A030',
  success: '#3AC870',
  danger: '#E04545',
} as const;

const FONT = {
  mono: Platform.OS === 'ios' ? 'Menlo-Regular' : 'monospace',
  body: Platform.OS === 'ios' ? 'AvenirNext-Regular' : 'sans-serif',
  demi: Platform.OS === 'ios' ? 'AvenirNext-DemiBold' : 'sans-serif-medium',
} as const;

const CONNECTOR_SUPPORTED = Platform.OS !== 'web';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function axisToNorm(axis: number): number {
  return Math.max(0, Math.min(1, (axis + 45) / 90));
}

const STATE_COLOR: Record<ConnectionState, string> = {
  disconnected: C.danger,
  connecting: C.textSecondary,
  connected: C.success,
  armed: C.warning,
};

const STATE_LABEL: Record<ConnectionState, string> = {
  disconnected: 'GETRENNT',
  connecting: 'VERBINDE…',
  connected: 'VERBUNDEN',
  armed: 'BEREIT',
};

interface TrainingPriority {
  label: string;
  value: string;
  tone: 'gold' | 'draw' | 'teal';
}

const BASE_TRAINING_PRIORITIES: TrainingPriority[] = [
  { label: 'Swing-Fokus', value: 'Early Extension', tone: 'gold' as const },
  { label: 'Bias', value: 'Draw-orientiert', tone: 'draw' as const },
  { label: 'Aktiver Klub', value: '7-Eisen', tone: 'teal' as const },
];

const WORK_AREAS = [
  { title: 'Session', body: 'Live-Metriken, Shot Rail und sofortiges Feedback.', badge: 'Jetzt' },
  { title: 'History', body: 'Blocks, Durchschnitte und wiederkehrende Muster lesen.', badge: 'Nächster Screen' },
  { title: 'Equipment', body: 'Korridore und Club-Zuordnung pro Schlag vorbereiten.', badge: 'Setup' },
];

// ---------------------------------------------------------------------------
// Dashboard screen
// ---------------------------------------------------------------------------

export default function DashboardScreen() {
  const {
    state,
    lastShot,
    shotCount,
    error,
    connect,
    arm,
    disconnect,
    isMock,
  } = useMevoSession();
  const { activeClubId, setActiveClubId, activeSessionId, startSession, endSession } = useTrainingState();
  const { rows: clubs } = useClubs();
  const activeClub = clubs.find((club) => club.id === activeClubId) ?? clubs[0] ?? null;
  const { rows: targets } = useMargins(activeClub?.id ?? null);
  const { rows: recentShots } = useClubShots(activeClub?.id ?? null);

  const [actionError, setActionError] = useState<string | null>(null);

  const handleActionError = useCallback((action: string, err: unknown) => {
    const message = err instanceof Error ? err.message : 'Unbekannter Fehler';
    console.error(`[Mevo] ${action} fehlgeschlagen:`, err);
    setActionError(`${action} fehlgeschlagen: ${message}`);
    Alert.alert('Mevo+ Fehler', `${action} fehlgeschlagen:\n${message}`);
  }, []);

  const safeConnect = useCallback(async () => {
    if (!CONNECTOR_SUPPORTED) {
      const message = 'Mevo+ Direktverbindung ist im Web nicht verfügbar. Bitte in einer nativen Android- oder iOS-Development-Build auf einem Gerät testen.';
      console.warn('[Mevo] ' + message);
      setActionError(message);
      Alert.alert('Nicht unterstützt', message);
      return;
    }
    setActionError(null);
    console.log('[Mevo] connect() gestartet');
    try {
      await connect();
      console.log('[Mevo] connect() erfolgreich');
    } catch (err) {
      handleActionError('Verbinden', err);
    }
  }, [connect, handleActionError]);

  const safeArm = useCallback(async () => {
    setActionError(null);
    console.log('[Mevo] arm() gestartet');
    try {
      await arm();
      console.log('[Mevo] arm() erfolgreich');
    } catch (err) {
      handleActionError('Messung starten', err);
    }
  }, [arm, handleActionError]);

  const safeDisconnect = useCallback(async () => {
    setActionError(null);
    console.log('[Mevo] disconnect() gestartet');
    try {
      await disconnect();
      console.log('[Mevo] disconnect() erfolgreich');
    } catch (err) {
      handleActionError('Trennen', err);
    }
  }, [disconnect, handleActionError]);

  const handleStartSession = useCallback(() => {
    startSession(activeClubId);
  }, [activeClubId, startSession]);

  // Session-Metadaten kommen in Phase 1 aus useSession()
  const sessionClub = activeClub?.name ?? 'Club lädt…';
  const trainingPriorities = BASE_TRAINING_PRIORITIES.map((item) =>
    item.label === 'Aktiver Klub'
      ? { ...item, value: activeClub?.name ?? 'Lädt…' }
      : item.label === 'Bias'
        ? { ...item, value: activeClub?.bias ?? item.value }
        : item,
  );

  // Connection dot pulse — only when armed
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Card reveal on new shot
  const revealAnim = useRef(new Animated.Value(lastShot ? 1 : 0)).current;

  // Spin axis dot position (0 = full draw, 1 = full fade)
  const spinAxisAnim = useRef(
    new Animated.Value(lastShot ? axisToNorm(lastShot.spinAxis) : 0.5),
  ).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 0.25, duration: 700, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      ]),
    );
    if (state === 'armed') {
      loop.start();
    } else {
      loop.stop();
      pulseAnim.setValue(1);
    }
    return () => loop.stop();
  }, [state]);

  useEffect(() => {
    if (!lastShot) return;
    revealAnim.setValue(0);
    Animated.spring(revealAnim, { toValue: 1, tension: 70, friction: 9, useNativeDriver: true }).start();
    Animated.spring(spinAxisAnim, {
      toValue: axisToNorm(lastShot.spinAxis),
      tension: 55,
      friction: 11,
      useNativeDriver: false,
    }).start();
  }, [lastShot]);

  useEffect(() => {
    console.log('[Mevo] state:', state);
  }, [state]);

  useEffect(() => {
    if (error != null) {
      console.error('[Mevo] hook error:', error);
    }
  }, [error]);

  const statusColor = STATE_COLOR[state];
  const statusLabel = STATE_LABEL[state];
  const bannerMessage = actionError ?? error;

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />

      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>

        {/* ── Header ────────────────────────────────────────────────── */}
        <View style={s.header}>
          <ConnectButton state={state} onConnect={safeConnect} onArm={safeArm} onDisconnect={safeDisconnect} />
          <View style={s.statusRow}>
            <Animated.View
              style={[s.statusDot, { backgroundColor: statusColor, opacity: state === 'armed' ? pulseAnim : 1 }]}
            />
            <Text style={[s.statusText, { color: statusColor }]}>{statusLabel}</Text>
          </View>
          <View style={s.sessionMeta}>
            {activeSessionId != null ? (
              <>
                <Text style={s.sessionClub}>{sessionClub}</Text>
                <Pressable onPress={endSession} hitSlop={8}>
                  <Text style={s.sessionEndBtn}>Beenden</Text>
                </Pressable>
              </>
            ) : (
              <Text style={s.sessionNoSession}>Keine Session</Text>
            )}
          </View>
        </View>

        {/* ── Error banner ──────────────────────────────────────────── */}
        {bannerMessage != null && <ErrorBanner message={bannerMessage} />}
        {isMock && (
          <InfoBanner message="Mock-Mevo aktiv. Verbindungsstatus und Schlagdaten werden lokal simuliert und wie echte Schläge in SQLite gespeichert." />
        )}
        {!CONNECTOR_SUPPORTED && !isMock && (
          <InfoBanner message="Web-Build erkannt. TCP zum Mevo+ funktioniert nur in einer nativen Android- oder iOS-Development-Build, nicht im Browser." />
        )}

        {/* ── Hero ─────────────────────────────────────────────────── */}
        {activeSessionId == null ? (
          <SessionStartPanel
            clubs={clubs}
            activeClubId={activeClubId}
            onSelectClub={setActiveClubId}
            onStart={handleStartSession}
          />
        ) : lastShot == null ? (
          <EmptyState state={state} onConnect={safeConnect} />
        ) : (
          <Animated.View
            style={[
              s.heroCard,
              {
                opacity: revealAnim,
                transform: [{ translateY: revealAnim.interpolate({ inputRange: [0, 1], outputRange: [18, 0] }) }],
              },
            ]}
          >
            <View style={s.arcWrap} pointerEvents="none">
              <View style={s.arcRing} />
              <View style={s.arcPeak} />
            </View>

            <Text style={s.heroEyebrow}>LETZTER SCHLAG</Text>
            <Text style={s.heroDistance}>{lastShot.carryDistanceYards.toFixed(1)}</Text>
            <Text style={s.heroUnit}>yards carry</Text>

            <SpinAxisBar spinAxis={lastShot.spinAxis} animValue={spinAxisAnim} />
          </Animated.View>
        )}

        {/* ── Metrics grid ────────────────────────────────────────── */}
        {activeSessionId != null && lastShot != null && (
          <Animated.View
            style={[
              s.metricsWrap,
              {
                opacity: revealAnim,
                transform: [{ translateY: revealAnim.interpolate({ inputRange: [0, 1], outputRange: [28, 0] }) }],
              },
            ]}
          >
            <MetricCard value={lastShot.ballSpeedMph.toFixed(1)} unit="mph" label="Ballgeschwindigkeit" accent={C.gold} />
            {lastShot.hasClubData && lastShot.clubSpeedMph != null && (
              <MetricCard value={lastShot.clubSpeedMph.toFixed(1)} unit="mph" label="Schlägergeschwindigkeit" accent={C.teal} />
            )}
            <MetricCard value={`${lastShot.verticalLaunchAngle.toFixed(1)}°`} unit="" label="VLA" accent={C.gold} />
            {lastShot.hasClubData && lastShot.angleOfAttack != null && (
              <MetricCard
                value={`${lastShot.angleOfAttack > 0 ? '+' : ''}${lastShot.angleOfAttack.toFixed(1)}°`}
                unit=""
                label="AoA"
                accent={lastShot.angleOfAttack < -5 ? C.warning : C.teal}
              />
            )}
            <MetricCard
              value={lastShot.totalSpin.toLocaleString('de-DE')}
              unit="rpm"
              label="Spin"
              accent={C.gold}
              estimated={lastShot.isEstimatedSpin}
            />
            <MetricCard
              value={`${lastShot.horizontalLaunchAngle > 0 ? '+' : ''}${lastShot.horizontalLaunchAngle.toFixed(1)}°`}
              unit=""
              label="HLA"
              accent={lastShot.horizontalLaunchAngle < 0 ? C.draw : C.fade}
            />
          </Animated.View>
        )}

        <View style={s.panel}>
          <View style={s.panelHeader}>
            <Text style={s.panelEyebrow}>Heute</Text>
            <Text style={s.panelTitle}>Fokus und Zielkorridore</Text>
          </View>
          <View style={s.priorityRow}>
            {trainingPriorities.map((item) => (
              <PriorityChip
                key={item.label}
                label={item.label}
                tone={item.tone}
                value={item.value}
              />
            ))}
          </View>
          <View style={s.corridorGrid}>
            {targets.map((item) => (
              <TargetCard
                key={item.label}
                metric={item.label}
                range={item.range_value}
                note={`Aktuell ${item.current_value}`}
                accent={item.accent === 'green' ? 'teal' : item.accent === 'blue' ? 'draw' : 'gold'}
              />
            ))}
          </View>
        </View>

        <View style={s.panel}>
          <View style={s.panelHeader}>
            <Text style={s.panelEyebrow}>Verlauf</Text>
            <Text style={s.panelTitle}>Letzte Schläge auf einen Blick</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.shotRail}>
            {recentShots.slice(0, 3).map((item) => (
              <RecentShotCard
                key={item.id}
                carry={item.carry}
                shape={item.shape}
                note={item.quality.toLowerCase()}
                accent={item.accent === 'green' ? 'teal' : item.accent === 'blue' ? 'draw' : 'gold'}
              />
            ))}
          </ScrollView>
        </View>

        <View style={s.panel}>
          <View style={s.panelHeader}>
            <Text style={s.panelEyebrow}>Arbeitsbereiche</Text>
            <Text style={s.panelTitle}>Nicht erklären, sondern benutzen</Text>
          </View>
          {WORK_AREAS.map((item) => (
            <WorkAreaCard key={item.title} {...item} />
          ))}
        </View>

        {/* ── CTA ─────────────────────────────────────────────────── */}
        {activeSessionId != null && (
          <Pressable
            style={({ pressed }: { pressed: boolean }) => [s.cta, pressed && s.ctaPressed]}
            onPress={() => router.push('/session' as Href)}
          >
            <Text style={s.ctaLabel}>SESSION FORTSETZEN</Text>
            <Text style={s.ctaArrow}>→</Text>
          </Pressable>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

// ---------------------------------------------------------------------------
// SessionStartPanel
// ---------------------------------------------------------------------------

interface SessionStartPanelProps {
  clubs: DbClub[];
  activeClubId: string;
  onSelectClub: (id: string) => void;
  onStart: () => void;
}

function SessionStartPanel({ clubs, activeClubId, onSelectClub, onStart }: Readonly<SessionStartPanelProps>) {
  return (
    <View style={s.startPanel}>
      <Text style={s.startEyebrow}>NEUE SESSION</Text>
      <Text style={s.startTitle}>Schläger wählen</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.startClubRail}>
        {clubs.map((club) => (
          <Pressable
            key={club.id}
            style={[s.startClubChip, club.id === activeClubId && s.startClubChipActive]}
            onPress={() => onSelectClub(club.id)}
          >
            <Text style={[s.startClubName, club.id === activeClubId && s.startClubNameActive]}>
              {club.name}
            </Text>
            <Text style={[s.startClubTarget, club.id === activeClubId && s.startClubTargetActive]}>
              {club.target}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
      <Pressable
        style={({ pressed }: { pressed: boolean }) => [s.startBtn, pressed && s.startBtnPressed]}
        onPress={onStart}
      >
        <Text style={s.startBtnLabel}>SESSION STARTEN</Text>
        <Text style={s.startBtnArrow}>→</Text>
      </Pressable>
    </View>
  );
}

// ---------------------------------------------------------------------------
// ConnectButton — small action in the header
// ---------------------------------------------------------------------------

interface ConnectButtonProps {
  state: ConnectionState;
  onConnect: () => void;
  onArm: () => void;
  onDisconnect: () => void;
}

function ConnectButton({ state, onConnect, onArm, onDisconnect }: Readonly<ConnectButtonProps>) {
  if (state === 'connecting') {
    return (
      <View style={[s.headerBtn, s.headerBtnDisabled]}>
        <Text style={[s.headerBtnText, { color: C.textSecondary }]}>Verbinde…</Text>
      </View>
    );
  }

  if (state === 'disconnected') {
    return (
      <Pressable style={s.headerBtn} onPress={onConnect}>
        <Text style={[s.headerBtnText, { color: C.success }]}>Verbinden</Text>
      </Pressable>
    );
  }

  if (state === 'connected') {
    return (
      <Pressable style={s.headerBtn} onPress={onArm}>
        <Text style={[s.headerBtnText, { color: C.warning }]}>Messung starten</Text>
      </Pressable>
    );
  }

  // armed
  return (
    <Pressable style={s.headerBtn} onPress={onDisconnect}>
      <Text style={[s.headerBtnText, { color: C.danger }]}>Trennen</Text>
    </Pressable>
  );
}

// ---------------------------------------------------------------------------
// SpinAxisBar
// ---------------------------------------------------------------------------

interface SpinAxisBarProps {
  spinAxis: number;
  animValue: Animated.Value;
}

function SpinAxisBar({ spinAxis, animValue }: Readonly<SpinAxisBarProps>) {
  const [trackWidth, setTrackWidth] = useState(SCREEN_WIDTH - 96);

  const onLayout = (e: LayoutChangeEvent) => {
    setTrackWidth(e.nativeEvent.layout.width);
  };

  let bias: 'draw' | 'fade' | 'straight';
  if (spinAxis < -5) bias = 'draw';
  else if (spinAxis > 5) bias = 'fade';
  else bias = 'straight';

  let dotColor: string;
  if (bias === 'draw') dotColor = C.draw;
  else if (bias === 'fade') dotColor = C.fade;
  else dotColor = C.neutral;

  const dotSize = 16;

  return (
    <View style={s.axisOuter}>
      <View style={s.axisLabelRow}>
        <Text style={[s.axisEndLabel, { color: C.draw }]}>← Draw</Text>
        <Text style={[s.axisValueText, { color: dotColor }]}>
          {spinAxis > 0 ? '+' : ''}{spinAxis.toFixed(1)}°
        </Text>
        <Text style={[s.axisEndLabel, { color: C.fade }]}>Fade →</Text>
      </View>

      <View style={s.axisTrack} onLayout={onLayout}>
        <View style={[s.axisCenterTick, { left: trackWidth / 2 - 0.5 }]} />
        <Animated.View
          style={[
            s.axisDot,
            {
              backgroundColor: dotColor,
              shadowColor: dotColor,
              left: animValue.interpolate({
                inputRange: [0, 1],
                outputRange: [0, trackWidth - dotSize],
              }),
            },
          ]}
        />
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// MetricCard
// ---------------------------------------------------------------------------

interface MetricCardProps {
  value: string;
  unit: string;
  label: string;
  accent: string;
  estimated?: boolean;
}

function MetricCard({ value, unit, label, accent, estimated }: Readonly<MetricCardProps>) {
  return (
    <View style={s.metricCard}>
      <View style={[s.metricBar, { backgroundColor: accent }]} />
      <View style={s.metricBody}>
        <View style={s.metricNumRow}>
          <Text style={s.metricNum}>{value}</Text>
          {unit ? <Text style={s.metricUnit}>{unit}</Text> : null}
          {estimated === true && (
            <View style={s.estimatedBadge}>
              <Text style={s.estimatedText}>~</Text>
            </View>
          )}
        </View>
        <Text style={s.metricLabel}>{label}</Text>
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// EmptyState
// ---------------------------------------------------------------------------

interface EmptyStateProps {
  state: ConnectionState;
  onConnect: () => void;
}

function EmptyState({ state, onConnect }: Readonly<EmptyStateProps>) {
  let title: string;
  if (state === 'connecting') title = 'Verbinde…';
  else if (state === 'connected') title = 'Bereit zum Starten';
  else title = 'Wartet auf Schlag';

  const body = state === 'armed'
    ? 'Schlag ausführen — Daten erscheinen hier.'
    : state === 'connecting'
      ? 'TCP-Verbindung zum Mevo+ wird aufgebaut.'
      : 'Verbindung aufgebaut.';

  return (
    <View style={s.emptyCard}>
      <Text style={s.emptyGlyph}>◎</Text>
      {state === 'disconnected' ? (
        <>
          <Text style={s.emptyTitle}>Nicht verbunden</Text>
          <Text style={s.emptyBody}>Mevo+ WLAN verbinden, dann hier starten.</Text>
          <Pressable
            style={({ pressed }: { pressed: boolean }) => [s.emptyConnectBtn, pressed && s.emptyConnectBtnPressed]}
            onPress={onConnect}
          >
            <Text style={s.emptyConnectLabel}>Verbinden</Text>
          </Pressable>
        </>
      ) : (
        <>
          {state === 'connecting' && (
            <View style={s.connectingIndicatorRow}>
              <Animated.View style={[s.connectingDot, { opacity: 0.9 }]} />
              <Text style={s.connectingLabel}>Verbindung läuft</Text>
            </View>
          )}
          <Text style={s.emptyTitle}>{title}</Text>
          <Text style={s.emptyBody}>{body}</Text>
        </>
      )}
    </View>
  );
}

// ---------------------------------------------------------------------------
// ErrorBanner
// ---------------------------------------------------------------------------

function ErrorBanner({ message }: Readonly<{ message: string }>) {
  return (
    <View style={s.errorBanner}>
      <Text style={s.errorText}>{message}</Text>
    </View>
  );
}

function InfoBanner({ message }: Readonly<{ message: string }>) {
  return (
    <View style={s.infoBanner}>
      <Text style={s.infoText}>{message}</Text>
    </View>
  );
}

function PriorityChip({
  label,
  value,
  tone,
}: Readonly<{ label: string; value: string; tone: 'gold' | 'draw' | 'teal' }>) {
  const toneColor = tone === 'gold' ? C.gold : tone === 'draw' ? C.draw : C.teal;
  return (
    <View style={[s.priorityChip, { borderColor: `${toneColor}55`, backgroundColor: `${toneColor}14` }]}>
      <Text style={s.priorityChipLabel}>{label}</Text>
      <Text style={[s.priorityChipValue, { color: toneColor }]}>{value}</Text>
    </View>
  );
}

function TargetCard({
  metric,
  range,
  note,
  accent,
}: Readonly<{ metric: string; range: string; note: string; accent: 'gold' | 'draw' | 'teal' }>) {
  const accentColor = accent === 'gold' ? C.gold : accent === 'draw' ? C.draw : C.teal;
  return (
    <View style={s.targetCard}>
      <View style={[s.targetCardBar, { backgroundColor: accentColor }]} />
      <Text style={s.targetMetric}>{metric}</Text>
      <Text style={s.targetRange}>{range}</Text>
      <Text style={s.targetNote}>{note}</Text>
    </View>
  );
}

function RecentShotCard({
  carry,
  shape,
  note,
  accent,
}: Readonly<{ carry: string; shape: string; note: string; accent: 'gold' | 'draw' | 'teal' }>) {
  const accentColor = accent === 'gold' ? C.gold : accent === 'draw' ? C.draw : C.teal;
  return (
    <View style={s.recentShotCard}>
      <View style={[s.recentShotAccent, { backgroundColor: accentColor }]} />
      <Text style={s.recentShotCarry}>{carry}</Text>
      <Text style={s.recentShotShape}>{shape}</Text>
      <Text style={s.recentShotNote}>{note}</Text>
    </View>
  );
}

function WorkAreaCard({
  title,
  body,
  badge,
}: Readonly<{ title: string; body: string; badge: string }>) {
  return (
    <View style={s.workAreaCard}>
      <View style={s.workAreaTop}>
        <View>
          <Text style={s.workAreaTitle}>{title}</Text>
        </View>
        <View style={s.workAreaBadge}>
          <Text style={s.workAreaBadgeText}>{badge}</Text>
        </View>
      </View>
      <Text style={s.workAreaBody}>{body}</Text>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const CARD_GAP = 10;
const CARD_H_PAD = 16;
const CARD_WIDTH = (SCREEN_WIDTH - CARD_H_PAD * 2 - CARD_GAP) / 2;

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  scroll: { flex: 1 },
  content: { paddingBottom: 48 },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontFamily: FONT.mono,
    fontSize: 11,
    letterSpacing: 1.8,
  },
  sessionMeta: {
    alignItems: 'flex-end',
  },
  sessionClub: {
    fontFamily: FONT.demi,
    fontSize: 14,
    color: C.text,
    letterSpacing: 0.2,
  },
  sessionEndBtn: {
    fontFamily: FONT.body,
    fontSize: 12,
    color: C.danger,
    marginTop: 2,
  },
  sessionNoSession: {
    fontFamily: FONT.body,
    fontSize: 12,
    color: C.textMuted,
  },
  headerBtn: {
    paddingVertical: 4,
    paddingHorizontal: 2,
  },
  headerBtnDisabled: {
    opacity: 0.7,
  },
  headerBtnText: {
    fontFamily: FONT.demi,
    fontSize: 13,
    letterSpacing: 0.3,
  },

  // Error banner
  errorBanner: {
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: `${C.danger}22`,
    borderWidth: 1,
    borderColor: `${C.danger}55`,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  errorText: {
    fontFamily: FONT.body,
    fontSize: 13,
    color: C.danger,
  },
  infoBanner: {
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: `${C.warning}18`,
    borderWidth: 1,
    borderColor: `${C.warning}55`,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  infoText: {
    fontFamily: FONT.body,
    fontSize: 13,
    color: C.warning,
  },

  // Hero card
  heroCard: {
    marginHorizontal: 16,
    marginBottom: 14,
    backgroundColor: C.card,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
    alignItems: 'center',
    overflow: 'hidden',
  },
  arcWrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 130,
    overflow: 'hidden',
  },
  arcRing: {
    position: 'absolute',
    bottom: -30,
    left: -40,
    right: -40,
    height: 220,
    borderRadius: 220,
    borderWidth: 1,
    borderColor: C.gold,
    opacity: 0.1,
  },
  arcPeak: {
    position: 'absolute',
    top: 22,
    alignSelf: 'center',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: C.gold,
    opacity: 0.25,
  },
  heroEyebrow: {
    fontFamily: FONT.mono,
    fontSize: 10,
    letterSpacing: 3.5,
    color: C.textMuted,
    marginBottom: 6,
    marginTop: 14,
  },
  heroDistance: {
    fontFamily: FONT.mono,
    fontSize: 80,
    color: C.gold,
    lineHeight: 88,
    letterSpacing: -3,
    includeFontPadding: false,
  },
  heroUnit: {
    fontFamily: FONT.body,
    fontSize: 15,
    color: C.textSecondary,
    letterSpacing: 1.2,
    marginTop: 4,
    marginBottom: 22,
  },

  // Spin axis
  axisOuter: { width: '100%', alignItems: 'stretch' },
  axisLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  axisEndLabel: {
    fontFamily: FONT.body,
    fontSize: 11,
    letterSpacing: 0.4,
  },
  axisValueText: {
    fontFamily: FONT.mono,
    fontSize: 13,
    letterSpacing: 0.3,
  },
  axisTrack: {
    height: 4,
    backgroundColor: C.border,
    borderRadius: 2,
    position: 'relative',
    justifyContent: 'center',
  },
  axisCenterTick: {
    position: 'absolute',
    width: 1,
    height: 12,
    backgroundColor: C.borderLight,
    top: -4,
  },
  axisDot: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    top: -6,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
    elevation: 4,
  },

  // Metrics grid
  metricsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: CARD_H_PAD,
    gap: CARD_GAP,
    marginBottom: 20,
  },
  metricCard: {
    width: CARD_WIDTH,
    backgroundColor: C.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  metricBar: { width: 3 },
  metricBody: { flex: 1, paddingVertical: 14, paddingHorizontal: 12 },
  metricNumRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
    flexWrap: 'wrap',
  },
  metricNum: {
    fontFamily: FONT.mono,
    fontSize: 23,
    color: C.text,
    letterSpacing: -0.5,
    includeFontPadding: false,
  },
  metricUnit: {
    fontFamily: FONT.body,
    fontSize: 12,
    color: C.textSecondary,
    marginBottom: 1,
  },
  estimatedBadge: {
    backgroundColor: `${C.warning}33`,
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 1,
    marginLeft: 2,
    alignSelf: 'center',
  },
  estimatedText: {
    fontFamily: FONT.mono,
    fontSize: 11,
    color: C.warning,
  },
  metricLabel: {
    fontFamily: FONT.body,
    fontSize: 11,
    color: C.textSecondary,
    marginTop: 5,
    letterSpacing: 0.2,
  },

  panel: {
    marginHorizontal: 16,
    marginBottom: 18,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 24,
    padding: 18,
  },
  panelHeader: {
    marginBottom: 14,
  },
  panelEyebrow: {
    fontFamily: FONT.mono,
    fontSize: 10,
    color: C.textMuted,
    letterSpacing: 2.4,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  panelTitle: {
    fontFamily: FONT.demi,
    fontSize: 20,
    color: C.text,
    letterSpacing: 0.2,
  },
  priorityRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 14,
  },
  priorityChip: {
    minWidth: 102,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flex: 1,
  },
  priorityChipLabel: {
    fontFamily: FONT.body,
    fontSize: 11,
    color: C.textSecondary,
    marginBottom: 4,
  },
  priorityChipValue: {
    fontFamily: FONT.demi,
    fontSize: 14,
  },
  corridorGrid: {
    gap: 10,
  },
  shotRail: {
    gap: 10,
    paddingRight: 4,
  },
  targetCard: {
    backgroundColor: C.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: 14,
    paddingVertical: 14,
    overflow: 'hidden',
  },
  targetCardBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
  },
  targetMetric: {
    fontFamily: FONT.mono,
    fontSize: 12,
    color: C.textSecondary,
    letterSpacing: 1.1,
    marginBottom: 6,
  },
  targetRange: {
    fontFamily: FONT.demi,
    fontSize: 18,
    color: C.text,
    marginBottom: 5,
  },
  targetNote: {
    fontFamily: FONT.body,
    fontSize: 13,
    lineHeight: 19,
    color: C.textSecondary,
  },
  recentShotCard: {
    width: 108,
    backgroundColor: C.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  recentShotAccent: {
    width: 28,
    height: 4,
    borderRadius: 2,
    marginBottom: 12,
  },
  recentShotCarry: {
    fontFamily: FONT.mono,
    fontSize: 28,
    color: C.text,
    marginBottom: 4,
  },
  recentShotShape: {
    fontFamily: FONT.demi,
    fontSize: 13,
    color: C.textSecondary,
    marginBottom: 4,
  },
  recentShotNote: {
    fontFamily: FONT.body,
    fontSize: 12,
    lineHeight: 16,
    color: C.textMuted,
  },
  workAreaCard: {
    backgroundColor: C.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 10,
  },
  workAreaTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  workAreaTitle: {
    fontFamily: FONT.demi,
    fontSize: 17,
    color: C.text,
  },
  workAreaBadge: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: C.borderLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  workAreaBadgeText: {
    fontFamily: FONT.mono,
    fontSize: 10,
    color: C.textSecondary,
    letterSpacing: 1.2,
  },
  workAreaBody: {
    fontFamily: FONT.body,
    fontSize: 14,
    lineHeight: 20,
    color: C.textSecondary,
  },

  // CTA button
  cta: {
    marginHorizontal: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: C.goldDim,
    backgroundColor: C.card,
    paddingVertical: 18,
    paddingHorizontal: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ctaPressed: { borderColor: C.gold, backgroundColor: C.goldGlow },
  ctaLabel: { fontFamily: FONT.demi, fontSize: 13, color: C.gold, letterSpacing: 2.2 },
  ctaArrow: { fontFamily: FONT.mono, fontSize: 18, color: C.gold },

  // Empty state
  emptyCard: {
    marginHorizontal: 16,
    marginBottom: 14,
    backgroundColor: C.card,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: C.border,
    paddingVertical: 48,
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  emptyGlyph: { fontSize: 38, color: C.textMuted, marginBottom: 16 },
  emptyTitle: {
    fontFamily: FONT.demi,
    fontSize: 17,
    color: C.textSecondary,
    marginBottom: 8,
  },
  connectingIndicatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  connectingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: C.warning,
  },
  connectingLabel: {
    fontFamily: FONT.mono,
    fontSize: 11,
    color: C.warning,
    letterSpacing: 1.2,
  },
  emptyBody: {
    fontFamily: FONT.body,
    fontSize: 14,
    color: C.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  emptyConnectBtn: {
    borderWidth: 1,
    borderColor: C.success,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 28,
  },
  emptyConnectBtnPressed: { backgroundColor: `${C.success}22` },
  emptyConnectLabel: {
    fontFamily: FONT.demi,
    fontSize: 14,
    color: C.success,
    letterSpacing: 0.5,
  },

  // Session start panel
  startPanel: {
    marginHorizontal: 16,
    marginBottom: 14,
    backgroundColor: C.card,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: C.goldDim,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 24,
  },
  startEyebrow: {
    fontFamily: FONT.mono,
    fontSize: 10,
    letterSpacing: 3.5,
    color: C.gold,
    marginBottom: 6,
  },
  startTitle: {
    fontFamily: FONT.demi,
    fontSize: 22,
    color: C.text,
    marginBottom: 20,
  },
  startClubRail: {
    gap: 10,
    paddingRight: 4,
    marginBottom: 20,
  },
  startClubChip: {
    minWidth: 100,
    backgroundColor: C.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  startClubChipActive: {
    backgroundColor: C.goldGlow,
    borderColor: C.goldDim,
  },
  startClubName: {
    fontFamily: FONT.demi,
    fontSize: 15,
    color: C.text,
    marginBottom: 3,
  },
  startClubNameActive: {
    color: C.gold,
  },
  startClubTarget: {
    fontFamily: FONT.body,
    fontSize: 12,
    color: C.textMuted,
  },
  startClubTargetActive: {
    color: C.textSecondary,
  },
  startBtn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: C.goldDim,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: C.goldGlow,
  },
  startBtnPressed: {
    borderColor: C.gold,
  },
  startBtnLabel: {
    fontFamily: FONT.demi,
    fontSize: 13,
    color: C.gold,
    letterSpacing: 2.2,
  },
  startBtnArrow: {
    fontFamily: FONT.mono,
    fontSize: 18,
    color: C.gold,
  },
});
