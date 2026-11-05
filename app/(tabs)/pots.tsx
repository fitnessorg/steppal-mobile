import { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {
  AppHeader,
  Body,
  Card,
  Chips,
  Label,
  Screen,
  SectionHeader,
} from '../../src/components/ui';
import { usePalette } from '../../src/theme';
import { hydratePots, usePots } from '../../src/store/pots';
import { modeLabel, naira, type Pot } from '../../src/mock/data';

const FILTERS = ['All', 'Running', 'Finished'] as const;
type Filter = (typeof FILTERS)[number];

function PotRow({ pot }: { pot: Pot }) {
  const C = usePalette();
  const settled = pot.status === 'settled';

  return (
    <Pressable onPress={() => router.push(`/pot/${pot.id}`)} className="active:opacity-80">
      <Card className="mb-3">
        <View className="flex-row items-center justify-between">
          <Label tone={settled ? undefined : 'flame'}>
            {settled ? 'Settled' : `Day ${pot.dayOf} of ${pot.totalDays}`}
          </Label>
          <Text className={`font-bodyBold text-[13px] ${settled ? 'text-accent' : 'text-money'}`}>
            {settled ? `+${naira(pot.payoutKobo ?? 0)}` : naira(pot.potKobo)}
          </Text>
        </View>

        <View className="mt-3 flex-row items-center justify-between">
          <View className="flex-1 pr-3">
            <Text className="font-display text-lg text-ink">{pot.name}</Text>
            <Body dim className="mt-1">
              {modeLabel[pot.mode]} · {pot.members.length}{' '}
              {pot.members.length === 1 ? 'person' : 'people'}
            </Body>
          </View>
          <Ionicons name="chevron-forward" size={18} color={C.inkFaint} />
        </View>
      </Card>
    </Pressable>
  );
}

export default function Pots() {
  // Refresh from the server whenever the tab is opened. A no-op in demo mode.
  useEffect(() => {
    void hydratePots();
  }, []);

  const C = usePalette();
  const pots = usePots();
  const [filter, setFilter] = useState<Filter>('All');

  const running = pots.filter((p) => p.status === 'active');
  const finished = pots.filter((p) => p.status === 'settled');
  const showRunning = filter === 'All' || filter === 'Running';
  const showFinished = filter === 'All' || filter === 'Finished';

  return (
    <Screen>
      <AppHeader
        title="Pots"
        actions={[{ icon: 'add', label: 'Start a pot', onPress: () => router.push('/pot/create') }]}
      />

      <View className="-mx-5">
        <Chips options={FILTERS} value={filter} onChange={setFilter} />
      </View>

      <ScrollView contentContainerClassName="px-5 pb-8" showsVerticalScrollIndicator={false}>
        {pots.length === 0 ? (
          <Card className="my-5 items-center p-6">
            <View className="mb-3 h-12 w-12 items-center justify-center rounded-full bg-surface2">
              <Ionicons name="trophy-outline" size={24} color={C.flame} />
            </View>
            <Text className="font-display text-lg text-ink">No pots yet</Text>
            <Body dim className="mt-1 text-center">
              You have not joined or started any pots. Put a stake behind your daily walking goals
              with friends, or join an existing pot with an invite code.
            </Body>
          </Card>
        ) : null}

        {pots.length > 0 && filter === 'Running' && running.length === 0 ? (
          <Card className="my-5 items-center p-6">
            <Text className="font-display text-base text-ink">No active pots</Text>
            <Body dim className="mt-1 text-center">
              You have no pots running right now. Start a new one below or check your finished pots.
            </Body>
          </Card>
        ) : null}

        {pots.length > 0 && filter === 'Finished' && finished.length === 0 ? (
          <Card className="my-5 items-center p-6">
            <Text className="font-display text-base text-ink">No finished pots</Text>
            <Body dim className="mt-1 text-center">
              Pots you finish will appear here with final rankings and payouts.
            </Body>
          </Card>
        ) : null}

        {showRunning && running.length > 0 ? (
          <>
            <SectionHeader title="Running now" />
            {running.map((p) => (
              <PotRow key={p.id} pot={p} />
            ))}
          </>
        ) : null}

        {showFinished && finished.length > 0 ? (
          <>
            <SectionHeader title="Finished" />
            {finished.map((p) => (
              <PotRow key={p.id} pot={p} />
            ))}
          </>
        ) : null}

        <SectionHeader title="Start something" />
        <View className="flex-row gap-3">
          <Pressable
            onPress={() => router.push('/pot/create')}
            className="flex-1 active:opacity-80"
          >
            <Card className="items-center gap-2 py-7">
              <Ionicons name="add-circle-outline" size={28} color={C.accent} />
              <Text className="font-bodyBold text-[14px] text-ink">Start a pot</Text>
              <Body dim className="text-center">
                Set a stake, invite friends
              </Body>
            </Card>
          </Pressable>

          <Pressable onPress={() => router.push('/pot/join')} className="flex-1 active:opacity-80">
            <Card className="items-center gap-2 py-7">
              <Ionicons name="ticket-outline" size={28} color={C.flame} />
              <Text className="font-bodyBold text-[14px] text-ink">Join with code</Text>
              <Body dim className="text-center">
                Someone sent you one
              </Body>
            </Card>
          </Pressable>
        </View>
      </ScrollView>
    </Screen>
  );
}
