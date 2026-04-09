import React from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useSessions } from '../../../lib/hooks/use-sqlite-training';

const FONT = {
  mono: Platform.OS === 'ios' ? 'Menlo-Regular' : 'monospace',
  body: Platform.OS === 'ios' ? 'AvenirNext-Regular' : 'sans-serif',
  demi: Platform.OS === 'ios' ? 'AvenirNext-DemiBold' : 'sans-serif-medium',
  heavy: Platform.OS === 'ios' ? 'AvenirNext-Heavy' : 'sans-serif-medium',
} as const;

export default function HistoryScreen() {
  const { rows: sessions, loading, error } = useSessions();

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <Text style={s.eyebrow}>History</Text>
        <Text style={s.title}>Vergangene Sessions schnell lesen</Text>
        <Text style={s.subtitle}>
          Chronologisch, knapp und vergleichbar. Nicht jeder Schlag, sondern erst die Muster.
        </Text>

        <View style={s.summaryRow}>
          <SummaryCard label="Sessions" value="14" />
          <SummaryCard label="Diese Woche" value="3" />
          <SummaryCard label="Trend" value="AoA besser" />
        </View>

        {loading && <Text style={s.infoText}>Lade Sessions…</Text>}
        {error != null && <Text style={s.errorText}>{error}</Text>}

        {sessions.map((session) => (
          <Pressable key={session.id} style={s.sessionCard} onPress={() => router.push(`/history/${session.id}`)}>
            <Text style={s.sessionDate}>{session.date}</Text>
            <View style={s.sessionBody}>
              <Text style={s.sessionTitle}>{session.title}</Text>
              <Text style={s.sessionMeta}>{session.shots_label}</Text>
              <Text style={s.sessionCarry}>{session.carry_label}</Text>
            </View>
          </Pressable>
        ))}
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
  infoText: { fontFamily: FONT.body, color: '#8DA0B3', fontSize: 14, marginBottom: 12 },
  errorText: { fontFamily: FONT.body, color: '#DE6E63', fontSize: 14, marginBottom: 12 },
  summaryLabel: { fontFamily: FONT.body, color: '#8DA0B3', fontSize: 11, marginBottom: 4 },
  summaryValue: { fontFamily: FONT.demi, color: '#EEF3F7', fontSize: 16 },
  sessionCard: {
    backgroundColor: '#0D1821',
    borderWidth: 1,
    borderColor: '#223244',
    borderRadius: 22,
    padding: 16,
    flexDirection: 'row',
    gap: 14,
    marginBottom: 12,
  },
  sessionDate: {
    fontFamily: FONT.mono,
    color: '#D2B15C',
    fontSize: 12,
    width: 52,
    marginTop: 2,
  },
  sessionBody: { flex: 1 },
  sessionTitle: { fontFamily: FONT.demi, color: '#EEF3F7', fontSize: 18, marginBottom: 5 },
  sessionMeta: { fontFamily: FONT.body, color: '#8DA0B3', fontSize: 13, marginBottom: 2 },
  sessionCarry: { fontFamily: FONT.body, color: '#53677A', fontSize: 13 },
});
