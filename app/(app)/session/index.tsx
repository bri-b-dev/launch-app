import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useTrainingState } from '../../../lib/hooks/use-training-state';
import {
  type DbMargin,
  type ShotStats,
  computeStats,
  useClubShots,
  useClubs,
  useMargins,
  useSessionShots,
} from '../../../lib/hooks/use-sqlite-training';

const C = {
  bg: '#071018',
  surface: '#0D1821',
  panel: '#111E28',
  panelAlt: '#152331',
  border: '#223244',
  text: '#EEF3F7',
  textSecondary: '#8DA0B3',
  textMuted: '#53677A',
  gold: '#D2B15C',
  green: '#4AC18D',
  orange: '#F2A24D',
  blue: '#5FA7FF',
  red: '#DE6E63',
} as const;

const FONT = {
  mono: Platform.OS === 'ios' ? 'Menlo-Regular' : 'monospace',
  body: Platform.OS === 'ios' ? 'AvenirNext-Regular' : 'sans-serif',
  demi: Platform.OS === 'ios' ? 'AvenirNext-DemiBold' : 'sans-serif-medium',
  heavy: Platform.OS === 'ios' ? 'AvenirNext-Heavy' : 'sans-serif-medium',
} as const;

const MODE_OPTIONS = ['Full Swing', 'Approach', 'Wedge'];

type StatsScope = 'heute' | 'gesamt';
type MarginStatusTone = 'good' | 'near' | 'bad' | 'idle';

function extractNumbers(input: string): number[] {
  const matches = input.match(/-?\d+(?:[.,]\d+)?/g) ?? [];
  return matches
    .map((value) => Number(value.replace(',', '.')))
    .filter((value) => Number.isFinite(value));
}

function evaluateMargin(target: DbMargin): {
  tone: MarginStatusTone;
  label: string;
  detail: string;
} {
  const current = extractNumbers(target.current_value)[0];
  const range = extractNumbers(target.range_value);

  if (current == null || range.length < 2) {
    return {
      tone: 'idle',
      label: 'Offen',
      detail: 'Noch keine bewertbare Zielprüfung.',
    };
  }

  const lower = Math.min(range[0], range[1]);
  const upper = Math.max(range[0], range[1]);

  if (current >= lower && current <= upper) {
    return {
      tone: 'good',
      label: 'Im Korridor',
      detail: `Aktuell ${target.current_value} liegt im Zielbereich.`,
    };
  }

  const distance = current < lower ? lower - current : current - upper;
  const nearThreshold = Math.max((upper - lower) * 0.25, 0.5);

  if (distance <= nearThreshold) {
    return {
      tone: 'near',
      label: 'Knapp daneben',
      detail: `Abweichung ${distance.toFixed(1)} zur Zielgrenze.`,
    };
  }

  return {
    tone: 'bad',
    label: 'Außerhalb',
    detail: `Abweichung ${distance.toFixed(1)} zum Korridor.`,
  };
}

export default function SessionScreen() {
  const [selectedMode] = useState('Full Swing');
  const [statsScope, setStatsScope] = useState<StatsScope>('heute');
  const { activeClubId, setActiveClubId } = useTrainingState();
  const { rows: clubs, loading: clubsLoading, error: clubsError } = useClubs();
  const club = clubs.find((item) => item.id === activeClubId) ?? clubs[0];
  const { rows: targets, loading: marginsLoading } = useMargins(club?.id ?? null);
  const { rows: shots, loading: shotsLoading } = useClubShots(club?.id ?? null);
  const todaySessionId = club != null
    ? `session-${new Date().toISOString().slice(0, 10)}-${club.id}`
    : null;
  const { rows: sessionShots } = useSessionShots(todaySessionId);
  const clubStats = useMemo(() => computeStats(shots), [shots]);
  const todayStats = useMemo(() => computeStats(sessionShots), [sessionShots]);
  const activeStats = statsScope === 'heute' ? todayStats : clubStats;
  const leadShot = shots[0];
  const marginSummary = targets.reduce(
    (summary, target) => {
      const result = evaluateMargin(target);
      if (result.tone === 'good') {
        summary.good += 1;
      } else if (result.tone === 'near') {
        summary.near += 1;
      } else if (result.tone === 'bad') {
        summary.bad += 1;
      }
      return summary;
    },
    { good: 0, near: 0, bad: 0 },
  );

  if (clubsError != null) {
    return (
      <SafeAreaView style={s.safe} edges={['top']}>
        <View style={s.center}><Text style={s.errorText}>{clubsError}</Text></View>
      </SafeAreaView>
    );
  }

  if (clubsLoading || club == null) {
    return (
      <SafeAreaView style={s.safe} edges={['top']}>
        <View style={s.center}><Text style={s.infoText}>Session wird geladen…</Text></View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <View style={s.hero}>
          <View style={s.heroTop}>
            <View>
              <Text style={s.eyebrow}>Aktive Session</Text>
              <Text style={s.title}>{club.session_label}</Text>
            </View>
            <View style={s.statePill}>
              <View style={s.stateDot} />
              <Text style={s.statePillText}>Armed</Text>
            </View>
          </View>

          <View style={s.heroBand}>
            <HeroMetric label="Schläge" value={club.shot_count} />
            <HeroMetric label="Ø Carry" value={club.avg_carry} />
            <HeroMetric label="Trefferquote" value={club.hit_rate} />
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.clubRail}>
            {clubs.map((item) => (
              <Pressable key={item.id} style={[s.clubChip, item.id === club.id && s.clubChipActive]} onPress={() => setActiveClubId(item.id)}>
                <Text style={[s.clubChipLabel, item.id === club.id && s.clubChipLabelActive]}>{item.name}</Text>
                <Text style={[s.clubChipMeta, item.id === club.id && s.clubChipMetaActive]}>{item.target}</Text>
              </Pressable>
            ))}
          </ScrollView>

          <View style={s.modeRow}>
            {MODE_OPTIONS.map((option, index) => (
              <Pressable key={option} style={[s.modeChip, option === selectedMode && s.modeChipActive]}>
                <Text style={[s.modeChipText, option === selectedMode && s.modeChipTextActive]}>{option}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={s.section}>
          <View style={s.sectionHeader}>
            <Text style={s.sectionEyebrow}>Letzter Schlag</Text>
            {leadShot != null && (
              <Pressable onPress={() => router.push(`/shot/${leadShot.id}`)}>
                <Text style={s.sectionLink}>Details</Text>
              </Pressable>
            )}
          </View>
          {shotsLoading ? (
            <Text style={s.infoText}>Schläge werden geladen…</Text>
          ) : leadShot == null ? (
            <Text style={s.infoText}>Noch keine Schläge für diesen Club.</Text>
          ) : (
            <>
              <View style={s.lastShotCard}>
                <View>
                  <Text style={s.lastShotCarry}>{leadShot.carry}</Text>
                  <Text style={s.lastShotUnit}>yards carry</Text>
                </View>
                <View style={s.lastShotMeta}>
                  <Text style={s.lastShotShape}>{leadShot.shape}</Text>
                  <Text style={s.lastShotNote}>{leadShot.note}</Text>
                </View>
              </View>
              <View style={s.liveMetricGrid}>
                <LiveMetric label="Ball Speed" value={leadShot.ball_speed} unit="mph" />
                <LiveMetric label="Club Speed" value={leadShot.club_speed} unit="mph" />
                <LiveMetric label="VLA" value={leadShot.vla} unit="°" />
                <LiveMetric label="Spin" value={leadShot.spin} unit="rpm" />
              </View>
            </>
          )}
        </View>

        <View style={s.section}>
          <View style={s.sectionHeader}>
            <Text style={s.sectionEyebrow}>Zielkorridore</Text>
            <Text style={s.sectionLink}>
              {marginSummary.good} ok · {marginSummary.near} nah · {marginSummary.bad} offen
            </Text>
          </View>
          {marginsLoading ? <Text style={s.infoText}>Margins werden geladen…</Text> : targets.map((target) => (
            <MarginStatusCard key={target.id} target={target} />
          ))}
        </View>

        <View style={s.section}>
          <View style={s.sectionHeader}>
            <Text style={s.sectionEyebrow}>Shot Rail</Text>
            <Pressable onPress={() => router.push('/history')}>
              <Text style={s.sectionLink}>Verlauf</Text>
            </Pressable>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.rail}>
            {shots.map((shot) => (
              <Pressable key={shot.id} style={s.railCard} onPress={() => router.push(`/shot/${shot.id}`)}>
                <View style={[s.railAccent, { backgroundColor: shot.accent === 'green' ? C.green : shot.accent === 'blue' ? C.blue : shot.accent === 'gold' ? C.gold : C.orange }]} />
                <Text style={s.railCarry}>{shot.carry}</Text>
                <Text style={s.railShape}>{shot.shape}</Text>
                <Text style={s.railQuality}>{shot.quality}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        <View style={s.section}>
          <View style={s.sectionHeader}>
            <Text style={s.sectionEyebrow}>Statistik</Text>
            <View style={s.scopeToggle}>
              <Pressable
                style={[s.scopeChip, statsScope === 'heute' && s.scopeChipActive]}
                onPress={() => setStatsScope('heute')}
              >
                <Text style={[s.scopeChipText, statsScope === 'heute' && s.scopeChipTextActive]}>Heute</Text>
              </Pressable>
              <Pressable
                style={[s.scopeChip, statsScope === 'gesamt' && s.scopeChipActive]}
                onPress={() => setStatsScope('gesamt')}
              >
                <Text style={[s.scopeChipText, statsScope === 'gesamt' && s.scopeChipTextActive]}>Gesamt</Text>
              </Pressable>
            </View>
          </View>
          {activeStats.shotCount === 0 ? (
            <Text style={s.infoText}>
              {statsScope === 'heute'
                ? 'Noch keine Schläge heute — starte die Mevo-Session.'
                : 'Noch keine Schläge für diesen Club.'}
            </Text>
          ) : (
            <>
              <StatRow
                label="Schläge"
                value={String(activeStats.shotCount)}
              />
              <StatRow
                label="Ø Carry"
                value={
                  activeStats.avgCarry != null
                    ? `${Math.round(activeStats.avgCarry)} y${activeStats.stdDevCarry != null ? ` ± ${Math.round(activeStats.stdDevCarry)} y` : ''}`
                    : '—'
                }
                accent={C.gold}
              />
              <StatRow
                label="Trefferquote"
                value={activeStats.hitRatePct != null ? `${Math.round(activeStats.hitRatePct)} %` : '—'}
                accent={activeStats.hitRatePct != null && activeStats.hitRatePct >= 70 ? C.green : activeStats.hitRatePct != null && activeStats.hitRatePct >= 50 ? C.gold : C.red}
              />
              {activeStats.avgBallSpeed != null && (
                <StatRow label="Ø Ball Speed" value={`${activeStats.avgBallSpeed.toFixed(1)} mph`} />
              )}
              {activeStats.avgClubSpeed != null && (
                <StatRow label="Ø Club Speed" value={`${activeStats.avgClubSpeed.toFixed(1)} mph`} />
              )}
              {activeStats.avgVla != null && (
                <StatRow label="Ø VLA" value={`${activeStats.avgVla.toFixed(1)} °`} />
              )}
              {activeStats.avgSpin != null && (
                <StatRow label="Ø Spin" value={`${Math.round(activeStats.avgSpin)} rpm`} />
              )}
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function MarginStatusCard({ target }: Readonly<{ target: DbMargin }>) {
  const accentColor =
    target.accent === 'green' ? C.green : target.accent === 'blue' ? C.blue : target.accent === 'gold' ? C.gold : C.orange;
  const result = evaluateMargin(target);
  const statusColor =
    result.tone === 'good' ? C.green : result.tone === 'near' ? C.gold : result.tone === 'bad' ? C.red : C.textSecondary;

  return (
    <View style={s.targetCard}>
      <View style={[s.targetAccent, { backgroundColor: accentColor }]} />
      <View style={s.targetBody}>
        <View style={s.targetTop}>
          <Text style={s.targetLabel}>{target.label}</Text>
          <View style={[s.targetStatusPill, { borderColor: `${statusColor}55`, backgroundColor: `${statusColor}18` }]}>
            <Text style={[s.targetStatusText, { color: statusColor }]}>{result.label}</Text>
          </View>
        </View>
        <View style={s.targetMetricRow}>
          <Text style={[s.targetCurrent, { color: accentColor }]}>{target.current_value}</Text>
          <Text style={s.targetRange}>{target.range_value}</Text>
        </View>
        <Text style={s.targetNote}>{result.detail}</Text>
      </View>
    </View>
  );
}

function HeroMetric({ label, value }: Readonly<{ label: string; value: string }>) {
  return (
    <View style={s.heroMetric}>
      <Text style={s.heroMetricLabel}>{label}</Text>
      <Text style={s.heroMetricValue}>{value}</Text>
    </View>
  );
}

function LiveMetric({
  label,
  value,
  unit,
}: Readonly<{ label: string; value: string; unit: string }>) {
  return (
    <View style={s.liveMetric}>
      <Text style={s.liveMetricValue}>
        {value}
        <Text style={s.liveMetricUnit}> {unit}</Text>
      </Text>
      <Text style={s.liveMetricLabel}>{label}</Text>
    </View>
  );
}

function StatRow({
  label,
  value,
  accent,
}: Readonly<{ label: string; value: string; accent?: string }>) {
  return (
    <View style={s.statRow}>
      <Text style={s.statLabel}>{label}</Text>
      <Text style={[s.statValue, accent != null && { color: accent }]}>{value}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 16, paddingBottom: 40 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 },
  infoText: { fontFamily: FONT.body, color: C.textSecondary, fontSize: 14 },
  errorText: { fontFamily: FONT.body, color: C.red, fontSize: 14, textAlign: 'center' },
  hero: {
    marginTop: 8,
    marginBottom: 16,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 28,
    padding: 20,
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
    gap: 12,
  },
  eyebrow: {
    fontFamily: FONT.mono,
    color: C.gold,
    fontSize: 10,
    letterSpacing: 2.4,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  title: {
    fontFamily: FONT.heavy,
    color: C.text,
    fontSize: 28,
    lineHeight: 32,
  },
  statePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: `${C.green}55`,
    backgroundColor: `${C.green}16`,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  stateDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: C.green,
  },
  statePillText: {
    fontFamily: FONT.mono,
    color: C.green,
    fontSize: 11,
    letterSpacing: 1.1,
  },
  heroBand: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  clubRail: {
    gap: 10,
    paddingRight: 4,
    marginBottom: 14,
  },
  clubChip: {
    width: 126,
    backgroundColor: C.panelAlt,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  clubChipActive: {
    backgroundColor: `${C.gold}18`,
    borderColor: `${C.gold}55`,
  },
  clubChipLabel: {
    fontFamily: FONT.demi,
    color: C.text,
    fontSize: 14,
    marginBottom: 4,
  },
  clubChipLabelActive: {
    color: C.gold,
  },
  clubChipMeta: {
    fontFamily: FONT.body,
    color: C.textMuted,
    fontSize: 12,
    lineHeight: 17,
  },
  clubChipMetaActive: {
    color: C.textSecondary,
  },
  heroMetric: {
    flex: 1,
    backgroundColor: C.panel,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  heroMetricLabel: {
    fontFamily: FONT.body,
    color: C.textSecondary,
    fontSize: 11,
    marginBottom: 4,
  },
  heroMetricValue: {
    fontFamily: FONT.demi,
    color: C.text,
    fontSize: 18,
  },
  modeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  modeChip: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.panel,
  },
  modeChipActive: {
    backgroundColor: `${C.gold}18`,
    borderColor: `${C.gold}55`,
  },
  modeChipText: {
    fontFamily: FONT.demi,
    color: C.textSecondary,
    fontSize: 14,
  },
  modeChipTextActive: {
    color: C.gold,
  },
  section: {
    marginBottom: 16,
    backgroundColor: C.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: C.border,
    padding: 18,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionEyebrow: {
    fontFamily: FONT.mono,
    color: C.textMuted,
    fontSize: 10,
    letterSpacing: 2.2,
    textTransform: 'uppercase',
  },
  sectionLink: {
    fontFamily: FONT.demi,
    color: C.gold,
    fontSize: 13,
  },
  lastShotCard: {
    backgroundColor: C.panel,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: 18,
    paddingVertical: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  lastShotCarry: {
    fontFamily: FONT.mono,
    color: C.gold,
    fontSize: 54,
    lineHeight: 58,
  },
  lastShotUnit: {
    fontFamily: FONT.body,
    color: C.textSecondary,
    fontSize: 13,
    letterSpacing: 0.8,
  },
  lastShotMeta: {
    alignItems: 'flex-end',
    maxWidth: 130,
  },
  lastShotShape: {
    fontFamily: FONT.heavy,
    color: C.text,
    fontSize: 22,
    marginBottom: 4,
  },
  lastShotNote: {
    fontFamily: FONT.body,
    color: C.textSecondary,
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'right',
  },
  liveMetricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  liveMetric: {
    width: '48%',
    minWidth: 146,
    backgroundColor: C.panelAlt,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  liveMetricValue: {
    fontFamily: FONT.heavy,
    color: C.text,
    fontSize: 24,
    marginBottom: 4,
  },
  liveMetricUnit: {
    fontFamily: FONT.body,
    color: C.textSecondary,
    fontSize: 12,
  },
  liveMetricLabel: {
    fontFamily: FONT.body,
    color: C.textSecondary,
    fontSize: 12,
  },
  targetCard: {
    flexDirection: 'row',
    backgroundColor: C.panel,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: C.border,
    overflow: 'hidden',
    marginBottom: 10,
  },
  targetAccent: {
    width: 4,
  },
  targetBody: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  targetTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 7,
    alignItems: 'center',
  },
  targetLabel: {
    fontFamily: FONT.mono,
    color: C.textSecondary,
    fontSize: 12,
    letterSpacing: 1.1,
  },
  targetCurrent: {
    fontFamily: FONT.demi,
    fontSize: 16,
  },
  targetRange: {
    fontFamily: FONT.body,
    color: C.textSecondary,
    fontSize: 13,
    flex: 1,
    textAlign: 'right',
  },
  targetMetricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    gap: 10,
    marginBottom: 6,
  },
  targetNote: {
    fontFamily: FONT.body,
    color: C.text,
    fontSize: 13,
    lineHeight: 18,
  },
  targetStatusPill: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  targetStatusText: {
    fontFamily: FONT.mono,
    fontSize: 10,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  rail: {
    gap: 10,
    paddingRight: 4,
  },
  railCard: {
    width: 108,
    backgroundColor: C.panel,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  railAccent: {
    width: 28,
    height: 4,
    borderRadius: 2,
    marginBottom: 12,
  },
  railCarry: {
    fontFamily: FONT.heavy,
    color: C.text,
    fontSize: 28,
    marginBottom: 4,
  },
  railShape: {
    fontFamily: FONT.demi,
    color: C.textSecondary,
    fontSize: 13,
    marginBottom: 4,
  },
  railQuality: {
    fontFamily: FONT.body,
    color: C.textMuted,
    fontSize: 12,
    lineHeight: 16,
  },
  scopeToggle: {
    flexDirection: 'row',
    gap: 6,
  },
  scopeChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.panel,
  },
  scopeChipActive: {
    backgroundColor: `${C.gold}18`,
    borderColor: `${C.gold}55`,
  },
  scopeChipText: {
    fontFamily: FONT.demi,
    color: C.textSecondary,
    fontSize: 12,
  },
  scopeChipTextActive: {
    color: C.gold,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  statLabel: {
    fontFamily: FONT.body,
    color: C.textSecondary,
    fontSize: 14,
  },
  statValue: {
    fontFamily: FONT.demi,
    color: C.text,
    fontSize: 14,
  },
});
