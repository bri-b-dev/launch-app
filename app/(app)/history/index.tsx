import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useSessionsEnriched } from '../../../lib/hooks/use-sqlite-training';

const FONT = {
  mono: Platform.OS === 'ios' ? 'Menlo-Regular' : 'monospace',
  body: Platform.OS === 'ios' ? 'AvenirNext-Regular' : 'sans-serif',
  demi: Platform.OS === 'ios' ? 'AvenirNext-DemiBold' : 'sans-serif-medium',
  heavy: Platform.OS === 'ios' ? 'AvenirNext-Heavy' : 'sans-serif-medium',
} as const;

const ACCENT: Record<string, string> = {
  green: '#4AC18D',
  blue: '#4A9CD2',
  gold: '#D2B15C',
  orange: '#DE6E63',
};

function extractIsoDate(sessionId: string): string | null {
  return sessionId.match(/session-(\d{4}-\d{2}-\d{2})/)?.[1] ?? null;
}

function isWithinDays(sessionId: string, days: number): boolean {
  const iso = extractIsoDate(sessionId);
  if (iso == null) return false;
  const sessionMs = new Date(iso).getTime();
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  return sessionMs >= cutoff;
}

export default function HistoryScreen() {
  const { rows: sessions, loading, error } = useSessionsEnriched();

  const summary = useMemo(() => {
    const total = sessions.length;
    const thisWeek = sessions.filter((s) => isWithinDays(s.id, 7)).length;
    const totalShots = sessions.reduce((acc, s) => {
      const n = Number.parseInt(s.shots_label, 10);
      return acc + (Number.isFinite(n) ? n : 0);
    }, 0);
    return { total, thisWeek, totalShots };
  }, [sessions]);

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <Text style={s.eyebrow}>History</Text>
        <Text style={s.title}>Vergangene Sessions</Text>
        <Text style={s.subtitle}>
          Chronologisch, knapp und vergleichbar. Nicht jeder Schlag, sondern erst die Muster.
        </Text>

        <View style={s.summaryRow}>
          <SummaryCard label="Sessions" value={String(summary.total)} />
          <SummaryCard label="Diese Woche" value={String(summary.thisWeek)} />
          <SummaryCard label="Schläge gesamt" value={String(summary.totalShots)} />
        </View>

        {loading && <Text style={s.infoText}>Lade Sessions…</Text>}
        {error != null && <Text style={s.errorText}>{error}</Text>}

        {sessions.map((session) => (
          <Pressable
            key={session.id}
            style={({ pressed }) => [s.sessionCard, pressed && s.sessionCardPressed]}
            onPress={() => router.push(`/history/${session.id}`)}
          >
            <Text style={s.sessionDate}>{session.date}</Text>
            <View style={s.sessionBody}>
              <Text style={s.sessionTitle}>{session.title}</Text>
              <Text style={s.sessionMeta}>
                {session.shots_label}
                {session.carry_label.length > 1 ? ` · ${session.carry_label}` : ''}
              </Text>
              {session.club_names.length > 0 && (
                <Text style={s.sessionClubs}>{session.club_names}</Text>
              )}
              {session.summary.length > 0 && (
                <Text style={s.sessionSummary}>{session.summary}</Text>
              )}
            </View>
            <Text style={s.chevron}>›</Text>
          </Pressable>
        ))}

        {!loading && sessions.length === 0 && error == null && (
          <Text style={s.infoText}>Noch keine Sessions aufgezeichnet.</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function SummaryCard({ label, value }: Readonly<{ label: string; value: string }>) {
  return (
    <View style={s.summaryCard}>
      <Text style={s.summaryLabel}>{label}</Text>
      <Text style={s.summaryValue}>{value}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#080C10' },
  content: { padding: 16, paddingBottom: 110 },
  eyebrow: {
    fontFamily: FONT.mono,
    color: '#D2B15C',
    fontSize: 10,
    letterSpacing: 2.4,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  title: {
    fontFamily: FONT.heavy,
    color: '#EEF3F7',
    fontSize: 28,
    lineHeight: 32,
    marginBottom: 10,
  },
  subtitle: {
    fontFamily: FONT.body,
    color: '#8DA0B3',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 16,
  },
  summaryRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  summaryCard: {
    flex: 1,
    backgroundColor: '#111E28',
    borderWidth: 1,
    borderColor: '#223244',
    borderRadius: 18,
    padding: 12,
  },
  summaryLabel: { fontFamily: FONT.body, color: '#8DA0B3', fontSize: 11, marginBottom: 4 },
  summaryValue: { fontFamily: FONT.demi, color: '#EEF3F7', fontSize: 16 },
  infoText: { fontFamily: FONT.body, color: '#8DA0B3', fontSize: 14, marginBottom: 12 },
  errorText: { fontFamily: FONT.body, color: '#DE6E63', fontSize: 14, marginBottom: 12 },
  sessionCard: {
    backgroundColor: '#0D1821',
    borderWidth: 1,
    borderColor: '#223244',
    borderRadius: 22,
    padding: 16,
    flexDirection: 'row',
    gap: 14,
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  sessionCardPressed: { opacity: 0.7 },
  sessionDate: {
    fontFamily: FONT.mono,
    color: '#D2B15C',
    fontSize: 12,
    width: 52,
    marginTop: 2,
  },
  sessionBody: { flex: 1, gap: 3 },
  sessionTitle: { fontFamily: FONT.demi, color: '#EEF3F7', fontSize: 17, marginBottom: 2 },
  sessionMeta: { fontFamily: FONT.body, color: '#8DA0B3', fontSize: 13 },
  sessionClubs: { fontFamily: FONT.demi, color: '#D2B15C', fontSize: 13 },
  sessionSummary: { fontFamily: FONT.body, color: '#53677A', fontSize: 12, lineHeight: 17 },
  chevron: {
    color: '#3A5068',
    fontSize: 22,
    fontFamily: FONT.body,
    alignSelf: 'center',
    marginLeft: 4,
  },
});
