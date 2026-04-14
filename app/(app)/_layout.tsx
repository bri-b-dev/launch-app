import { Tabs, usePathname } from 'expo-router';
import type { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import { Pressable, Text, View, StyleSheet, Platform } from 'react-native';
import { Canvas, Path } from '@shopify/react-native-skia';
import { TrainingStateProvider } from '../../lib/hooks/use-training-state';
import { TrainingDataProvider } from '../../lib/hooks/use-sqlite-training';
import { MevoSessionProvider } from '../../lib/hooks/use-mevo-session';

const ICON_SIZE = 22;
const ICON_SCALE = ICON_SIZE / 24;

// Material Design 24×24 SVG paths
const TAB_ICONS = {
  home: 'M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z',
  session: 'M8 5v14l11-7z',
  history: 'M5 9.2h3V19H5V9.2zM10.6 5h2.8v14h-2.8V5zm5.6 8H19v6h-2.8v-6z',
  equipment:
    'M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z',
  settings:
    'M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.57 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z',
} as const;

type TabIconName = keyof typeof TAB_ICONS;

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
                  <TabButton {...props} label="Home" icon="home" routeName="index" />
                ),
              }}
            />
            <Tabs.Screen
              name="session"
              options={{
                tabBarButton: (props) => (
                  <TabButton {...props} label="Session" icon="session" routeName="session" />
                ),
              }}
            />
            <Tabs.Screen
              name="history"
              options={{
                tabBarButton: (props) => (
                  <TabButton {...props} label="History" icon="history" routeName="history" />
                ),
              }}
            />
            <Tabs.Screen
              name="equipment"
              options={{
                tabBarButton: (props) => (
                  <TabButton {...props} label="Equipment" icon="equipment" routeName="equipment" />
                ),
              }}
            />
            <Tabs.Screen
              name="settings"
              options={{
                tabBarButton: (props) => (
                  <TabButton {...props} label="Settings" icon="settings" routeName="settings" />
                ),
              }}
            />
            <Tabs.Screen
              name="shot"
              options={{ href: null }}
            />
          </Tabs>
        </MevoSessionProvider>
      </TrainingStateProvider>
    </TrainingDataProvider>
  );
}

function TabButton({
  label,
  icon,
  routeName,
  accessibilityState,
  onPress,
  onLongPress,
}: BottomTabBarButtonProps & Readonly<{ label: string; icon: TabIconName; routeName: string }>) {
  const pathname = usePathname();
  const focused =
    routeName === 'index'
      ? pathname === '/' || pathname === ''
      : pathname === `/${routeName}` || pathname.startsWith(`/${routeName}/`);
  const iconColor = focused ? '#E8C97A' : '#4A6070';

  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityState={accessibilityState}
      onPress={onPress}
      onLongPress={onLongPress}
      style={[s.tabButton, focused ? s.tabButtonActive : null]}
    >
      <Canvas style={s.iconCanvas}>
        <Path
          path={TAB_ICONS[icon]}
          color={iconColor}
          transform={[{ scale: ICON_SCALE }]}
        />
      </Canvas>
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
    borderWidth: 1,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  tabButtonActive: {
    backgroundColor: '#1E3550',
    borderColor: 'rgba(210,177,92,0.65)',
  },
  iconCanvas: {
    width: ICON_SIZE,
    height: ICON_SIZE,
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
    marginTop: 3,
    width: 24,
    height: 3,
    borderRadius: 999,
    backgroundColor: 'transparent',
  },
  tabUnderlineActive: {
    backgroundColor: '#D2B15C',
  },
});
