import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import {
  computeStats,
  useClubShots,
  useClubSessionStats,
  useClubs,
  type DbClubSessionStat,
} from '../../../lib/hooks/use-sqlite-training';
import { TrendChart } from '../../../components/charts/TrendChart';

const FONT = {
  mono: Platform.OS === 'ios' ? 'Menlo-Regular' : 'monospace',
  body: Platform.OS === 'ios' ? 'AvenirNext-Regular' : 'sans-serif',
  demi: Platform.OS === 'ios' ? 'AvenirNext-DemiBold' : 'sans-serif-medium',
  heavy: Platform.OS === 'ios' ? 'AvenirNext-Heavy' : 'sans-serif-medium',
} as const;

const C = {
  bg: '#080C10',
  surface: '#0D1821',
  panel: '#111E28',
  border: '#223244',
  text: '#EEF3F7',
  muted: '#8DA0B3',
  dim: '#53677A',
  gold: '#D2B15C',
  green: '#4AC18D',
  red: '#DE6E63',
} as const;

export default function ClubVerlaufScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { rows: clubs } = useClubs(true);
  const club = clubs.find((c) => c.id === id) ?? null;

  const { rows: allShots } = useClubShots(id ?? null);
  const { rows: sessionStats, loading } = useClubSessionStats(id ?? null);

  const overallStats = useMemo(() => computeStats(allShots), [allShots]);

  if (club == null && !loading) {
    return (
      <SafeAreaView style={s.safe} edges={['top']}>
        <View style={s.center}>
          <Text style={s.fallback}>Schläger nicht gefunden.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <Pressable style={s.backRow} onPress={() => router.back()}>
          <Text style={s.backText}>← Zurück</Text>
        </Pressable>

        {club != null && (
          <>
            <Text style={s.eyebrow}>{club.type}{club.loft ? ` · ${club.loft}°` : ''}</Text>
            <Text style={s.title}>{club.name}</Text>
            {[club.length, club.manufacturer, club.model]
              .filter((v) => v.trim().length > 0)
              .join(' · ')
              .length > 0 && (
              <Text style={s.subtitle}>
                {[club.length, club.manufacturer, club.model].filter((v) => v.trim().length > 0).join(' · ')}
              </Text>
            )}
          </>
        )}

        <Text style={s.sectionHeading}>Gesamtübersicht</Text>
        <View style={s.card}>
          {overallStats.shotCount === 0 ? (
            <Text style={s.fallback}>Noch keine Schläge mit diesem Schläger.</Text>
          ) : (
            <>
              <StatRow label="Schläge gesamt" value={String(overallStats.shotCount)} />
              <StatRow
                label="Ø Carry"
                value={
                  overallStats.avgCarry != null
                    ? `${Math.round(overallStats.avgCarry)} y${overallStats.stdDevCarry != null ? ` ± ${Math.round(overallStats.stdDevCarry)} y` : ''}`
                    : '—'
                }
                accent={C.gold}
              />
              <StatRow
                label="Trefferquote"
                value={overallStats.hitRatePct != null ? `${Math.round(overallStats.hitRatePct)} %` : '—'}
                accent={
                  overallStats.hitRatePct != null && overallStats.hitRatePct >= 70
                    ? C.green
                    : overallStats.hitRatePct != null && overallStats.hitRatePct >= 50
                      ? C.gold
                      : C.red
                }
                isLast={overallStats.avgBallSpeed == null}
              />
              {overallStats.avgBallSpeed != null && (
                <StatRow
                  label="Ø Ball Speed"
                  value={`${overallStats.avgBallSpeed.toFixed(1)} mph`}
                />
              )}
              {overallStats.avgClubSpeed != null && (
                <StatRow
                  label="Ø Club Speed"
                  value={`${overallStats.avgClubSpeed.toFixed(1)} mph`}
                />
              )}
              {overallStats.avgVla != null && (
                <StatRow label="Ø VLA" value={`${overallStats.avgVla.toFixed(1)} °`} />
              )}
              {overallStats.avgSpin != null && (
                <StatRow
                  label="Ø Spin"
                  value={`${Math.round(overallStats.avgSpin)} rpm`}
                  isLast
                />
              )}
            </>
          )}
        </View>

        <Text style={s.sectionHeading}>Verlauf pro Session ({sessionStats.length})</Text>

        {!loading && sessionStats.length >= 2 && (
          <TrendChart sessions={sessionStats} />
        )}

        {loading ? (
          <Text style={s.fallback}>Wird geladen…</Text>
        ) : sessionStats.length === 0 ? (
          <Text style={s.fallback}>Noch keine Sessions mit diesem Schläger.</Text>
        ) : (
          sessionStats.map((stat, index) => (
            <SessionStatCard key={stat.session_id} stat={stat} isFirst={index === 0} />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function SessionStatCard({
  stat,
  isFirst,
}: Readonly<{ stat: DbClubSessionStat; isFirst: boolean }>) {
  const hitColor =
    stat.hit_rate_pct != null && stat.hit_rate_pct >= 70
      ? C.green
      : stat.hit_rate_pct != null && stat.hit_rate_pct >= 50
        ? C.gold
        : C.red;

  return (
    <View style={[s.sessionCard, isFirst && s.sessionCardFirst]}>
      <View style={s.sessionHeader}>
        <View>
          <Text style={s.sessionDate}>{stat.date || '—'}</Text>
          <Text style={s.sessionTitle}>{stat.title}</Text>
        </View>
        <Text style={s.sessionShots}>{stat.shot_count} Schläge</Text>
      </View>
      <View style={s.sessionStatsRow}>
        <SessionStat
          label="Ø Carry"
          value={stat.avg_carry != null ? `${Math.round(stat.avg_carry)} y` : '—'}
          accent={C.gold}
        />
        <SessionStat
          label="Trefferquote"
          value={stat.hit_rate_pct != null ? `${Math.round(stat.hit_rate_pct)} %` : '—'}
          accent={hitColor}
        />
        {stat.avg_ball_speed != null && (
          <SessionStat
            label="Ø Ball Speed"
            value={`${stat.avg_ball_speed.toFixed(0)} mph`}
          />
        )}
      </View>
    </View>
  );
}

function StatRow({
  label,
  value,
  accent,
  isLast,
}: Readonly<{ label: string; value: string; accent?: string; isLast?: boolean }>) {
  return (
    <View style={[s.statRow, isLast === true && s.statRowLast]}>
      <Text style={s.statLabel}>{label}</Text>
      <Text style={[s.statValue, accent != null && { color: accent }]}>{value}</Text>
    </View>
  );
}

function SessionStat({
  label,
  value,
  accent,
}: Readonly<{ label: string; value: string; accent?: string }>) {
  return (
    <View style={s.sessionStat}>
      <Text style={s.sessionStatLabel}>{label}</Text>
      <Text style={[s.sessionStatValue, accent != null && { color: accent }]}>{value}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  content: { padding: 16, paddingBottom: 40 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  fallback: { fontFamily: FONT.body, color: C.muted, fontSize: 14 },

  backRow: { marginBottom: 12 },
  backText: { fontFamily: FONT.demi, color: C.gold, fontSize: 14 },

  eyebrow: {
    fontFamily: FONT.mono,
    color: C.gold,
    fontSize: 10,
    letterSpacing: 2.4,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  title: {
    fontFamily: FONT.heavy,
    color: C.text,
    fontSize: 28,
    lineHeight: 32,
    marginBottom: 6,
  },
  subtitle: {
    fontFamily: FONT.body,
    color: C.muted,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
  },

  sectionHeading: {
    fontFamily: FONT.mono,
    color: C.dim,
    fontSize: 10,
    letterSpacing: 2.2,
    textTransform: 'uppercase',
    marginTop: 20,
    marginBottom: 10,
  },

  card: {
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 4,
  },

  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  statRowLast: { borderBottomWidth: 0 },
  statLabel: { fontFamily: FONT.body, color: C.muted, fontSize: 14 },
  statValue: { fontFamily: FONT.demi, color: C.text, fontSize: 14 },

  sessionCard: {
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 20,
    padding: 16,
    marginBottom: 10,
  },
  sessionCardFirst: {
    borderColor: `${C.gold}55`,
    backgroundColor: C.panel,
  },

  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  sessionDate: {
    fontFamily: FONT.mono,
    color: C.gold,
    fontSize: 10,
    letterSpacing: 1.5,
    marginBottom: 3,
  },
  sessionTitle: { fontFamily: FONT.demi, color: C.text, fontSize: 15 },
  sessionShots: { fontFamily: FONT.mono, color: C.dim, fontSize: 12 },

  sessionStatsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  sessionStat: {
    backgroundColor: C.bg,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: 80,
  },
  sessionStatLabel: {
    fontFamily: FONT.mono,
    color: C.dim,
    fontSize: 9,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 3,
  },
  sessionStatValue: { fontFamily: FONT.demi, color: C.text, fontSize: 14 },
});
