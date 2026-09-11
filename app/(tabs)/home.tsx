import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {
  AppHeader,
  Body,
  Card,
  DayGrid,
  Label,
  ProgressBar,
  Screen,
  SectionHeader,
  useThemeCycle,
} from '../../src/components/ui';
import { usePalette } from '../../src/theme';
import { activePot, lastSynced, naira, steps, todaySteps, user, week } from '../../src/mock/data';

export default function Home() {
  const C = usePalette();
  const theme = useThemeCycle();
  const [synced, setSynced] = useState(lastSynced);

  const me = activePot.members.find((m) => m.isYou)!;
  const rank = activePot.members.findIndex((m) => m.isYou) + 1;
  const ahead = activePot.members[rank - 2];
  const progress = todaySteps / user.dailyGoal;
  const toGo = Math.max(0, user.dailyGoal - todaySteps);
  const daysHit = week.filter((d) => d.goalMet).length;

  return (
    <Screen>
      <AppHeader
        logo
        actions={[
          { icon: 'sync-outline', label: 'Sync steps', onPress: () => setSynced('just now') },
          { icon: theme.icon, label: 'Change theme', onPress: theme.cycle },
        ]}
      />

      <ScrollView contentContainerClassName="px-5 pb-8" showsVerticalScrollIndicator={false}>
        <View className="flex-row items-end justify-between">
          <View className="flex-1 pr-3">
            <Label>Wednesday</Label>
            <Text className="mt-1 font-display text-xl text-ink">Morning, {user.name}</Text>
          </View>
          <Text className="font-body text-[11px] text-inkFaint">Synced {synced}</Text>
        </View>

        {/* ---- the number people open the app for ---- */}
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

        {/* ---- your pot ---- */}
        <SectionHeader
          title="Your pot"
          action="See all"
          onAction={() => router.push('/(tabs)/pots')}
        />
        <Pressable onPress={() => router.push(`/pot/${activePot.id}`)} className="active:opacity-80">
          <Card>
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

            <View className="mt-4 flex-row items-center gap-1.5">
              <Text className="font-bodyBold text-[13px] text-accent">See the leaderboard</Text>
              <Ionicons name="chevron-forward" size={14} color={C.accent} />
            </View>
          </Card>
        </Pressable>

        {/* ---- the week ---- */}
        <SectionHeader title="This week" />
        <Card>
          <DayGrid days={week} />
          <View className="mt-5 flex-row items-center gap-2">
            <Ionicons name="checkmark-circle" size={16} color={C.accent} />
            <Body dim>
              {daysHit} of 7 days hit · miss a day and {naira(100_000)} goes to the pot
            </Body>
          </View>
        </Card>
      </ScrollView>
    </Screen>
  );
}
