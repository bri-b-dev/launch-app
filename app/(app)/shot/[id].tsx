import React from 'react';
import { View, Text, StyleSheet, ScrollView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { getShotById } from '../../../lib/mock/training';

const FONT = {
  mono: Platform.OS === 'ios' ? 'Menlo-Regular' : 'monospace',
  body: Platform.OS === 'ios' ? 'AvenirNext-Regular' : 'sans-serif',
  demi: Platform.OS === 'ios' ? 'AvenirNext-DemiBold' : 'sans-serif-medium',
  heavy: Platform.OS === 'ios' ? 'AvenirNext-Heavy' : 'sans-serif-medium',
} as const;

export default function ShotDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const result = id ? getShotById(id) : null;

  if (!result) {
    return (
      <SafeAreaView style={s.safe}>
        <View style={s.center}><Text style={s.fallback}>Schlag nicht gefunden</Text></View>
      </SafeAreaView>
    );
  }

  const { shot, club } = result;

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <Text style={s.eyebrow}>{club.name}</Text>
        <Text style={s.title}>{shot.carry}y {shot.shape}</Text>
        <Text style={s.subtitle}>{shot.note}</Text>

        <View style={s.heroCard}>
          <Text style={s.heroLabel}>Qualitaet</Text>
          <Text style={s.heroValue}>{shot.quality}</Text>
        </View>

        <View style={s.grid}>
          <MetricCard label="Ball Speed" value={shot.ballSpeed} unit="mph" />
          <MetricCard label="Club Speed" value={shot.clubSpeed} unit="mph" />
          <MetricCard label="VLA" value={shot.vla} unit="°" />
          <MetricCard label="Spin" value={shot.spin} unit="rpm" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function MetricCard({ label, value, unit }: Readonly<{ label: string; value: string; unit: string }>) {
  return (
    <View style={s.metricCard}>
      <Text style={s.metricValue}>{value} <Text style={s.metricUnit}>{unit}</Text></Text>
      <Text style={s.metricLabel}>{label}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#080C10' },
  content: { padding: 16, paddingBottom: 40 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  fallback: { color: '#8DA0B3', fontFamily: FONT.body, fontSize: 16 },
  eyebrow: { fontFamily: FONT.mono, color: '#D2B15C', fontSize: 10, letterSpacing: 2.4, marginBottom: 8 },
  title: { fontFamily: FONT.heavy, color: '#EEF3F7', fontSize: 28, lineHeight: 32, marginBottom: 10 },
  subtitle: { fontFamily: FONT.body, color: '#8DA0B3', fontSize: 15, lineHeight: 22, marginBottom: 16 },
  heroCard: { backgroundColor: '#0D1821', borderWidth: 1, borderColor: '#223244', borderRadius: 22, padding: 16, marginBottom: 14 },
  heroLabel: { fontFamily: FONT.mono, color: '#53677A', fontSize: 11, marginBottom: 6 },
  heroValue: { fontFamily: FONT.heavy, color: '#EEF3F7', fontSize: 24 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  metricCard: { width: '48%', minWidth: 145, backgroundColor: '#111E28', borderWidth: 1, borderColor: '#223244', borderRadius: 18, padding: 14 },
  metricValue: { fontFamily: FONT.heavy, color: '#EEF3F7', fontSize: 22, marginBottom: 4 },
  metricUnit: { fontFamily: FONT.body, color: '#8DA0B3', fontSize: 12 },
  metricLabel: { fontFamily: FONT.body, color: '#8DA0B3', fontSize: 12 },
});
