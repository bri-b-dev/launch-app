import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import {
  computeStats,
  useSessionDetail,
  useSessionShotsDetail,
  type DbShotDetail,
} from '../../../lib/hooks/use-sqlite-training';
import { ShotDispersionChart } from '../../../components/charts/ShotDispersionChart';

const FONT = {
  mono: Platform.OS === 'ios' ? 'Menlo-Regular' : 'monospace',
  body: Platform.OS === 'ios' ? 'AvenirNext-Regular' : 'sans-serif',
  demi: Platform.OS === 'ios' ? 'AvenirNext-DemiBold' : 'sans-serif-medium',
  heavy: Platform.OS === 'ios' ? 'AvenirNext-Heavy' : 'sans-serif-medium',
} as const;

const ACCENT_COLOR: Record<string, string> = {
  green: '#4AC18D',
  blue: '#4A9CD2',
  gold: '#D2B15C',
  orange: '#DE6E63',
};

function shapeDistLabel(shots: DbShotDetail[]): string {
  const counts: Record<string, number> = {};
  for (const s of shots) {
    counts[s.shape] = (counts[s.shape] ?? 0) + 1;
  }
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([shape, count]) => `${count}× ${shape}`)
    .join(' · ');
}

export default function HistoryDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { session, clubs, loading, error } = useSessionDetail(id ?? null);
  const { rows: shots } = useSessionShotsDetail(id ?? null);

  const statsAll = useMemo(() => computeStats(shots), [shots]);

  const perClubStats = useMemo(() => {
    const map = new Map<string, DbShotDetail[]>();
    for (const shot of shots) {
      const arr = map.get(shot.club_id) ?? [];
      arr.push(shot);
      map.set(shot.club_id, arr);
    }
    return map;
  }, [shots]);

  if (loading) {
    return (
      <SafeAreaView style={s.safe}>
        <View style={s.center}><Text style={s.fallback}>Session wird geladen…</Text></View>
      </SafeAreaView>
    );
  }

  if (error != null) {
    return (
      <SafeAreaView style={s.safe}>
        <View style={s.center}><Text style={s.errorText}>{error}</Text></View>
      </SafeAreaView>
    );
  }

  if (!session) {
    return (
      <SafeAreaView style={s.safe}>
        <View style={s.center}><Text style={s.fallback}>Session nicht gefunden</Text></View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Text style={s.eyebrow}>{session.date}</Text>
        <Text style={s.title}>{session.title}</Text>
        <Text style={s.subtitle}>{session.summary}</Text>

        {/* Fokus */}
        <View style={s.card}>
          <Text style={s.cardLabel}>Fokus</Text>
          <Text style={s.cardBody}>{session.focus}</Text>
          <Text style={s.cardMeta}>{session.shots_label} · {session.carry_label}</Text>
        </View>

        {/* Per-club session breakdown */}
        {clubs.length > 0 && (
          <>
            <SectionHeading label="Schläger dieser Session" />
            {clubs.map((club) => {
              const clubShots = perClubStats.get(club.id) ?? [];
              const st = computeStats(clubShots);
              return (
                <View key={club.id} style={s.clubCard}>
                  <View style={s.clubHeader}>
                    <Text style={s.clubName}>{club.name}</Text>
                    <Text style={s.clubType}>{club.type}{club.loft ? ` · ${club.loft}°` : ''}</Text>
                  </View>

                  {clubShots.length > 0 ? (
                    <>
                      <View style={s.clubStatsRow}>
                        <ClubStat
                          label="Schläge"
                          value={String(st.shotCount)}
                        />
                        <ClubStat
                          label="Ø Carry"
                          value={
                            st.avgCarry != null
                              ? `${Math.round(st.avgCarry)}y${st.stdDevCarry != null ? ` ±${Math.round(st.stdDevCarry)}` : ''}`
                              : '—'
                          }
                          accent="#D2B15C"
                        />
                        <ClubStat
                          label="Trefferquote"
                          value={st.hitRatePct != null ? `${Math.round(st.hitRatePct)}%` : '—'}
                          accent={
                            st.hitRatePct != null && st.hitRatePct >= 70 ? '#4AC18D'
                              : st.hitRatePct != null && st.hitRatePct >= 50 ? '#D2B15C'
                                : '#DE6E63'
                          }
                        />
                        {st.avgBallSpeed != null && (
                          <ClubStat
                            label="Ø Ball Speed"
                            value={`${st.avgBallSpeed.toFixed(0)} mph`}
                          />
                        )}
                      </View>
                      <Text style={s.clubShapeLabel}>{shapeDistLabel(clubShots)}</Text>
                    </>
                  ) : (
                    <Text style={s.fallback}>Keine Schläge in dieser Session.</Text>
                  )}
                </View>
              );
            })}
          </>
        )}

        {/* Overall stats */}
        <SectionHeading label="Gesamtstatistik" />
        <View style={s.card}>
          {statsAll.shotCount === 0 ? (
            <Text style={s.fallback}>Keine Schläge in dieser Session.</Text>
          ) : (
            <>
              <StatRow label="Schläge" value={String(statsAll.shotCount)} />
              <StatRow
                label="Ø Carry"
                value={
                  statsAll.avgCarry != null
                    ? `${Math.round(statsAll.avgCarry)} y${statsAll.stdDevCarry != null ? ` ± ${Math.round(statsAll.stdDevCarry)} y` : ''}`
                    : '—'
                }
                accent="#D2B15C"
              />
              {(statsAll.minCarry != null || statsAll.maxCarry != null) && (
                <StatRow
                  label="Carry Spanne"
                  value={
                    statsAll.minCarry != null && statsAll.maxCarry != null
                      ? `${Math.round(statsAll.minCarry)} – ${Math.round(statsAll.maxCarry)} y`
                      : '—'
                  }
                />
              )}
              <StatRow
                label="Trefferquote"
                value={statsAll.hitRatePct != null ? `${Math.round(statsAll.hitRatePct)} %` : '—'}
                accent={
                  statsAll.hitRatePct != null && statsAll.hitRatePct >= 70 ? '#4AC18D'
                    : statsAll.hitRatePct != null && statsAll.hitRatePct >= 50 ? '#D2B15C'
                      : '#DE6E63'
                }
              />
              {Object.keys(statsAll.shapeDist).length > 0 && (
                <StatRow
                  label="Schlagformen"
                  value={Object.entries(statsAll.shapeDist)
                    .sort((a, b) => b[1] - a[1])
                    .map(([shape, count]) => `${count}× ${shape}`)
                    .join(' · ')}
                />
              )}
              {statsAll.avgBallSpeed != null && (
                <StatRow
                  label="Ø Ball Speed"
                  value={`${statsAll.avgBallSpeed.toFixed(1)} mph${statsAll.stdDevBallSpeed != null ? ` ± ${statsAll.stdDevBallSpeed.toFixed(1)}` : ''}`}
                />
              )}
              {statsAll.avgClubSpeed != null && (
                <StatRow
                  label="Ø Club Speed"
                  value={`${statsAll.avgClubSpeed.toFixed(1)} mph${statsAll.stdDevClubSpeed != null ? ` ± ${statsAll.stdDevClubSpeed.toFixed(1)}` : ''}`}
                />
              )}
              {statsAll.smashFactor != null && (
                <StatRow
                  label="Smash Factor"
                  value={statsAll.smashFactor.toFixed(2)}
                  accent={
                    statsAll.smashFactor >= 1.48 ? '#4AC18D'
                      : statsAll.smashFactor >= 1.40 ? '#D2B15C'
                        : '#DE6E63'
                  }
                />
              )}
              {statsAll.avgVla != null && (
                <StatRow label="Ø VLA" value={`${statsAll.avgVla.toFixed(1)} °`} />
              )}
              {statsAll.avgSpin != null && (
                <StatRow
                  label="Ø Spin"
                  value={`${Math.round(statsAll.avgSpin)} rpm${statsAll.stdDevSpin != null ? ` ± ${Math.round(statsAll.stdDevSpin)} rpm` : ''}`}
                />
              )}
            </>
          )}
        </View>

        {/* Shot Dispersion */}
        {shots.length > 0 && (
          <>
            <SectionHeading label="Shot Dispersion" />
            <View style={s.chartCard}>
              <ShotDispersionChart shots={shots} />
            </View>
          </>
        )}

        {/* Individual shots */}
        {shots.length > 0 && (
          <>
            <SectionHeading label={`Schläge (${shots.length})`} />
            <View style={s.card}>
              {shots.map((shot, index) => (
                <ShotRow key={shot.id} shot={shot} isLast={index === shots.length - 1} />
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function SectionHeading({ label }: Readonly<{ label: string }>) {
  return (
    <Text style={s.sectionHeading}>{label}</Text>
  );
}

function ClubStat({
  label,
  value,
  accent,
}: Readonly<{ label: string; value: string; accent?: string }>) {
  return (
    <View style={s.clubStat}>
      <Text style={s.clubStatLabel}>{label}</Text>
      <Text style={[s.clubStatValue, accent != null && { color: accent }]}>{value}</Text>
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

function ShotRow({
  shot,
  isLast,
}: Readonly<{ shot: DbShotDetail; isLast: boolean }>) {
  const accentColor = ACCENT_COLOR[shot.accent] ?? '#8DA0B3';
  const carryNum = Number.parseFloat(shot.carry);
  const ballSpeedNum = Number.parseFloat(shot.ball_speed);
  const spinNum = Number.parseFloat(shot.spin);
  const vlaNum = Number.parseFloat(shot.vla);

  return (
    <View style={[s.shotRow, !isLast && s.shotRowBorder]}>
      <View style={[s.shotDot, { backgroundColor: accentColor }]} />
      <View style={s.shotBody}>
        <View style={s.shotTopRow}>
          <Text style={[s.shotShape, { color: accentColor }]}>{shot.shape}</Text>
          <Text style={s.shotQuality}>{shot.quality}</Text>
          <Text style={s.shotClubName}>{shot.club_name}</Text>
        </View>
        <View style={s.shotMetaRow}>
          {Number.isFinite(carryNum) && (
            <Text style={s.shotMetaItem}>{Math.round(carryNum)} y</Text>
          )}
          {Number.isFinite(ballSpeedNum) && (
            <Text style={s.shotMetaItem}>{ballSpeedNum.toFixed(0)} mph</Text>
          )}
          {Number.isFinite(spinNum) && (
            <Text style={s.shotMetaItem}>{Math.round(spinNum)} rpm</Text>
          )}
          {Number.isFinite(vlaNum) && (
            <Text style={s.shotMetaItem}>VLA {vlaNum.toFixed(1)}°</Text>
          )}
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#080C10' },
  content: { padding: 16, paddingBottom: 110 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  fallback: { color: '#8DA0B3', fontFamily: FONT.body, fontSize: 14 },
  errorText: { color: '#DE6E63', fontFamily: FONT.body, fontSize: 16, textAlign: 'center' },

  eyebrow: { fontFamily: FONT.mono, color: '#D2B15C', fontSize: 10, letterSpacing: 2.4, marginBottom: 8 },
  title: { fontFamily: FONT.heavy, color: '#EEF3F7', fontSize: 28, lineHeight: 32, marginBottom: 10 },
  subtitle: { fontFamily: FONT.body, color: '#8DA0B3', fontSize: 15, lineHeight: 22, marginBottom: 16 },

  card: { backgroundColor: '#0D1821', borderWidth: 1, borderColor: '#223244', borderRadius: 22, padding: 16, marginBottom: 14 },
  chartCard: { backgroundColor: '#080C10', borderWidth: 1, borderColor: '#223244', borderRadius: 22, overflow: 'hidden', marginBottom: 14 },
  cardLabel: { fontFamily: FONT.mono, color: '#53677A', fontSize: 11, marginBottom: 6 },
  cardBody: { fontFamily: FONT.body, color: '#EEF3F7', fontSize: 15, lineHeight: 22, marginBottom: 10 },
  cardMeta: { fontFamily: FONT.body, color: '#8DA0B3', fontSize: 13 },

  sectionHeading: { fontFamily: FONT.mono, color: '#53677A', fontSize: 10, letterSpacing: 2.2, textTransform: 'uppercase', marginBottom: 10, marginTop: 6 },

  clubCard: { backgroundColor: '#111E28', borderWidth: 1, borderColor: '#223244', borderRadius: 20, padding: 16, marginBottom: 12 },
  clubHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 },
  clubName: { fontFamily: FONT.demi, color: '#EEF3F7', fontSize: 18 },
  clubType: { fontFamily: FONT.mono, color: '#53677A', fontSize: 11 },
  clubStatsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 10 },
  clubStat: { backgroundColor: '#0D1821', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8, minWidth: 70 },
  clubStatLabel: { fontFamily: FONT.mono, color: '#53677A', fontSize: 9, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 3 },
  clubStatValue: { fontFamily: FONT.demi, color: '#EEF3F7', fontSize: 14 },
  clubShapeLabel: { fontFamily: FONT.body, color: '#8DA0B3', fontSize: 13 },

  statRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#223244' },
  statLabel: { fontFamily: FONT.body, color: '#8DA0B3', fontSize: 14 },
  statValue: { fontFamily: FONT.demi, color: '#EEF3F7', fontSize: 14 },

  shotRow: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 11, gap: 12 },
  shotRowBorder: { borderBottomWidth: 1, borderBottomColor: '#223244' },
  shotDot: { width: 8, height: 8, borderRadius: 4, marginTop: 5 },
  shotBody: { flex: 1, gap: 4 },
  shotTopRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  shotShape: { fontFamily: FONT.demi, fontSize: 14 },
  shotQuality: { fontFamily: FONT.body, color: '#8DA0B3', fontSize: 13 },
  shotClubName: { fontFamily: FONT.body, color: '#53677A', fontSize: 13, marginLeft: 'auto' },
  shotMetaRow: { flexDirection: 'row', gap: 10 },
  shotMetaItem: { fontFamily: FONT.mono, color: '#8DA0B3', fontSize: 12 },
});
