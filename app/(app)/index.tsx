import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  StatusBar,
  Animated,
  Dimensions,
  Platform,
  LayoutChangeEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import type { Href } from 'expo-router';
import type { ShotData, ConnectionStatus } from '../../lib/types/shot';

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
  medium: Platform.OS === 'ios' ? 'AvenirNext-Medium' : 'sans-serif-medium',
  demi: Platform.OS === 'ios' ? 'AvenirNext-DemiBold' : 'sans-serif-medium',
  heavy: Platform.OS === 'ios' ? 'AvenirNext-Heavy' : 'sans-serif-condensed',
} as const;

// ---------------------------------------------------------------------------
// Mock data — replace with useMevo / useShots hooks in Phase 1
// ---------------------------------------------------------------------------

const MOCK_SHOT: ShotData = {
  ballSpeedMph: 114.2,
  verticalLaunchAngle: 14.3,
  horizontalLaunchAngle: -1.8,
  totalSpin: 4420,
  spinAxis: -11.4,
  carryDistanceYards: 178.5,
  isEstimatedSpin: false,
  hasClubData: true,
  hasFaceImpact: true,
  clubSpeedMph: 76.4,
  angleOfAttack: -3.1,
  clubPath: -2.4,
  faceToTarget: -1.2,
  dynamicLoft: 28.3,
  spinLoft: 31.4,
  faceImpactX: -2.1,
  faceImpactY: 1.4,
};

// ---------------------------------------------------------------------------
// Dashboard screen
// ---------------------------------------------------------------------------

export default function DashboardScreen() {
  // Phase 1: replace with useMevo() and useShots() hooks
  const [status] = useState<ConnectionStatus>('connected');
  const [lastShot] = useState<ShotData | null>(MOCK_SHOT);
  const [shotCount] = useState(12);
  const [sessionClub] = useState('7-Eisen');

  // Connection dot pulse (active only when "armed")
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
    if (status === 'armed') {
      loop.start();
    } else {
      loop.stop();
      pulseAnim.setValue(1);
    }
    return () => loop.stop();
  }, [status]);

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

  const statusColor = { connected: C.success, disconnected: C.danger, armed: C.warning }[status];
  const statusLabel = { connected: 'VERBUNDEN', disconnected: 'GETRENNT', armed: 'BEREIT' }[status];

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />

      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>

        {/* ── Header ────────────────────────────────────────────────── */}
        <View style={s.header}>
          <View style={s.statusRow}>
            <Animated.View style={[s.statusDot, { backgroundColor: statusColor, opacity: status === 'armed' ? pulseAnim : 1 }]} />
            <Text style={[s.statusText, { color: statusColor }]}>{statusLabel}</Text>
          </View>
          <View style={s.sessionMeta}>
            <Text style={s.sessionClub}>{sessionClub}</Text>
            <Text style={s.sessionShots}>{shotCount} Schläge</Text>
          </View>
        </View>

        {/* ── Hero ─────────────────────────────────────────────────── */}
        {lastShot ? (
          <Animated.View
            style={[
              s.heroCard,
              {
                opacity: revealAnim,
                transform: [{ translateY: revealAnim.interpolate({ inputRange: [0, 1], outputRange: [18, 0] }) }],
              },
            ]}
          >
            {/* Decorative arc */}
            <View style={s.arcWrap} pointerEvents="none">
              <View style={s.arcRing} />
              <View style={s.arcPeak} />
            </View>

            <Text style={s.heroEyebrow}>LETZTER SCHLAG</Text>
            <Text style={s.heroDistance}>{lastShot.carryDistanceYards.toFixed(1)}</Text>
            <Text style={s.heroUnit}>yards carry</Text>

            <SpinAxisBar spinAxis={lastShot.spinAxis} animValue={spinAxisAnim} />
          </Animated.View>
        ) : (
          <EmptyState />
        )}

        {/* ── Metrics grid ────────────────────────────────────────── */}
        {lastShot && (
          <Animated.View
            style={[
              s.metricsWrap,
              {
                opacity: revealAnim,
                transform: [{ translateY: revealAnim.interpolate({ inputRange: [0, 1], outputRange: [28, 0] }) }],
              },
            ]}
          >
            <MetricCard
              value={lastShot.ballSpeedMph.toFixed(1)}
              unit="mph"
              label="Ballgeschwindigkeit"
              accent={C.gold}
            />
            {lastShot.hasClubData && lastShot.clubSpeedMph != null && (
              <MetricCard
                value={lastShot.clubSpeedMph.toFixed(1)}
                unit="mph"
                label="Schlägergeschwindigkeit"
                accent={C.teal}
              />
            )}
            <MetricCard
              value={`${lastShot.verticalLaunchAngle.toFixed(1)}°`}
              unit=""
              label="VLA"
              accent={C.gold}
            />
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

        {/* ── CTA ─────────────────────────────────────────────────── */}
        <Pressable
          style={({ pressed }: { pressed: boolean }) => [s.cta, pressed && s.ctaPressed]}
          onPress={() => router.push('/session' as Href)}
        >
          <Text style={s.ctaLabel}>SESSION FORTSETZEN</Text>
          <Text style={s.ctaArrow}>→</Text>
        </Pressable>

      </ScrollView>
    </SafeAreaView>
  );
}

// ---------------------------------------------------------------------------
// SpinAxisBar
// ---------------------------------------------------------------------------

function axisToNorm(axis: number): number {
  // Map -45..+45 → 0..1; clamp for safety
  return Math.max(0, Math.min(1, (axis + 45) / 90));
}

interface SpinAxisBarProps {
  spinAxis: number;
  animValue: Animated.Value;
}

function SpinAxisBar({ spinAxis, animValue }: Readonly<SpinAxisBarProps>) {
  const [trackWidth, setTrackWidth] = useState(SCREEN_WIDTH - 96);

  const onLayout = (e: LayoutChangeEvent) => {
    setTrackWidth(e.nativeEvent.layout.width);
  };

  const bias = spinAxis < -5 ? 'draw' : spinAxis > 5 ? 'fade' : 'straight';
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
        {/* Center tick */}
        <View style={[s.axisCenterTick, { left: trackWidth / 2 - 0.5 }]} />

        {/* Animated dot */}
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
          {estimated && (
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

function EmptyState() {
  return (
    <View style={s.emptyCard}>
      <Text style={s.emptyGlyph}>◎</Text>
      <Text style={s.emptyTitle}>Kein Schlag erfasst</Text>
      <Text style={s.emptyBody}>Mevo+ verbinden und ersten Schlag ausführen.</Text>
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
  safe: {
    flex: 1,
    backgroundColor: C.bg,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingBottom: 48,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
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
  sessionShots: {
    fontFamily: FONT.body,
    fontSize: 12,
    color: C.textSecondary,
    marginTop: 2,
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

  // Decorative arc behind the hero number
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
  axisOuter: {
    width: '100%',
    alignItems: 'stretch',
  },
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
  metricBar: {
    width: 3,
  },
  metricBody: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 12,
  },
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
  ctaPressed: {
    borderColor: C.gold,
    backgroundColor: C.goldGlow,
  },
  ctaLabel: {
    fontFamily: FONT.demi,
    fontSize: 13,
    color: C.gold,
    letterSpacing: 2.2,
  },
  ctaArrow: {
    fontFamily: FONT.mono,
    fontSize: 18,
    color: C.gold,
  },

  // Empty state
  emptyCard: {
    marginHorizontal: 16,
    marginBottom: 14,
    backgroundColor: C.card,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: C.border,
    paddingVertical: 56,
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  emptyGlyph: {
    fontSize: 38,
    color: C.textMuted,
    marginBottom: 16,
  },
  emptyTitle: {
    fontFamily: FONT.demi,
    fontSize: 17,
    color: C.textSecondary,
    marginBottom: 8,
  },
  emptyBody: {
    fontFamily: FONT.body,
    fontSize: 14,
    color: C.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
});
