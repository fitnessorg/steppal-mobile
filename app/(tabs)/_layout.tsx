import { View } from 'react-native';
import { Tabs } from 'expo-router';
import { F, usePalette } from '../../src/theme';

/**
 * Labels go in `tabBarLabel`, not `tabBarIcon`. The icon slot is narrow, so
 * putting text there wraps "Wallet" onto two lines — which is exactly what it
 * did before this fix.
 *
 * The icon slot now holds only a 3px accent dash marking the active tab.
 */
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
          fontSize: 11.5,
          marginTop: 4,
          includeFontPadding: false,
        },
        tabBarIconStyle: { height: 3, marginTop: 2 },
        tabBarItemStyle: { paddingVertical: 0 },
        tabBarStyle: {
          backgroundColor: C.surface,
          borderTopColor: C.surface2,
          borderTopWidth: 1,
          height: 76,
          paddingTop: 12,
          paddingBottom: 18,
        },
      }}
    >
      {(
        [
          ['home', 'Today'],
          ['pots', 'Pots'],
          ['wallet', 'Wallet'],
          ['profile', 'You'],
        ] as const
      ).map(([name, title]) => (
        <Tabs.Screen
          key={name}
          name={name}
          options={{
            title,
            tabBarIcon: ({ focused }) => (
              <View
                style={{
                  height: 3,
                  width: 20,
                  borderRadius: 2,
                  backgroundColor: focused ? C.accent : 'transparent',
                }}
              />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}
