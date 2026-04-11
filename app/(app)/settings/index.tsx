import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSQLiteContext } from 'expo-sqlite';
import { useAuth } from '../../../lib/hooks/use-auth';
import { syncToSupabase, type SyncStatus } from '../../../lib/supabase/sync';

const FONT = {
  mono: Platform.OS === 'ios' ? 'Menlo-Regular' : 'monospace',
  body: Platform.OS === 'ios' ? 'AvenirNext-Regular' : 'sans-serif',
  demi: Platform.OS === 'ios' ? 'AvenirNext-DemiBold' : 'sans-serif-medium',
  heavy: Platform.OS === 'ios' ? 'AvenirNext-Heavy' : 'sans-serif-medium',
} as const;

const PLACEHOLDER_SETTINGS = [
  { title: 'Einheiten', body: 'Intern mph / yards, spaeter Anzeige optional in Meter und m/s.' },
  { title: 'Margins', body: 'Pro Club und Metrik Zielbereiche pflegen.' },
  { title: 'Account', body: 'Auth und persönliche Trainingsdaten trennen.' },
];

export default function SettingsScreen() {
  const { user, signOut } = useAuth();
  const db = useSQLiteContext();

  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);

  async function handleSync() {
    if (user == null || syncStatus === 'syncing') return;
    setSyncStatus('syncing');
    setSyncError(null);

    const result = await syncToSupabase(db, user.id);

    if (result.status === 'success') {
      setSyncStatus('success');
      setLastSyncedAt(result.syncedAt);
    } else {
      setSyncStatus('error');
      setSyncError(result.error ?? 'Unbekannter Fehler');
    }
  }

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <Text style={s.eyebrow}>Settings</Text>
        <Text style={s.title}>Technik ruhig halten, Training schnell halten</Text>
        <Text style={s.subtitle}>
          Keine ueberladene Konfigurationsseite, sondern wenige systemische Einstellungen mit direktem Bezug zum Training.
        </Text>

        {PLACEHOLDER_SETTINGS.map((item) => (
          <View key={item.title} style={s.settingCard}>
            <Text style={s.settingTitle}>{item.title}</Text>
            <Text style={s.settingBody}>{item.body}</Text>
          </View>
        ))}

        <View style={s.settingCard}>
          <Text style={s.settingTitle}>Cloud-Sync</Text>
          <Text style={s.settingBody}>
            Lokale Trainingsdaten manuell in die Cloud sichern. Nur bei bestehender Internetverbindung ausführen — nicht beim Mevo+ WLAN.
          </Text>

          {lastSyncedAt != null && syncStatus !== 'error' && (
            <Text style={s.syncTimestamp}>
              Zuletzt synchronisiert: {new Date(lastSyncedAt).toLocaleString('de-DE')}
            </Text>
          )}

          {syncStatus === 'error' && syncError != null && (
            <Text style={s.syncError}>{syncError}</Text>
          )}

          <Pressable
            style={({ pressed }) => [
              s.syncButton,
              syncStatus === 'success' && s.syncButtonSuccess,
              syncStatus === 'error' && s.syncButtonError,
              (pressed || syncStatus === 'syncing') && s.syncButtonPressed,
            ]}
            onPress={handleSync}
            disabled={syncStatus === 'syncing'}
          >
            {syncStatus === 'syncing' ? (
              <ActivityIndicator size="small" color="#5FA7FF" />
            ) : (
              <Text style={[
                s.syncButtonText,
                syncStatus === 'success' && s.syncButtonTextSuccess,
                syncStatus === 'error' && s.syncButtonTextError,
              ]}>
                {syncStatus === 'success' ? 'Synchronisiert' : syncStatus === 'error' ? 'Erneut versuchen' : 'Mit Cloud synchronisieren'}
              </Text>
            )}
          </Pressable>
        </View>

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
    gap: 10,
  },
  settingTitle: { fontFamily: FONT.demi, color: '#EEF3F7', fontSize: 18 },
  settingBody: { fontFamily: FONT.body, color: '#8DA0B3', fontSize: 14, lineHeight: 20 },
  syncTimestamp: {
    fontFamily: FONT.mono,
    color: '#4AC18D',
    fontSize: 11,
    letterSpacing: 0.5,
  },
  syncError: {
    fontFamily: FONT.body,
    color: '#DE6E63',
    fontSize: 13,
    lineHeight: 18,
  },
  syncButton: {
    height: 44,
    borderWidth: 1,
    borderColor: '#1E3A5A',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0D2038',
    marginTop: 2,
  },
  syncButtonSuccess: {
    borderColor: '#2A5A3F',
    backgroundColor: '#0D2218',
  },
  syncButtonError: {
    borderColor: '#5A2A2A',
    backgroundColor: '#1A0E0E',
  },
  syncButtonPressed: { opacity: 0.7 },
  syncButtonText: { fontFamily: FONT.demi, color: '#5FA7FF', fontSize: 14 },
  syncButtonTextSuccess: { color: '#4AC18D' },
  syncButtonTextError: { color: '#E05C5C' },
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
