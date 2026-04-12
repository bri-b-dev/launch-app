import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SQLiteProvider } from 'expo-sqlite';
import { initializeDatabase } from '../lib/db/init';
import { AuthProvider, useAuth } from '../lib/hooks/use-auth';

function RootNavigator() {
  const { session, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const inAuth = segments[0] === '(auth)';

    if (!session && !inAuth) {
      router.replace('/(auth)/login');
    } else if (session && inAuth) {
      router.replace('/(app)');
    }
  }, [session, loading, segments, router]);

  return (
    <>
      <Stack screenOptions={{ headerShown: false }} />
      <StatusBar style="light" />
    </>
  );
}

export default function RootLayout() {
  return (
    <SQLiteProvider databaseName="launcher.db" onInit={initializeDatabase}>
      <AuthProvider>
        <RootNavigator />
      </AuthProvider>
    </SQLiteProvider>
  );
}
