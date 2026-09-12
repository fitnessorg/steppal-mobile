import { useCallback, useEffect, useState } from 'react';
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
import { getStepSource, type DailySteps } from '../../src/health';
import { activePot, naira, steps, user, week } from '../../src/mock/data';

const source = getStepSource();

export default function Home() {
  const C = usePalette();
  const theme = useThemeCycle();

  const [days, setDays] = useState<DailySteps[]>([]);
  const [synced, setSynced] = useState('never');
  const [syncing, setSyncing] = useState(false);

  /**
   * Pull the last seven days, not just today. Phones go offline and Health
   * Connect backfills late, so a today-only sync silently loses days.
   */
  const sync = useCallback(async () => {
    setSyncing(true);
    try {
      const to = new Date();
      const from = new Date();
      from.setDate(from.getDate() - 6);
      setDays(await source.getRange(from, to));
      setSynced('just now');
    } catch {
      setSynced('failed');
    } finally {
      setSyncing(false);
    }
  }, []);

  useEffect(() => {
    sync();
  }, [sync]);

  // TODO(contributor): sync on app foreground and queue failures
  // Right now it syncs once on mount. Add an AppState listener, and retry a
  // failed sync on the next foreground rather than losing it.
  // difficulty: medium

  const today = days.at(-1)?.steps ?? 0;
  const progress = today / user.dailyGoal;
  const toGo = Math.max(0, user.dailyGoal - today);

  const grid = days.length
    ? days.map((d, i) => ({
        day: week[i]?.day ?? '',
        goalMet: d.steps >= user.dailyGoal,
      }))
    : week;
  const daysHit = grid.filter((d) => d.goalMet).length;

  const me = activePot.members.find((m) => m.isYou)!;
  const rank = activePot.members.findIndex((m) => m.isYou) + 1;
  const ahead = activePot.members[rank - 2];

  return (
    <Screen>
      <AppHeader
        logo
        actions={[
          { icon: 'sync-outline', label: 'Sync steps', onPress: sync },
          { icon: theme.icon, label: 'Change theme', onPress: theme.cycle },
        ]}
      />

      <ScrollView contentContainerClassName="px-5 pb-8" showsVerticalScrollIndicator={false}>
        <View className="flex-row items-end justify-between">
          <View className="flex-1 pr-3">
            <Label>Wednesday</Label>
            <Text className="mt-1 font-display text-xl text-ink">Morning, {user.name}</Text>
          </View>
          <Text className="font-body text-[11px] text-inkFaint">
            {syncing ? 'Syncing…' : `Synced ${synced}`}
          </Text>
        </View>

        <Card className="mt-5">
          <Label>Steps today</Label>
          <Text className="mt-2 font-displayBlack text-[56px] leading-[58px] text-ink">
            {steps(today)}
          </Text>
          <View className="mt-4">
            <ProgressBar value={progress} />
          </View>
          <View className="mt-3 flex-row justify-between">
            <Body dim>Goal {steps(user.dailyGoal)}</Body>
            <Body dim>{toGo > 0 ? `${steps(toGo)} to go` : 'Goal met'}</Body>
          </View>
        </Card>

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

        <SectionHeader title="This week" />
        <Card>
          <DayGrid days={grid} />
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
