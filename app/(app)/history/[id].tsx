import React from 'react';
import { View, Text, StyleSheet, ScrollView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { useSessionDetail } from '../../../lib/hooks/use-sqlite-training';

const FONT = {
  mono: Platform.OS === 'ios' ? 'Menlo-Regular' : 'monospace',
  body: Platform.OS === 'ios' ? 'AvenirNext-Regular' : 'sans-serif',
  demi: Platform.OS === 'ios' ? 'AvenirNext-DemiBold' : 'sans-serif-medium',
  heavy: Platform.OS === 'ios' ? 'AvenirNext-Heavy' : 'sans-serif-medium',
} as const;

export default function HistoryDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { session, clubs, loading, error } = useSessionDetail(id ?? null);

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
        <Text style={s.eyebrow}>{session.date}</Text>
        <Text style={s.title}>{session.title}</Text>
        <Text style={s.subtitle}>{session.summary}</Text>

        <View style={s.summaryCard}>
          <Text style={s.summaryLabel}>Fokus</Text>
          <Text style={s.summaryText}>{session.focus}</Text>
          <Text style={s.summaryMeta}>{session.shots_label} · {session.carry_label}</Text>
        </View>

        {clubs.map((club) => (
          <View key={club.id} style={s.clubCard}>
            <Text style={s.clubName}>{club.name}</Text>
            <Text style={s.clubMeta}>{club.avg_carry} · Trefferquote {club.hit_rate}</Text>
            <Text style={s.clubBody}>{club.target}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#080C10' },
  content: { padding: 16, paddingBottom: 40 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  fallback: { color: '#8DA0B3', fontFamily: FONT.body, fontSize: 16 },
  errorText: { color: '#DE6E63', fontFamily: FONT.body, fontSize: 16, textAlign: 'center' },
  eyebrow: { fontFamily: FONT.mono, color: '#D2B15C', fontSize: 10, letterSpacing: 2.4, marginBottom: 8 },
  title: { fontFamily: FONT.heavy, color: '#EEF3F7', fontSize: 28, lineHeight: 32, marginBottom: 10 },
  subtitle: { fontFamily: FONT.body, color: '#8DA0B3', fontSize: 15, lineHeight: 22, marginBottom: 16 },
  summaryCard: { backgroundColor: '#0D1821', borderWidth: 1, borderColor: '#223244', borderRadius: 22, padding: 16, marginBottom: 14 },
  summaryLabel: { fontFamily: FONT.mono, color: '#53677A', fontSize: 11, marginBottom: 6 },
  summaryText: { fontFamily: FONT.body, color: '#EEF3F7', fontSize: 15, lineHeight: 22, marginBottom: 10 },
  summaryMeta: { fontFamily: FONT.body, color: '#8DA0B3', fontSize: 13 },
  clubCard: { backgroundColor: '#111E28', borderWidth: 1, borderColor: '#223244', borderRadius: 20, padding: 16, marginBottom: 12 },
  clubName: { fontFamily: FONT.demi, color: '#EEF3F7', fontSize: 18, marginBottom: 5 },
  clubMeta: { fontFamily: FONT.body, color: '#D2B15C', fontSize: 13, marginBottom: 6 },
  clubBody: { fontFamily: FONT.body, color: '#8DA0B3', fontSize: 14, lineHeight: 20 },
});
