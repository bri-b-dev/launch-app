import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
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
  const router = useRouter();

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
          Keine überladene Konfigurationsseite, sondern wenige systemische Einstellungen mit direktem Bezug zum Training.
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

          {user != null && lastSyncedAt != null && syncStatus !== 'error' && (
            <Text style={s.statusLabel}>
              Zuletzt synchronisiert: {new Date(lastSyncedAt).toLocaleString('de-DE')}
            </Text>
          )}

          {user != null && syncStatus === 'error' && syncError != null && (
            <Text style={s.errorLabel}>{syncError}</Text>
          )}
        </View>

        {user == null ? (
          <Pressable
            style={({ pressed }) => [s.btnPrimary, pressed && s.btnPressed]}
            onPress={() => router.push('/(auth)/login')}
          >
            <Text style={s.btnPrimaryText}>Anmelden für Cloud-Sync</Text>
          </Pressable>
        ) : (
          <Pressable
            style={({ pressed }) => [
              s.btnSecondary,
              syncStatus === 'success' && s.btnSecondarySuccess,
              syncStatus === 'error' && s.btnSecondaryError,
              (pressed || syncStatus === 'syncing') && s.btnPressed,
            ]}
            onPress={handleSync}
            disabled={syncStatus === 'syncing'}
          >
            {syncStatus === 'syncing' ? (
              <ActivityIndicator size="small" color="#EEF3F7" />
            ) : (
              <Text style={[
                s.btnSecondaryText,
                syncStatus === 'success' && s.btnSecondaryTextSuccess,
                syncStatus === 'error' && s.btnSecondaryTextError,
              ]}>
                {syncStatus === 'success' ? 'Synchronisiert' : syncStatus === 'error' ? 'Erneut versuchen' : 'Mit Cloud synchronisieren'}
              </Text>
            )}
          </Pressable>
        )}

        {user != null && (
          <View style={s.accountRow}>
            <Text style={s.accountEmail}>{user.email}</Text>
            <Pressable
              style={({ pressed }) => [s.btnDestructive, pressed && s.btnPressed]}
              onPress={signOut}
            >
              <Text style={s.btnDestructiveText}>Abmelden</Text>
            </Pressable>
          </View>
        )}
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
  statusLabel: {
    fontFamily: FONT.mono,
    color: '#4AC18D',
    fontSize: 11,
    letterSpacing: 0.5,
  },
  errorLabel: {
    fontFamily: FONT.body,
    color: '#DE6E63',
    fontSize: 13,
    lineHeight: 18,
  },
  // Buttons — clearly distinct from info cards
  btnPrimary: {
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#D2B15C',
    marginBottom: 12,
  },
  btnPrimaryText: {
    fontFamily: FONT.demi,
    color: '#080C10',
    fontSize: 15,
    letterSpacing: 0.3,
  },
  btnSecondary: {
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1A3A5C',
    marginBottom: 12,
  },
  btnSecondarySuccess: { backgroundColor: '#1A3D2A' },
  btnSecondaryError: { backgroundColor: '#3D1A1A' },
  btnSecondaryText: {
    fontFamily: FONT.demi,
    color: '#EEF3F7',
    fontSize: 15,
  },
  btnSecondaryTextSuccess: { color: '#4AC18D' },
  btnSecondaryTextError: { color: '#E05C5C' },
  btnDestructive: {
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3D1A1A',
    paddingHorizontal: 20,
    alignSelf: 'flex-start',
  },
  btnDestructiveText: {
    fontFamily: FONT.demi,
    color: '#E05C5C',
    fontSize: 14,
  },
  btnPressed: { opacity: 0.65 },
  accountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    marginBottom: 12,
  },
  accountEmail: {
    fontFamily: FONT.body,
    color: '#53677A',
    fontSize: 13,
    flexShrink: 1,
    marginRight: 12,
  },
});
