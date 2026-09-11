import { Linking, ScrollView, Text, View } from 'react-native';
import { Body, Card, Divider, H1, Label, Screen } from '../../src/components/ui';
import { stats, steps, user } from '../../src/mock/data';

const ROWS: [string, string][] = [
  ['Pots played', String(stats.potsPlayed)],
  ['Pots won', String(stats.potsWon)],
  ['Steps all time', steps(stats.totalSteps)],
  ['Best day', steps(stats.bestDay)],
];

export default function Profile() {
  return (
    <Screen>
      <ScrollView contentContainerClassName="px-5 pb-10" showsVerticalScrollIndicator={false}>
        <View className="pt-6">
          <H1>You</H1>
        </View>

        <Card className="mt-6">
          <View className="flex-row items-center gap-4">
            <View className="h-14 w-14 items-center justify-center rounded-full bg-accent">
              <Text className="font-displayBlack text-xl text-accentInk">
                {user.name.slice(0, 1)}
              </Text>
            </View>
            <View>
              <Text className="font-display text-lg text-ink">{user.name}</Text>
              <Body dim className="mt-0.5">
                {user.handle}
              </Body>
            </View>
          </View>
        </Card>

        <Card className="mt-3 p-0">
          {ROWS.map(([k, v], i) => (
            <View key={k}>
              {i > 0 ? <Divider /> : null}
              <View className="flex-row items-center justify-between px-5 py-4">
                <Body dim>{k}</Body>
                <Text className="font-bodyBold text-[15px] text-ink">{v}</Text>
              </View>
            </View>
          ))}
        </Card>

        <View className="mt-9">
          <Label>Steps come from</Label>
          <Card className="mt-3">
            <Text className="font-bodyMed text-[15px] text-ink">Health Connect</Text>
            <Body dim className="mt-1">
              Demo build — steps are sample data. The real app reads your phone&apos;s health
              store directly, with nothing to log by hand.
            </Body>
          </Card>
        </View>

        {/*
          TODO(contributor): real auth and sign out
          No account exists in this build. steppal-core has phone OTP endpoints;
          wire them, store tokens in expo-secure-store, and gate the tabs behind
          a session.
          difficulty: medium
        */}

        <Text
          onPress={() => Linking.openURL('https://github.com/fitnessorg')}
          className="mt-9 font-bodyMed text-[14px] text-accent"
        >
          Open source on GitHub ↗
        </Text>
        <Body dim className="mt-2">
          StepPal 1.0.0 · demo build · Apache-2.0
        </Body>
      </ScrollView>
    </Screen>
  );
}
