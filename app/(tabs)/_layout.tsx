import { Tabs } from 'expo-router';
import { Text, View } from 'react-native';
import { C, F } from '../../src/theme';

/**
 * Label-only tab bar with a small active bar above the word. No icon library
 * is installed, and honestly four words read more clearly than four ambiguous
 * glyphs would.
 */
function TabLabel({ label, focused }: { label: string; focused: boolean }) {
  return (
    <View className="items-center gap-1.5">
      <View className={`h-[3px] w-6 rounded-full ${focused ? 'bg-accent' : 'bg-transparent'}`} />
      <Text
        style={{ fontFamily: focused ? F.bodyBold : F.body }}
        className={`text-[12px] ${focused ? 'text-ink' : 'text-inkFaint'}`}
      >
        {label}
      </Text>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        sceneStyle: { backgroundColor: C.ground },
        tabBarStyle: {
          backgroundColor: C.surface,
          borderTopColor: C.surface2,
          borderTopWidth: 1,
          height: 74,
          paddingTop: 10,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{ tabBarIcon: ({ focused }) => <TabLabel label="Today" focused={focused} /> }}
      />
      <Tabs.Screen
        name="pots"
        options={{ tabBarIcon: ({ focused }) => <TabLabel label="Pots" focused={focused} /> }}
      />
      <Tabs.Screen
        name="wallet"
        options={{ tabBarIcon: ({ focused }) => <TabLabel label="Wallet" focused={focused} /> }}
      />
      <Tabs.Screen
        name="profile"
        options={{ tabBarIcon: ({ focused }) => <TabLabel label="You" focused={focused} /> }}
      />
    </Tabs>
  );
}
