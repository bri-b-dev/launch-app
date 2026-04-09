import { Tabs } from 'expo-router';
import type { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import { Pressable, Text, View, StyleSheet, Platform } from 'react-native';
import { TrainingStateProvider } from '../../lib/hooks/use-training-state';
import { TrainingDataProvider } from '../../lib/hooks/use-sqlite-training';
import { MevoSessionProvider } from '../../lib/hooks/use-mevo-session';

export default function AppLayout() {
  return (
    <TrainingDataProvider>
      <TrainingStateProvider>
        <MevoSessionProvider>
          <Tabs
            screenOptions={{
              headerShown: false,
              tabBarShowLabel: false,
              tabBarStyle: s.tabBar,
              tabBarHideOnKeyboard: true,
              sceneStyle: s.scene,
            }}
          >
            <Tabs.Screen
              name="index"
              options={{
                tabBarButton: (props) => (
                  <TabButton {...props} label="Home" shortLabel="01" />
                ),
              }}
            />
            <Tabs.Screen
              name="session"
              options={{
                tabBarButton: (props) => (
                  <TabButton {...props} label="Session" shortLabel="02" />
                ),
              }}
            />
            <Tabs.Screen
              name="history"
              options={{
                tabBarButton: (props) => (
                  <TabButton {...props} label="History" shortLabel="03" />
                ),
              }}
            />
            <Tabs.Screen
              name="equipment"
              options={{
                tabBarButton: (props) => (
                  <TabButton {...props} label="Equipment" shortLabel="04" />
                ),
              }}
            />
            <Tabs.Screen
              name="settings"
              options={{
                tabBarButton: (props) => (
                  <TabButton {...props} label="Settings" shortLabel="05" />
                ),
              }}
            />
          </Tabs>
        </MevoSessionProvider>
      </TrainingStateProvider>
    </TrainingDataProvider>
  );
}

function TabButton({
  label,
  shortLabel,
  accessibilityState,
  onPress,
  onLongPress,
}: BottomTabBarButtonProps & Readonly<{ label: string; shortLabel: string }>) {
  const focused = accessibilityState?.selected === true;

  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityState={accessibilityState}
      onPress={onPress}
      onLongPress={onLongPress}
      style={[s.tabButton, focused ? s.tabButtonActive : null]}
    >
      <Text style={[s.tabIndex, focused ? s.tabIndexActive : null]}>{shortLabel}</Text>
      <Text style={[s.tabLabel, focused ? s.tabLabelActive : null]}>{label}</Text>
      <View style={[s.tabUnderline, focused ? s.tabUnderlineActive : null]} />
    </Pressable>
  );
}

const s = StyleSheet.create({
  scene: {
    backgroundColor: '#080C10',
  },
  tabBar: {
    position: 'absolute',
    left: 14,
    right: 14,
    bottom: Platform.OS === 'ios' ? 16 : 12,
    height: 74,
    borderTopWidth: 0,
    borderWidth: 1,
    borderColor: '#223244',
    borderRadius: 24,
    backgroundColor: '#0D1821',
    paddingHorizontal: 6,
    paddingTop: 8,
    paddingBottom: 8,
  },
  tabButton: {
    flex: 1,
    marginHorizontal: 3,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  tabButtonActive: {
    backgroundColor: '#12202B',
  },
  tabIndex: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo-Regular' : 'monospace',
    fontSize: 9,
    letterSpacing: 1.2,
    color: '#53677A',
  },
  tabIndexActive: {
    color: '#D2B15C',
  },
  tabLabel: {
    fontFamily: Platform.OS === 'ios' ? 'AvenirNext-DemiBold' : 'sans-serif-medium',
    fontSize: 12,
    color: '#8DA0B3',
  },
  tabLabelActive: {
    color: '#EEF3F7',
  },
  tabUnderline: {
    marginTop: 4,
    width: 18,
    height: 2,
    borderRadius: 999,
    backgroundColor: 'transparent',
  },
  tabUnderlineActive: {
    backgroundColor: '#D2B15C',
  },
});
