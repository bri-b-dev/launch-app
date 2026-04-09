import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SQLiteProvider } from 'expo-sqlite';
import { initializeDatabase } from '../lib/db/init';

export default function RootLayout() {
  return (
    <SQLiteProvider databaseName="launch-app.db" onInit={initializeDatabase}>
      <Stack screenOptions={{ headerShown: false }} />
      <StatusBar style="light" />
    </SQLiteProvider>
  );
}
