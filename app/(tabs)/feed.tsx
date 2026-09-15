import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppHeader, Body, Card, Chips, Screen } from '../../src/components/ui';
import { PledgeCard } from '../../src/components/PledgeCard';
import { usePalette } from '../../src/theme';
import { usePledges } from '../../src/store/feed';

const FILTERS = ['All', 'Live', 'Finished', 'Sponsored'] as const;
type Filter = (typeof FILTERS)[number];

export default function Feed() {
  const C = usePalette();
  const pledges = usePledges();
  const [filter, setFilter] = useState<Filter>('All');

  const shown = pledges.filter((p) => {
    if (filter === 'Live') return p.status === 'open' || p.status === 'attested';
    if (filter === 'Finished') return p.status === 'paid';
    if (filter === 'Sponsored') return p.kind === 'sponsored';
    return true;
  });

  return (
    <Screen>
      <AppHeader
        title="Feed"
        actions={[
          {
            icon: 'gift-outline',
            label: 'Set a goal for a friend',
            onPress: () => router.push('/sponsor/new'),
          },
          {
            icon: 'create-outline',
            label: 'Post a pledge',
            onPress: () => router.push('/pledge/new'),
          },
        ]}
      />

      <View className="-mx-5">
        <Chips options={FILTERS} value={filter} onChange={setFilter} />
      </View>

      <ScrollView contentContainerClassName="px-5 pb-8 pt-5" showsVerticalScrollIndicator={false}>
        {shown.length === 0 ? (
          <View className="mt-16 items-center gap-3">
            <Ionicons name="megaphone-outline" size={32} color={C.inkFaint} />
            <Body dim className="text-center">
              Nothing here yet.
            </Body>
          </View>
        ) : (
          shown.map((p) => <PledgeCard key={p.id} pledge={p} />)
        )}

        {/* ---- two ways in ---- */}
        <View className="mt-5 flex-row gap-3">
          <Pressable onPress={() => router.push('/pledge/new')} className="flex-1 active:opacity-80">
            <Card className="items-center gap-2 py-7">
              <Ionicons name="megaphone-outline" size={26} color={C.accent} />
              <Text className="font-bodyBold text-[14px] text-ink">Post a pledge</Text>
              <Body dim className="text-center">
                Say it out loud, get tipped
              </Body>
            </Card>
          </Pressable>

          <Pressable onPress={() => router.push('/sponsor/new')} className="flex-1 active:opacity-80">
            <Card className="items-center gap-2 py-7">
              <Ionicons name="gift-outline" size={26} color={C.flame} />
              <Text className="font-bodyBold text-[14px] text-ink">Sponsor a friend</Text>
              <Body dim className="text-center">
                Set a goal, fund it
              </Body>
            </Card>
          </Pressable>
        </View>
      </ScrollView>
    </Screen>
  );
}
