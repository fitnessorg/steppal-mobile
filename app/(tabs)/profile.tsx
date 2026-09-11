import { Linking, ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  AppHeader,
  Body,
  Button,
  Card,
  Divider,
  Logo,
  Screen,
  SectionHeader,
  useThemeCycle,
} from '../../src/components/ui';
import { usePalette } from '../../src/theme';
import { stats, steps, user } from '../../src/mock/data';

const STATS: [string, string][] = [
  ['Pots played', String(stats.potsPlayed)],
  ['Pots won', String(stats.potsWon)],
  ['Steps all time', steps(stats.totalSteps)],
  ['Best day', steps(stats.bestDay)],
];

export default function Profile() {
  const C = usePalette();
  const theme = useThemeCycle();

  return (
    <Screen>
      <AppHeader
        title="You"
        actions={[
          { icon: theme.icon, label: 'Change theme', onPress: theme.cycle },
          { icon: 'settings-outline', label: 'Settings', onPress: () => {} },
        ]}
      />

      <ScrollView contentContainerClassName="px-5 pb-8" showsVerticalScrollIndicator={false}>
        {/* ---- identity block, Strava-style: avatar, name, meta, actions ---- */}
        <View className="flex-row items-center gap-4">
          <View className="h-16 w-16 items-center justify-center rounded-full bg-accent">
            <Text className="font-displayBlack text-2xl text-accentInk">
              {user.name.slice(0, 1)}
            </Text>
          </View>
          <View className="flex-1">
            <Text className="font-display text-xl text-ink">{user.name}</Text>
            <Body dim className="mt-0.5">
              {stats.potsPlayed} pots · joined {user.joined}
            </Body>
          </View>
        </View>

        <View className="mt-5 flex-row gap-3">
          <View className="flex-1">
            <Button label="Edit profile" tone="ghost" onPress={() => {}} />
          </View>
          <View className="flex-1">
            <Button label="Invite friends" tone="ghost" icon="share-outline" onPress={() => {}} />
          </View>
        </View>

        <SectionHeader title="Your numbers" />
        <Card className="p-0">
          {STATS.map(([k, v], i) => (
            <View key={k}>
              {i > 0 ? <Divider /> : null}
              <View className="flex-row items-center justify-between px-5 py-4">
                <Body dim>{k}</Body>
                <Text className="font-bodyBold text-[15px] text-ink">{v}</Text>
              </View>
            </View>
          ))}
        </Card>

        <SectionHeader title="Steps come from" />
        <Card>
          <View className="flex-row items-center gap-3">
            <Ionicons name="heart-circle-outline" size={22} color={C.accent} />
            <Text className="font-bodyMed text-[15px] text-ink">Health Connect</Text>
          </View>
          <Body dim className="mt-2">
            Demo build — steps are sample data. The real app reads your phone&apos;s health store
            directly, with nothing to log by hand.
          </Body>
        </Card>

        {/*
          TODO(contributor): real auth and sign out
          No account exists in this build. steppal-core has phone OTP endpoints;
          wire them, store tokens in expo-secure-store, and gate the tabs behind
          a session.
          difficulty: medium
        */}

        <View className="mt-12 items-center gap-3 pb-2">
          <Logo size={32} />
          <Text
            onPress={() => Linking.openURL('https://github.com/fitnessorg')}
            className="font-bodyMed text-[14px] text-accent"
          >
            Open source on GitHub ↗
          </Text>
          <Body dim>StepPal 1.0.0 · demo build · Apache-2.0</Body>
        </View>
      </ScrollView>
    </Screen>
  );
}
