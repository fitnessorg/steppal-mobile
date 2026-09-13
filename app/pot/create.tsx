import { useState } from 'react';
import { Alert, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Body, Button, Card, Label, Screen, SectionHeader } from '../../src/components/ui';
import { usePalette } from '../../src/theme';
import { createPot } from '../../src/store/pots';
import { naira, type PotMode } from '../../src/mock/data';

const MODES: { key: PotMode; title: string; blurb: string }[] = [
  {
    key: 'forfeit',
    title: 'Forfeit pot',
    blurb:
      'Everyone sets their own goal. Miss a day, forfeit into the pot. Everyone who hits all seven splits it.',
  },
  {
    key: 'winner_takes_all',
    title: 'Winner takes all',
    blurb:
      'Most steps at the end of the week takes everything. Best when everyone walks about the same.',
  },
];

export default function CreatePot() {
  const C = usePalette();
  const [name, setName] = useState('');
  const [mode, setMode] = useState<PotMode>('forfeit');
  const [stake, setStake] = useState('5000');
  const [goal, setGoal] = useState('10000');

  // TODO(contributor): POST the pot to the API
  // createPot() writes to the in-memory store. steppal-core exposes POST /v1/pots
  // — the stake hold must be inserted in the same transaction as the membership
  // row, so a half-created pot is impossible.
  // difficulty: medium
  const submit = () => {
    const stakeNaira = Number(stake);
    const dailyGoal = Number(goal);

    if (!name.trim()) {
      return Alert.alert('Give it a name', 'Your friends need to recognise it.');
    }
    if (!Number.isFinite(stakeNaira) || stakeNaira < 100) {
      return Alert.alert('Stake too small', 'Use at least ₦100 so it actually stings.');
    }
    if (!Number.isFinite(dailyGoal) || dailyGoal < 1000) {
      return Alert.alert('Goal too low', 'Pick at least 1,000 steps a day.');
    }

    const pot = createPot({
      name,
      mode,
      stakeKobo: Math.round(stakeNaira * 100),
      dailyGoal,
    });

    // Replace, not push: backing out of a new pot should land on the list,
    // never on the empty form that made it.
    router.replace(`/pot/${pot.id}?created=1`);
  };

  return (
    <Screen>
      <View className="flex-row items-center px-5 pb-2 pt-2">
        <Pressable
          onPress={() => router.back()}
          accessibilityLabel="Cancel"
          className="h-10 w-10 items-center justify-center rounded-full active:opacity-60"
        >
          <Ionicons name="close" size={24} color={C.ink} />
        </Pressable>
      </View>

      <ScrollView contentContainerClassName="px-5 pb-10" showsVerticalScrollIndicator={false}>
        <Text className="font-displayBlack text-[30px] leading-9 text-ink">Start a pot</Text>
        <Body dim className="mt-2">
          Runs for 7 days once everyone has joined. Nobody can join after it starts.
        </Body>

        <SectionHeader title="Name it" />
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Lagos Walkers"
          placeholderTextColor={C.inkFaint}
          className="rounded-2xl bg-surface px-5 py-4 font-body text-[16px] text-ink"
        />

        <SectionHeader title="How it settles" />
        <View className="gap-3">
          {MODES.map((m) => {
            const on = mode === m.key;
            return (
              <Pressable key={m.key} onPress={() => setMode(m.key)} className="active:opacity-80">
                <Card className={on ? 'border border-accent' : 'border border-transparent'}>
                  <View className="flex-row items-center justify-between">
                    <Text className={`font-bodyBold text-[15px] ${on ? 'text-accent' : 'text-ink'}`}>
                      {m.title}
                    </Text>
                    <Ionicons
                      name={on ? 'radio-button-on' : 'radio-button-off'}
                      size={20}
                      color={on ? C.accent : C.inkFaint}
                    />
                  </View>
                  <Body dim className="mt-2">
                    {m.blurb}
                  </Body>
                </Card>
              </Pressable>
            );
          })}
        </View>

        <SectionHeader title="The numbers" />
        <View className="flex-row gap-3">
          <View className="flex-1 gap-2">
            <Label>Stake each (₦)</Label>
            <TextInput
              value={stake}
              onChangeText={setStake}
              keyboardType="number-pad"
              className="rounded-2xl bg-surface px-5 py-4 font-body text-[16px] text-ink"
            />
          </View>
          <View className="flex-1 gap-2">
            <Label>Daily goal</Label>
            <TextInput
              value={goal}
              onChangeText={setGoal}
              keyboardType="number-pad"
              className="rounded-2xl bg-surface px-5 py-4 font-body text-[16px] text-ink"
            />
          </View>
        </View>

        <View className="mt-5 flex-row items-start gap-2">
          <Ionicons name="lock-closed" size={14} color={C.money} />
          <Body dim className="flex-1">
            {naira(Math.round(Number(stake || 0) * 100))} leaves your wallet when you create
            it, and is held until the week closes.
          </Body>
        </View>

        <View className="mt-8">
          <Button label="Create pot" icon="checkmark" onPress={submit} />
        </View>
      </ScrollView>
    </Screen>
  );
}
