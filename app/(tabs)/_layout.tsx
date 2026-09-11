import { View } from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { F, usePalette } from '../../src/theme';

/**
 * Icon in a pill for the active tab, label underneath — the pattern Strava
 * and most mature consumer apps use, because the pill gives the active state
 * a shape rather than only a colour.
 *
 * Labels live in `tabBarLabel`, never in the icon slot: that slot is narrow
 * and wraps longer words like "Wallet" onto two lines.
 */
const TABS = [
  { name: 'home', title: 'Today', icon: 'footsteps' },
  { name: 'pots', title: 'Pots', icon: 'trophy' },
  { name: 'wallet', title: 'Wallet', icon: 'wallet' },
  { name: 'profile', title: 'You', icon: 'person' },
] as const;

export default function TabsLayout() {
  const C = usePalette();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: C.ground },
        tabBarActiveTintColor: C.ink,
        tabBarInactiveTintColor: C.inkFaint,
        tabBarLabelStyle: {
          fontFamily: F.bodyMed,
          fontSize: 11,
          marginTop: 4,
          includeFontPadding: false,
        },
        tabBarItemStyle: { paddingVertical: 0 },
        tabBarStyle: {
          backgroundColor: C.surface,
          borderTopColor: C.surface2,
          borderTopWidth: 1,
          height: 84,
          paddingTop: 10,
          paddingBottom: 22,
        },
      }}
    >
      {TABS.map((t) => (
        <Tabs.Screen
          key={t.name}
          name={t.name}
          options={{
            title: t.title,
            tabBarIcon: ({ focused }) => (
              <View
                style={{
                  paddingHorizontal: 18,
                  paddingVertical: 5,
                  borderRadius: 999,
                  backgroundColor: focused ? C.surface2 : 'transparent',
                }}
              >
                <Ionicons
                  name={focused ? t.icon : (`${t.icon}-outline` as never)}
                  size={20}
                  color={focused ? C.accent : C.inkFaint}
                />
              </View>
            ),
          }}
        />
      ))}
    </Tabs>
  );
}
