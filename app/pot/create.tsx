import { useState } from 'react';
import { Alert, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { Body, Button, Card, H1, Label, Screen } from '../../src/components/ui';
import { C } from '../../src/theme';
import type { PotMode } from '../../src/mock/data';

const MODES: { key: PotMode; title: string; blurb: string }[] = [
  {
    key: 'forfeit',
    title: 'Forfeit pot',
    blurb: 'Everyone sets their own goal. Miss a day, forfeit into the pot. Everyone who hits all seven splits it.',
  },
  {
    key: 'winner_takes_all',
    title: 'Winner takes all',
    blurb: 'Most steps at the end of the week takes everything. Best when everyone walks about the same.',
  },
];

export default function CreatePot() {
  const [name, setName] = useState('');
  const [mode, setMode] = useState<PotMode>('forfeit');
  const [stake, setStake] = useState('5000');
  const [goal, setGoal] = useState('10000');

  // TODO(contributor): POST the pot to the API
  // Currently this just confirms and navigates back. steppal-core exposes
  // POST /v1/pots — creating should place the creator's stake hold in the same
  // transaction as the membership row.
  // difficulty: easy
  const create = () => {
    if (!name.trim()) return Alert.alert('Give it a name', 'Your friends need to recognise it.');
    Alert.alert('Demo build', `"${name}" would be created and your stake held.`, [
      { text: 'OK', onPress: () => router.back() },
    ]);
  };

  return (
    <Screen>
      <ScrollView contentContainerClassName="px-5 pb-12" showsVerticalScrollIndicator={false}>
        <Pressable onPress={() => router.back()} className="pt-4 active:opacity-60">
          <Text className="font-bodyMed text-[14px] text-inkSoft">← Cancel</Text>
        </Pressable>

        <View className="mt-5">
          <H1>Start a pot</H1>
        </View>

        <View className="mt-8 gap-2">
          <Label>Name it</Label>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Lagos Walkers"
            placeholderTextColor={C.inkFaint}
            className="rounded-2xl bg-surface px-5 py-4 font-body text-[16px] text-ink"
          />
        </View>

        <View className="mt-7 gap-3">
          <Label>How it settles</Label>
          {MODES.map((m) => {
            const on = mode === m.key;
            return (
              <Pressable key={m.key} onPress={() => setMode(m.key)} className="active:opacity-80">
                <Card className={on ? 'border border-accent' : 'border border-transparent'}>
                  <View className="flex-row items-center justify-between">
                    <Text
                      className={`font-bodyBold text-[15px] ${on ? 'text-accent' : 'text-ink'}`}
                    >
                      {m.title}
                    </Text>
                    <View
                      className={`h-5 w-5 rounded-full border-2 ${
                        on ? 'border-accent bg-accent' : 'border-surface2'
                      }`}
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

        <View className="mt-7 flex-row gap-3">
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

        <Body dim className="mt-5">
          Runs for 7 days from the moment everyone has joined. Nobody can join after it starts.
        </Body>

        <View className="mt-8">
          <Button label="Create pot" onPress={create} />
        </View>
      </ScrollView>
    </Screen>
  );
}
