import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  useClubs,
  useClubSessionStats,
} from '../../../lib/hooks/use-sqlite-training';
import { TrendChart, METRICS, type MetricKey } from '../../../components/charts/TrendChart';

// ─── Constants ────────────────────────────────────────────────────────────────

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
} as const;

// ─── Component ────────────────────────────────────────────────────────────────

export default function TrendOverviewScreen() {
  const { rows: clubs } = useClubs(false); // active clubs only

  const [selectedClubId, setSelectedClubId] = useState<string | null>(null);
  const [selectedMetrics, setSelectedMetrics] = useState<MetricKey[]>(['avg_carry', 'hit_rate_pct']);

  const activeClubId = selectedClubId ?? clubs[0]?.id ?? null;
  const { rows: sessionStats, loading } = useClubSessionStats(activeClubId);

  const activeClub = clubs.find((c) => c.id === activeClubId) ?? null;

  function toggleMetric(key: MetricKey) {
    setSelectedMetrics((prev) => {
      if (prev.includes(key)) {
        // Keep at least one selected
        if (prev.length === 1) return prev;
        return prev.filter((k) => k !== key);
      }
      return [...prev, key];
    });
  }

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <Pressable style={s.backRow} onPress={() => router.back()}>
          <Text style={s.backText}>← Zurück</Text>
        </Pressable>

        <Text style={s.eyebrow}>Analyse</Text>
        <Text style={s.title}>Trend-Übersicht</Text>
        <Text style={s.subtitle}>
          Entwicklung über Sessions — Schläger und Metriken wählen.
        </Text>

        {/* Club selector */}
        <Text style={s.sectionLabel}>Schläger</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.chipRow}
        >
          {clubs.map((club) => {
            const isActive = club.id === activeClubId;
            return (
              <Pressable
                key={club.id}
                style={[s.chip, isActive && s.chipActive]}
                onPress={() => setSelectedClubId(club.id)}
              >
                <Text style={[s.chipText, isActive && s.chipTextActive]}>
                  {club.name}
                </Text>
                {club.loft.trim().length > 0 && (
                  <Text style={[s.chipSub, isActive && s.chipSubActive]}>
                    {club.loft}°
                  </Text>
                )}
              </Pressable>
            );
          })}
          {clubs.length === 0 && (
            <Text style={s.fallback}>Keine Schläger vorhanden.</Text>
          )}
        </ScrollView>

        {/* Metric multi-select */}
        <Text style={s.sectionLabel}>Metriken</Text>
        <View style={s.metricRow}>
          {METRICS.map((m) => {
            const isActive = selectedMetrics.includes(m.key);
            return (
              <Pressable
                key={m.key}
                style={[
                  s.metricChip,
                  isActive && { borderColor: m.color, backgroundColor: `${m.color}18` },
                ]}
                onPress={() => toggleMetric(m.key)}
              >
                <View style={[s.metricDot, { backgroundColor: isActive ? m.color : C.dim }]} />
                <Text style={[s.metricLabel, isActive && { color: m.color }]}>
                  {m.label}
                </Text>
                <Text style={[s.metricUnit, isActive && { color: `${m.color}99` }]}>
                  {m.unit}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Charts */}
        {activeClub != null && (
          <Text style={s.sectionLabel}>
            {activeClub.name}
            {activeClub.type.length > 0 ? ` · ${activeClub.type}` : ''}
            {activeClub.loft.trim().length > 0 ? ` · ${activeClub.loft}°` : ''}
          </Text>
        )}

        {loading && <Text style={s.fallback}>Wird geladen…</Text>}

        {!loading && sessionStats.length < 2 && activeClubId != null && (
          <View style={s.emptyCard}>
            <Text style={s.fallback}>
              {sessionStats.length === 0
                ? 'Noch keine Sessions mit diesem Schläger.'
                : 'Mindestens 2 Sessions für den Trend-Chart.'}
            </Text>
          </View>
        )}

        {!loading && sessionStats.length >= 2 &&
          METRICS.filter((m) => selectedMetrics.includes(m.key)).map((m) => (
            <View key={m.key}>
              <Text style={s.chartLabel}>{m.label}</Text>
              <TrendChart sessions={sessionStats} metric={m.key} />
            </View>
          ))
        }
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  content: { padding: 16, paddingBottom: 110 },

  backRow: { marginBottom: 12 },
  backText: { fontFamily: FONT.demi, color: C.gold, fontSize: 14 },

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
    marginBottom: 10,
  },
  subtitle: {
    fontFamily: FONT.body,
    color: C.muted,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 20,
  },

  sectionLabel: {
    fontFamily: FONT.mono,
    color: C.dim,
    fontSize: 10,
    letterSpacing: 2.2,
    textTransform: 'uppercase',
    marginBottom: 10,
    marginTop: 4,
  },

  chipRow: {
    flexDirection: 'row',
    gap: 8,
    paddingBottom: 16,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.surface,
    alignItems: 'center',
  },
  chipActive: {
    borderColor: C.gold,
    backgroundColor: `${C.gold}18`,
  },
  chipText: {
    fontFamily: FONT.demi,
    color: C.muted,
    fontSize: 13,
  },
  chipTextActive: {
    color: C.gold,
  },
  chipSub: {
    fontFamily: FONT.mono,
    color: C.dim,
    fontSize: 9,
    marginTop: 2,
  },
  chipSubActive: {
    color: `${C.gold}99`,
  },

  metricRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  metricChip: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.surface,
    gap: 4,
  },
  metricDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  metricLabel: {
    fontFamily: FONT.mono,
    color: C.dim,
    fontSize: 9,
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  metricUnit: {
    fontFamily: FONT.mono,
    color: C.dim,
    fontSize: 8,
  },

  chartLabel: {
    fontFamily: FONT.mono,
    color: C.dim,
    fontSize: 9,
    letterSpacing: 1.8,
    textTransform: 'uppercase',
    marginBottom: 6,
  },

  emptyCard: {
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 12,
  },
  fallback: {
    fontFamily: FONT.body,
    color: C.muted,
    fontSize: 14,
  },
});
