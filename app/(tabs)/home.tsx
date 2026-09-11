import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { router } from 'expo-router';
import {
  Body,
  Card,
  DayGrid,
  Label,
  ProgressBar,
  Screen,
  ThemeToggle,
  Wordmark,
} from '../../src/components/ui';
import { activePot, lastSynced, naira, steps, todaySteps, user, week } from '../../src/mock/data';

export default function Home() {
  const [synced, setSynced] = useState(lastSynced);
  const me = activePot.members.find((m) => m.isYou)!;
  const rank = activePot.members.findIndex((m) => m.isYou) + 1;
  const ahead = activePot.members[rank - 2];
  const progress = todaySteps / user.dailyGoal;
  const toGo = Math.max(0, user.dailyGoal - todaySteps);

  return (
    <Screen>
      {/* ---- app bar ---- */}
      <View className="flex-row items-center justify-between px-5 pt-2 pb-1">
        <Wordmark />
        <ThemeToggle />
      </View>

      <ScrollView contentContainerClassName="px-5 pb-10" showsVerticalScrollIndicator={false}>
        <View className="flex-row items-end justify-between pt-5">
          <View className="flex-1 pr-3">
            <Label>Wednesday</Label>
            <Text className="mt-1 font-display text-lg text-ink">Morning, {user.name}</Text>
          </View>
          <Pressable
            onPress={() => setSynced('just now')}
            className="rounded-full border border-surface2 px-3 py-2 active:opacity-70"
          >
            <Text className="font-body text-[11px] text-inkSoft">Synced {synced}</Text>
          </Pressable>
        </View>

        {/* ---- today's steps: the number people open the app for ---- */}
        <Card className="mt-5">
          <Label>Steps today</Label>
          <Text className="mt-2 font-displayBlack text-[56px] leading-[58px] text-ink">
            {steps(todaySteps)}
          </Text>
          <View className="mt-4">
            <ProgressBar value={progress} />
          </View>
          <View className="mt-3 flex-row justify-between">
            <Body dim>Goal {steps(user.dailyGoal)}</Body>
            <Body dim>{toGo > 0 ? `${steps(toGo)} to go` : 'Goal met'}</Body>
          </View>
        </Card>

        {/* ---- the nudge: why you'd walk this evening ---- */}
        <Pressable onPress={() => router.push(`/pot/${activePot.id}`)} className="active:opacity-80">
          <Card className="mt-3">
            <View className="flex-row items-center justify-between">
              <Label tone="flame">
                Day {activePot.dayOf} of {activePot.totalDays}
              </Label>
              <Text className="font-bodyMed text-[12px] text-money">
                {naira(activePot.potKobo)} pot
              </Text>
            </View>
            <Text className="mt-3 font-display text-lg text-ink">{activePot.name}</Text>
            <Body dim className="mt-1">
              {ahead
                ? `You're ${rank === 2 ? '2nd' : `${rank}th`} — ${steps(ahead.steps - me.steps)} behind ${ahead.name}.`
                : `You're leading by ${steps(me.steps - activePot.members[1].steps)}.`}
            </Body>
            <Text className="mt-4 font-bodyMed text-[13px] text-accent">See the leaderboard →</Text>
          </Card>
        </Pressable>

        {/* ---- the week ---- */}
        <Card className="mt-3">
          <Label>Your week</Label>
          <View className="mt-4">
            <DayGrid days={week} />
          </View>
          <Body dim className="mt-4">
            {week.filter((d) => d.goalMet).length} of 7 days hit. Miss a day and you forfeit{' '}
            {naira(100_000)} into the pot.
          </Body>
        </Card>
      </ScrollView>
    </Screen>
  );
}
