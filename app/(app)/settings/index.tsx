import React from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../../lib/hooks/use-auth';

const FONT = {
  mono: Platform.OS === 'ios' ? 'Menlo-Regular' : 'monospace',
  body: Platform.OS === 'ios' ? 'AvenirNext-Regular' : 'sans-serif',
  demi: Platform.OS === 'ios' ? 'AvenirNext-DemiBold' : 'sans-serif-medium',
  heavy: Platform.OS === 'ios' ? 'AvenirNext-Heavy' : 'sans-serif-medium',
} as const;

const SETTINGS = [
  { title: 'Einheiten', body: 'Intern mph / yards, spaeter Anzeige optional in Meter und m/s.' },
  { title: 'Margins', body: 'Pro Club und Metrik Zielbereiche pflegen.' },
  { title: 'Sync', body: 'Offline-first, spaeter Supabase als optionaler Cloud-Layer.' },
  { title: 'Account', body: 'Auth und persönliche Trainingsdaten trennen.' },
];

export default function SettingsScreen() {
  const { user, signOut } = useAuth();

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <Text style={s.eyebrow}>Settings</Text>
        <Text style={s.title}>Technik ruhig halten, Training schnell halten</Text>
        <Text style={s.subtitle}>
          Keine ueberladene Konfigurationsseite, sondern wenige systemische Einstellungen mit direktem Bezug zum Training.
        </Text>

        {SETTINGS.map((item) => (
          <View key={item.title} style={s.settingCard}>
            <Text style={s.settingTitle}>{item.title}</Text>
            <Text style={s.settingBody}>{item.body}</Text>
          </View>
        ))}

        <View style={s.accountCard}>
          <Text style={s.accountEmail}>{user?.email}</Text>
          <Pressable style={s.signOutButton} onPress={signOut}>
            <Text style={s.signOutText}>Sign out</Text>
          </Pressable>
        </View>
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
  settingCard: {
    backgroundColor: '#0D1821',
    borderWidth: 1,
    borderColor: '#223244',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
  },
  settingTitle: { fontFamily: FONT.demi, color: '#EEF3F7', fontSize: 18, marginBottom: 6 },
  settingBody: { fontFamily: FONT.body, color: '#8DA0B3', fontSize: 14, lineHeight: 20 },
  accountCard: {
    backgroundColor: '#0D1821',
    borderWidth: 1,
    borderColor: '#223244',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    gap: 12,
  },
  accountEmail: { fontFamily: FONT.body, color: '#8DA0B3', fontSize: 14 },
  signOutButton: {
    height: 44,
    borderWidth: 1,
    borderColor: '#3A2020',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1A0E0E',
  },
  signOutText: { fontFamily: FONT.demi, color: '#E05C5C', fontSize: 14 },
});
