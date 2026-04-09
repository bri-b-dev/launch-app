import React from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CLUBS } from '../../../lib/mock/training';
import { useTrainingState } from '../../../lib/hooks/use-training-state';

const FONT = {
  mono: Platform.OS === 'ios' ? 'Menlo-Regular' : 'monospace',
  body: Platform.OS === 'ios' ? 'AvenirNext-Regular' : 'sans-serif',
  demi: Platform.OS === 'ios' ? 'AvenirNext-DemiBold' : 'sans-serif-medium',
  heavy: Platform.OS === 'ios' ? 'AvenirNext-Heavy' : 'sans-serif-medium',
} as const;

export default function EquipmentScreen() {
  const { activeClubId, setActiveClubId } = useTrainingState();

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <Text style={s.eyebrow}>Equipment</Text>
        <Text style={s.title}>Schlaeger und Zielbereiche vorbereiten</Text>
        <Text style={s.subtitle}>
          Hier entsteht die Struktur fuer Club-Zuordnung, Margins und spaeter Face-Impact-Ansichten.
        </Text>

        <View style={s.monitorCard}>
          <Text style={s.monitorLabel}>Launch Monitor</Text>
          <Text style={s.monitorValue}>FlightScope Mevo+</Text>
          <Text style={s.monitorMeta}>TCP 5100 · WiFi direct</Text>
        </View>

        {CLUBS.map((club) => (
          <Pressable key={club.name} style={[s.clubCard, club.id === activeClubId ? s.clubCardActive : null]} onPress={() => setActiveClubId(club.id)}>
            <View style={s.clubTop}>
              <Text style={s.clubName}>{club.name}</Text>
              <Text style={s.clubLoft}>{club.loft}</Text>
            </View>
            <Text style={s.clubType}>{club.type}</Text>
            <Text style={s.clubTarget}>{club.target}</Text>
            <View style={s.marginRow}>
              {club.targets.map((target) => (
                <View key={target.label} style={[s.marginChip, club.id === activeClubId ? s.marginChipActive : null]}>
                  <Text style={s.marginChipLabel}>{target.label}</Text>
                </View>
              ))}
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
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
  monitorCard: {
    backgroundColor: '#0D1821',
    borderWidth: 1,
    borderColor: '#223244',
    borderRadius: 22,
    padding: 16,
    marginBottom: 14,
  },
  monitorLabel: { fontFamily: FONT.mono, color: '#53677A', fontSize: 11, marginBottom: 6 },
  monitorValue: { fontFamily: FONT.demi, color: '#EEF3F7', fontSize: 20, marginBottom: 4 },
  monitorMeta: { fontFamily: FONT.body, color: '#8DA0B3', fontSize: 13 },
  clubCard: {
    backgroundColor: '#111E28',
    borderWidth: 1,
    borderColor: '#223244',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
  },
  clubCardActive: {
    borderColor: '#D2B15C55',
    backgroundColor: '#152331',
  },
  clubTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  clubName: { fontFamily: FONT.demi, color: '#EEF3F7', fontSize: 18 },
  clubLoft: { fontFamily: FONT.mono, color: '#D2B15C', fontSize: 13 },
  clubType: { fontFamily: FONT.body, color: '#8DA0B3', fontSize: 13, marginBottom: 6 },
  clubTarget: { fontFamily: FONT.body, color: '#53677A', fontSize: 13 },
  marginRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  marginChip: {
    borderWidth: 1,
    borderColor: '#223244',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#0D1821',
  },
  marginChipActive: {
    borderColor: '#D2B15C55',
  },
  marginChipLabel: { fontFamily: FONT.mono, color: '#8DA0B3', fontSize: 10, letterSpacing: 1.1 },
});
